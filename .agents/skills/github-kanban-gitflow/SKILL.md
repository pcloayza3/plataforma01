---
name: github-kanban-gitflow
description: >-
  Automatiza la gestión del proyecto en GitHub: creación de issues asignados a pcloayza3, movimiento de tarjetas en el tablero Kanban del proyecto plataforma01 (Todo -> In Progress -> Done), y gestión de ramas bajo la metodología GitFlow (feature/*, develop, main).
---

# GitHub Kanban & GitFlow Automation Skill

Este skill proporciona las directrices y herramientas para mantener el proyecto sincronizado con GitHub y asegurar que todo trabajo quede registrado y trazado.

## Reglas de Asignación y Repositorio
* **Usuario asignado:** `pcloayza3` (`pcloayza3@gmail.com`).
* **Repositorio oficial:** `pcloayza3/plataforma01`.
* **Tablero Kanban:** Proyecto `plataforma01`.

## Automatización Kanban mediante Script

Uso de [kanban_manager.py](../../../scripts/kanban_manager.py):

1. **Crear tarea al inicio de una fase o requisito:**
   ```bash
   python3 scripts/kanban_manager.py create-issue \
     --title "[SDLC: Envisioning] Definir propuesta de valor y visión" \
     --body "Levantamiento de información con el usuario aplicando Design Thinking." \
     --status "Todo"
   ```
2. **Mover a In Progress al comenzar a trabajar:**
   ```bash
   python3 scripts/kanban_manager.py set-status --issue-number <num> --status "In Progress"
   ```
3. **Mover a Done tras la aprobación formal del usuario:**
   ```bash
   python3 scripts/kanban_manager.py set-status --issue-number <num> --status "Done"
   ```

## Automatización GitFlow mediante Script

Uso de [gitflow_helper.sh](../../../scripts/gitflow_helper.sh):

1. **Crear rama de trabajo para una característica o fase:**
   ```bash
   ./scripts/gitflow_helper.sh start-feature <nombre-fase-o-tarea>
   ```
2. **Integrar rama tras aprobación y pruebas superadas:**
   ```bash
   ./scripts/gitflow_helper.sh finish-feature <nombre-fase-o-tarea>
   ```
