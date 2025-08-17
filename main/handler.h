#ifndef HANDLER_H
#define HANDLER_H

#include "MyWebserver.h"
#include "stdStructs.h"
#include <ArduinoJson.h>
#include <ctime>

inline void handleDrift() {
    //logic to send signals to cnc
}

void streamMonitor(const char* monitorCode, float values[30], int elementsInArray,  SPCSettings setting, SPCResult result) {
    char jsonBuffer[2048];   
    int offset = 0;

    // Start JSON -m 
    offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
        "{"
        "\"monitorCode\": %s,"
        "\"tableData\": [", monitorCode);

    // Add tableData
    for (int i = 0; i < elementsInArray; i++) {
        offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
            "{\"value\": %.5f, \"MR\": %.5f}%s",
            values[i],
            result.mrArray.data[i],
            (i < elementsInArray - 1) ? "," : "");
    }

    offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
        "],"
        "\"X-bar\": %.2f,"
        "\"stdDev\": \"%.1f;\","
        "\"avgMR\": \"%.0f;\","
        "\"UCL_X\": \"%.0f;\","
        "\"LCL_X\": \"%.0f;\","
        "\"UCL_MR\": \"%.0f;\","
        "\"LCL_MR\": \"%.0f;\","
        "\"cp\": \"%.0f;\","
        "\"cpk\": \"%.0f;\","
        "\"isDrifting\": %s,"
        "\"a2\": \"%.1f;\","
        "\"d3\": \"%.1f;\","
        "\"usl\": \"%.1f;\","
        "\"lsl\": \"%.1f;\","
        "\"datapointSize\": \"%d;\","
        "\"machineName\": \"%s;\","
        "\"machineIP\": \"%s;\","
        "\"toolOffsetNumber\": \"%d;\","
        "\"offsetSize\": \"%d;\""
        "}",
        result.xBar,
        result.stdDev,
        result.avgMR,
        result.UCL_X,
        result.LCL_X,
        result.UCL_MR,
        result.LCL_MR,
        result.cp,
        result.cpk,
        result.isDrifting ? "true" : "false",
        setting.a2,
        setting.d3,
        setting.usl,
        setting.lsl,
        setting.datapointSize,
        setting.machineName,
        setting.machineIP,
        setting.toolOffsetNumber,
        setting.offsetSize
    );

    webserver.publish("MONITOR", jsonBuffer);
}

inline void handleResult(const char* monitorCode, float values[30], int elementsInArray,  SPCSettings setting, SPCResult result) {
    if (result.isDrifting) {
        handleDrift();
    }
    streamMonitor(monitorCode, values, elementsInArray, setting, result);
}

#endif // HANDLER_H
