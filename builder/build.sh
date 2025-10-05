#!/bin/bash
set -e
set -o pipefail

echo ""
echo "=============================="
echo "   🚀 ESP32 Full Build Script"
echo "=============================="
echo ""

# ------------------------
# Paths
# ------------------------
PROJECT_ROOT="$(pwd)"
BUILD_DIR="$PROJECT_ROOT/build"
DATA_DIR="$PROJECT_ROOT/data"
MAIN_DIR="$PROJECT_ROOT/main"
WEBSITE_DIR="$PROJECT_ROOT/website"
PARTITION_FILE="$PROJECT_ROOT/builder/partition.csv"
FLASH_PY="$PROJECT_ROOT/builder/flash.py"
CONFIG_FILE="$PROJECT_ROOT/builder/arduino.json"
LIB_DIR="$PROJECT_ROOT/lib"
BIN_DIR="$PROJECT_ROOT/bin"
FLASHER_DIR="$PROJECT_ROOT/flasher"

# ------------------------
# 1️⃣ System dependencies
# ------------------------
echo "==> [1/10] Installing system dependencies..."
sudo apt update -y >/dev/null
sudo apt install -y jq curl unzip build-essential git python3-pip >/dev/null

# ------------------------
# 2️⃣ Node.js
# ------------------------
if ! command -v node >/dev/null 2>&1; then
    echo "==> Node.js not found. Installing Node 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "🟢 Node: $(node -v), npm: $(npm -v)"

# ------------------------
# 3️⃣ Arduino CLI
# ------------------------
if ! command -v arduino-cli >/dev/null 2>&1; then
    echo "==> Arduino CLI not found. Installing..."
    mkdir -p "$BIN_DIR"
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]]; then
    ARCH="ARM64"
    elif [[ "$ARCH" == "x86_64" ]]; then
    ARCH="64bit"
    else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
    fi

    CLI_URL="https://downloads.arduino.cc/arduino-cli/arduino-cli_1.3.1_Linux_${ARCH}.tar.gz"
    curl -fsSL "$CLI_URL" -o /tmp/arduino-cli.tar.gz
    tar -xzf /tmp/arduino-cli.tar.gz -C "$BIN_DIR"
    rm /tmp/arduino-cli.tar.gz
    export PATH="$BIN_DIR:$PATH"
fi
echo "🟢 Arduino CLI: $(arduino-cli version | head -n 1)"

# ------------------------
# 4️⃣ Arduino config
# ------------------------
CONFIG_PATH="$PROJECT_ROOT/arduino-cli.yaml"
if [ ! -f "$CONFIG_PATH" ]; then
    echo "==> Creating Arduino CLI config..."
    arduino-cli config init --dest-file "$CONFIG_PATH"
fi
export ARDUINO_CLI_CONFIG_FILE="$CONFIG_PATH"

# ------------------------
# 5️⃣ ESP32 Core
# ------------------------
echo "==> [2/10] Installing ESP32 board core..."
arduino-cli core update-index --config-file "$CONFIG_PATH" >/dev/null
arduino-cli core install esp32:esp32 --config-file "$CONFIG_PATH" >/dev/null
echo "🟢 ESP32 Core installed"

# ------------------------
# 6️⃣ Create dirs
# ------------------------
mkdir -p "$BUILD_DIR" "$DATA_DIR" "$LIB_DIR" "$MAIN_DIR/data"
echo "==> [3/10] Created build directories"

# ------------------------
# 7️⃣ Read board FQBN
# ------------------------
BOARD_FQBN=$(jq -r '.board_fqbn' "$CONFIG_FILE")
if [ -z "$BOARD_FQBN" ]; then
    echo "❌ Error: board_fqbn not defined in arduino.json"
    exit 1
fi
echo "🟢 Using board: $BOARD_FQBN"

# ------------------------
# 8️⃣ Libraries
# ------------------------
echo "==> [4/10] Installing libraries..."
LIBS=$(jq -r '.libraries[]' "$CONFIG_FILE")
for lib in $LIBS; do
    if [[ "$lib" =~ ^https?:// ]]; then
        echo "📦 Git library: $lib"
        git clone --depth 1 "$lib" "$LIB_DIR/$(basename "$lib" .git)" 2>/dev/null || echo "   ↳ already cloned"
    else
        clean_lib=$(echo "$lib" | sed 's/\^//')
        echo "📚 Arduino library: $clean_lib"
        arduino-cli lib install "$clean_lib" --config-file "$CONFIG_PATH" >/dev/null || echo "   ↳ already installed"
    fi
done

# ------------------------
# 9️⃣ Build React website
# ------------------------
echo "==> [5/10] Building frontend..."
cd "$WEBSITE_DIR"
npm install >/dev/null
npm run build >/dev/null
echo "🟢 Website built successfully"

# ------------------------
# 🔟 Move website files
# ------------------------
echo "==> [6/10] Preparing LittleFS data..."
rm -rf "$DATA_DIR/dist"
mv dist "$DATA_DIR/dist"
rm -rf "$MAIN_DIR/data/*"
cp -r "$DATA_DIR/dist/"* "$MAIN_DIR/data/"
echo "🟢 LittleFS data ready"

# ------------------------
# 1️⃣1️⃣ Compile firmware
# ------------------------
echo "==> [7/10] Compiling firmware..."
arduino-cli compile \
  --fqbn "$BOARD_FQBN" \
  --build-path "$BUILD_DIR" \
  --build-property "board_build.partitions=$(basename "$PARTITION_FILE")" \
  --libraries "$LIB_DIR" \
  "$MAIN_DIR/main.ino" \
  --config-file "$CONFIG_PATH"

echo "🟢 Compilation complete"
echo ""
echo "==> [8/10] Checking build output..."
ls -lh "$BUILD_DIR" || true
echo ""

# ------------------------
# 1️⃣2️⃣ Collect binaries
# ------------------------
echo "==> [9/10] Collecting binaries..."
APP_BIN=$(find "$BUILD_DIR" -type f -name "*.ino.bin" | head -n 1)
BOOT_BIN=$(find "$BUILD_DIR" -type f -name "*.bootloader.bin" | head -n 1)
PART_BIN=$(find "$BUILD_DIR" -type f -name "*.partitions.bin" | head -n 1)

if [ -z "$APP_BIN" ] || [ -z "$BOOT_BIN" ] || [ -z "$PART_BIN" ]; then
    echo "❌ Error: One or more binaries missing!"
    echo "Contents of build dir:"
    ls -R "$BUILD_DIR"
    exit 1
fi

# ------------------------
# 🧩 Create flasher folder
# ------------------------
mkdir -p "$FLASHER_DIR"

cp "$APP_BIN"        "$FLASHER_DIR/app.bin"
cp "$BOOT_BIN"       "$FLASHER_DIR/firmware.bin"
cp "$PART_BIN"       "$FLASHER_DIR/partition.bin"
cp "$PARTITION_FILE" "$FLASHER_DIR/partition.csv"
cp "$FLASH_PY"       "$FLASHER_DIR/flash.py"

# ------------------------
# 🧹 Cleanup old build folder
# ------------------------
rm -rf "$BUILD_DIR"

echo ""
echo "✅ Build complete!"
echo "👉 Final flasher files are in: $FLASHER_DIR"
ls -lh "$FLASHER_DIR"
echo ""
echo "✨ Done!"
