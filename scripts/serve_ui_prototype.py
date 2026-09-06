#!/usr/bin/env python3
"""
serve_ui_prototype.py
Servidor local ultraligero para inspeccionar y navegar las 14 pantallas estáticas
del prototipo UI de plataforma01 (React Native for Web / HTML5).

Uso:
  python3 scripts/serve_ui_prototype.py
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3000
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)


def main():
    os.chdir(FRONTEND_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print("=" * 70)
            print(f" 🌐 PROTOTIPO UI DE PANTALLAS (SUB-ETAPA 4.2) DISPONIBLE LOCALMENTE")
            print(f" 👉 Abre en tu navegador: http://localhost:{PORT}")
            print(f" 📄 Directorio de pantallas: {FRONTEND_DIR}")
            print(" Presiona Ctrl+C para detener el servidor.")
            print("=" * 70)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor local detenido.")
    except Exception as e:
        print(f"[ERROR] No se pudo iniciar el servidor en el puerto {PORT}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
