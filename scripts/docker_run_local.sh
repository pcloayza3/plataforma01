#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "    PLATAFORMA01 - DESPLIEGUE LOCAL EN DOCKER COMPOSE     "
echo "=========================================================="
echo "Servicios:"
echo " - Frontend Web (PWA):      http://localhost:3001"
echo " - Backend API (Express):   http://localhost:4000"
echo " - PostgreSQL DB:           localhost:5432"
echo " - MongoDB Logs & Chats:    localhost:27017"
echo "=========================================================="

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado en el sistema."
    exit 1
fi

# 2. Levantar los servicios con Docker Compose
echo "[1/3] Construyendo y levantando contenedores en background..."
docker compose up -d --build

# 3. Esperar que el backend responda el healthcheck
echo "[2/3] Esperando que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:4000/health | grep -q '"status":"ok"'; then
        echo "✅ Backend API operativo en http://localhost:4000"
        break
    fi
    sleep 1
done

# 4. Verificar Frontend
echo "[3/3] Verificando Frontend..."
if curl -s http://localhost:3001 | grep -q "plataforma01"; then
    echo "✅ Frontend Web operativo en http://localhost:3001"
fi

echo "=========================================================="
echo "  SISTEMA COMPLETO OPERATIVO LOCALMENTE"
echo "  - Abrir en el navegador: http://localhost:3001"
echo "  - Backend REST directo:  http://localhost:4000/health"
echo "  - Para detener el entorno: docker compose down"
echo "=========================================================="
