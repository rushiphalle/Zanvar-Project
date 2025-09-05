#ifndef MY_WEBSERVER_H
#define MY_WEBSERVER_H

//#include "MySPCHandler.h"
#include <WiFi.h>   //To start Access Point
#include <ESPAsyncWebServer.h>  //To start webserver
#include <AsyncWebSocket.h> //To start websocket
#include "FS.h"
#include "LittleFS.h"   //To access stored webpage
#include "stdStructs.h" //Global User defined structures
#include "MyDB.h"   //To interact with database
#include "AppCore.h"    //Business Logic
#include "Auth.h"   //To handle Authentication
#include <ArduinoJson.h>    //To parse JSON
#include <Ticker.h>

#include <cstring>

#define MAX_SOCKET 10
#define MAX_CHANNELS 1
#define STRING_LENGTH 32
#define CHANNEL_NAME_SIZE 8
#define SUBSCRIBER_CAPACITY (MAX_SOCKET * MAX_CHANNELS)
#define CLIENT_TIMEOUT_MS 15000

class MyWebserver {
private:
    // Prevent copy
    MyWebserver(const MyWebserver&) = delete;
    MyWebserver& operator=(const MyWebserver&) = delete;

    //Initialize Null
    MyWebserver() : server(80), ws("/subscribe") {
        activeSubscribers = 0;
        for (int i = 0; i < SUBSCRIBER_CAPACITY; ++i) {
            subscribersList[i].clientId = 0;
            subscribersList[i].channel[0] = '\0';
        }

        for (int i = 0; i < MAX_SOCKET; ++i) {
            clientList[i].clientId = 0;
            clientList[i].sessionId[0] = '\0';
            clientList[i].isVerified = false;
            clientList[i].lastPong  = 0;
        }
    }

    // Declare Variables
    AsyncWebServer server;
    AsyncWebSocket ws;
    IPAddress ip;
    Ticker heartbeatTicker;
    char ssid[STRING_LENGTH];
    char password[STRING_LENGTH];
    char sta_ssid[STRING_LENGTH];
    char sta_password[STRING_LENGTH];

    struct Subscriber {
        uint32_t clientId;            
        char channel[CHANNEL_NAME_SIZE];      
    };
    Subscriber subscribersList[SUBSCRIBER_CAPACITY];
    int activeSubscribers = 0;

    struct SocketClient {
        uint32_t clientId;
        char sessionId[16];
        bool isVerified;
        unsigned long lastPong; // timestamp of last pong
    };

    SocketClient clientList[MAX_SOCKET];

    //Helper Private Function
    //1) Get Cookies - to parse session id of each request 
    bool getCookie(AsyncWebServerRequest *request, char* cookieValue, size_t maxLen) {
        if (!request || !cookieValue) return false;
        if (!request->hasHeader("Cookie")) return false;

        const AsyncWebHeader* cookieHeader = request->getHeader("Cookie");
        if (!cookieHeader) return false;

        const char* headerVal = cookieHeader->value().c_str();  // raw C string
        if (!headerVal || *headerVal == '\0') return false;

        const char searchKey[] = "session_id=";
        const size_t nameLen = sizeof(searchKey) - 1; // exclude '\0'

        const char* found = strstr(headerVal, searchKey);
        if (!found) return false;

        found += nameLen; // move past "session_id="

        // Copy exactly 15 chars or as many as fit in cookieValue
        size_t copyLen = (15 < maxLen - 1) ? 15 : maxLen - 1;
        strncpy(cookieValue, found, copyLen);
        cookieValue[copyLen] = '\0';

        return true;
    }

