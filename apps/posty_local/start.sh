#!/usr/bin/env bash
set -euo pipefail

# start.sh • Servidor local para la maqueta móvil interactiva de PostyLocal
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8092

echo "=========================================================="
echo "  PostyLocal • Maqueta Móvil Interactiva (MicroApp 2)     "
echo "=========================================================="
echo "Iniciando servidor local en: http://localhost:$PORT"
echo "Presione Ctrl+C para detener."
echo "=========================================================="

cd "$SCRIPT_DIR"
python3 -m http.server "$PORT"
