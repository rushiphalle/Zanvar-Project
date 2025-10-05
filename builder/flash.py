#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import re
import time
from pathlib import Path

# ------------------------
# 🚀 CONFIG
# ------------------------
PROJECT_ROOT = Path(__file__).resolve().parent
APP_BIN = PROJECT_ROOT / "app.bin"
BOOT_BIN = PROJECT_ROOT / "firmware.bin"
PART_BIN = PROJECT_ROOT / "partition.bin"
PARTITION_CSV = PROJECT_ROOT / "partition.csv"

ESPTOOL_CMD = "esptool.py"
BAUD_RATE = "460800"  # You can adjust (115200 for safe mode)
CHIP_TYPE = "esp32"

# ------------------------
# 🧠 Helper functions
# ------------------------
def log(msg):
    print(f"[FLASHER] {msg}")

def run_cmd(cmd):
    try:
        subprocess.run(cmd, shell=True, check=True)
    except subprocess.CalledProcessError:
        log(f"❌ Command failed: {cmd}")
        sys.exit(1)

# ------------------------
# 1️⃣ Ensure esptool exists
# ------------------------
def ensure_esptool():
    log("Checking for esptool.py...")
    try:
        subprocess.run([ESPTOOL_CMD, "--version"], check=True, stdout=subprocess.DEVNULL)
        log("✅ esptool.py found")
    except Exception:
        log("⚙️ Installing esptool...")
        run_cmd("pip install --upgrade esptool")
        log("✅ esptool installed successfully")

# ------------------------
# 2️⃣ Detect serial port automatically
# ------------------------
def detect_port():
    log("🔍 Detecting ESP32 port...")
    system = platform.system().lower()

    # Linux/macOS -> /dev/tty*
    if system in ["linux", "darwin"]:
        ports = subprocess.getoutput("ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null").split()
        if not ports:
            log("❌ No ESP32 device detected! Connect it via USB and try again.")
            sys.exit(1)
        port = ports[0]
    # Windows -> COM ports
    elif system == "windows":
        output = subprocess.getoutput("mode")
        matches = re.findall(r"COM[0-9]+", output)
        if not matches:
            log("❌ No COM port detected! Plug ESP32 and try again.")
            sys.exit(1)
        port = matches[-1]
    else:
        log(f"❌ Unsupported platform: {system}")
        sys.exit(1)

    log(f"✅ Detected port: {port}")
    return port

# ------------------------
# 3️⃣ Parse partition.csv (to confirm memory offsets)
# ------------------------
def parse_partition_csv():
    log("📖 Parsing partition.csv to verify offsets...")
    if not PARTITION_CSV.exists():
        log("⚠️ partition.csv not found — using standard offsets")
        return {
            "bootloader": "0x1000",
            "partition_table": "0x8000",
            "app": "0x10000"
        }

    offsets = {
        "bootloader": "0x1000",
        "partition_table": "0x8000",
        "app": "0x10000"
    }
    try:
        with open(PARTITION_CSV, "r") as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                fields = [x.strip() for x in line.split(",")]
                if len(fields) >= 4:
                    name, type_, subtype, offset = fields[:4]
                    if "factory" in name.lower():
                        offsets["app"] = offset
                    elif "nvs" in name.lower():
                        offsets["partition_table"] = offset
        log(f"✅ Parsed offsets: {offsets}")
    except Exception as e:
        log(f"⚠️ Could not parse partition.csv: {e}")
    return offsets

# ------------------------
# 4️⃣ Flash the ESP32
# ------------------------
def flash_firmware(port, offsets):
    log("🚀 Starting flash process...")
    cmd = [
        ESPTOOL_CMD,
        "--chip", CHIP_TYPE,
        "--port", port,
        "--baud", BAUD_RATE,
        "--before", "default_reset",
        "--after", "hard_reset",
        "write_flash",
        "-z",
        offsets["bootloader"], str(BOOT_BIN),
        offsets["partition_table"], str(PART_BIN),
        offsets["app"], str(APP_BIN)
    ]
    run_cmd(" ".join(cmd))
    log("✅ Flashing complete! Device should reboot shortly.")

# ------------------------
# 🏁 MAIN
# ------------------------
def main():
    print("\n==============================")
    print("   ⚡ ESP32 Auto Flasher ⚡")
    print("==============================\n")

    # Check files
    required = [APP_BIN, BOOT_BIN, PART_BIN, PARTITION_CSV]
    for f in required:
        if not f.exists():
            log(f"❌ Missing required file: {f}")
            sys.exit(1)

    ensure_esptool()
    port = detect_port()
    offsets = parse_partition_csv()
    flash_firmware(port, offsets)

    log("🎉 All done!")

if __name__ == "__main__":
    main()
