#!/usr/bin/env bash
set -e

echo "=== Ejecutando pruebas unitarias y de integración TDD en Docker ==="
docker run --rm \
  -v "$(pwd)/backend:/app" \
  -w /app \
  node:20-alpine \
  sh -c "npm test"
