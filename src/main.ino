#include "MyDB.h"
#include "MyInputParser.h"
#include "MyWebserver.h"

void setup(){
    db.begin();
    inputStream.begin();
    server.begin();
}

void loop(){
    //blank for now
}