#ifndef MYDB_H
#define MYDB_H

#include <Preferences.h>
#include "SPCSettings.h"

class _MyDB {
private:
    Preferences prefs;
    bool initialized = false;
    const String namespace = 'SPCSettings';

public:
    void begin() {
        if (!initialized) {
            prefs.begin(namespace, false); 
            initialized = true;
        }
    }

    void set(const String& key, const SPCSettings& value) {
        if (initialized) {
            prefs.putBytes(key.c_str(), &value, sizeof(SPCSettings));
        }
    }

    SPCSettings get(const String& key) {
        SPCSettings value = {};
        if (initialized) {
            prefs.getBytes(key.c_str(), &value, sizeof(SPCSettings));
        }
        return value;
    }

    bool has(const String& key) {
        return initialized && prefs.getBytesLength(key.c_str()) == sizeof(SPCSettings);
    }

    void remove(const String& key) {
        if (initialized) {
            prefs.remove(key.c_str());
        }
    }
};

static _MyDB db;

#endif
