# Guía de Ejecución Local y Contenerización con Docker

Esta guía documenta los pasos para levantar y validar de manera local y automatizada el stack completo de **plataforma01** mediante Docker y Docker Compose.

---

## 1. Arquitectura de Contenedores y Servicios

El entorno local se compone de cuatro servicios orquestados en una red puente (`plat-network`):

| Servicio | Contenedor | Imagen Base | Puerto Expuesto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `plataforma01-frontend` | `nginx:latest` | `http://localhost:3001` | PWA / React Native for Web servida con proxy inverso hacia `/api/` |
| **Backend API** | `plataforma01-backend` | `node:20-alpine` | `http://localhost:4000` | API REST en Node.js + Express con Clean Architecture y TDD |
| **PostgreSQL** | `plataforma01-postgres` | `postgres:15-alpine`| `localhost:5432` | BD transaccional (Usuarios, Escrow, Hitos, Calificaciones) |
| **MongoDB** | `plataforma01-mongo` | `mongo:7-jammy` | `localhost:27017` | BD documental (Logs de auditoría, transcripciones IA de sesiones) |

---

## 2. Requisitos Previos
* Docker instalado y en ejecución (Docker Engine / Docker Desktop).
* Docker Compose (`docker compose` o `docker-compose`).
* Puerto `3001` libre para el Frontend (o `3000` si no hay otros servicios).
* Puerto `4000` libre para la API Backend.

---

## 3. Comandos de Ejecución

### 3.1 Despliegue con un Solo Comando
Para compilar y levantar todo el ecosistema en segundo plano:
```bash
./scripts/docker_run_local.sh
```
O directamente con Docker Compose:
```bash
docker compose up -d --build
```

### 3.2 Verificación de Estado de los Contenedores
```bash
docker compose ps
```

### 3.3 Verificación de la API REST (Healthcheck)
```bash
curl -i http://localhost:4000/health
```
Respuesta esperada:
```json
{
  "status": "ok",
  "service": "plataforma01-backend",
  "uptime": 10.34,
  "timestamp": "2026-09-06T23:16:35.810Z"
}
```

### 3.4 Ejecución de la Suite de Pruebas TDD (Unitarias y de Integración)
```bash
./scripts/test_backend.sh
```
Resultado: **20 pruebas automáticas ejecutadas y aprobadas (100% pass)** validando comisiones (15%/10%), anti-desintermediación, escrow, Kanban con semáforo y calificaciones.

---

## 4. Acceso en el Navegador
* **Portal Web / Prototipo PWA:** [http://localhost:3001](http://localhost:3001)
  * Incluye el catálogo de las 14 pantallas conectadas a la API REST.
  * Selector en la barra superior para explorar flujos completos.
  * Funcionalidad interactiva de pagos en custodia, liberación de fondos y calificaciones.

---

## 5. Detención y Limpieza del Entorno
Para detener los contenedores preservando los volúmenes de datos:
```bash
docker compose down
```
Para detener y eliminar volúmenes asociados:
```bash
docker compose down -v
```
