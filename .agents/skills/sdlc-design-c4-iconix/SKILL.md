---
name: sdlc-design-c4-iconix
description: >-
  Modela la arquitectura y el diseño técnico del sistema combinando el modelo C4 (Contexto, Contenedores, Componentes y Código) y la metodología ICONIX (Modelo de Dominio, Diagramas de Robustez y Diagramas de Secuencia), aplicando patrones de arquitectura y diseño reconocidos.
---

# Architecture & Design Skill (C4 Model + ICONIX Process)

Este skill define la arquitectura del sistema y el diseño técnico detallado mediante dos marcos complementarios:
1. **C4 Model:** Proporciona vistas jerárquicas y comprensibles de la arquitectura estática.
2. **ICONIX Process:** Conecta los requisitos (IEEE 830) con el código ejecutable a través de análisis de robustez y dinamismo de secuencia.

## Metodologías y Diagramación

### 1. C4 Model (Visualización Arquitectónica)
* **Nivel 1 - Contexto del Sistema:** Muestra el sistema en relación con usuarios humanos y sistemas externos de software.
* **Nivel 2 - Contenedores:** Identifica aplicaciones web, móviles, bases de datos, APIs y sistemas de archivos que componen la solución.
* **Nivel 3 - Componentes:** Descompone cada contenedor clave en módulos, controladores, servicios y repositorios.
* **Nivel 4 - Código:** Estructuras de clases o interfaces clave.

### 2. ICONIX Process (Puente Análisis-Diseño)
* **Modelo de Dominio:** Entidades del negocio y sus relaciones estructurales.
* **Análisis de Robustez:** Diagramas de robustez para cada caso de uso clave identificando:
  - *Boundary Objects* (Interfaces/Vistas/APIs de entrada).
  - *Control Objects* (Lógica de negocio, orquestadores, validadores).
  - *Entity Objects* (Datos persistentes del dominio).
* **Diagramas de Secuencia:** Flujos dinámicos de mensajes entre objetos.

### 3. Patrones de Arquitectura y Diseño
* **Arquitectura:** Clean Architecture / Hexagonal (Ports & Adapters), MVC o Microservicios.
* **Diseño:** Patrones GoF aplicables (Repository, Factory, Strategy, Observer, Decorator).

## Puerta de Calidad (Quality Gate)
* Publicar diseño completo en `docs/03_architecture_and_design.md`.
* Solicitar autorización: *"¿Aprueba el diseño arquitectónico C4 e ICONIX para proceder a la fase de Desarrollo e Implementación (Extreme Programming - XP)?"*.