    //2) Add Subscriber - to add new subscriber in the subcription list
    bool addSubscriber(const uint32_t clientId, const char* channel) {
        // avoid duplicates
        for (int i = 0; i < activeSubscribers; ++i) {
            if (subscribersList[i].clientId == clientId &&
                strncmp(subscribersList[i].channel, channel, CHANNEL_NAME_SIZE) == 0) {
                // already subscribed
                return true;
            }
        }

        // ensure capacity
        if (activeSubscribers >= SUBSCRIBER_CAPACITY) return false;

        // create new record
        int idx = activeSubscribers++;
        subscribersList[idx].clientId = clientId;
        strncpy(subscribersList[idx].channel, channel, CHANNEL_NAME_SIZE - 1);
        subscribersList[idx].channel[CHANNEL_NAME_SIZE - 1] = '\0';
        return true;
    }

    //3) Remove Subscriber - to remove ew subscriber from the subcription list
    bool removeSubscriber(const uint32_t clientId, const char* channel) {
        bool removed = false;
        bool removeAll = (strcmp(channel, "*") == 0);

        for (int i = 0; i < activeSubscribers; ) {
            if (subscribersList[i].clientId == clientId && (removeAll || strcmp(subscribersList[i].channel, channel) == 0)) {
                // remove this entry by shifting left
                for (int j = i; j < activeSubscribers - 1; ++j) {
                    subscribersList[j] = subscribersList[j + 1];
                }
                // clear last slot
                subscribersList[activeSubscribers - 1].clientId = 0;
                subscribersList[activeSubscribers - 1].channel[0] = '\0';
                --activeSubscribers;
                removed = true;
                // continue without incrementing i (we now have new entry at i)
            } else {
                ++i;
            }
        }
        return removed;
    }

    //4) Restart Server - to forcefully restart the server
    void restartServer() {
        Serial.println("[Server] Restarting...");
        heartbeatTicker.detach();
        
        // 1. Stop hotspot
        WiFi.softAPdisconnect(true);
        Serial.println("[Server] Hotspot stopped.");

        // 2. Stop server
        ws.closeAll();  
        server.end();  
        Serial.println("[Server] Server stopped.");

        delay(1000);

        // 3. Restart server
        begin(); 
        Serial.println("[Server] Restart completed.");
    }

    //5) Add Client - To add new record for new websocket connection
    bool addClient(const uint32_t clientId) {
      for (int i = 0; i < MAX_SOCKET; i++) {
          if (clientList[i].clientId == 0) {   // free slot
              clientList[i].clientId = clientId;
              clientList[i].sessionId[0] = '\0';
              clientList[i].isVerified = false;
              clientList[i].lastPong  = millis();
              return true;
          }
      }
      return false; // no slot available
  }

    //6) Remove Client - to remove the disconnected client
    void removeClient(const uint32_t clientId) {
        for (int i = 0; i < MAX_SOCKET; i++) {
            if (clientList[i].clientId == clientId) {
                clientList[i].clientId = 0;
                clientList[i].sessionId[0] = '\0';
                clientList[i].isVerified = false;
                clientList[i].lastPong  = 0;
                return;
            }
        }
    }

    //7) Mark As Verified - to mark the connected websocket client as verified and authenticated
    void markAsVerified(const uint32_t clientId, const char* sessionId){
        for(int i=0; i<MAX_SOCKET; i++){
            if(clientList[i].clientId == clientId){
                strncpy(clientList[i].sessionId, sessionId, 15);
                clientList[i].sessionId[15] = '\0';
                clientList[i].isVerified = true;
                return;
            }
        }
    }

