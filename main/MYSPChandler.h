#ifndef MYSPCCALCULATOR_H
#define MYSPCCALCULATOR_H

#include "stdStructs.h" //Global User defined structures
#include "MyDB.h"   //To interact with database
#include "MySPCCalculator.h"
#include "handler.h"

class MySPCHandler {
private:

    // Make constructor private
    MySPCHandler() {}

    // Prevent copy/assign (enforces singleton)
    MySPCHandler(const MySPCHandler&) = delete;
    MySPCHandler& operator=(const MySPCHandler&) = delete;

public:
    static MySPCHandler& getInstance() {
        static MySPCHandler instance;
        return instance;
    }

    void reset(const char* monitorCode){
        //clean the array of float associated with this monitor code
    }

    void remove(const char* monitorCode){
        //delete the record associated with monitorcode
    }

    void insertParameter(const char* monitorCode, float parameter){
        //insert new value to record -> get updated array of float -> call calculate() (..this function is present in this MySPCCalculator dont create new one and dont take tension of it you just call 😅) -> it will resturn struct SPCResult object -> call handleResult () and pass required things to itthen your task is over 
    }
};

//Shared Singleton CLass
inline MySPCHandler& spcHandler = MySPCHandler::getInstance();

#endif
