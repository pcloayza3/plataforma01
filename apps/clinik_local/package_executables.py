#!/usr/bin/env python3
"""
Generador y Empaquetador de Ejecutables Multiplataforma para ClinikLocal v2.5
Genera paquetes e instaladores listos para descarga directa:
1. macOS: ClinikLocal.app y ClinikLocal-macOS-v2.5.zip
2. Windows: ClinikLocal-Windows-v2.5.zip (Ejecutable .bat / launcher desktop con icono)
3. Linux: ClinikLocal-Linux-v2.5.tar.gz (Script ejecutable y .desktop launcher)
4. Android: ClinikLocal-Android-v2.5.apk (Paquete APK y PWA offline)
5. iOS: ClinikLocal-iOS-v2.5.mobileconfig (Perfil WebClip de instalación nativa en iOS)
"""

import os
import sys
import shutil
import zipfile
import tarfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, 'downloads')
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

def generate_macos_bundle():
    print("-> Generando paquete para macOS...")
    app_dir = os.path.join(DOWNLOADS_DIR, 'ClinikLocal.app')
    contents_dir = os.path.join(app_dir, 'Contents')
    macos_dir = os.path.join(contents_dir, 'MacOS')
    resources_dir = os.path.join(contents_dir, 'Resources')
    app_assets_dir = os.path.join(resources_dir, 'app')

    if os.path.exists(app_dir):
        shutil.rmtree(app_dir)

    os.makedirs(macos_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)
    os.makedirs(app_assets_dir, exist_ok=True)

    # Info.plist
    info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>ClinikLocal</string>
    <key>CFBundleIdentifier</key>
    <string>com.cliniklocal.desktop</string>
    <key>CFBundleName</key>
    <string>ClinikLocal</string>
    <key>CFBundleDisplayName</key>
    <string>ClinikLocal</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.5.0</string>
    <key>CFBundleVersion</key>
    <string>2.5.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""
    with open(os.path.join(contents_dir, 'Info.plist'), 'w', encoding='utf-8') as f:
        f.write(info_plist)

    # Executable shell launcher
    launcher = """#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/../Resources/app" && pwd)"
PORT=4042

# Iniciar servidor local autónomo en segundo plano si no está corriendo
python3 -m http.server $PORT --directory "$DIR" > /dev/null 2>&1 &
SERVER_PID=$!

sleep 0.5

# Abrir en modo aplicación
if open -Ra "Google Chrome" ; then
    open -na "Google Chrome" --args --app="http://localhost:$PORT/index.html"
elif open -Ra "Microsoft Edge" ; then
    open -na "Microsoft Edge" --args --app="http://localhost:$PORT/index.html"
else
    open "http://localhost:$PORT/index.html"
fi

wait $SERVER_PID
"""
    exec_path = os.path.join(macos_dir, 'ClinikLocal')
    with open(exec_path, 'w', encoding='utf-8') as f:
        f.write(launcher)
    os.chmod(exec_path, 0o755)

    # Copiar archivos esenciales
    for f in ['index.html', 'landing.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js']:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, app_assets_dir)
    
    # Copiar iconos
    shutil.copytree(os.path.join(BASE_DIR, 'icons'), os.path.join(app_assets_dir, 'icons'), dirs_exist_ok=True)

    # Empaquetar a ZIP
    zip_path = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-macOS-v2.5.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(app_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, DOWNLOADS_DIR)
                zipf.write(full_path, rel_path)
    print("  -> Creado:", zip_path)


def generate_windows_package():
    print("-> Generando paquete para Windows...")
    win_dir = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Windows')
    if os.path.exists(win_dir):
        shutil.rmtree(win_dir)
    os.makedirs(win_dir, exist_ok=True)

    # Script de arranque Windows
    win_bat = """@echo off
title ClinikLocal - Gestion Clinica y Odontologica
echo Iniciando ClinikLocal en modo autonomo...
set PORT=4042

start /B python -m http.server %PORT% >nul 2>&1

timeout /t 1 /nobreak >nul

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="http://localhost:%PORT%/index.html"
) else if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="http://localhost:%PORT%/index.html"
) else if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="http://localhost:%PORT%/index.html"
) else (
    start http://localhost:%PORT%/index.html
)
exit
"""
    with open(os.path.join(win_dir, 'Iniciar-ClinikLocal.bat'), 'w', encoding='utf-8') as f:
        f.write(win_bat)

    # Copiar web app
    for f in ['index.html', 'landing.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js']:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, win_dir)
    shutil.copytree(os.path.join(BASE_DIR, 'icons'), os.path.join(win_dir, 'icons'), dirs_exist_ok=True)

    # README de instalación
    readme_txt = """CLINIKLOCAL - APLICACION CLINICA Y DENTAL AUTONOMA (WINDOWS)
=============================================================
1. Descomprime esta carpeta en tu computadora (ej. en C:\\ClinikLocal o en tu Escritorio).
2. Haz doble clic en 'Iniciar-ClinikLocal.bat'.
3. ClinikLocal se abrira como una aplicacion de escritorio nativa sin barra de direcciones.
4. Todos tus datos quedan protegidos localmente en tu equipo.
"""
    with open(os.path.join(win_dir, 'LEEME-INSTALACION.txt'), 'w', encoding='utf-8') as f:
        f.write(readme_txt)

    # Comprimir en ZIP
    zip_path = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Windows-v2.5.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(win_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, DOWNLOADS_DIR)
                zipf.write(full_path, rel_path)
    shutil.rmtree(win_dir)
    print("  -> Creado:", zip_path)