    //8) Is verified - to check whether the client is verified/ authenticated or not
    bool isVerified(const uint32_t clientId, char* outString){
        for(int i=0; i<MAX_SOCKET; i++){
            if(clientList[i].clientId == clientId){
                if(clientList[i].isVerified){
                    if(outString != nullptr){
                        strncpy(outString, clientList[i].sessionId, 15);
                        outString[15] = '\0';
                    }
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    //9) Is Authenticated(Kind of middleware) - to check whether a http request has access to perform
    bool isAuthenticated(AsyncWebServerRequest *request, const char* action){
        char sessionId[16] = {0};
        if (!getCookie(request, sessionId, sizeof(sessionId))) {
            request->send(400, "text/plain", "Session cookie not found");
            return false;
        }
        if(!Auth::isValid(sessionId)){
            request->send(401, "text/plain", "Unauthenticated");
            return false;
        }
        if(!Auth::isAllowedTo(sessionId, action)){
            request->send(403, "text/plain", "Not Allowded To Perform This Action");
            return false;
        }
        return true;
    }

    //10) custom Heartbeat (check for stale sockets and remove it)
    void customHeartbeat() {
        ws.pingAll();
        unsigned long now = millis();
        for (int i = 0; i < MAX_SOCKET; i++) {
            if (now - clientList[i].lastPong > CLIENT_TIMEOUT_MS && clientList[i].clientId !=0 ) {
                AsyncWebSocketClient* deadClient = ws.client(clientList[i].clientId);
                if (deadClient) {
                    deadClient->close(4000, "NO PONG"); // mark dead
                }
            }
        }
        ws.cleanupClients();
    }

    //11) Add Pong (adds latest pong interval)
    void addPong(uint32_t clientId){
        for (int i = 0; i < MAX_SOCKET; i++) {
            if(clientList[i].clientId == clientId){
                clientList[i].lastPong = millis();
                break;
            }
        }
    }

public:
    static MyWebserver& getInstance() {
        static MyWebserver instance;
        return instance;
    }
    //Esposes some public function 
    //1) Begin - To start AP, webserver and listen for new websocket request, and api endpoints
    void begin() {
        Serial.println("Starting Webserver...");
        WiFi.mode(WIFI_AP_STA);
        //fetch wifi ssid from db
        {
            FixedString32 tmp;
            if (generalDb.get("SSID", &tmp)) {
                size_t copyN = sizeof(ssid);
                if (copyN > sizeof(tmp)) copyN = sizeof(tmp);
                memcpy(ssid, &tmp, copyN);
                ssid[sizeof(ssid) - 1] = '\0';
            }
        }
        //fetch wifi password from db
        {
            FixedString32 tmp;
            if (generalDb.get("PASSWORD", &tmp)) {
                size_t copyN = sizeof(password);
                if (copyN > sizeof(tmp)) copyN = sizeof(tmp);
                memcpy(password, &tmp, copyN);
                password[sizeof(password) - 1] = '\0';
            }
        }
        //fetch sta ssid from db
        {
            FixedString32 tmp;
            if (generalDb.get("STA_SSID", &tmp)) {
                size_t copyN = sizeof(sta_ssid);
                if (copyN > sizeof(tmp)) copyN = sizeof(tmp);
                memcpy(sta_ssid, &tmp, copyN);
                sta_ssid[sizeof(sta_ssid) - 1] = '\0';
            }
        }
        //fetch sta password from db
        {
            FixedString32 tmp;
            if (generalDb.get("STA_PASSWORD", &tmp)) {
                size_t copyN = sizeof(sta_password);
                if (copyN > sizeof(tmp)) copyN = sizeof(tmp);
                memcpy(sta_password, &tmp, copyN);
                sta_password[sizeof(sta_password) - 1] = '\0';
            }
        }

        //initialise littleFS filesystem
        if (!LittleFS.begin(true)) {
            Serial.println("LittleFS Mount Failed");
            return;
        }

        // Start AP
        if(WiFi.softAP(ssid, password)){
            ip = WiFi.softAPIP();
            Serial.println("Access Point started");
            Serial.print("IP address: "); Serial.println(ip);
            Serial.print("SSID: "); Serial.println(ssid);
            Serial.print("Password: "); Serial.println(password);
        }else{
            Serial.println("Failed To Start WIFI Access Point");
            return;
        }

        //start STA
        WiFi.begin(sta_ssid, sta_password);
        Serial.println("Connecting to WiFi (STA)...");
        int retries = 10;
        while (WiFi.status() != WL_CONNECTED && retries > 0) {
            delay(500);
            Serial.print(".");
            retries--;
        }
        if(retries != 0){
            Serial.println("\nConnected as STA!");
            Serial.print("STA IP: ");   Serial.println(WiFi.localIP());
        }

//     WebSocket event handler
       ws.onEvent([this](AsyncWebSocket *serverPtr, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
           uint32_t clientId = client->id();
           switch (type) {
                case WS_EVT_PONG:
                  this->addPong(clientId);
                  break;
                case WS_EVT_CONNECT: {
                   // Ensure one socket per IP
                   IPAddress remoteIp = client->remoteIP();
                   
                   for (auto &existingClient : serverPtr->getClients()) {
                       if (existingClient.id() != client->id() && existingClient.remoteIP() == client->remoteIP()) {
                            existingClient.close(3001, "TOO MANY REQUESTS");
                       }
                   }
                   // Add client (unverified yet)
                   if (!addClient(clientId)) {
                        client->close(1013, "CLIENT CAPACITY FULL");
                       return;
                   }
               } break;

               case WS_EVT_DISCONNECT: {
                   char sessionId[16];
                   if (isVerified(clientId, sessionId)) {
                       Auth::informSocket(sessionId, clientId, false);
                   }
                   removeClient(clientId);
                   removeSubscriber(clientId, "*");
               } break;

               case WS_EVT_DATA: {
                   char msg[64];
                   size_t copyLen = (len < sizeof(msg) - 1) ? len : sizeof(msg) - 1;
                   memcpy(msg, data, copyLen);
                   msg[copyLen] = '\0';

                   // If not verified yet, expect VERIFY-SESSIONID
                   char sessionId[16];
                   if (!isVerified(clientId, sessionId)) {
                       if (strncmp(msg, "VERIFY-", 7) == 0 && strlen(msg + 7) == 15) {
                           strncpy(sessionId, msg + 7, 15);
                           sessionId[15] = '\0';
                           // TODO: validate sessionId via Auth::isValid(sessionId)
                           if (!Auth::isValid(sessionId)) {
                                client->close(1008, "UNAUTHORIZED");
                               return;
                           }

                           Auth::informSocket(sessionId, clientId, true);
                           
                           markAsVerified(clientId, sessionId);
                           client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"verify\",\"status\":true}}");
                       } else {
                            client->close(1008, "BAD MESSAGE");
                       }
                       return;
                   }

                   // Client is verified → only SUB-XXXXXXXX or UNS-XXXXXXXX allowed
                   if (strncmp(msg, "SUB-", 4) == 0) {
                       char channel[CHANNEL_NAME_SIZE];
                       strncpy(channel, msg + 4, CHANNEL_NAME_SIZE - 1);
                       channel[CHANNEL_NAME_SIZE - 1] = '\0';

                       if (strlen(channel) == 7) {
                           bool success = addSubscriber(clientId, channel);
                           if (success) {
                               client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"suback\",\"status\":true}}");
                              AppCore::refreshRecords();
                           } else {
                               client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"suback\",\"status\":false}}");
                           }
                       } else {
                           client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"suback\",\"reason\":\"Channel Name not Valid\",\"status\":false}}");
                       }
                   } else if (strncmp(msg, "UNS-", 4) == 0) {
                       char channel[CHANNEL_NAME_SIZE];
                       strncpy(channel, msg + 4, CHANNEL_NAME_SIZE - 1);
                       channel[CHANNEL_NAME_SIZE - 1] = '\0';

                       if (strlen(channel) == 7) {
                           removeSubscriber(clientId, channel);
                           client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"unsack\",\"status\":true}}");
                       } else {
                            client->text("{\"type\":\"msg\",\"data\":{\"subject\":\"suback\",\"reason\":\"Channel Name not Valid\",\"status\":false}}");
                       }
                   } else {
                        client->close(1008, "INVALID MESSAGE");
                   }
               } break;

               default:
                   break;
           }
       });

