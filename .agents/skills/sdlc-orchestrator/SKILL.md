---
name: sdlc-orchestrator
description: >-
  Coordina el ciclo de vida completo del software (SDLC) a través de sus fases: Envisioning, Requisitos (IEEE 830), Diseño (C4 + ICONIX), Desarrollo (XP/TDD), QA y Despliegue. Aplica gatekeeping estricto para evitar avanzar sin autorización expresa del usuario y sincroniza el estado en el Kanban de GitHub.
---

# SDLC Orchestrator Skill

Controlador central del ciclo de vida del desarrollo de software. Supervisa el flujo de trabajo secuencial entre fases, asegurando que se cumplan las puertas de calidad (*quality gates*).

## Flujo de Estados del Ciclo de Vida

```mermaid
stateDiagram-v2
    [*] --> Envisioning: Iniciar Proyecto
    Envisioning --> Gate1: Entregable Envisioning
    Gate1 --> Requirements: Aprobado por Usuario
    Gate1 --> Envisioning: Ajustes solicitados
    
    Requirements --> Gate2: SRS IEEE 830 Generado
    Gate2 --> Design: Aprobado por Usuario
    Gate2 --> Requirements: Ajustes solicitados
    
    Design --> Gate3: C4 + ICONIX Modelado
    Gate3 --> Development: Aprobado por Usuario
    Gate3 --> Design: Ajustes solicitados
    
    Development --> Gate4: Código + TDD (XP)
    Gate4 --> TestingQA: Aprobado por Usuario
    Gate4 --> Development: Ajustes solicitados
    
    TestingQA --> Gate5: Validación y Cobertura
    Gate5 --> Deployment: Aprobado por Usuario
    Gate5 --> TestingQA: Corrección de fallos
    
    Deployment --> [*]: Release en Producción
```

## Procedimiento de Orquestación

1. **Identificar Fase Actual:**
   - Consultar el estado de los issues en GitHub Projects (`plataforma01`) o el archivo `docs/sdlc_status.md`.
2. **Asignación e Inicio:**
   - Mover el issue de la fase correspondiente a `In Progress` en el tablero Kanban.
   - Asignar a `pcloayza3`.
   - Crear o cambiar a la rama GitFlow correspondiente (`feature/<fase>-...`).
3. **Ejecución del Skill Especializado:**
   - Delegar o ejecutar el skill de la fase con rigor metodológico y verificación de fuentes reales (cero alucinación).
4. **Presentación de Entregable y Puerta de Calidad:**
   - Presentar resumen conciso del artefacto o entregable generado.
   - **DETENERSE OBLIGATORIAMENTE.** No continuar a la siguiente fase bajo ninguna circunstancia sin respuesta explícita.
5. **Transición:**
   - Con aprobación del usuario: Marcar issue en `Done` en el Kanban, integrar rama en `develop` vía GitFlow, y habilitar la fase subsiguiente.