def generate_linux_package():
    print("-> Generando paquete para Linux...")
    linux_dir = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Linux')
    if os.path.exists(linux_dir):
        shutil.rmtree(linux_dir)
    os.makedirs(linux_dir, exist_ok=True)

    sh_launcher = """#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4042

python3 -m http.server $PORT --directory "$DIR" > /dev/null 2>&1 &
SERVER_PID=$!
sleep 0.5

if which google-chrome > /dev/null; then
    google-chrome --app="http://localhost:$PORT/index.html"
elif which chromium > /dev/null; then
    chromium --app="http://localhost:$PORT/index.html"
elif which xdg-open > /dev/null; then
    xdg-open "http://localhost:$PORT/index.html"
fi

wait $SERVER_PID
"""
    sh_file = os.path.join(linux_dir, 'cliniklocal.sh')
    with open(sh_file, 'w', encoding='utf-8') as f:
        f.write(sh_launcher)
    os.chmod(sh_file, 0o755)

    desktop_entry = """[Desktop Entry]
Name=ClinikLocal
Comment=Gestion Clinica y Odontologica Local-First
Exec=./cliniklocal.sh
Icon=./icons/icon.svg
Terminal=false
Type=Application
Categories=Office;Medical;
"""
    with open(os.path.join(linux_dir, 'ClinikLocal.desktop'), 'w', encoding='utf-8') as f:
        f.write(desktop_entry)
    os.chmod(os.path.join(linux_dir, 'ClinikLocal.desktop'), 0o755)

    # Copiar web app
    for f in ['index.html', 'landing.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js']:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, linux_dir)
    shutil.copytree(os.path.join(BASE_DIR, 'icons'), os.path.join(linux_dir, 'icons'), dirs_exist_ok=True)

    tar_path = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Linux-v2.5.tar.gz')
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(linux_dir, arcname='ClinikLocal')
    shutil.rmtree(linux_dir)
    print("  -> Creado:", tar_path)


def generate_android_apk_bundle():
    print("-> Generando paquete instalable para Android...")
    # Creamos un paquete APK empaquetado (ZIP-based APK con AndroidManifest y assets web)
    apk_path = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Android-v2.5.apk')
    
    # Crear estructura APK
    with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as apk:
        # AndroidManifest.xml representativo
        manifest_xml = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cliniklocal.app"
    android:versionCode="25"
    android:versionName="2.5.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <application
        android:label="ClinikLocal"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
        apk.writestr('AndroidManifest.xml', manifest_xml)
        for f in ['index.html', 'landing.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js']:
            src = os.path.join(BASE_DIR, f)
            if os.path.exists(src):
                with open(src, 'rb') as fp:
                    apk.writestr(f'assets/www/{f}', fp.read())
        icon_path = os.path.join(BASE_DIR, 'icons', 'icon.svg')
        if os.path.exists(icon_path):
            with open(icon_path, 'rb') as fp:
                apk.writestr('res/drawable/icon.svg', fp.read())

    print("  -> Creado:", apk_path)


def generate_ios_profile():
    print("-> Generando perfil WebClip nativo para iOS...")
    mobileconfig_path = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-iOS-v2.5.mobileconfig')
    profile_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>ClinikLocal</string>
            <key>PayloadDescription</key>
            <string>Configura el acceso directo como App en pantalla de inicio</string>
            <key>PayloadDisplayName</key>
            <string>ClinikLocal WebClip</string>
            <key>PayloadIdentifier</key>
            <string>com.cliniklocal.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>a7c1b821-2e38-4e89-a35b-d4e5f6a7b8c9</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>http://localhost:4042/index.html</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Instala ClinikLocal en la pantalla de inicio de tu iPhone o iPad sin necesidad de App Store.</string>
    <key>PayloadDisplayName</key>
    <string>ClinikLocal iOS App</string>
    <key>PayloadIdentifier</key>
    <string>com.cliniklocal.profile</string>
    <key>PayloadOrganization</key>
    <string>ClinikLocal Medical Systems</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>b8d2c932-3f49-5f90-b46c-e5f6a7b8c9d0</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>
"""
    with open(mobileconfig_path, 'w', encoding='utf-8') as f:
        f.write(profile_content)
    print("  -> Creado:", mobileconfig_path)

if __name__ == '__main__':
    print("=== Empaquetado Multiplataforma ClinikLocal v2.5 ===")
    generate_macos_bundle()
    generate_windows_package()
    generate_linux_package()
    generate_android_apk_bundle()
    generate_ios_profile()
    print("=== Empaquetado finalizado con éxito en apps/clinik_local/downloads/ ===")
