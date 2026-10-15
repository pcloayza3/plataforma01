#!/usr/bin/env bash
set -euo pipefail

# build_ios.sh
# Compila y empaqueta PostyLocal como aplicación nativa de iOS (.app)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_DIR="$SCRIPT_DIR/build"
APP_BUNDLE="$OUTPUT_DIR/PostyLocal.app"

echo "==> [iOS] Limpiando compilaciones previas..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$APP_BUNDLE/www"

echo "==> [iOS] Copiando recursos web locales..."
cp "$SCRIPT_DIR/../index.html" "$APP_BUNDLE/www/"
cp "$SCRIPT_DIR/../styles.css" "$APP_BUNDLE/www/"
cp "$SCRIPT_DIR/../app.js" "$APP_BUNDLE/www/"
cp "$SCRIPT_DIR/../manifest.json" "$APP_BUNDLE/www/"

echo "==> [iOS] Compilando binario nativo Swift (iOS Simulator ARM64)..."
SDK_PATH="$(xcrun --sdk iphonesimulator --show-sdk-path)"
xcrun --sdk iphonesimulator swiftc \
  -target arm64-apple-ios17.0-simulator \
  -sdk "$SDK_PATH" \
  "$SCRIPT_DIR/PostyLocal/AppDelegate.swift" \
  "$SCRIPT_DIR/PostyLocal/WebViewController.swift" \
  -o "$APP_BUNDLE/PostyLocal"

echo "==> [iOS] Generando metadatos y manifiesto Info.plist..."
cp "$SCRIPT_DIR/PostyLocal/Info.plist" "$APP_BUNDLE/Info.plist"
echo -n "APPL????" > "$APP_BUNDLE/PkgInfo"

echo "==> [iOS] Firmando paquete con firma ad-hoc local..."
codesign -s - --force --deep "$APP_BUNDLE"

echo "==> [iOS] Creando archivo distribuible PostyLocal-iOS.zip..."
cd "$OUTPUT_DIR"
zip -r -q "$SCRIPT_DIR/../PostyLocal-iOS.zip" "PostyLocal.app"
cd "$SCRIPT_DIR"

echo "✓ [OK] Aplicación iOS generada exitosamente:"
echo "   - Bundle .app: $APP_BUNDLE"
echo "   - Archivo ZIP distribuible: $SCRIPT_DIR/../PostyLocal-iOS.zip"
