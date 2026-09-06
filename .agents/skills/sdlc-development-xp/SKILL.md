---
name: sdlc-development-xp
description: >-
  Gobierna la fase de desarrollo e implementación bajo la metodología Extreme Programming (XP). Aplica Test-Driven Development (TDD: Red-Green-Refactor), diseño simple, estándares de código limpio (Clean Code) y patrones de programación comprobados. Trabaja en ramas de GitFlow específicas asignando tareas en el tablero Kanban.
---

# Development Skill (Metodología: Extreme Programming - XP)

Este skill define el estándar de desarrollo de software riguroso basado en los valores fundamentales de **Extreme Programming (XP)**: Comunicación, Simplicidad, Retroalimentación, Coraje y Respeto.

## Flujo Obligatorio de la Fase de Desarrollo (4 Sub-etapas)

Para garantizar la máxima alineación con el usuario y evitar retrabajos, la fase de desarrollo se ejecuta en el siguiente orden estricto:

```mermaid
graph TD
    S1["4.1. Definición del Stack Tecnológico<br/>(Frontend, Backend, Conectores, BD, Storage)"]
    G1{"🛑 Compuerta 4.1<br/>¿Stack Aprobado?"}
    
    S2["4.2. Definición y Maquetación de Pantallas<br/>(React Native for Web / HTML5 sin funcionalidad)"]
    G2{"🛑 Compuerta 4.2<br/>¿Pantallas Aprobadas?"}
    
    S3["4.3. Implementación Backend, Integración y TDD<br/>(Node.js, dLocal, Whereby, Miro, S3)"]
    
    S4["4.4. Contenerización y Ejecución Local<br/>(Docker / Docker Compose paso a paso)"]
    
    G_Final{"🛑 Compuerta Final Fase 4<br/>¿Desarrollo Completo Aprobado?"}

    S1 --> G1
    G1 -->|Sí| S2
    G1 -->|No| S1
    S2 --> G2
    G2 -->|Sí| S3
    G2 -->|No| S2
    S3 --> S4
    S4 --> G_Final
```

### Sub-etapa 4.1: Definición del Stack Tecnológico
* Especificar tecnologías para: Frontend (React Native for Web, JS, HTML5), Backend (Node.js, JS), Conectores (dLocal, Whereby, Miro, Cloudflare R2), Bases de Datos (PostgreSQL, MongoDB) y Contenedores (Docker).
* Documentar en `docs/04_tech_stack_specification.md`.
* **COMPUERTA OBLIGATORIA:** No avanzar a maquetar pantallas sin la aprobación expresa del Stack Tecnológico.

### Sub-etapa 4.2: Definición y Maquetación de Pantallas (Sin Funcionalidad)
* Diseñar y maquetar todas las pantallas del flujo completo (Landing, Búsqueda, CV sin links, Checkout Escrow, Sala Whereby 60m + Miro, Kanban con semáforo, Rating 1-5 estrellas).
* Maquetación pura en React Native for Web / HTML5 sin lógica de backend ni conectores reales.
* **COMPUERTA OBLIGATORIA:** No avanzar a la implementación backend sin la aprobación expresa de las pantallas.

### Sub-etapa 4.3: Implementación Backend, Integración y Funcionalidad (XP / TDD)
* Construcción del código backend y adaptadores bajo TDD (Red-Green-Refactor) y Clean Architecture.
* Integración de la UI con los servicios y conectores externos.

### Sub-etapa 4.4: Contenerización y Ejecución Local
* Configuración de `Dockerfile` y `docker-compose.yml`.
* Elaboración de guía paso a paso para levantar localmente el frontend, backend y bases de datos con un único comando.

---

## Puertas de Calidad (Quality Gates)
* **Gate 4.1:** Aprobación del Stack Tecnológico.
* **Gate 4.2:** Aprobación de la Maquetación de Pantallas.
* **Gate 4.3/4.4:** Aprobación del Software Funcionando y Contenedores Locales.
