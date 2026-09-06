# Plataforma01 - Sistema de Gobernanza SDLC con Agentes

Este repositorio contiene la arquitectura de software, especificaciones técnicas y herramientas de automatización gobernadas por agentes de inteligencia artificial bajo metodologías formales de ingeniería de software.

---

## 🧭 Metodologías por Etapa

| Etapa SDLC | Metodología Principal | Entregable Formal | Puerta de Calidad (Gatekeeping) |
| :--- | :--- | :--- | :--- |
| **1. Envisioning & Planning** | *Design Thinking* | `docs/01_envisioning_and_planning.md` | Aprobación explícita del usuario |
| **2. Análisis de Requisitos** | *IEEE 830 (SRS)* | `docs/02_requirements_ieee830.md` | Aprobación explícita del usuario |
| **3. Arquitectura y Diseño** | *C4 Model + ICONIX* | `docs/03_architecture_and_design.md` | Aprobación explícita del usuario |
| **4. Desarrollo e Implementación**| *Extreme Programming (XP / TDD)* | Código fuente + Pruebas unitarias | Aprobación de PR / revisión |
| **5. Pruebas y QA** | Testing sistemático / UAT | Reporte de cobertura y validación | Aprobación explícita del usuario |
| **6. Despliegue y Mantenimiento**| *GitFlow* | Release en `main` | Aprobación de despliegue |

---

## 🛡️ Reglas de Operación de los Agentes

1. **Gatekeeping Estricto:** Ningún agente avanza a la siguiente fase sin validación y aprobación humana expresa.
2. **Cero Alucinación:** Queda prohibido inventar supuestos, librerías o requerimientos no confirmados. Se validan en internet o se consultan directamente al usuario.
3. **Redacción Técnica:** Simple, clara, concisa, directa y profesional.
4. **Trazabilidad Kanban en GitHub:**
   - Cada tarea es un Issue en `pcloayza3/plataforma01`.
   - Asignada a `pcloayza3`.
   - Estados: `Todo` -> `In Progress` -> `Done`.
5. **GitFlow:** Trabajo en ramas `feature/*` a partir de `develop`.

---

## 🛠️ Herramientas y Scripts

* **Sincronizador Kanban (`scripts/kanban_manager.py`):**
  - Crear issue: `python3 scripts/kanban_manager.py create-issue --title "..." --body "..." --status "Todo"`
  - Actualizar estado: `python3 scripts/kanban_manager.py set-status --issue-number <N> --status "In Progress|Done"`
  - Listar tablero: `python3 scripts/kanban_manager.py list`

* **Asistente GitFlow (`scripts/gitflow_helper.sh`):**
  - Inicializar ramas: `./scripts/gitflow_helper.sh init`
  - Iniciar característica: `./scripts/gitflow_helper.sh start-feature <nombre>`
  - Concluir característica: `./scripts/gitflow_helper.sh finish-feature <nombre>`
