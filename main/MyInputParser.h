#ifndef MYINPUTHANDLER_H
#define MYINPUTHANDLER_H

#include "MYSPCHandler.h"
#include <Arduino.h>

#define BUFFER_SIZE 512
#define RX 16
#define TX 17

class MyInputHandler {
private:
    char buffer[BUFFER_SIZE];
    int bufferIndex = 0;
    bool capturing = false;

    // Private constructor (singleton)
    MyInputHandler() {}
    MyInputHandler(const MyInputHandler&) = delete;
    MyInputHandler& operator=(const MyInputHandler&) = delete;

    // Collect characters until a complete block is received
    void parseBlock(char c) {
        if (c == '%') {
            if (!capturing) {
                // Start a new block
                bufferIndex = 0;
                buffer[bufferIndex++] = c;
                capturing = true;
            } else {
                // End block
                buffer[bufferIndex++] = c;
                buffer[bufferIndex] = '\0'; // terminate string

                parseValue(buffer); // send complete block

                // Reset for next block
                capturing = false;
                bufferIndex = 0;
            }
        } else if (capturing) {
            if (bufferIndex < BUFFER_SIZE - 1) {
                buffer[bufferIndex++] = c;
            } else {
                // Overflow -> reset
                bufferIndex = 0;
                capturing = false;
                Serial.println("Error: Buffer overflow in MyInputHandler");
            }
        }
    }

    // Parse completed block, extract key-value pairs
    void parseValue(const char* block) {
        char buf[BUFFER_SIZE];
        strncpy(buf, block, sizeof(buf) - 1);
        buf[sizeof(buf) - 1] = '\0';

        char* line = strtok(buf, "\n\r");
        while (line != nullptr) {
            // Trim spaces
            while (*line == ' ' || *line == '\t') line++;

            // Parameter lines start with #
            if (line[0] == '#') {
                char* equalSign = strchr(line, '=');
                if (equalSign) {
                    char key[32] = {0};
                    int keyLen = equalSign - (line + 1);
                    if (keyLen > 0 && keyLen < (int)sizeof(key)) {
                        strncpy(key, line + 1, keyLen);
                        key[keyLen] = '\0';
                    }

                    float value = atof(equalSign + 1);

                    spcHandler.insertParameter(key, value);
                }
            }

            line = strtok(nullptr, "\n\r");
        }
    }

public:
    static MyInputHandler& getInstance() {
        static MyInputHandler instance;
        return instance;
    }

    void begin() {
        Serial1.begin(9600, SERIAL_8N1, RX, TX); 
    }

    void read() {
        while (Serial1.available()) {
            char c = (char)Serial1.read();
            parseBlock(c);
        }
    }
};

// Global reference
inline MyInputHandler& inputStream = MyInputHandler::getInstance();

#endif
