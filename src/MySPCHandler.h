#ifndef MYSPCHANDLER_H
#define MYSPCHANDLER_H

#include "MySPCCalculator.h"
#include "stdStructs.h" //Global User defined structures
#include "MyDB.h"   //To interact with database
#include "handler.h"
#include <cstring>   // strcmp, strncpy

#define MAX_RECORDS 10   // how many monitor codes we can handle

// Record for each monitorCode
struct MonitorRecord {
    char monitorCode[10];   // unique key
    float values[30];       // circular buffer for SPC data
    int size;               // number of valid elements
    bool active;            // marks if slot is used
};

class MySPCHandler {
private:
    MonitorRecord records[MAX_RECORDS];

    // Make constructor private
    MySPCHandler() {
        for (int i = 0; i < MAX_RECORDS; i++) {
            records[i].active = false;
            records[i].size = 0;
            records[i].monitorCode[0] = '\0';
        }
    }
    // Prevent copy/assign (enforces singleton)
    MySPCHandler(const MySPCHandler&) = delete;
    MySPCHandler& operator=(const MySPCHandler&) = delete;
    
    // helper: find record index
    int findRecord(const char* monitorCode) {
        for (int i = 0; i < MAX_RECORDS; i++) {
            if (records[i].active && strcmp(records[i].monitorCode, monitorCode) == 0) {
                return i;
            }
        }
        return -1;
    }

    // helper: create new record if not exists
    int createRecord(const char* monitorCode) {
        for (int i = 0; i < MAX_RECORDS; i++) {
            if (!records[i].active) {
                strncpy(records[i].monitorCode, monitorCode, sizeof(records[i].monitorCode) - 1);
                records[i].monitorCode[sizeof(records[i].monitorCode) - 1] = '\0';
                records[i].size = 0;
                records[i].active = true;
                return i;
            }
        }
        return -1; // no free slot
    }

public:
    static MySPCHandler& getInstance() {
        static MySPCHandler instance;
        return instance;
    }

     // Reset all stored values for a monitor
    void reset(const char* monitorCode){
        //clean the array of float associated with this monitor code
        int idx = findRecord(monitorCode);
        if (idx >= 0) {
            records[idx].size = 0;
            for (int j = 0; j < 30; j++) {
                records[idx].values[j] = 0.0f;
            }
        }
    }

    // Delete the monitor record entirely
    void remove(const char* monitorCode){
        //delete the record associated with monitorcode
        int idx = findRecord(monitorCode);
        if (idx >= 0) {
            records[idx].active = false;
            records[idx].size = 0;
            records[idx].monitorCode[0] = '\0';
        }
    }

    // Insert new parameter into monitor’s rolling buffer
    void insertParameter(const char* monitorCode, float parameter){
        //insert new value to record -> get updated array of float -> call calculate() (..this function is present in this MySPCCalculator dont create new one and dont take tension of it you just call 😅) -> it will resturn struct SPCResult object -> call handleResult () and pass required things to itthen your task is over 
        int idx = findRecord(monitorCode);
        if (idx < 0) {
            idx = createRecord(monitorCode);
            if (idx < 0) {
                Serial.println("No space for new monitorCode!");
                return;
            }
        }

        MonitorRecord& rec = records[idx];

        // If full, shift left
        if (rec.size >= 30) {
            for (int i = 1; i < 30; i++) {
                rec.values[i - 1] = rec.values[i];
            }
            rec.values[29] = parameter;
        } else {
            rec.values[rec.size++] = parameter;
        }

        // Get SPC settings from DB
        SPCSettings setting;
        if (!spcDb.get(monitorCode, &setting)) {
            Serial.println("SPC settings not found for monitorCode!");
            return;
        }
                
        // Run SPC calculation
        SPCResult result = calculate(setting, rec.values, rec.size);

        // Handle results (publish, drift check, etc)
        handleResult(monitorCode, rec.values, rec.size, setting, result);
    }
};

//Shared Singleton CLass
inline MySPCHandler& spcHandler = MySPCHandler::getInstance();

#endif
