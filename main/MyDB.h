#ifndef MYDB_H
#define MYDB_H

#include <Preferences.h>
#include "stdStructs.h"

class _MyDB {
private:
    Preferences prefs;
    bool initialized = false;
    const char* _namespace = "SPCSettings";

    // 🔒 Make constructor private
    _MyDB() {}

    // 🔒 Prevent copy/assign (enforces singleton)
    _MyDB(const _MyDB&) = delete;
    _MyDB& operator=(const _MyDB&) = delete;

    // ✅ Only allow this specific object to construct
    friend _MyDB& db;

public:
    void begin() {
        if (!initialized) {
            prefs.begin(_namespace, false); 
            initialized = true;
        }
    }

    void set(const String& key, const SPCsettings& value) {
        if (initialized) {
            prefs.putBytes(key.c_str(), &value, sizeof(SPCSettings));
        }
    }

    bool get(const String& key, SPCSettings* out) {
        if (!initialized || out == nullptr) return false;

        if (prefs.getBytesLength(key.c_str()) == sizeof(SPCSettings)) {
            prefs.getBytes(key.c_str(), out, sizeof(SPCSettings));
            return true;
        }

        return false;
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

// ✅ Shared singleton-like instance
inline _MyDB db;

#endif // MYDB_H
