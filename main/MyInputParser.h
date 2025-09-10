#ifndef MYINPUTHANDLER_H
#define MYINPUTHANDLER_H

#include "MySPCHandler.h"
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
                // Start new block
                bufferIndex = 0;
                buffer[bufferIndex++] = c;
                capturing = true;
            } else {
                // End block
                buffer[bufferIndex++] = c;
                buffer[bufferIndex] = '\0'; // terminate string

                // Validate block: must start and end with %
                if (bufferIndex > 2 && buffer[0] == '%' && buffer[bufferIndex - 1] == '%') {
                    parseValue(buffer); // send complete block
                }
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
            }
        }
    }

    // Parse completed block, extract key-value pairs
    void parseValue(const char* block) {
        char buf[BUFFER_SIZE];
        strncpy(buf, block, sizeof(buf) - 1);
        buf[sizeof(buf) - 1] = '\0';

        // Remove starting and ending '%'
        char* start = strchr(buf, '%');
        char* end   = strrchr(buf, '%');
        if (start && end && start != end) {
            *end = '\0';   // terminate at last %
            start++;       // move after first %
        } else {
            return; // invalid block
        }

        // Split into lines
        char* line = strtok(start, "\n\r");
        while (line != nullptr) {
            // Trim leading spaces
            while (*line == ' ' || *line == '\t') line++;

            // Parameter lines start with '#'
            if (line[0] == '#') {
                char* equalSign = strchr(line, '=');
                if (equalSign) {
                    // Extract key (after #, before '=')
                    char keyStr[16] = {0};
                    int keyLen = equalSign - (line + 1);
                    if (keyLen > 0 && keyLen < (int)sizeof(keyStr)) {
                        strncpy(keyStr, line + 1, keyLen);
                        keyStr[keyLen] = '\0';
                    }

                    float value = atof(equalSign + 1); // convert to float

                    // Call SPC handler with string key
                    spcHandler.insertParameter(keyStr, value);
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
