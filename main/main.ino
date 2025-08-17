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
    if(!generalDb.has("ssid") || !generalDb.has("ssid")){
        Serial.println("Config Parameters Not Found! Setting Up Default Parameters! - WIFI Credintials");
        FixedString32 ssid = {"ZANVAR_INDUSTRY"};
        FixedString32 password = {"12345678"};
        generalDb.set("ssid", ssid);
        generalDb.set("password", password);
    }  
    if(!userRolesDb.has("admin")){
        Serial.println("Config Parameters Not Found! Setting Up Default Parameters! - ADMIN Credintials");
        User adminRole = {};
        strncpy(adminRole.username, "admin", sizeof(adminRole.username) - 1);
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

void loop(){
    //nothing is needed here
}
