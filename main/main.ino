#include "MyDB.h"
#include "MyInputParser.h"
#include "MyWebserver.h"

//demo mode 
#include "MYSPChandler.h"

void setup(){
    db.begin();
    inputStream.begin();
    server.begin();
}

void loop(){
    //blank for now
    spchandler.insertParameter('700', getRandomFloat());
    delay(2000);
}