#include "MyDB.h"
//#include "MyInputParser.h"
#include "MyWebserver.h"
#include "stdStructs.h"

//demo mode 
//#include "MySPCHandler.h"
#include "esp_system.h"  // Required for esp_random()

float getRandomFloat() {
    // Generate random float between 0.0 and 1.0
    float randFloat = (float)(esp_random() & 0xFFFFFF) / 0xFFFFFF;
    
    // Scale to range 25.950 to 26.000
    return 25.950 + randFloat * (26.000 - 25.950);
}


void setup(){
    Serial.begin(115200);
    generalDb.begin();
    spcDb.begin();
    userRolesDb.begin();
    keyStoreDb.begin();
    // inputStream.begin();
    webserver.begin();
    if (!userRolesDb.has("admin")) {
        User adminRole = {};

        // Copy username and password
        strncpy(adminRole.username, "admin", sizeof(adminRole.username) - 1);
        strncpy(adminRole.password, "admin123", sizeof(adminRole.password) - 1);

        // Add roles
        strncpy(adminRole.allowedTo.data[0], "SETTING", sizeof(adminRole.allowedTo.data[0]) - 1);
        strncpy(adminRole.allowedTo.data[1], "SECURITY", sizeof(adminRole.allowedTo.data[1]) - 1);
        strncpy(adminRole.allowedTo.data[2], "MONITOR", sizeof(adminRole.allowedTo.data[2]) - 1);

        // Update size
        adminRole.allowedTo.size = 3;

        // Store in DB
        userRolesDb.set("admin", adminRole);
    }

}

void loop(){
    //blank for now
    // spchandler.insertParameter("700", getRandomFloat());
    // delay(2000);
}
