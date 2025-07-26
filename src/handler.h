#ifndef HANDLER_H
#define HANDLER_H

#include "MyWebserver.h"
#include "stdStructs.h"
#include <ArduinoJson.h>
#include <vector>
#include <ctime>

inline void handleDrift() {
    //logic to send signals to cnc
}

inline String getCurrentTimestampUTC() {
    time_t now = time(nullptr);
    struct tm* gmtm = gmtime(&now);
    char buf[30];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", gmtm);
    return String(buf);
}

inline void handleStreaming(const String& monitorCode, const std::vector<float>& values, const SPCResult& result, const SPCsettings& settings) {
    DynamicJsonDocument doc(4096);
    JsonArray tableData = doc.createNestedArray("tableData");

    for (size_t i = 0; i < values.size(); ++i) {
        JsonObject row = tableData.createNestedObject();
        row["value"] = values[i];
        row["MR"] = i != 0 ? result.mrArray[i - 1] : 0.0;
    }

    // Add SPCResult fields
    doc["X-bar"] = result.xBar;
    doc["stdDev"] = result.stdDev;
    doc["avgMR"] = result.avgMR;
    doc["UCL_X"] = result.UCL_X;
    doc["LCL_X"] = result.LCL_X;
    doc["UCL_MR"] = result.UCL_MR;
    doc["LCL_MR"] = result.LCL_MR;
    doc["cp"] = result.cp;
    doc["cpk"] = result.cpk;
    doc["isDrifting"] = result.isDrifting;

    // Add SPCsettings fields
    doc["a2"] = settings.a2;
    doc["d3"] = settings.d3;
    doc["d4"] = settings.d4;
    doc["usl"] = settings.usl;
    doc["lsl"] = settings.lsl;
    doc["datapointSize"] = settings.datapointSize;
    doc["machineName"] = settings.machineName;
    doc["machineIP"] = settings.machineIP;
    doc["toolOffsetNumber"] = settings.toolOffsetNumber;
    doc["offsetSize"] = settings.offsetSize;

    // Add timestamp
    doc["timestamp"] = getCurrentTimestampUTC();

    // Send JSON using singleton object
    server.send(doc);
}

inline void handleResult(const String& monitorCode, const std::vector<float>& values, const SPCResult& result, const SPCsettings& settings) {
    if (result.isDrifting) {
        handleDrift();
    }
    handleStreaming(monitorCode, values, result, settings);
}

#endif // HANDLER_H