        // Instruct server to server webpage on default routes
        server.serveStatic("/", LittleFS, "/dist").setDefaultFile("index.html");

        // Handle Api endpoints
        // 1) GET /login?username=admin&password=admin123
        server.on("/api/login", HTTP_GET, [this](AsyncWebServerRequest *request) {
            if (!request->hasParam("username") || !request->hasParam("password")) {
                request->send(400, "text/plain", "Missing Username Or Password");
                return;
            }

            char username[32] = {0};
            char passwordBuf[32] = {0};

            const AsyncWebParameter* pUser = request->getParam("username");
            const AsyncWebParameter* pPass = request->getParam("password");

            if (pUser != nullptr) {
                pUser->value().toCharArray(username, sizeof(username));
            }

            if (pPass != nullptr) {
                pPass->value().toCharArray(passwordBuf, sizeof(passwordBuf));
            }

            ActiveUser activeUser = Auth::login(username, passwordBuf);
            
            if (!activeUser.valid) {
                request->send(activeUser.errCode, "text/plain", activeUser.errCode ==401 ? "Invalid Username Or Password" : "Server Reached Max Login capacity");
                return;
            }
            
           char cookieBuf[128];
           snprintf(cookieBuf, sizeof(cookieBuf), "session_id=%s; Path=/", activeUser.cookie);

            
            char jsonBuf[256]; // adjust based on max expected size
            AppCore::activeUserToJson(&activeUser, jsonBuf, sizeof(jsonBuf));

            // create response, add header, send
            AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", jsonBuf);
            resp->addHeader("Set-Cookie", cookieBuf);
            request->send(resp);
        });

