#include "MyDB.h"   //To initialize a persistant Key-Value based persistant database -- Read /docs/Mydb.md
#include "MyInputParser.h"    //To start reading serial input and parse & pass to handlers -- Read /docs/MyInputParser.md
#include "MyWebserver.h"    //To handle webserver backend -- Read /docs/MyWebserver.md
#include "stdStructs.h"     //This exposes user defined structures necessary to enwrap multiple related variables -- Read /docs/stdStructs.md


void setup(){
//Begin Serial Output
    Serial.begin(115200);
    
//Begin Databases
    generalDb.begin();
    spcDb.begin();
    userRolesDb.begin();
//Initialize Default Config
    if(!generalDb.has("SSID") || !generalDb.has("PASSWORD")){
        Serial.println("Config Parameters Not Found! Setting Up Default Parameters! - WIFI Credintials");
        FixedString32 ssid = {"ZANVAR_INDUSTRY"};
        FixedString32 password = {"12345678"};
        generalDb.set("SSID", ssid);
        generalDb.set("PASSWORD", password);
    }  
    if(!generalDb.has("STA_SSID") || !generalDb.has("STA_PASSWORD")){
        Serial.println("Config Parameters Not Found! Setting Up Default Parameters! - WIFI Credintials");
        FixedString32 ssid = {"WIFI_NAME"};
        FixedString32 password = {"12345678"};
        generalDb.set("STA_SSID", ssid);
        generalDb.set("STA_PASSWORD", password);
    }
    if(!userRolesDb.has("admin")){
        Serial.println("Config Parameters Not Found! Setting Up Default Parameters! - ADMIN Credintials");
        User adminRole = {};
        strncpy(adminRole.username, "admin", sizeof(adminRole.username) - 1);
        strncpy(adminRole.userAlias, "admin", sizeof(adminRole.userAlias) - 1);
        strncpy(adminRole.password, "admin123", sizeof(adminRole.password) - 1);
        strncpy(adminRole.allowedTo.data[0], "SETTING", sizeof(adminRole.allowedTo.data[0]) - 1);
        strncpy(adminRole.allowedTo.data[1], "SECURITY", sizeof(adminRole.allowedTo.data[1]) - 1);
        strncpy(adminRole.allowedTo.data[2], "MONITOR", sizeof(adminRole.allowedTo.data[2]) - 1);
        adminRole.allowedTo.size = 3;
        userRolesDb.set("admin", adminRole);
    }
//Begin Webserver
    webserver.begin();
//Begin Input Stream Reading
   inputStream.begin();
}

/*DEMO INPUT LOGIC*/
float getRandomFloat(float a, float b) {
  if (a > b) {
    float temp = a;
    a = b;
    b = temp;
  }

  // Generate random 32-bit number
  uint32_t r = esp_random();

  // Normalize to [0,1]
  float normalized = (float)r / (float)UINT32_MAX;

  // Scale to [a, b]
  float randomVal = a + normalized * (b - a);

  // Round to 3 decimals
  randomVal = roundf(randomVal * 1000.0f) / 1000.0f;

  return randomVal;
}


void loop(){
    //nothing is needed here
     inputStream.read();
    // delay(5000);


    // /*DEMO INPUT LOGIC*/
    // auto keys = spcDb.getKeys();
    // for(int i=0; i<keys.size; i++){
    //     SPCSettings data;
    //     if (spcDb.get(keys.keys[i], &data)) {
    //         spcHandler.insertParameter(keys.keys[i], getRandomFloat(data.lsl, data.usl));  
    //     }
    // }
    // delay(20000);
}