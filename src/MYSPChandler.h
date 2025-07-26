#ifndef MYSPCCALCULATOR_H
#define MYSPCCALCULATOR_H

#include "stdStructs.h"
#include "MySPCCalculator.h"
#include "MyDB.h"
#include "handler.h"
#include <string>
#include <vector>

class _MySPCHandler {
private:

    // Make constructor private
    _MySPCHandler() {}

    // Prevent copy/assign (enforces singleton)
    _MySPCHandler(const _MySPCHandler&) = delete;
    _MySPCHandler& operator=(const _MySPCHandler&) = delete;

    // Only allow this specific object to construct
    friend _MySPCHandler& spchandler;

    void calculateSPC(const String& monitorCode, std::vector<float> values){
        //this function wiil fetch spc settings associated with monitor code using db.get(monitorCode) **Note - if spc setting is not there for specific monitorCode then call delete(monitorCode) fucntion
        //then it will call calculate(values, settinngs) which will return a result struct
        //then it will call handleResult(monitorCode, values, result, setting)
    }

public:
    void reset(const String& monitorCode){
        //this will remove all elements form the vector where key = monitorCode
    }

    void delete(const String& monitorCode){
        //this will delete key value pair where key = monitorCode
    }

    void insertParameter(const String& monitorCode, float parameter){
        //this will check wheter it maps monitorCode with any vector if yes then add parameter at end of that vector and call calculateSPC() with new vector and if it dont holds then create new map record
    }
};

// ✅ Shared singleton-like instance
inline _MySPCHandler spchandler;

#endif