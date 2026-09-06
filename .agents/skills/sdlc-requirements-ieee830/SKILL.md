---
name: sdlc-requirements-ieee830
description: >-
  Gestiona la fase de especificación y análisis de requisitos bajo el estándar IEEE 830 (Software Requirements Specification - SRS). Define requerimientos funcionales (RF) y no funcionales (RNF), criterios de aceptación específicos y matrices de trazabilidad sin inventar datos no confirmados por el usuario.
---

# Requirements Skill (Estándar: IEEE 830 SRS)

Este skill estructura los requerimientos del sistema conforme a la norma **IEEE 830**, asegurando que cada requisito sea verificable, no ambiguo, trazable y consistente.

## Principios Rectores
1. **Verificabilidad:** Todo requisito debe contar con criterios de aceptación cuantificables (formato Given-When-Then o lista de verificación).
2. **Cero Alucinación:** Los requerimientos funcionales y restricciones técnicas deben ser consultados o extraídos de documentación oficial confirmada.
3. **Control de Puerta:** El documento `docs/02_requirements_ieee830.md` debe ser validado y firmado por el usuario antes de proceder al diseño.

## Estructura IEEE 830 a Aplicar

1. **Introducción:**
   - Propósito del sistema y alcance delimitado.
   - Definiciones, acrónimos y abreviaturas.
2. **Descripción General:**
   - Perspectiva del producto e interfaces del sistema (usuario, hardware, software, comunicaciones).
   - Restricciones de diseño y supuestos validados.
3. **Requisitos Específicos:**
   - **Requisitos Funcionales (RF):** Identificador unívoco (`RF-01`, `RF-02`), descripción concisa, entradas, procesos y salidas esperadas.
   - **Requisitos No Funcionales (RNF):** Rendimiento, seguridad, disponibilidad, mantenibilidad, portabilidad (`RNF-01`).
   - **Matriz de Trazabilidad:** Mapeo entre objetivos de negocio (Envisioning) y Requisitos Funcionales.

## Puerta de Calidad (Quality Gate)
* Publicar documento formal en `docs/02_requirements_ieee830.md`.
* Solicitar autorización: *"¿Aprueba la especificación de requisitos IEEE 830 para proceder a la fase de Arquitectura y Diseño (C4 Model + ICONIX)?"*.
