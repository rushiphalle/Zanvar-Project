#include "SPCSettings.h"
#include "MyWebserver.h"
#include "SPC.h"

/*
1) expose function called insertParameter(monitorId, parameter) => this will check whether you have key with moitorId if so then it will add this parameter into vector associated with that key, remember if vector already has == bufferSize then empty vector and push that new parameter -> after that you have to call calculateSPC(monitorCode, parameters) 
2) calculateSPC(monitorCode, parameters) => this will fetch spc settings associated with monitorId from db by using get(monitorCode) and simply call calculate(parameters, spcSettings) and then you have to call updateCharts(monitorCode, parameters, result, spcSettings)
*/