        //2) GET /logout
        server.on("/api/logout", HTTP_GET, [this](AsyncWebServerRequest *request) {
            char sessionId[16] = {0};
            if (!getCookie(request, sessionId, sizeof(sessionId))) {
                request->send(400, "text/plain", "Session cookie not found");
                return;
            }
            if(!Auth::isValid(sessionId)){
                request->send(401, "text/plain", "Unauthenticated");
                return;
            }

            Auth::logout(sessionId);

            char clearCookie[128];
            snprintf(clearCookie, sizeof(clearCookie), "session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");

            AsyncWebServerResponse *resp = request->beginResponse(200, "application/json", "{\"status\":\"logged_out\"}");
            resp->addHeader("Set-Cookie", clearCookie);
            request->send(resp);
        });

        //3) GET getSettings
        server.on("/api/getSettings", HTTP_GET, [this](AsyncWebServerRequest *request) {
            if(!isAuthenticated(request, "SETTING"))   return;
            char jsonBuf[3072];
            AppCore::getSettings(jsonBuf, sizeof(jsonBuf));
            request->send(200, "application/json", jsonBuf);
        });       

        //4) GET getSecurityCredintials
        server.on("/api/getSecurityCredintials", HTTP_GET, [this](AsyncWebServerRequest *request) {
            if(!isAuthenticated(request, "SECURITY"))   return;
            char jsonBuf[2048]; // Adjust size to fit max expected JSON
            AppCore::getSecurityCreds(jsonBuf, sizeof(jsonBuf));
            request->send(200, "application/json", jsonBuf);
        });

        //5) POST /reset?monitorCode=700
        server.on("/api/reset", HTTP_POST, [this](AsyncWebServerRequest *request) {
            if(!isAuthenticated(request, "SETTING"))   return;
            const AsyncWebParameter *p = request->getParam("monitorCode");
            if (!p) {
                request->send(400, "text/plain", "Missing monitorCode");
                return;
            }
            char monitorCode[32]; 
            p->value().toCharArray(monitorCode, sizeof(monitorCode));

            AppCore::reset(monitorCode);
            request->send(200, "application/json", "{\"status\":\"OK\"}");
        });

