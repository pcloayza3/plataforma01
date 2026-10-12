#!/usr/bin/env python3
"""
Generador y Empaquetador de Ejecutables Multiplataforma para ClinikLocal v2.6
Genera paquetes e instaladores listos para descarga directa:
1. macOS: ClinikLocal-macOS-v2.6.zip (y v2.5 alias)
2. Windows: ClinikLocal-Windows-v2.6.zip (y v2.5 alias)
3. Linux: ClinikLocal-Linux-v2.6.tar.gz (y v2.5 alias)
4. Android: ClinikLocal-Android-v2.6.apk (y v2.5 alias)
5. iOS: clinik-ios-profile.mobileconfig (Perfil WebClip de instalación nativa en iOS)
"""

import os
import sys
import shutil
import zipfile
import tarfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, 'downloads')
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

CORE_FILES = [
    'index.html',
    'landing.html',
    'landing.css',
    'styles.css',
    'app.js',
    'jspdf.min.js',
    'manifest.json',
    'sw.js'
]

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
    <string>2.6.0</string>
    <key>CFBundleVersion</key>
    <string>2.6.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""
    with open(os.path.join(contents_dir, 'Info.plist'), 'w', encoding='utf-8') as f:
        f.write(info_plist)

    # Launcher shell script
    launcher = """#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/../Resources/app" && pwd)"
PORT=4042

python3 -m http.server $PORT --directory "$DIR" > /dev/null 2>&1 &
SERVER_PID=$!

sleep 0.5

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
    for f in CORE_FILES:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, app_assets_dir)
    
    # Copiar iconos
    icons_src = os.path.join(BASE_DIR, 'icons')
    if os.path.exists(icons_src):
        shutil.copytree(icons_src, os.path.join(app_assets_dir, 'icons'), dirs_exist_ok=True)

    # Empaquetar a ZIP v2.6 y v2.5
    zip_path_v26 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-macOS-v2.6.zip')
    with zipfile.ZipFile(zip_path_v26, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(app_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, DOWNLOADS_DIR)
                zipf.write(full_path, rel_path)

    zip_path_v25 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-macOS-v2.5.zip')
    shutil.copy2(zip_path_v26, zip_path_v25)

    shutil.rmtree(app_dir)
    print("  -> Creado macOS v2.6 y v2.5:", zip_path_v26)


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
    for f in CORE_FILES:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, win_dir)
    icons_src = os.path.join(BASE_DIR, 'icons')
    if os.path.exists(icons_src):
        shutil.copytree(icons_src, os.path.join(win_dir, 'icons'), dirs_exist_ok=True)

    # README de instalación
    readme_txt = """CLINIKLOCAL - APLICACION CLINICA Y DENTAL AUTONOMA (WINDOWS) v2.6
=============================================================
1. Descomprime esta carpeta en tu computadora (ej. en C:\\ClinikLocal o en tu Escritorio).
2. Haz doble clic en 'Iniciar-ClinikLocal.bat'.
3. ClinikLocal se abrira como una aplicacion de escritorio nativa sin barra de direcciones.
4. Todos tus datos quedan protegidos localmente en tu equipo.
"""
    with open(os.path.join(win_dir, 'LEEME-INSTALACION.txt'), 'w', encoding='utf-8') as f:
        f.write(readme_txt)

    # Comprimir en ZIP v2.6 y v2.5
    zip_path_v26 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Windows-v2.6.zip')
    with zipfile.ZipFile(zip_path_v26, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(win_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, DOWNLOADS_DIR)
                zipf.write(full_path, rel_path)

    zip_path_v25 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Windows-v2.5.zip')
    shutil.copy2(zip_path_v26, zip_path_v25)

    shutil.rmtree(win_dir)
    print("  -> Creado Windows v2.6 y v2.5:", zip_path_v26)


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
    for f in CORE_FILES:
        src = os.path.join(BASE_DIR, f)
        if os.path.exists(src):
            shutil.copy(src, linux_dir)
    icons_src = os.path.join(BASE_DIR, 'icons')
    if os.path.exists(icons_src):
        shutil.copytree(icons_src, os.path.join(linux_dir, 'icons'), dirs_exist_ok=True)

    tar_path_v26 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Linux-v2.6.tar.gz')
    with tarfile.open(tar_path_v26, "w:gz") as tar:
        tar.add(linux_dir, arcname='ClinikLocal')

    tar_path_v25 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-Linux-v2.5.tar.gz')
    shutil.copy2(tar_path_v26, tar_path_v25)

    shutil.rmtree(linux_dir)
    print("  -> Creado Linux v2.6 y v2.5:", tar_path_v26)


def generate_android_apk_bundle():
    print("-> Generando paquete oficial instalable para Android (APK nativo ~50 MB)...")
    try:
        import compile_android_apk
        compile_android_apk.main()
    except Exception as e:
        print(f"  [!] Advertencia al compilar con Android SDK: {e}")


def generate_ios_profile():
    print("-> Generando perfil WebClip nativo para iOS...")
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
    p1 = os.path.join(DOWNLOADS_DIR, 'clinik-ios-profile.mobileconfig')
    p2 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-iOS-v2.6.mobileconfig')
    p3 = os.path.join(DOWNLOADS_DIR, 'ClinikLocal-iOS-v2.5.mobileconfig')
    for p in [p1, p2, p3]:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(profile_content)
    print("  -> Creado perfil iOS:", p1)


if __name__ == '__main__':
    print("=== Empaquetado Multiplataforma ClinikLocal v2.6 ===")
    generate_macos_bundle()
    generate_windows_package()
    generate_linux_package()
    generate_android_apk_bundle()
    generate_ios_profile()
    print("=== Empaquetado finalizado con éxito en apps/clinik_local/downloads/ ===")
