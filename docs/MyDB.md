# 📄 MYDB.h – Persistent Settings Storage for ESP32

## 🧭 Purpose

This file (`MYDB.h`) provides a **lightweight**, **persistent**, and **easy-to-use** interface for storing structured data (specifically `SPCSettings`) in the ESP32's **non-volatile flash memory** using the built-in `Preferences` API.

The implementation is based on a **singleton design pattern**, meaning you access it through a single global object called `db`.

---

## 📦 Prerequisites

- ESP32 board
- Arduino framework
- `Preferences.h` available in ESP-IDF / Arduino core
- Custom struct `SPCSettings` declared in `"stdStructs.h"`

---

## 🧱 File Structure

```cpp
#ifndef MYDB_H
#define MYDB_H

#include <Preferences.h>
#include "stdStructs.h"

class _MyDB {
    ...
};
inline _MyDB db;

#endif
