#ifndef STDSTRUCTS_H
#define STDSTRUCTS_H

#include <cstring>
#include <ctime>

#define MAX_ROLES 5
#define MAX_ROLE_SIZE 10
#define MAX_STRING_LENGTH 32

//1) struct for user control
//1.1) struct to store user action array
struct DynamicRoleArray {
    char data[MAX_ROLES][MAX_ROLE_SIZE];  
    int size = 0;         
};

//1.2) struct to store user records
struct User {
    char username[MAX_STRING_LENGTH];
    char password[MAX_STRING_LENGTH];
    char userAlias[MAX_STRING_LENGTH];
    DynamicRoleArray allowedTo;
};

//1.3) struct to store active users in ram
struct ActiveUser {
        char cookie[16];
        char userAlias[MAX_STRING_LENGTH];
        char username[MAX_STRING_LENGTH];
        bool valid;
        int errCode;
        bool isSubscriber;
        uint32_t clientId;
        time_t lastActivity; 
        DynamicRoleArray allowedTo;
};

//2) struct to store string in db like ssid, password
struct FixedString32 {
    char value[MAX_STRING_LENGTH];
};

struct FixedArray90 {
    float value[90];
};

//3) struct to store spc settings
struct SPCSettings { 
    float usl;
    float lsl;
    int sampleSize;
    char machineName[MAX_STRING_LENGTH]; 
    char machineIP[16];  
    int toolOffsetNumber;
    float offsetSize; 
};

//4) structs to store spc results
//4.1) strucst to store mr array 
struct DynamicMRArray {
    float data[30];  
    int size = 0;         
};

//4.2) struct to store spc result
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
};

#endif // STDSTRUCTS_H
