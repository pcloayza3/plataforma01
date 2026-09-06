---
name: dev-envisioning
description: >-
  Inicio rápido para la fase de Envisioning & Planning del ciclo de vida del software.
  Se activa al escribir dev-envisioning, /dev-envisioning o cuando el usuario comparte una idea de proyecto.
  Conduce la formulación y refinamiento bajo Design Thinking, valida datos reales en internet sin alucinaciones,
  redacta el documento formal y aplica el gatekeeping antes de pasar a la fase de Requisitos.
---

# Dev-Envisioning (Inicio Rápido de Envisioning & Planning)

Este skill es el punto de entrada para concebir un nuevo producto o sistema de software siguiendo la metodología **Design Thinking** y asegurando la gobernanza del SDLC.

## Protocolo de Ejecución

### Paso 1: Recepción de la Idea Inicial
* Si el usuario escribe `dev-envisioning` sin acompañarlo de la idea, solicitarla inmediatamente de forma directa:
  > *"Por favor, describe en pocas líneas la idea o problema que deseas resolver con este software."*
* Si el usuario ya adjunta la idea, proceder de inmediato al Paso 2.

### Paso 2: Preparación del Entorno GitFlow y Kanban
* Verificar o crear la rama de trabajo:
  ```bash
  ./scripts/gitflow_helper.sh start-feature 01-envisioning
  ```
* Verificar o crear el Issue Kanban en estado `In Progress` asignado a `pcloayza3`:
  ```bash
  python3 scripts/kanban_manager.py list
  ```

### Paso 3: Análisis y Preguntas Focalizadas (Design Thinking)
Analizar la idea recibida y formular únicamente las preguntas necesarias para completar el documento de visión técnica, enfocadas en:
1. **Problema concreto:** ¿Qué dolor crítico experimenta el usuario objetivo?
2. **Propuesta de valor:** ¿Por qué esta solución es preferible a las alternativas actuales?
3. **Arquetipos de usuario:** Roles específicos que operarán el sistema.
4. **Delimitación del MVP:** Las 2 o 3 funcionalidades indispensables para la primera versión (y qué queda explícitamente fuera de alcance).
5. **Restricciones técnicas:** Entorno de ejecución, bases de datos o integraciones mandatorias.

> [!CAUTION]
> **Cero Alucinación:** Queda estrictamente prohibido asumir o inventar datos de mercado, librerías no verificadas o modelos de negocio. Si falta un dato técnico, investigarlo con herramientas web o consultarlo directamente al usuario.

### Paso 4: Generación del Documento Formal
* Redactar el documento final en: `docs/01_envisioning_and_planning.md` siguiendo la plantilla `docs/templates/envisioning_template.md`.
* La redacción debe ser simple, concisa, profesional y directa.
* Registrar los cambios en git:
  ```bash
  git add docs/01_envisioning_and_planning.md
  git commit -m "docs(envisioning): redactar documento de visión y alcance inicial"
  ```

### Paso 5: Puerta de Calidad (Gatekeeping Obligatorio)
* Presentar el resumen formal al usuario.
* **DETENERSE Y ESPERAR AUTORIZACIÓN EXPRESA:**
  > *"¿Aprueba el documento de Envisioning y Planificación para dar por concluida esta fase y proceder a la fase de Análisis de Requisitos (IEEE 830)?"*

### Paso 6: Transición tras Aprobación
* Mover el Issue a `Done`:
  ```bash
  python3 scripts/kanban_manager.py set-status --issue-number 1 --status "Done"
  ```
* Integrar la rama hacia `develop`:
  ```bash
  ./scripts/gitflow_helper.sh finish-feature 01-envisioning
  ```
* Presentar la bienvenida a la Fase 2: Requisitos de Software (IEEE 830).
