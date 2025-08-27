#ifndef MYDB_H
#define MYDB_H

#include <Preferences.h>
#include <cstring>
#include "stdStructs.h" // SPCSettings, UserRoles, etc.

#define MAX_NAMESPACE_LEN 16
#define MAX_DB_INSTANCES 5
#define MAX_KEYS 10
#define MAX_KEY_LEN 32

//class to store keys in each db instance
class KeyStore {
public:
    struct KeyList {
        char keys[MAX_KEYS][MAX_KEY_LEN];
        size_t size = 0;
    };

private:
    Preferences prefs;
    bool initialized = false;
    char ns[MAX_NAMESPACE_LEN] = "keyStore";

    KeyStore() {
        prefs.begin(ns, false);  // initialize namespace automatically
        initialized = true;
    }

    KeyStore(const KeyStore&) = delete;
    KeyStore& operator=(const KeyStore&) = delete;

public:
    static KeyStore& getInstance() {
        static KeyStore instance; // auto-created singleton
        return instance;
    }

    void addKey(const char* dbNamespace, const char* key) {
        KeyList keys = getKeys(dbNamespace);
        for(int i=0; i<keys.size; i++){
          if(strcmp(keys.keys[i], key)==0) return; 
        }
        if (keys.size < MAX_KEYS) {
            strncpy(keys.keys[keys.size], key, MAX_KEY_LEN - 1);
            keys.keys[keys.size][MAX_KEY_LEN - 1] = '\0';
            keys.size++;
            setKeys(dbNamespace, keys);
        }
    }

    void removeKey(const char* dbNamespace, const char* key) {
        KeyList keys = getKeys(dbNamespace);
        int index = -1;
        for (size_t i = 0; i < keys.size; i++) {
            if (strcmp(keys.keys[i], key) == 0) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            for (size_t i = index; i < keys.size - 1; i++) {
                strncpy(keys.keys[i], keys.keys[i + 1], MAX_KEY_LEN);
            }
            keys.size--;
            setKeys(dbNamespace, keys);
        }
    }

    KeyList getKeys(const char* dbNamespace) {
        KeyList keys = {};
        size_t len = prefs.getBytesLength(dbNamespace);
        if (len == sizeof(KeyList)) {
            prefs.getBytes(dbNamespace, &keys, sizeof(KeyList));
        }
        return keys;
    }

private:
    void setKeys(const char* dbNamespace, const KeyList& keys) {
        prefs.putBytes(dbNamespace, &keys, sizeof(KeyList));
    }
};

template <typename T>
class MyDB {
private:
    Preferences prefs;
    bool initialized = false;
    char ns[MAX_NAMESPACE_LEN]; // fixed buffer for namespace

    struct InstanceEntry {
        char ns[MAX_NAMESPACE_LEN];
        MyDB<T>* instance;
    };

    static InstanceEntry instances[MAX_DB_INSTANCES];

    MyDB(const char* namespaceName) {
        strncpy(ns, namespaceName, sizeof(ns) - 1);
        ns[sizeof(ns) - 1] = '\0';
    }

    MyDB(const MyDB&) = delete;
    MyDB& operator=(const MyDB&) = delete;

public:
    static MyDB<T>& getInstance(const char* namespaceName) {
        // Check if instance exists
        for (size_t i = 0; i < MAX_DB_INSTANCES; i++) {
            if (instances[i].instance != nullptr &&
                strcmp(instances[i].ns, namespaceName) == 0) {
                return *(instances[i].instance);
            }
        }

        // Find empty slot
        for (size_t i = 0; i < MAX_DB_INSTANCES; i++) {
            if (instances[i].instance == nullptr) {
                MyDB<T>* instance = new MyDB<T>(namespaceName);
                strncpy(instances[i].ns, namespaceName, sizeof(instances[i].ns) - 1);
                instances[i].ns[sizeof(instances[i].ns) - 1] = '\0';
                instances[i].instance = instance;
                return *instance;
            }
        }

        Serial.println("MyDB: No space for more instances!");
        while (true) { delay(1000); }
    }

    void begin() {
        if (!initialized) {
            prefs.begin(ns, false);
            initialized = true;
        }
    }

    void set(const char* key, const T& value) {
        if (!initialized) return;
        prefs.putBytes(key, &value, sizeof(T));
        Serial.printf("[%s] Set key: %s\n", ns, key);

        // Add key to KeyStore
        KeyStore::getInstance().addKey(ns, key);
    }

    bool get(const char* key, T* out) {
        if (!initialized || !out) return false;
        if (prefs.getBytesLength(key) == sizeof(T)) {
            prefs.getBytes(key, out, sizeof(T));
            Serial.printf("[%s] Got key: %s\n", ns, key);
            return true;
        }
        return false;
    }

    bool has(const char* key) {
        if (!initialized) return false;
        return prefs.isKey(key);
    }

    void remove(const char* key) {
        if (!initialized) return;
        prefs.remove(key);
        KeyStore::getInstance().removeKey(ns, key);
        Serial.printf("[%s] Removed key: %s\n", ns, key);
    }

    typename KeyStore::KeyList getKeys() {
        return KeyStore::getInstance().getKeys(ns);
    }
};

// Static storage for instances
template <typename T>
typename MyDB<T>::InstanceEntry MyDB<T>::instances[MAX_DB_INSTANCES] = {};

// Typedefs
using SPCSettingsDB = MyDB<SPCSettings>;
using UserRolesDB   = MyDB<User>;
using GeneralDb     = MyDB<FixedString32>;

// Inline global references
inline GeneralDb& generalDb = GeneralDb::getInstance("generalDb");
inline SPCSettingsDB& spcDb = SPCSettingsDB::getInstance("SPCSettings");
inline UserRolesDB& userRolesDb = UserRolesDB::getInstance("UserRoles");

#endif // MYDB_H