        //6) POST /delete?monitorCode=700
        server.on("/api/delete", HTTP_POST, [this](AsyncWebServerRequest *request) {
           if(!isAuthenticated(request, "SETTING"))   return;
            const AsyncWebParameter *p = request->getParam("monitorCode");
            if (!p) {
                request->send(400, "text/plain", "Missing monitorCode");
                return;
            }

            char monitorCode[32]; 
            p->value().toCharArray(monitorCode, sizeof(monitorCode));

            if (AppCore::remove(monitorCode)) {
                 request->send(200, "application/json", "{\"status\":\"OK\"}");
            } else {
                request->send(404, "text/plain", "Record Not Found");
            }
        });

        //7) POST /update { "a2": 1.50, "d3": 0, "d4": 3.50, "usl": 26.00, "lsl": 25.95, "datapointSize": 30, "machineName": "machineName", "machineIP": "machineIP", "toolOffsetNumber": 30, "offsetSize": 20, "monitorCode":"700" }
        server.on("/api/update", HTTP_POST, [this](AsyncWebServerRequest *request) {}, nullptr, [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
                if(!isAuthenticated(request, "SETTING"))   return;

                if (len >= 512) {
                    request->send(400, "text/plain", "JSON Data Too Large");
                    return;
                }

                StaticJsonDocument<512> doc; 
                DeserializationError err = deserializeJson(doc, data, len);
                if (err) {
                    request->send(400, "text/plain", "Invalid JSON Data");
                    return;
                }

                const char *monitorCode = doc["monitorCode"] | "";
                const char *machineName = doc["machineName"] | "";
                const char *machineIP   = doc["machineIP"] | "";
                float a2                = doc["a2"]  | 0.0f;
                float d3                = doc["d3"]  | 0.0f;
                float d4                = doc["d4"]  | 0.0f;
                float usl               = doc["usl"] | 0.0f;
                float lsl               = doc["lsl"] | 0.0f;
                int datapointSize       = doc["datapointSize"] | 0;
                int toolOffsetNumber    = doc["toolOffsetNumber"] | 0;
                float offsetSize          = doc["offsetSize"] | 0.0f;

                bool success = AppCore::update(monitorCode, a2, d3, d4, usl, lsl, datapointSize, machineName, machineIP, toolOffsetNumber, offsetSize);

                if (success) {
                    request->send(200, "application/json", "{\"status\":\"OK\"}");
                } else {
                    request->send(507, "text/plain", "Max Setting Storage Limit Reached");
                }
            }
        );

        //8) POST /updateWifi {"ssid": "newSSID", "password":"newpassword"}
        server.on("/api/updateWifi", HTTP_POST, [this](AsyncWebServerRequest *request) { }, nullptr, [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
                if(!isAuthenticated(request, "SECURITY"))   return;

                if (len >= 128) {
                    request->send(400, "text/plain", "JSON Data Too Large");
                    return;
                }

                StaticJsonDocument<128> doc;
                DeserializationError err = deserializeJson(doc, data, len);
                if (err) {
                    request->send(400, "text/plain", "Invalid JSON Data");
                    return;
                }

                const char *ssid     = doc["ssid"]     | "";
                const char *password = doc["password"] | "";

                if (strlen(ssid) <= 7 || strlen(password) <= 7) {
                    request->send(400, "text/plain", "Length of password and ssid must be greater than 7");
                    return;
                }

                AppCore::updateWifi(ssid, password);
                request->send(200, "application/json", "{\"status\":\"ok\"}");
                delay(2000);
                restartServer();
            }
        );

        //9) POST /updateSTA {"ssid": "newSSID", "password":"newpassword"}
        server.on("/api/updateSTA", HTTP_POST, [this](AsyncWebServerRequest *request) { }, nullptr, [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
                if(!isAuthenticated(request, "SECURITY"))   return;

                if (len >= 128) {
                    request->send(400, "text/plain", "JSON Data Too Large");
                    return;
                }

                StaticJsonDocument<128> doc;
                DeserializationError err = deserializeJson(doc, data, len);
                if (err) {
                    request->send(400, "text/plain", "Invalid JSON Data");
                    return;
                }

                const char *ssid     = doc["ssid"]     | "";
                const char *password = doc["password"] | "";

                if (strlen(ssid) <= 7 || strlen(password) <= 7) {
                    request->send(400, "text/plain", "Length of password and ssid must be greater than 7");
                    return;
                }

                AppCore::updateSTA(ssid, password);
                request->send(200, "application/json", "{\"status\":\"ok\"}");
                restartServer();
            }
        );

