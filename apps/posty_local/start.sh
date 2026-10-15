#!/usr/bin/env bash
set -euo pipefail

# start.sh • Previsualización Estática Local de PostyLocal (MicroApp 2)
# Arquitectura: 100% Stand-Alone Embebido (Sin Backend ni Servidor de Aplicaciones)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8092

echo "=========================================================="
echo "  PostyLocal • Aplicación Móvil 100% Local-First          "
echo "  (Arquitectura Stand-Alone Embebida - Cero Backend)      "
echo "=========================================================="
echo "Abriendo la interfaz móvil estática en: http://localhost:$PORT"
echo "Todos los datos (SQLite/LocalStorage, audio y voz) corren"
echo "directamente en el dispositivo/cliente sin llamadas de red."
echo "Presione Ctrl+C para finalizar la previsualización."
echo "=========================================================="

cd "$SCRIPT_DIR"
python3 -m http.server "$PORT"
