# AGENTS.md - Normas de Gobernanza del SDLC

Este archivo establece las reglas universales e inquebrantables para todos los agentes y subagentes que operan en este repositorio (`plataforma01`).

---

## 1. Regla de Oro: Gatekeeping (Puertas de Calidad)
* **Ningún agente debe avanzar a la siguiente etapa del ciclo de vida del software sin la autorización expresa del usuario.**
* Al finalizar los entregables de una etapa, el agente debe presentar un resumen formal de validación y detenerse explícitamente solicitando aprobación para avanzar.
* Etapas del ciclo de vida:
  1. **Envisioning & Planning** (*Design Thinking*)
  2. **Análisis de Requisitos** (*IEEE 830 - SRS*)
  3. **Análisis y Diseño** (*C4 Model + ICONIX Process + Patrones*)
  4. **Desarrollo e Implementación** (*Extreme Programming - XP / TDD*)
  5. **Pruebas y Aseguramiento de Calidad** (*Testing sistemático*)
  6. **Despliegue y Mantenimiento** (*GitFlow & CI/CD*)

---

## 2. Política de Cero Alucinación (Zero-Hallucination)
* **Queda terminantemente prohibido inventar o asumir cualquier dato**, ya sean requerimientos de negocio, métricas, integraciones, configuraciones, nombres de paquetes o APIs.
* Todos los datos técnicos deben ser validados mediante búsquedas en fuentes reales de internet o consultados de forma explícita y directa al usuario.
* Si falta información para completar un documento o diseño, se debe detener la ejecución y formular la consulta precisa al usuario.

---

## 3. Estilo de Comunicación y Redacción
* La redacción técnica debe ser **simple, clara, concisa, directa y profesional**, sin introducciones vacías ni rodeos explicativos.
* Utilizar viñetas, tablas y diagramas (Mermaid) para maximizar la legibilidad.
* Cada decisión técnica debe estar fundamentada en su metodología correspondiente.

---

## 4. Gestión en GitHub Projects (Kanban)
* Cada tarea, fase o requerimiento técnico debe estar registrado como un **Issue** en GitHub.
* Todos los issues deben asignarse al usuario **`pcloayza3`** (`pcloayza3@gmail.com`).
* Los issues deben sincronizarse automáticamente con el proyecto **`plataforma01`** en las columnas Kanban:
  * `Todo`: Cuando la tarea es creada y planificada.
  * `In Progress`: Mientras el agente o el usuario están activamente trabajando en ella.
  * `Done`: Una vez que la tarea ha sido completada, validada y aprobada.

---

## 5. Control de Versiones con GitFlow
* Todo el código y documentación debe residir en el repositorio `pcloayza3/plataforma01`.
* Se prohíbe realizar commits directos en la rama `main` para código en desarrollo.
* Convención de ramas GitFlow:
  * `main`: Versión estable / productiva.
  * `develop`: Rama base de integración de desarrollo.
  * `feature/<nombre-tarea>`: Ramas para cada nueva característica, diseño o código.
  * `release/<version>`: Preparación de entrega formal.
  * `hotfix/<nombre>`: Correcciones urgentes de producción.
* Cada rama de característica debe originarse desde `develop` y cerrarse mediante Pull Request revisado.