        //10) POST /updateRole {"username": "username", "password":"newpassword", "userAlias":"newUserAlias", "allowedTo":["SETTING", "MONITOR"...]}
        server.on("/api/updateRole", HTTP_POST, [this](AsyncWebServerRequest *request) { }, nullptr, [this](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
                if(!isAuthenticated(request, "SECURITY"))   return;

                if (len >= 256) {
                    request->send(400, "text/plain", "JSON Data Too Large");
                    return;
                }

                StaticJsonDocument<256> doc;
                DeserializationError err = deserializeJson(doc, data, len);
                if (err) {
                    request->send(400, "text/plain", "Invalid JSON Data");
                    return;
                }

                const char *username   = doc["username"]  | "";
                const char *password   = doc["password"]  | "";
                const char *userAlias  = doc["userAlias"] | "";

                char allowedTo[5][10] = {{0}};
                int allowedCount = 0;

                JsonArray arr = doc["allowedTo"].as<JsonArray>();
                if (!arr.isNull()) {
                    for (JsonVariant v : arr) {
                        if (allowedCount >= 5) break;
                        strncpy(allowedTo[allowedCount], v.as<const char*>(), sizeof(allowedTo[allowedCount]) - 1);
                        allowedCount++;
                    }
                }

                if (Auth::createNewUser(username, password, userAlias, allowedTo, allowedCount)) {
                    request->send(200, "application/json", "{\"status\":\"ok\"}");
                } else {
                    request->send(507, "text/plain", "Max User Capacity Reached");
                }
            }
        );

        //11)POST /deleteRole?username=xyz
        server.on("/api/deleteRole", HTTP_POST, [this](AsyncWebServerRequest *request) {
            if(!isAuthenticated(request, "SECURITY"))   return;
            const AsyncWebParameter *p = request->getParam("username");
            if (!p) {
                request->send(400, "text/plain", "Missing Username");
                return;
            }
            char username[32] = {0};
            request->getParam("username")->value().toCharArray(username, sizeof(username));

            if (Auth::deleteRole(username)) {
                request->send(200, "application/json", "{\"status\":\"ok\"}");
            } else {
                request->send(404, "text/plain", "Role not found");
            }
        });

        //Default route handeling
        server.onNotFound([](AsyncWebServerRequest *request) {
            request->send(LittleFS, "/dist/index.html", "text/html");
        });
        
        server.addHandler(&ws);
        heartbeatTicker.attach_ms(5000, []() {
            MyWebserver::getInstance().customHeartbeat();
        });
        server.begin();
    } 

    //2) Publish - To publish data at specific channel
    void publish(const char* channel, const char* msg) {
        if (!channel || !msg) return;

        char out[3072];
        snprintf(out, sizeof(out), "{\"type\":\"content\",\"channel\":\"%s\",\"data\":%s}", channel, msg);

        for (int i = 0; i < activeSubscribers; ++i) {
            if (strncmp(subscribersList[i].channel, channel, CHANNEL_NAME_SIZE) == 0) {
                uint32_t clientId = subscribersList[i].clientId;
                AsyncWebSocketClient* c = ws.client(clientId);
                if (c) {
                    c->text(out);
                } else {
                    ws.text(clientId, out);
                }
            }
        }
    }

    //3) Disconnect Socket - To forcefully disconnect specific socket
    void disconnectSocket(const uint32_t clientId) {
        AsyncWebSocketClient* c = ws.client(clientId);
        if (c) c->close(1000, "FORCEFULLY LOGGED OUT");
    }
};

// global reference
inline MyWebserver& webserver = MyWebserver::getInstance();

#endif // MY_WEBSERVER_H
