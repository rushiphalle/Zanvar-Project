#include "Handler.h"
#include "MyWebserver.h"
#include "stdStructs.h"
#include <ArduinoJson.h>
#include <ctime>

void handleDrift() {
    // logic to send signals to cnc
}

void streamMonitor(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
    char jsonBuffer[2048];
    int offset = 0;

    offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
        "{ \"monitorCode\": %s, \"tableData\": [", monitorCode);

    for (int i = 0; i < elementsInArray; i++) {
        offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
            "{\"value\": %.5f, \"MR\": %.5f}%s",
            values[i],
            result.mrArray.data[i],
            (i < elementsInArray - 1) ? "," : "");
    }

    offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
        "], \"X-bar\": %.2f }",
        result.xBar);

    MyWebserver::getInstance().publish("MONITOR", jsonBuffer);
}

void handleResult(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
    if (result.isDrifting) {
        handleDrift();
    }
    streamMonitor(monitorCode, values, elementsInArray, setting, result);
}
