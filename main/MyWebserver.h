#ifndef MY_WEBSERVER_H
#define MY_WEBSERVER_H

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncWebSocket.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include "stdStructs.h"
#include "MyDB.h"
#include "MYSPChandler.h"

SPCsettings parseSettings(JsonObject obj) {
    SPCsettings settings;

    settings.usl = obj["USL"] | 0;
    settings.lsl = obj["LSL"] | 0;
    settings.d3 = obj["D3"] | 0;
    settings.d4 = obj["D4"] | 0;
    settings.a2 = obj["A2"] | 0;
    settings.datapointSize = obj["datapointSize"] | 0;

    // ArduinoJson returns const char*, convert to std::string
    settings.machineName = obj["machineName"] | "";
    settings.machineIP = obj["machineIP"] | "";

    settings.toolOffsetNumber = obj["toolOffsetNumber"] | 0;
    settings.offsetSize = obj["offsetSize"] | 0.0f;

    return settings;
}

class MyWebserver {
  private:
    AsyncWebServer server;
    AsyncWebSocket ws;
    IPAddress ip;

    const char* ssid = "ZANAVAR_IND";
    const char* password = "12345678";

  public:
    MyWebserver() : server(80), ws("/subscribe") {}

    void begin() {
      Serial.println("Starting Webserver...");
      if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS Mount Failed");
        return;
      }

      WiFi.softAP(ssid, password);
      delay(1000);
      ip = WiFi.softAPIP();

      Serial.println("Access Point started");
      Serial.print("IP address: "); Serial.println(ip);
      Serial.print("SSID: "); Serial.println(ssid);
      Serial.print("Password: "); Serial.println(password);

      server.serveStatic("/", SPIFFS, "/dist/").setDefaultFile("index.html");

      server.on("/update", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL,
        [this](AsyncWebServerRequest *request, uint8_t* data, size_t len, size_t, size_t) {
          DynamicJsonDocument doc(2048);
          if (deserializeJson(doc, data, len)) {
            request->send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
            return;
          }
          update(doc);
          request->send(200, "application/json", "{\"status\":\"updated\"}");
        });

      server.on("/reset", HTTP_GET, [this](AsyncWebServerRequest *request) {
        if (!request->hasParam("monitorCode")) {
          request->send(400, "text/plain", "Missing monitorCode");
          return;
        }
        String code = request->getParam("monitorCode")->value();
        reset(code);
        request->send(200, "application/json", "{\"status\":\"reset\"}");
      });

      server.on("/delete", HTTP_GET, [this](AsyncWebServerRequest *request) {
        if (!request->hasParam("monitorCode")) {
          request->send(400, "text/plain", "Missing monitorCode");
          return;
        }
        String code = request->getParam("monitorCode")->value();
        remove(code);
        request->send(200, "application/json", "{\"status\":\"deleted\"}");
      });

      ws.onEvent([this](AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
                        void *arg, uint8_t *data, size_t len) {
        if (type == WS_EVT_CONNECT) {
          Serial.printf("WebSocket Client %u connected\n", client->id());
        } else if (type == WS_EVT_DISCONNECT) {
          Serial.printf("WebSocket Client %u disconnected\n", client->id());
        }
      });

      server.addHandler(&ws);
      server.begin();
    }

    void send(DynamicJsonDocument& doc) {
      String json;
      serializeJson(doc, json);
      ws.textAll(json);
    }

  private:
    void update(JsonDocument& doc) {
      if(db.has(doc['machineCode'])){
        this->reset(doc['machineCode']);
      }
      db.set(doc['machineCode'], parseSettings(doc));
    }

    void reset(const String& monitorCode) {
      spchandler.reset(monitorCode);
    }

    void remove(const String& monitorCode) {
      db.remove(monitorCode);
      spchandler.remove(monitorCode);
    }
};

inline MyWebserver server;

#endif // MY_WEBSERVER_H
