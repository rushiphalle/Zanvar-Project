#include "handler.h"
#include "MyWebserver.h"
#include "stdStructs.h"
#include <ArduinoJson.h>
#include <ctime>
#include "CNCHandler.h"

void streamMonitor(const char* monitorCode, float values[30], int elementsInArray, 
                   SPCSettings setting, SPCResult result) {
    static char jsonBuffer[4096];  // large enough buffer for JSON string
    char temp[256];

    // Start JSON
    snprintf(jsonBuffer, sizeof(jsonBuffer),
        "{\n  monitorCode: '%s',\n  tableData: [\n", monitorCode);

    // Add tableData values + MR from result.mrArray
    for (int i = 0; i < elementsInArray; i++) {
        snprintf(temp, sizeof(temp),
            "    { value: %.2f, MR: %.2f }%s\n",
            values[i],
            (i < result.mrArray.size ? result.mrArray.data[i] : 0.0),
            (i == elementsInArray - 1 ? "" : ","));
        strncat(jsonBuffer, temp, sizeof(jsonBuffer) - strlen(jsonBuffer) - 1);
    }

    // Close tableData and add rest
    snprintf(temp, sizeof(temp),
        "  ],\n"
        "  'X-bar': %.2f,\n"
        "  stdDev: %.2f,\n"
        "  avgMR: %.2f,\n"
        "  UCL_X: %.2f,\n"
        "  LCL_X: %.2f,\n"
        "  UCL_MR: %.2f,\n"
        "  LCL_MR: %.2f,\n"
        "  cp: %.2f,\n"
        "  cpk: %.2f,\n"
        "  isDrifting: %s,\n"
        "  usl: %.2f,\n"
        "  lsl: %.2f\n"
        "}\n",
        result.xBar,
        result.stdDev,
        result.avgMR,
        result.UCL_X,
        result.LCL_X,
        result.UCL_MR,
        result.LCL_MR,
        result.cp,
        result.cpk,
        (result.isDrifting ? "true" : "false"),
        setting.usl,
        setting.lsl);

    strncat(jsonBuffer, temp, sizeof(jsonBuffer) - strlen(jsonBuffer) - 1);

    // Print JSON string
    MyWebserver::getInstance().publish("MONITOR", jsonBuffer);
}

void handleResult(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
    if (result.isDrifting) {
        CNCSignal::handleDrift();
    }
    streamMonitor(monitorCode, values, elementsInArray, setting, result);
}
