#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Users/paul/Library/Android/sdk"

echo "==> [Android] Copiando recursos web más recientes (raíz y www)..."
mkdir -p "$SCRIPT_DIR/app/src/main/assets/www"

# Copiar a www/
cp "$SCRIPT_DIR/../index.html" "$SCRIPT_DIR/app/src/main/assets/www/"
cp "$SCRIPT_DIR/../styles.css" "$SCRIPT_DIR/app/src/main/assets/www/"
cp "$SCRIPT_DIR/../app.js" "$SCRIPT_DIR/app/src/main/assets/www/"
cp "$SCRIPT_DIR/../manifest.json" "$SCRIPT_DIR/app/src/main/assets/www/"
cp "$SCRIPT_DIR/../icon.png" "$SCRIPT_DIR/app/src/main/assets/www/"
cp -r "$SCRIPT_DIR/../libs" "$SCRIPT_DIR/app/src/main/assets/www/"

# Copiar también directamente a assets/ para compatibilidad total
cp "$SCRIPT_DIR/../index.html" "$SCRIPT_DIR/app/src/main/assets/"
cp "$SCRIPT_DIR/../styles.css" "$SCRIPT_DIR/app/src/main/assets/"
cp "$SCRIPT_DIR/../app.js" "$SCRIPT_DIR/app/src/main/assets/"
cp "$SCRIPT_DIR/../manifest.json" "$SCRIPT_DIR/app/src/main/assets/"
cp "$SCRIPT_DIR/../icon.png" "$SCRIPT_DIR/app/src/main/assets/"
cp -r "$SCRIPT_DIR/../libs" "$SCRIPT_DIR/app/src/main/assets/"

echo "==> [Android] Compilando APK con Gradle..."
./gradlew assembleDebug

APK_PATH="$SCRIPT_DIR/app/build/outputs/apk/debug/app-debug.apk"
cp "$APK_PATH" "$SCRIPT_DIR/../PostyLocal.apk"

echo "✓ [OK] APK generado exitosamente en: $SCRIPT_DIR/../PostyLocal.apk"
