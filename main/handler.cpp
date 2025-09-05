#include "handler.h"
#include "MyWebserver.h"
#include "stdStructs.h"
#include <ArduinoJson.h>
#include <ctime>
#include "CNCHandler.h"

void streamMonitor(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
    StaticJsonDocument<4096> doc;   // Adjust size if needed

    // Root object
    doc["monitorCode"] = monitorCode;

    // Table data (array of objects)
    JsonArray tableData = doc.createNestedArray("tableData");
    for (int i = 0; i < elementsInArray; i++) {
        JsonObject entry = tableData.createNestedObject();
        entry["value"] = values[i];
        entry["MR"] = (i < result.mrArray.size ? result.mrArray.data[i] : 0.0);
    }

    // Add SPC results
    doc["xBar"]      = result.xBar;
    doc["stdDev"]     = result.stdDev;
    doc["avgMR"]      = result.avgMR;
    doc["UCL_X"]      = result.UCL_X;
    doc["LCL_X"]      = result.LCL_X;
    doc["UCL_MR"]     = result.UCL_MR;
    doc["LCL_MR"]     = result.LCL_MR;
    doc["cp"]         = result.cp;
    doc["cpk"]        = result.cpk;
    doc["isDrifting"] = result.isDrifting;
    doc["usl"]        = setting.usl;
    doc["lsl"]        = setting.lsl;

    // Serialize to buffer
    static char jsonBuffer[4096];
    size_t len = serializeJson(doc, jsonBuffer, sizeof(jsonBuffer));

    MyWebserver::getInstance().publish("MONITOR", jsonBuffer);
}


void handleResult(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
    CNCSignal::handleDrift(monitorCode, values, elementsInArray, setting, result);
    streamMonitor(monitorCode, values, elementsInArray, setting, result);
}
