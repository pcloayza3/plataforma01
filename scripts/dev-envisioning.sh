#!/usr/bin/env bash
set -euo pipefail

# dev-envisioning.sh
# Asistente de inicio rápido para la fase 1 de Envisioning & Planning

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "============================================================"
echo " 🚀 SDLC Quickstart: dev-envisioning (Fase 1)"
echo " Metodología: Design Thinking | Gobernanza: Gatekeeping Activo"
echo "============================================================"

# 1. Asegurar rama feature/01-envisioning
./scripts/gitflow_helper.sh start-feature 01-envisioning

# 2. Verificar estado en Kanban
echo "[KANBAN] Estado actual del tablero:"
python3 scripts/kanban_manager.py list

echo ""
echo "✅ Entorno preparado para trabajar en Envisioning & Planning."
echo "Escribe tu idea en el chat para comenzar la interacción de Design Thinking."
