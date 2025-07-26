#ifndef STDSTRUCTS_H
#define STDSTRUCTS_H

#include <string>
#include <vector>

struct SPCsettings {
    float a2;
    float d3; 
    float d4;  
    float usl;
    float lsl;
    int datapointSize;
    std::string machineName;
    std::string machineIP;
    int toolOffsetNumber;
    float offsetSize; 
};

struct SPCResult {
    float xBar;
    float stdDev;
    float avgMR;
    float UCL_X;
    float LCL_X;
    float UCL_MR;
    float LCL_MR;
    float cp;
    float cpk;
    std::vector<float> mrArray;
    bool isDrifting;
};

#endif // STDSTRUCTS_H
