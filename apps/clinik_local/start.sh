#!/usr/bin/env bash
# ==============================================================================
# ClinikLocal - Lanzador Integral de Aplicación y Servidor REST API Sync con JWT
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================================="
echo " ClinikLocal - Sistema Clínico y Dental Local-First Multiplataforma"
echo "=========================================================================="

# 1. Iniciar Servidor REST API de Sincronización en segundo plano (Puerto 4050)
echo "[*] Iniciando Servidor REST API de Sincronización en la Nube (JWT HTTPS/CORS)..."
python3 server/sync_server.py &
API_PID=$!

# Trap para matar el API al salir
trap "echo ''; echo '[*] Deteniendo servicios de ClinikLocal...'; kill $API_PID 2>/dev/null || true; exit 0" INT TERM EXIT

sleep 0.5
echo "[OK] REST API activo en: http://localhost:4050/api/health"

# 2. Iniciar Servidor Web de la Aplicación (Puerto 8080)
echo "[*] Iniciando Aplicación Web Local en: http://localhost:8080"
echo "--------------------------------------------------------------------------"
echo " Accede en tu navegador a: http://localhost:8080"
echo " Presiona Ctrl + C para detener todos los servicios."
echo "--------------------------------------------------------------------------"

python3 -m http.server 8080
