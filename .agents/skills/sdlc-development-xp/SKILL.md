---
name: sdlc-development-xp
description: >-
  Gobierna la fase de desarrollo e implementación bajo la metodología Extreme Programming (XP). Aplica Test-Driven Development (TDD: Red-Green-Refactor), diseño simple, estándares de código limpio (Clean Code) y patrones de programación comprobados. Trabaja en ramas de GitFlow específicas asignando tareas en el tablero Kanban.
---

# Development Skill (Metodología: Extreme Programming - XP)

Este skill define el estándar de desarrollo de software riguroso basado en los valores fundamentales de **Extreme Programming (XP)**: Comunicación, Simplicidad, Retroalimentación, Coraje y Respeto.

## Prácticas Fundamentales de XP a Ejecutar

### 1. Test-Driven Development (TDD)
El código de producción solo se escribe en respuesta a una prueba automatizada que falla:
1. **Rojo (Red):** Escribir una prueba unitaria que defina el comportamiento esperado del caso de uso o entidad. Ejecutar la prueba y comprobar que falla.
2. **Verde (Green):** Escribir el código mínimo indispensable para que la prueba pase satisfactoriamente.
3. **Refactorización (Refactor):** Limpiar el código, eliminar duplicación, mejorar nombres y extraer métodos preservando las pruebas en verde.

### 2. Diseño Simple (Simple Design)
El código debe cumplir con las 4 reglas del diseño simple de Kent Beck:
1. Pasa todas las pruebas.
2. Revela la intención del programador (claridad en nombres y estructura).
3. No contiene código duplicado (DRY).
4. Contiene el menor número posible de clases y métodos (sin sobreingeniería ni especulación futura).

### 3. Patrones de Programación y Clean Code
* Principios SOLID en todas las clases y módulos.
* Inmutabilidad y manejo explícito de errores (sin silenciar excepciones).
* Separación estricta de responsabilidades (SRP).

### 4. Integración Continua y GitFlow
* Cada desarrollo se ejecuta en una rama `feature/<nombre-requerimiento>`.
* Creación de Pull Request hacia la rama `develop`.
* Ejecución de suite completa de pruebas antes de cualquier commit.

## Puerta de Calidad (Quality Gate)
* Demostrar que el 100% de las pruebas unitarias y de integración pasan satisfactoriamente.
* Presentar métricas de cobertura y revisión de código al usuario.
* Solicitar autorización: *"¿Aprueba la implementación de [Módulo/Característica] para proceder a la fase de Pruebas de Sistema y QA?"*.
