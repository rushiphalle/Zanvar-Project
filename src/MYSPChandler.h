#ifndef MYSPCCALCULATOR_H
#define MYSPCCALCULATOR_H

#include "stdStructs.h"
#include "MySPCCalculator.h"
#include "MyDB.h"
#include "handler.h"
#include <string>
#include <vector>
#include <map>

class _MySPCHandler {
private:
    std::map<String, std::vector<float>> monitorData;

    _MySPCHandler() {}

    _MySPCHandler(const _MySPCHandler&) = delete;
    _MySPCHandler& operator=(const _MySPCHandler&) = delete;

    friend _MySPCHandler& spchandler;

    void calculateSPC(const String& monitorCode, std::vector<float> values) {
        SPCsettings settings;

        if (db.get(monitorCode, &settings)) {
            SPCResult result = calculate(values, settings);
            handleResult(monitorCode, values, result, settings);
        } else {
            this->remove(monitorCode);
            Serial.printf("SPC settings not found for monitorCode: %s. Data record deleted.\n", monitorCode.c_str());
        }
    }

public:
    void reset(const String& monitorCode) {
        auto it = monitorData.find(monitorCode);
        if (it != monitorData.end()) {
            it->second.clear();
            Serial.printf("Record for monitorCode: %s has been reset.\n", monitorCode.c_str());
        } else {
            Serial.printf("No record found for monitorCode: %s to reset.\n", monitorCode.c_str());
        }
    }

    void remove(const String& monitorCode) {
        auto it = monitorData.find(monitorCode);
        if (it != monitorData.end()) {
            monitorData.erase(it);
            Serial.printf("Record for monitorCode: %s has been deleted.\n", monitorCode.c_str());
        } else {
            Serial.printf("No record found for monitorCode: %s to delete.\n", monitorCode.c_str());
        }
    }

    void insertParameter(const String& monitorCode, float parameter) {
        auto it = monitorData.find(monitorCode);

        if (it != monitorData.end()) {
            it->second.push_back(parameter);
            Serial.printf("Parameter %.3f added to existing record for monitorCode: %s. Current size: %d\n",
                          parameter, monitorCode.c_str(), it->second.size());
        } else {
            monitorData[monitorCode] = {parameter};
            Serial.printf("New record created for monitorCode: %s with initial parameter: %.3f\n",
                          monitorCode.c_str(), parameter);
        }

        SPCsettings settings;
        if (db.get(monitorCode, &settings)) {
            if (monitorData[monitorCode].size() >= settings.datapointSize && settings.datapointSize > 0) {
                Serial.printf("Datapoint size limit (%d) reached for monitorCode: %s. Flushing record and calculating SPC.\n",
                              settings.datapointSize, monitorCode.c_str());

                calculateSPC(monitorCode, monitorData[monitorCode]);
                this->reset(monitorCode);
            } else {
                calculateSPC(monitorCode, monitorData[monitorCode]);
            }
        } else {
            Serial.printf("Warning: SPC settings not found for monitorCode: %s. Cannot check datapointSize or calculate SPC.\n",
                          monitorCode.c_str());
        }
    }
};

inline _MySPCHandler spchandler;

#endif // MYSPCCALCULATOR_H
