#include "Auth.h"
#include "MyWebserver.h" 
#include <cstdlib>         // rand, srand

void generateCookie(char* buffer, size_t bufferSize) {
    const char charset[] =
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz";
    const size_t maxIndex = sizeof(charset) - 1;

    if (bufferSize < 16) {
        if (bufferSize > 0) buffer[0] = '\0';
        return;
    }

    static bool seeded = false;
    if (!seeded) {
        seeded = true;
        std::srand(static_cast<unsigned>(time(nullptr)));
    }

    for (int i = 0; i < 15; i++) {
        buffer[i] = charset[std::rand() % maxIndex];
    }
    buffer[15] = '\0';
}

//private
ActiveUser Auth::activeUsers[CONCURRENT_LIMIT] = {};
int Auth::activeUsersCount = 0;

bool Auth::isInactive(const ActiveUser& user, int thresholdMinutes) {
    time_t now = std::time(nullptr);
    double diffSeconds = difftime(now, user.lastActivity);
    return diffSeconds > thresholdMinutes * 60;
}

bool Auth::flushStaleUser() {
    for (int i = 0; i < activeUsersCount; i++) {
        if (isInactive(activeUsers[i], 60) && !activeUsers[i].isSubscriber) {
            logout(activeUsers[i].cookie);
            i--; // adjust index after removal
            return true;
        }
    }
    return false;
}

//public
    ActiveUser Auth::login(const char* username, const char* password) {
        ActiveUser newUser = {};
        newUser.valid = false;
        newUser.errCode = 401;

        if (activeUsersCount >= CONCURRENT_LIMIT && !flushStaleUser()) {
            newUser.errCode = 503;
            return newUser;
        }

        User user;
        if (userRolesDb.get(username, &user) && strcmp(user.password, password) == 0) {
            newUser.valid = true;
            generateCookie(newUser.cookie, sizeof(newUser.cookie));
            strncpy(newUser.userAlias, user.userAlias, sizeof(newUser.userAlias) - 1);
            strncpy(newUser.username, user.username, sizeof(newUser.username) - 1);
            newUser.allowedTo   = user.allowedTo;
            newUser.isSubscriber = false;
            newUser.clientId  = 0;
            newUser.lastActivity = std::time(nullptr);
            activeUsers[activeUsersCount++] = newUser;
        }
        return newUser;
    }

void Auth::logout(const char* cookie) {
    int index = -1;
    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].cookie, cookie) == 0) {
            index = i;
            if (activeUsers[i].isSubscriber) {
                MyWebserver::getInstance().disconnectSocket(activeUsers[i].clientId);
            }
            break;
        }
    }
    if (index >= 0) {
        for (int i = index; i < activeUsersCount - 1; i++) {
            activeUsers[i] = activeUsers[i + 1];
        }
        activeUsersCount--;
    }
}

bool Auth::isValid(const char* cookie) {
    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].cookie, cookie) == 0) {
            activeUsers[i].lastActivity = std::time(nullptr);
            return true;
        }
    }
    return false;
}

bool Auth::isAllowedTo(const char* cookie, const char* action) {
    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].cookie, cookie) == 0) {
            for (int j = 0; j < activeUsers[i].allowedTo.size; j++) {
                if (activeUsers[i].allowedTo.data[j][0] != '\0' &&
                    strcmp(activeUsers[i].allowedTo.data[j], action) == 0) {
                    activeUsers[i].lastActivity = std::time(nullptr);
                    return true;
                }
            }
            return false;
        }
    }
    return false;
}

bool Auth::createNewUser(const char* username, const char* password, const char* userAlias,
                         const char allowedTo[][10], int size) {
    if (userRolesDb.getKeys().size >= ACCOUNT_LIMIT && !userRolesDb.has(username))
        return false;

    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].username, username) == 0) {
            logout(activeUsers[i].cookie);
            break;
        }
    }

    User newUser = {};
    strncpy(newUser.username,  username,  sizeof(newUser.username)  - 1);
    strncpy(newUser.password,  password,  sizeof(newUser.password)  - 1);
    strncpy(newUser.userAlias, userAlias, sizeof(newUser.userAlias) - 1);

    
    if(strcmp(username, "admin")==0){
        strncpy(newUser.allowedTo.data[0], "SETTING", sizeof(newUser.allowedTo.data[0]) - 1);
        newUser.allowedTo.data[0][sizeof(newUser.allowedTo.data[0]) - 1] = '\0';
        strncpy(newUser.allowedTo.data[1], "MONITOR", sizeof(newUser.allowedTo.data[1]) - 1);
        newUser.allowedTo.data[1][sizeof(newUser.allowedTo.data[1]) - 1] = '\0';
        strncpy(newUser.allowedTo.data[2], "SECURITY", sizeof(newUser.allowedTo.data[2]) - 1);
        newUser.allowedTo.data[2][sizeof(newUser.allowedTo.data[2]) - 1] = '\0';
        newUser.allowedTo.size = 3;
    }else{
        for (int i = 0; i < size && i < 5; i++) {
            strncpy(newUser.allowedTo.data[i], allowedTo[i], sizeof(newUser.allowedTo.data[i]) - 1);
            newUser.allowedTo.data[i][sizeof(newUser.allowedTo.data[i]) - 1] = '\0';
        }
        newUser.allowedTo.size = size;
    }
    
    userRolesDb.set(username, newUser);
    return userRolesDb.has(username);
}

bool Auth::deleteRole(const char* username) {
    if(strcmp(username, "admin")==0)    return false;
    userRolesDb.remove(username);
    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].username, username) == 0) {
            logout(activeUsers[i].cookie);
            i--; // Recheck index after shifting
        }
    }
    return true;
}

void Auth::informSocket(const char* cookie, const uint32_t clientId, bool isConnected) {
    for (int i = 0; i < activeUsersCount; i++) {
        if (strcmp(activeUsers[i].cookie, cookie) == 0 || activeUsers[i].clientId == clientId) {
            if (isConnected) {
                activeUsers[i].clientId = clientId;
                activeUsers[i].isSubscriber = true;
            } else {
                activeUsers[i].clientId = 0;
                activeUsers[i].isSubscriber = false;
            }
            activeUsers[i].lastActivity = std::time(nullptr);
            break;
        }
    }
}
