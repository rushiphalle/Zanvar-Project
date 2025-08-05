#ifndef MYINPUTPARSER_H
#define MYINPUTPARSER_H

#include "MYSPChandler.h"

class _MyInputParser {
private:
//your logic here    

public:
    void begin(){
        //initialize reading from uart/ whatever
        //write all logic here which you were supposed or had written in previous code for initalizing reading with 19200 baud rate and then after receiving each character just pass it to parseBlock(newChar)
    }

    void parseBlock(Char character){
        //parse block and call parseValue(block)
    }

    void parseValue(String block){
        //parse each key values and call spchandler.insertParameter(monitorCode, value) 
    }
};

inline _MyInputParser inputStream;

#endif



