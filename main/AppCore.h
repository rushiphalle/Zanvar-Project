#ifndef APP_CORE_H
#define APP_CORE_H

#include "MyDB.h"
#include "stdStructs.h"
#include <cstdio>
#include <cstring>
#include "MySPCHandler.h"

#define MAX_SETTINGS 10
#define MAX_JSON_SIZE 2048
#define MAX_KEYS 10

namespace AppCore {
    inline bool reset(const char* monitorCode){
        spcHandler.reset(monitorCode);
        return true;
    }
    inline void refreshRecords(){
     spcHandler.refreshRecords();
    
    }
    inline bool update(const char* monitorCode, float a2, float d3, float d4, float usl, float lsl, int datapointSize, const char* machineName, const char* machineIP, int toolOffsetNumber, float offsetSize){
        auto keys = spcDb.getKeys();
        bool isExist = false;

        for (size_t i = 0; i < keys.size; i++) {
            if (strcmp(keys.keys[i], monitorCode) == 0) {
                isExist = true;
                reset(monitorCode);  
                break;
            }
        }

        if (keys.size >= MAX_SETTINGS && !isExist) return false;
        SPCSettings newSettings = {};
        newSettings.a2 = a2;
        newSettings.d3 = d3;
        newSettings.d4 = d4;
        newSettings.usl = usl;
        newSettings.lsl = lsl;
        newSettings.datapointSize = datapointSize;

        std::strncpy(newSettings.machineName, machineName, sizeof(newSettings.machineName) - 1);
        newSettings.machineName[sizeof(newSettings.machineName) - 1] = '\0';

        std::strncpy(newSettings.machineIP, machineIP, sizeof(newSettings.machineIP) - 1);
        newSettings.machineIP[sizeof(newSettings.machineIP) - 1] = '\0';

        newSettings.toolOffsetNumber = toolOffsetNumber;
        newSettings.offsetSize = offsetSize;

        spcDb.set(monitorCode, newSettings);
        return true;
    }

    inline bool remove(const char* monitorCode){
        if (!spcDb.has(monitorCode)) return false;
          spcDb.remove(monitorCode);
          spcHandler.remove(monitorCode);
        return true;
    }

    inline void updateWifi(const char* ssid, const char* password) {
        FixedString32 ssidObj;
        FixedString32 passwordObj;

        strncpy(ssidObj.value, ssid, sizeof(ssidObj.value));
        ssidObj.value[sizeof(ssidObj.value) - 1] = '\0';

        strncpy(passwordObj.value, password, sizeof(passwordObj.value));
        passwordObj.value[sizeof(passwordObj.value) - 1] = '\0';

        generalDb.set("SSID", ssidObj);
        generalDb.set("PASSWORD", passwordObj);
    }

    inline void getSettings(char* outBuffer, size_t bufferSize) {
        if (bufferSize == 0) return;

        auto keys = spcDb.getKeys();
        size_t offset = 0;

        int n = std::snprintf(outBuffer + offset, bufferSize - offset, "{\n");
        if (n < 0) return;
        offset += (size_t)n;
        if (offset >= bufferSize) { outBuffer[bufferSize - 1] = '\0'; return; }

        bool first = true;
        size_t emitted = 0;

        for (size_t i = 0; i < keys.size && emitted < MAX_KEYS; i++) {
            SPCSettings setting;
            if (!spcDb.get(keys.keys[i], &setting)) continue;

            if (!first) {
                n = std::snprintf(outBuffer + offset, bufferSize - offset, ",\n");
                if (n < 0) break;
                offset += (size_t)n;
                if (offset >= bufferSize) break;
            }
            first = false;

            n = std::snprintf(outBuffer + offset, bufferSize - offset,
                "  \"%s\": {\n"
                "    \"a2\": %.3f,\n"
                "    \"d3\": %.3f,\n"
                "    \"d4\": %.3f,\n"
                "    \"usl\": %.3f,\n"
                "    \"lsl\": %.3f,\n"
                "    \"datapointSize\": %d,\n"
                "    \"machineName\": \"%s\",\n"
                "    \"machineIP\": \"%s\",\n"
                "    \"toolOffsetNumber\": %d,\n"
                "    \"offsetSize\": %.3f\n"
                "  }",
                keys.keys[i],
                setting.a2,
                setting.d3,
                setting.d4,
                setting.usl,
                setting.lsl,
                setting.datapointSize,
                setting.machineName,
                setting.machineIP,
                setting.toolOffsetNumber,
                setting.offsetSize
            );
            if (n < 0) break;
            offset += (size_t)n;
            if (offset >= bufferSize) break;

            emitted++;
        }

        if (offset < bufferSize) {
            n = std::snprintf(outBuffer + offset, bufferSize - offset, "\n}\n");
            if (n > 0) offset += (size_t)n;
        }

        outBuffer[bufferSize - 1] = '\0';
    }

