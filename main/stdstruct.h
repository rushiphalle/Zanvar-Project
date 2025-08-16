#ifndef STDSTRUCTS_H
#define STDSTRUCTS_H

#include <cstring> // for strncpy, memset
#include <ctime>

// Fixed-size float array
struct DynamicMRArray {
    float data[30];  
    int size = 0;         
};

// Fixed-size string array for roles (each role max 32 chars)
struct DynamicRoleArray {
    char data[5][10];  // 5 roles, each up to 31 chars + null terminator
    int size = 0;         
};

struct ActiveUser {
        char cookie[17];
        char userAlias[32];
        char username[32];
        DynamicRoleArray allowedTo;
        bool valid;
        int errCode;
        bool isSubscriber;
        char clientId[32];
        time_t lastActivity; // store full timestamp
};

struct FixedString32 {
    char value[32];
};

// SPC settings - no heap allocations
struct SPCSettings {
    float a2;
    float d3; 
    float d4;  
    float usl;
    float lsl;
    int datapointSize;
    char machineName[32]; // fixed buffer for machine name
    char machineIP[16];   // enough for IPv4
    int toolOffsetNumber;
    int offsetSize; 
};

// SPC result - no heap
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

// User struct - fixed-size char arrays for strings
struct User {
    char username[32];
    char password[32];
    char userAlias[32];
    DynamicRoleArray allowedTo;
};

#endif // STDSTRUCTS_H
