#ifndef AUTH_H
#define AUTH_H

#include "stdStructs.h"
#include "MyDB.h"       // for userRolesDb
#include <ctime>
#include <cstring>      // strcpy, strcmp

#define CONCURRENT_LIMIT 10
#define ACCOUNT_LIMIT    10

void generateCookie(char* buffer, size_t bufferSize);

class Auth {
private:
    static ActiveUser activeUsers[CONCURRENT_LIMIT];
    static int activeUsersCount;

    static bool isInactive(const ActiveUser& user, int thresholdMinutes);
    static bool flushStaleUser();

public:
    static ActiveUser login(const char* username, const char* password);
    static void logout(const char* cookie);
    static bool isValid(const char* cookie);
    static bool isAllowedTo(const char* cookie, const char* action);
    static bool createNewUser(const char* username, const char* password,
                              const char* userAlias, const char allowedTo[][10], int size);
    static bool deleteRole(const char* username);
    static void informSocket(const char* cookie, const char* clientId, bool isConnected);
};

#endif // AUTH_H