    inline void getSecurityCreds(char* outBuffer, size_t bufferSize) {
        if (bufferSize == 0) return;

        auto keys = userRolesDb.getKeys();

        char ssid[32] = {0};
        char password[32] = {0};

        FixedString32 ssidObj;
        FixedString32 passwordObj;

        if (!generalDb.get("SSID", &ssidObj)) {
            std::strncpy(ssid, "ZANVAR_IND", sizeof(ssid) - 1);
        } else {
            std::strncpy(ssid, ssidObj.value, sizeof(ssid) - 1);
        }

        if (!generalDb.get("PASSWORD", &passwordObj)) {
            std::strncpy(password, "12345678", sizeof(password) - 1);
        } else {
            std::strncpy(password, passwordObj.value, sizeof(password) - 1);
        }

        size_t offset = 0;
        int n = std::snprintf(outBuffer + offset, bufferSize - offset,
            "{\n"
            "  \"wifi\": {\n"
            "    \"ssid\": \"%s\",\n"
            "    \"password\": \"%s\"\n"
            "  },\n"
            "  \"users\": [\n",
            ssid, password
        );
        if (n < 0) return;
        offset += (size_t)n;
        if (offset >= bufferSize) { outBuffer[bufferSize - 1] = '\0'; return; }

        bool firstUser = true;
        size_t emitted = 0;

        for (size_t i = 0; i < keys.size && emitted < MAX_KEYS; i++) {
            User user;
            if (!userRolesDb.get(keys.keys[i], &user)) continue;

            if (!firstUser) {
                n = std::snprintf(outBuffer + offset, bufferSize - offset, ",\n");
                if (n < 0) break;
                offset += (size_t)n;
                if (offset >= bufferSize) break;
            }
            firstUser = false;

            n = std::snprintf(outBuffer + offset, bufferSize - offset,
                "    {\n"
                "      \"username\": \"%s\",\n"
                "      \"password\": \"%s\",\n"
                "      \"userAlias\": \"%s\",\n"
                "      \"allowedTo\": [",
                user.username,
                user.password,
                user.userAlias
            );
            if (n < 0) break;
            offset += (size_t)n;
            if (offset >= bufferSize) break;

            for (int j = 0; j < user.allowedTo.size; j++) {
                n = std::snprintf(outBuffer + offset, bufferSize - offset,
                    "%s\"%s\"",
                    (j == 0 ? "" : ", "),
                    user.allowedTo.data[j]
                );
                if (n < 0) break;
                offset += (size_t)n;
                if (offset >= bufferSize) break;
            }
            if (offset >= bufferSize) break;

            n = std::snprintf(outBuffer + offset, bufferSize - offset,
                "]\n"
                "    }"
            );
            if (n < 0) break;
            offset += (size_t)n;
            if (offset >= bufferSize) break;

            emitted++;
        }

        if (offset < bufferSize) {
            n = std::snprintf(outBuffer + offset, bufferSize - offset, "\n  ]\n}\n");
            if (n > 0) offset += (size_t)n;
        }

        outBuffer[bufferSize - 1] = '\0';
    }

    inline void activeUserToJson(const ActiveUser* user, char* outBuf, size_t bufSize) {
        size_t offset = 0;
        int written = 0;

        written = snprintf(outBuf + offset, bufSize - offset,
            "{"
            "\"cookie\":\"%s\","
            "\"userAlias\":\"%s\","
            "\"username\":\"%s\","
            "\"allowedTo\":[",
            user->cookie,
            user->userAlias,
            user->username
        );
        if (written < 0) return;
        offset += (size_t)written;
        if (offset >= bufSize) return;

        for (int i = 0; i < user->allowedTo.size; i++) {
            written = snprintf(outBuf + offset, bufSize - offset,
                "\"%s\"%s",
                user->allowedTo.data[i],
                (i < user->allowedTo.size - 1) ? "," : ""
            );
            if (written < 0) return;
            offset += (size_t)written;
            if (offset >= bufSize) return;
        }

        written = snprintf(outBuf + offset, bufSize - offset,
            "],"
            "\"valid\":%s,"
            "\"errCode\":%d,"
            "\"isSubscriber\":%s,"
            "\"lastActivity\":%lu"
            "}",
            user->valid ? "true" : "false",
            user->errCode,
            user->isSubscriber ? "true" : "false",
            (unsigned long)user->lastActivity
        );
        (void)written;
    }
} 

#endif // APP_CORE_H
