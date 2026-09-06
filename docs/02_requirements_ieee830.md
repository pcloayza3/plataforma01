# Especificación de Requisitos de Software (SRS) - IEEE 830

## 1. Introducción

### 1.1 Propósito
Este documento define de manera formal y no ambigua la Especificación de Requisitos de Software (SRS) para la plataforma `plataforma01`, basada en la norma **IEEE 830**. Sirve como contrato técnico entre el negocio, la arquitectura y el equipo de desarrollo.

### 1.2 Alcance del Sistema
La plataforma es un ecosistema digital de intermediación académica y laboral que opera como Progressive Web App (PWA) respaldada por una arquitectura de microservicios desacoplados. Cubre:
* Intermediación de Trabajos Finales de Grado (TFG) de pregrado.
* Asesorías de tesis y proyectos de posgrado (maestrías, doctorados).
* Vinculación para prácticas profesionales y pasantías.
* Retos de innovación corporativa y selección de talento temprano (*pre-hiring*).
* Custodia financiera (*escrow*) con comisiones dinámicas y pagos locales mediante dLocal for Platforms.

### 1.3 Referencias Normativas y Fuentes Técnicas
* **IEEE Std 830-1998:** *IEEE Recommended Practice for Software Requirements Specifications*.
* **dLocal for Platforms API Documentation:** *Marketplace Split Payments & Escrow Engine*.
* **W3C Progressive Web App Specification:** *Service Workers & Web App Manifest*.
* **S3 API Standard Specification:** *Cloudflare R2 Object Storage Compatibility*.
* **Documento Base:** `docs/01_envisioning_and_planning.md`.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
`plataforma01` opera como un sistema autónomo distribuido, estructurado en una interfaz unificada (PWA) conectada mediante HTTPS/REST a una suite de microservicios independientes con bases de datos aisladas (Database-per-Service).

### 2.2 Roles y Perfiles de Usuario (RBAC)
1. **Estudiante / Practicante (Pregrado):** Solicita asesorías de TFG, aplica a retos o postula a pasantías en empresas.
2. **Investigador / Tesista (Posgrado):** Solicita asesorías metodológicas avanzadas para maestrías o doctorados.
3. **Consultor / Experto:** Publica disponibilidad, bandas tarifarias, atiende sesiones y cobra honorarios netos tras aprobación de hitos.
4. **Empresa / Institución:** Publica retos técnicos, evalúa postulantes y vincula entregables.
5. **Administrador:** Supervisa transacciones, resuelve disputas de escrow y audita el cumplimiento normativo.

### 2.3 Restricciones Generales de Diseño
* **Agnosticismo de Pasarela:** La lógica de retención y comisiones debe estar desacoplada de la implementación del SDK de dLocal mediante el patrón *Gateway/Adapter*.
* **Cero Costo de Egress Inicial:** El almacenamiento de archivos debe consumir APIs compatibles con S3 operando sobre Cloudflare R2 sin costes por transferencia saliente.
* **Sesiones Stateless:** Autenticación basada en JSON Web Tokens (JWT) firmados con algoritmo asimétrico (RS256).

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (RF)

