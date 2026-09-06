# Especificación del Stack Tecnológico - Plataforma01

Este documento formaliza la selección tecnológica para cada componente del sistema `plataforma01`, respondiendo a los requerimientos de desarrollo con **React Native for Web (PWA)**, **Node.js**, **JavaScript**, **HTML5**, integración de APIs externas y contenerización local con **Docker**.

---

## 1. Capa de Frontend (Progressive Web App - PWA)

| Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Framework Base** | **React Native for Web** (`react-native-web` + Expo) | Permite escribir una única base de componentes nativos reutilizables (`View`, `Text`, `Pressable`, `FlatList`) que compilan directamente a elementos HTML5 semánticos y CSS en el navegador web, manteniendo la puerta abierta a compilar a iOS/Android nativo en el futuro sin reescribir la UI. |
| **Lenguaje de Programación** | **JavaScript (ES2022+)** | Ecosistema universal, alta velocidad de prototipado y consistencia isomórfica con el backend de Node.js. |
| **Capacidades PWA** | **HTML5 + Service Workers (Workbox) + Web App Manifest** | Instalable directamente en escritorio y dispositivos móviles desde el navegador. Soporte de notificaciones push nativas para recordatorios de videollamadas y pagos, con caché offline para consulta básica de perfiles y tableros. |
| **Estilos y Diseño Responsive** | **React Native StyleSheet + Flexbox + HTML5 Canvas** | Diseño responsivo adaptable a pantallas de computadoras de escritorio, tablets y teléfonos móviles con diseño fluido. |
| **Embebibilidad de Terceros** | **HTML5 `<iframe>` / Web SDKs** | Incrustación fluida de la sala de videollamadas de Whereby y el canvas interactivo de Miro dentro de la interfaz PWA. |

---

## 2. Capa de Backend (Servicios y API Gateway)

| Componente | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Runtime de Ejecución** | **Node.js (LTS v20+)** | Motor JavaScript V8 de alto rendimiento con modelo de E/S no bloqueante basado en eventos, óptimo para microservicios y streaming de Webhooks. |
| **Lenguaje de Programación** | **JavaScript (Node.js ES Modules)** | Sintaxis moderna con soporte de módulos estándar (`import/export`), asincronía nativa (`async/await`) y tipado dinámico rápido. |
| **Framework de Aplicación** | **Express.js** | Framework minimalista y maduro para estructuración de endpoints REST JSON, middlewares de autenticación JWT y enrutamiento modular. |
| **Patrón Arquitectónico** | **Clean Architecture (Hexagonal)** | Aislamiento estricto de las reglas de negocio (cálculo de comisiones 15%/10%, estados de escrow, validación de avance) respecto a librerías y bases de datos. |
| **Filtro de Desintermediación** | **Sanitizer Middleware (RegEx + NLP ligero)** | Interceptor de peticiones que detecta, rechaza o censura enlaces web externos, correos electrónicos y teléfonos en biografías y mensajes. |

---

## 3. Conectores e Integraciones Externas

| Conector / API | Proveedor y SDK | Función Operativa |
| :--- | :--- | :--- |
| **Pagos y Escrow** | **dLocal for Platforms REST API** | Procesamiento de cobros locales (*pay-ins*) en monedas sudamericanas (BOB, etc.) con tarjetas, transferencias y QR; retención temporal de fondos en custodia (*escrow*), división automática de comisiones y transferencias a consultores (*pay-outs*). |
| **Videollamadas** | **Whereby Embedded API** | Aprovisionamiento bajo demanda de salas virtuales temporales de **60 minutos**, control de participantes y temporizador visual en pantalla. |
| **Transcripción con IA** | **Whereby AI Transcription Webhook** | Generación automatizada del resumen y texto transcrito de la sesión para documentar los acuerdos de cada asesoría. |
| **Pizarrón Interactivo** | **Miro Live Embed API** | Pizarra colaborativa digital integrada dentro de la sesión de trabajo para diagramación y revisión conjunta. |
| **Almacenamiento de Archivos** | **Cloudflare R2 vía AWS SDK v3 (`@aws-sdk/client-s3`)** | Almacenamiento compatible con la API estándar S3 para documentos (PDF y Office de máx. 25 MB), avatares y logos mediante generación de URLs prefirmadas temporales sin costo por ancho de banda de salida (*zero egress fee*). |

---

## 4. Persistencia y Almacenamiento de Datos

| Almacén | Motor Seleccionado | Propósito y Contenido |
| :--- | :--- | :--- |
| **Base de Datos Relacional** | **PostgreSQL 16** | Usuarios, credenciales, perfiles estructurados, proyectos de asesoría, transacciones contables de escrow y calificaciones de 1 a 5 estrellas. Garantiza consistencia transaccional ACID. |
| **Base de Datos Documental** | **MongoDB 7** | Tableros Kanban de proyectos, histórico de tarjetas, actas y transcripciones de sesiones emitidas por la IA de Whereby. |
| **Object Storage** | **Cloudflare R2 (S3 Compatible)** | Archivos ofimáticos (`.docx`, `.pdf`, `.xlsx`, `.pptx`), fotos de perfil y logos de empresas e instituciones. |

---

## 5. Contenerización y Entorno de Ejecución Local (Docker)

| Componente Docker | Imagen Base | Configuración en `docker-compose.yml` |
| :--- | :--- | :--- |
| `frontend` | `node:20-alpine` | Sirve la aplicación React Native for Web (PWA) expuesta en el puerto `3000`. |
| `backend` | `node:20-alpine` | Ejecuta la API de Node.js/Express expuesta en el puerto `4000`. |
| `postgres` | `postgres:16-alpine` | Instancia local relacional expuesta en el puerto `5432`. |
| `mongo` | `mongo:7-alpine` | Instancia local documental expuesta en el puerto `27017`. |
| `localstack` / `minio` | `minio/minio` (Opcional local) | Emulador local compatible con S3 para pruebas de subida de archivos sin requerir conexión a internet. |

---

## 6. Procedimiento de Ejecución Local con un Solo Comando

Para levantar el ecosistema completo localmente sin configurar dependencias en la máquina anfitriona:
```bash
# 1. Clonar y situarse en el repositorio
cd plataforma01

# 2. Levantar todos los contenedores
docker compose up --build

# 3. Accesos locales
# Frontend PWA: http://localhost:3000
# Backend API:  http://localhost:4000/api/health
```
