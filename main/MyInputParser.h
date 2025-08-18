#ifndef MYINPUTHANDLER_H
#define MYINPUTHANDLER_H

#include "MYSPCHandler.h"

class MyInputHandler {
private:

    // Make constructor private
    MyInputHandler() {}

    // Prevent copy/assign (enforces singleton)
    MyInputHandler(const MyInputHandler&) = delete;
    MyInputHandler& operator=(const MyInputHandler&) = delete;

public:
    static MyInputHandler& getInstance() {
        static MyInputHandler instance;
        return instance;
    }

    void begin(){
        //this will remove all elements form the vector where key = monitorCode
    }

    void parseBlock(const char* character){
        //this will delete key value pair where key = monitorCode
    }

    void parseValue(const char* block){
        //this will check wheter it maps monitorCode with any vector if yes then add parameter at end of that vector and call calculateSPC() with new vector and if it dont holds then create new map record
    }
};

//Shared Singleton CLass
inline MyInputHandler& inputStream = MyInputHandler::getInstance();

#endif