| ID | Requisito Funcional | Descripción y Flujo | Criterio de Aceptación (Verificable) |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Autenticación y Gestión de Perfiles** | El sistema debe permitir el registro e inicio de sesión seguro diferenciando los 5 roles mediante JWT, validación de email y gestión de perfiles profesionales/académicos. | El usuario recibe un token JWT con sus claims y rol asignado. Contraseñas protegidas mediante Argon2id o bcrypt. |
| **RF-02** | **Catálogo de Solicitudes Académicas** | El estudiante debe poder crear solicitudes especificando modalidad (`tesis_pregrado`, `tesis_posgrado`, `practica_profesional`), área de conocimiento, universidad/instituto y descripción del hito. | La solicitud se almacena en estado `borrador` o `publicada`, visible para consultores calificados en el área. |
| **RF-03** | **Agenda y Matching Multizona** | El consultor define franjas horarias de disponibilidad. El sistema calcula cruces de horario convirtiendo automáticamente a UTC y presentando la hora local a cada participante. | El estudiante puede reservar una sesión; ambos reciben confirmación con enlace y ajuste a sus respectivos husos horarios. |
| **RF-04** | **Publicación de Retos Empresariales** | Las empresas deben poder publicar convocatorias y desafíos técnicos delimitando requisitos, entregables esperados y plazas disponibles para pasantías o resolución de TFG. | El reto queda indexado en el catálogo corporativo; los estudiantes pueden postular adjuntando su propuesta o currículum. |
| **RF-05** | **Motor de Custodia (Escrow) y Pasarela dLocal** | Al confirmar una asesoría o contratación, el sistema procesa el cobro local (*pay-in*) mediante dLocal for Platforms, retiene los fondos en custodia (*escrow*) y aplica la regla de comisiones dinámicas:<br>- Monto < 300 BOB: Retención de comisión del **15%**.<br>- Monto ≥ 300 BOB: Retención de comisión del **10%**. | Los fondos quedan congelados en estado `EN_CUSTODIA`. Ningún pago se liquida al consultor hasta la confirmación del hito. |
| **RF-06** | **Gestión y Aprobación de Hitos / Entregables** | El estudiante y el consultor operan sobre hitos de entrega. El consultor sube el avance/informe; el estudiante dispone de un botón formal de validación y aprobación. | Al marcar `Hito Aprobado`, el motor de pagos dispara automáticamente la orden de dispersión (*pay-out*) a la cuenta del consultor por el monto neto. |
| **RF-07** | **Almacenamiento Seguro de Documentos (S3/R2)** | La plataforma debe permitir la subida y descarga de archivos de tesis, informes y acuerdos mediante URLs firmadas temporales (*presigned URLs*) hacia Cloudflare R2. | Ningún archivo se transmite a través del backend de aplicación; la subida/descarga es directa al storage con URLs que expiran en máximo 15 minutos. |
| **RF-08** | **Notificaciones Push y Soporte PWA** | La aplicación debe instalarse en dispositivos del usuario mediante PWA manifest y emitir notificaciones push para recordatorios de citas, confirmación de fondos retenidos y avisos de entrega. | La PWA presenta el prompt de instalación en navegadores modernos y el Service Worker gestiona el badge y alertas push. |
| **RF-09** | **Gestión de Disputas y Arbitraje** | En caso de inconformidad en un hito, cualquiera de las partes puede abrir un ticket de disputa antes de la liberación de fondos, congelando la dispersión para revisión del Administrador. | El estado de la transacción pasa a `EN_DISPUTA` y se bloquea la liberación automática hasta la resolución administrativa. |

---

### 3.2 Requisitos No Funcionales (RNF)

| ID | Categoría | Requisito Técnico | Métrica / Umbral Verificable |
| :--- | :--- | :--- | :--- |
| **RNF-01** | **Rendimiento / Latencia** | Las APIs de microservicios deben responder con alta eficiencia bajo carga típica. | Tiempo de respuesta p95 < 200 ms en endpoints REST (excluyendo llamadas a pasarelas externas). |
| **RNF-02** | **Rendimiento Web (CWV)** | La PWA debe cumplir con los estándares de Core Web Vitals de Google. | LCP (Largest Contentful Paint) < 2.5 s; INP < 200 ms; CLS < 0.1. |
| **RNF-03** | **Seguridad en Tránsito y Reposo** | Toda comunicación cliente-servidor e inter-servicio debe estar encriptada; datos sensibles protegidos. | TLS 1.3 forzado en toda la red; datos contables y bancarios cifrados con AES-256 en base de datos. |
| **RNF-04** | **Escalabilidad y Desacoplamiento** | Cada microservicio debe ser desplegable en contenedor de forma independiente. | Contenedores Docker ligeros (< 250 MB); arranque en frío < 5 s para entornos serverless (Cloud Run/Koyeb). |
| **RNF-05** | **Portabilidad de Almacenamiento** | La capa de acceso a objetos debe utilizar clientes estándar compatibles con AWS S3 SDK. | Cambio de proveedor (R2 -> Google Cloud Storage / AWS S3) viable modificando únicamente variables de entorno (`ENDPOINT`, `ACCESS_KEY`, `SECRET_KEY`). |
| **RNF-06** | **Disponibilidad** | Tolerancia a fallos en servicios no críticos sin interrupción de la navegación básica. | SLA objetivo del 99.9% de uptime mensual. Si la pasarela de pagos está en mantenimiento, la navegación y agendamiento permanecen operativos. |

---

## 4. Matriz de Trazabilidad

| Objetivo Estratégico (Envisioning) | Requisitos Funcionales Asociados | Requisitos No Funcionales |
| :--- | :--- | :--- |
| Asesorías protegidas para pregrado y posgrado | RF-01, RF-02, RF-03, RF-06 | RNF-01, RNF-06 |
| Vinculación con prácticas y retos de empresas | RF-01, RF-04, RF-06 | RNF-01, RNF-04 |
| Monetización garantizada y pagos locales | RF-05, RF-06, RF-09 | RNF-03, RNF-06 |
| Accesibilidad universal sin costo de tiendas de apps | RF-08 | RNF-02, RNF-04 |
| Gestión documental segura de tesis y acuerdos | RF-07 | RNF-03, RNF-05 |
