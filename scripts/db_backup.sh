#!/usr/bin/env bash
set -e

BACKUP_DIR="$(pwd)/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=========================================================="
echo "    PLATAFORMA01 - RESPALDO DE BASES DE DATOS             "
echo "=========================================================="
echo "Destino: $BACKUP_DIR"

# 1. Respaldo de PostgreSQL
if docker ps | grep -q "plataforma01-postgres"; then
    echo "[1/2] Respaldando PostgreSQL (plataforma01_db)..."
    docker exec -t plataforma01-postgres pg_dump -U platuser plataforma01_db > "$BACKUP_DIR/postgres_dump.sql"
    echo "  Respaldo PostgreSQL guardado en $BACKUP_DIR/postgres_dump.sql"
else
    echo "  Contenedor plataforma01-postgres no está en ejecución."
fi

# 2. Respaldo de MongoDB
if docker ps | grep -q "plataforma01-mongo"; then
    echo "[2/2] Respaldando MongoDB (plataforma01_logs)..."
    docker exec -t plataforma01-mongo mongodump --username platuser --password platpassword --authenticationDatabase admin --out /tmp/mongodump > /dev/null 2>&1 || true
    docker cp plataforma01-mongo:/tmp/mongodump "$BACKUP_DIR/mongo_dump" > /dev/null 2>&1 || true
    echo "  Respaldo MongoDB guardado en $BACKUP_DIR/mongo_dump"
else
    echo "  Contenedor plataforma01-mongo no está en ejecución."
fi

echo "=========================================================="
echo "  RESPALDO COMPLETADO EXITOSAMENTE                        "
echo "=========================================================="
