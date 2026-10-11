#!/usr/bin/env bash
# Inicia el servidor local para ClinikLocal en el puerto 8080
cd "$(dirname "$0")"
echo "=========================================================="
echo " ClinikLocal - Gestión Clínica y Dental Local-First"
echo " Servidor local disponible en: http://localhost:8080"
echo "=========================================================="
python3 -m http.server 8080
