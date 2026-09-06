# Fase 4: Desarrollo e Implementación (Extreme Programming - XP / TDD)

## 1. Resumen Ejecutivo de la Fase 4

La Fase 4 del SDLC implementa el núcleo funcional, la arquitectura técnica y el despliegue local de **plataforma01** siguiendo estrictamente la metodología **Extreme Programming (XP)**, prácticas de **Test-Driven Development (TDD: Red-Green-Refactor)** y **Clean Architecture**.

La fase se desglosó en 4 sub-etapas secuenciales con compuertas de calidad:
* **Sub-etapa 4.1:** Definición y Aprobación del Stack Tecnológico (**APROBADO por el usuario**).
* **Sub-etapa 4.2:** Definición y Maquetación de Pantallas del Flujo Completo sin funcionalidad (**APROBADO por el usuario**).
* **Sub-etapa 4.3:** Implementación Backend, Integración y Funcionalidad con TDD (**COMPLETADO Y VERIFICADO AL 100%**).
* **Sub-etapa 4.4:** Contenerización y Ejecución Local con Docker Compose (**COMPLETADO Y VERIFICADO AL 100%**).

---

## 2. Entregables de la Sub-etapa 4.3 (Backend, Integración y Funcionalidad)

### 2.1 Módulos de Dominio (Hexagonal / Clean Architecture)
* [backend/src/domain/commissionCalculator.js](file:///Users/paul/develop/platform01/backend/src/domain/commissionCalculator.js): Cálculo dinámico de comisiones (15% para micropagos < 300 BOB y 10% para pagos estándar $\ge$ 300 BOB).
* [backend/src/domain/antiLinkSanitizer.js](file:///Users/paul/develop/platform01/backend/src/domain/antiLinkSanitizer.js): Filtro estricto de seguridad anti-desintermediación que detecta, bloquea y censura URLs externas, correos personales y números telefónicos.
* [backend/src/domain/escrowManager.js](file:///Users/paul/develop/platform01/backend/src/domain/escrowManager.js): Máquina de estados para custodia financiera de pagos por adelantado (por hito individual o totalidad del proyecto), resguardo de fondos y dispersión segura (*pay-out*) al consultor tras la aprobación del estudiante.
* [backend/src/domain/projectKanbanManager.js](file:///Users/paul/develop/platform01/backend/src/domain/projectKanbanManager.js): Tablero Kanban colaborativo, cálculo de avance porcentual de hitos y tareas, retroalimentación del consultor, y semáforo temporal de cumplimiento (`A_TIEMPO`, `RETRASADO`, `CRITICO`).
* [backend/src/domain/ratingManager.js](file:///Users/paul/develop/platform01/backend/src/domain/ratingManager.js): Calificación multilateral obligatoria de 1 a 5 estrellas con comentarios entre estudiantes, consultores y empresas/instituciones.
* [backend/src/domain/wherebySessionManager.js](file:///Users/paul/develop/platform01/backend/src/domain/wherebySessionManager.js): Sesiones efímeras de videollamada Whereby de 60 minutos con Miro Live Embed y transcripciones procesadas por IA.

### 2.2 Adaptadores de Infraestructura y Pasarelas
* [backend/src/adapters/dLocalAdapter.js](file:///Users/paul/develop/platform01/backend/src/adapters/dLocalAdapter.js): Integración para pagos locales (*Pay-in* vía QR Simple / tarjetas locales) y desembolsos directos (*Pay-out*) a cuentas bancarias de consultores en BOB.
* [backend/src/adapters/wherebyAdapter.js](file:///Users/paul/develop/platform01/backend/src/adapters/wherebyAdapter.js): Creación de salas de videollamada efímeras de 60 minutos con URLs temporales para estudiante y docente.
* [backend/src/adapters/r2StorageAdapter.js](file:///Users/paul/develop/platform01/backend/src/adapters/r2StorageAdapter.js): Adaptador S3 API para Cloudflare R2 con subida prefirmada, restricción a documentos Office/PDF y límite estricto de 25 MB.

### 2.3 Endpoints REST de la API Express
* `POST /api/auth/register` & `POST /api/auth/login`: Autenticación y registro con verificación anti-desintermediación en perfiles.
* `GET /api/projects/:id/progress`: Semáforo de avance porcentual y tareas vencidas.
* `POST /api/escrow/deposit`: Pay-in por adelantado y resguardo en custodia `EN_CUSTODIA`.
* `POST /api/escrow/:id/approve-payout`: Conformidad del hito y dispersión dLocal al consultor.
* `POST /api/ratings`: Registro de calificaciones con estrellas y comentarios.
* `POST /api/sessions`: Generación de salas de videollamada de 60 min.

### 2.4 Resultados de Pruebas Unitarias y de Integración (TDD)
* **20/20 pruebas automáticas aprobadas (100% pass)** en 390 ms ejecutadas en contenedor `node:20-alpine`:
  * `antiLinkSanitizer.test.js`: 5 pruebas (validación limpia, bloqueo URLs, emails, teléfonos y censura).
  * `commissionCalculator.test.js`: 4 pruebas (reglas 15%/10%, umbral 300 BOB, validación de montos).
  * `escrowManager.test.js`: 2 pruebas (ciclo de custodia y bloqueo de dispersión prematura).
  * `projectKanbanManager.test.js`: 2 pruebas (avance porcentual, conformidad de hitos y semáforo de atrasos).
  * `ratingManager.test.js`: 2 pruebas (cálculo de promedio y validación de rango 1..5).
  * `api.test.js`: 5 pruebas (healthcheck, registro con sanitización, depósito escrow, progreso de proyecto y ratings).

---

## 3. Entregables de la Sub-etapa 4.4 (Contenerización y Ejecución Local)

* [docker-compose.yml](file:///Users/paul/develop/platform01/docker-compose.yml): Orquestación completa de 4 contenedores (`frontend:3001`, `backend:4000`, `postgres:5432`, `mongo:27017`).
* [backend/Dockerfile](file:///Users/paul/develop/platform01/backend/Dockerfile): Contenedor Node.js 20 Alpine para el API REST.
* [frontend/Dockerfile](file:///Users/paul/develop/platform01/frontend/Dockerfile) & [frontend/nginx.conf](file:///Users/paul/develop/platform01/frontend/nginx.conf): Servidor NGINX con proxy inverso hacia `/api/`.
* [scripts/docker_run_local.sh](file:///Users/paul/develop/platform01/scripts/docker_run_local.sh): Script de despliegue local automatizado paso a paso.
* [scripts/test_backend.sh](file:///Users/paul/develop/platform01/scripts/test_backend.sh): Script para ejecución de pruebas TDD dentro de contenedor Docker.
* [docs/04_local_docker_execution.md](file:///Users/paul/develop/platform01/docs/04_local_docker_execution.md): Guía técnica completa de ejecución local.
