  // Handler.h
#ifndef HANDLER_H
#define HANDLER_H

#include "stdStructs.h"

class MyWebserver;  // forward declaration

void streamMonitor(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result);
void handleResult(const char* monitorCode, float values[30], int elementsInArray, SPCSettings setting, SPCResult result);
void handleDrift();

#endif
