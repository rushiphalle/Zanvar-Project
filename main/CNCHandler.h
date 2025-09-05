#ifndef CNCHANDLER_H
#define CNCHANDLER_H

#include "stdStructs.h"

namespace CNCSignal {
    inline void handleDrift(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result) {
        // logic to send signals to cnc
    }
} 

#endif 
