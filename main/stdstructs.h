#ifndef STDSTRUCTS_H
#define STDSTRUCTS_H

#include <cstring>
#include <ctime>

struct DynamicMRArray {
    float data[30];  
    int size = 0;         
};

struct DynamicRoleArray {
    char data[5][10];  
    int size = 0;         
};

struct ActiveUser {
        char cookie[16];
        char userAlias[32];
        char username[32];
        DynamicRoleArray allowedTo;
        bool valid;
        int errCode;
        bool isSubscriber;
        char clientId[32];
        time_t lastActivity; 
};

struct FixedString32 {
    char value[32];
};

struct SPCSettings {
    float a2;
    float d3; 
    float d4;  
    float usl;
    float lsl;
    int datapointSize;
    char machineName[32]; 
    char machineIP[16];  
    int toolOffsetNumber;
    int offsetSize; 
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
    DynamicMRArray mrArray;
    bool isDrifting;
};

struct User {
    char username[32];
    char password[32];
    char userAlias[32];
    DynamicRoleArray allowedTo;
};

#endif // STDSTRUCTS_H
