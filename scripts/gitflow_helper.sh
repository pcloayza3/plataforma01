#!/usr/bin/env bash
set -euo pipefail

# gitflow_helper.sh
# Utilidad para automatizar el flujo de trabajo GitFlow en pcloayza3/plataforma01

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

command_help() {
    echo "Uso: $0 {init | start-feature <nombre> | finish-feature <nombre> | sync}"
    exit 1
}

CMD="${1:-}"

case "$CMD" in
    init)
        echo "[GITFLOW] Inicializando estructura GitFlow (main y develop)..."
        git branch -M main || true
        git checkout -B develop
        git push -u origin main || true
        git push -u origin develop || true
        echo "[GITFLOW] Ramas main y develop configuradas exitosamente."
        ;;

    start-feature)
        FEATURE_NAME="${2:-}"
        if [ -z "$FEATURE_NAME" ]; then
            echo "[ERROR] Debe especificar el nombre de la característica."
            exit 1
        fi
        BRANCH="feature/$FEATURE_NAME"
        echo "[GITFLOW] Creando rama $BRANCH desde develop..."
        git checkout develop
        git pull origin develop || true
        git checkout -b "$BRANCH"
        echo "[GITFLOW] Rama activa: $BRANCH"
        ;;

    finish-feature)
        FEATURE_NAME="${2:-}"
        if [ -z "$FEATURE_NAME" ]; then
            echo "[ERROR] Debe especificar el nombre de la característica."
            exit 1
        fi
        BRANCH="feature/$FEATURE_NAME"
        echo "[GITFLOW] Integrando rama $BRANCH hacia develop..."
        git checkout develop
        git pull origin develop || true
        git merge --no-ff "$BRANCH" -m "feat: integrar $BRANCH en develop"
        git push origin develop
        git branch -d "$BRANCH"
        echo "[GITFLOW] Característica $BRANCH integrada y eliminada localmente."
        ;;

    sync)
        echo "[GITFLOW] Sincronizando cambios con el repositorio remoto..."
        git fetch origin
        git status
        ;;

    *)
        command_help
        ;;
esac
