# Especificación de Requisitos de Software (SRS) - IEEE 830

## 1. Introducción

### 1.1 Propósito
Este documento define de manera formal y no ambigua la Especificación de Requisitos de Software (SRS) para la plataforma `plataforma01`, basada en la norma **IEEE 830**. Sirve como contrato técnico entre el negocio, la arquitectura y el equipo de desarrollo.

### 1.2 Alcance del Sistema
La plataforma es un ecosistema digital de intermediación académica y laboral que opera como Progressive Web App (PWA) respaldada por una arquitectura de microservicios desacoplados. Cubre:
* Intermediación de Trabajos Finales de Grado (TFG) de pregrado y tesis de posgrado (maestrías, doctorados).
* Vinculación para prácticas profesionales y pasantías para carreras universitarias e institutos.
* Retos de innovación corporativa y selección de talento temprano (*pre-hiring*).
* Custodia financiera (*escrow*) con comisiones dinámicas (15% < 300 BOB / 10% ≥ 300 BOB) mediante dLocal for Platforms.
* Salas de videollamadas interactivas de 1 hora mediante **Whereby Embedded API**, pizarra compartida con **Miro** y transcripción automatizada con IA.
* Seguimiento de asesorías mediante **tableros Kanban colaborativos**.
* Repositorio documental con cuotas y filtrado estricto a formatos de texto y ofimática (Office/PDF).
* Marco normativo y políticas estrictas anti-desintermediación para proteger el ecosistema.

### 1.3 Referencias Normativas y Fuentes Técnicas
* **IEEE Std 830-1998:** *IEEE Recommended Practice for Software Requirements Specifications*.
* **Whereby Embedded API Documentation:** *Video Calls, Rooms Management & AI Transcription Webhooks*.
* **Miro Live Embed API:** *Collaborative Interactive Whiteboards*.
* **dLocal for Platforms API Documentation:** *Marketplace Split Payments & Escrow Engine*.
* **W3C Progressive Web App Specification:** *Service Workers & Web App Manifest*.
* **S3 API Standard Specification:** *Cloudflare R2 Object Storage Compatibility*.
* **Documento Base:** `docs/01_envisioning_and_planning.md`.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
`plataforma01` opera como un sistema autónomo distribuido, estructurado en una interfaz unificada (PWA) conectada mediante HTTPS/REST a una suite de microservicios independientes con bases de datos aisladas (Database-per-Service).

### 2.2 Roles y Perfiles de Usuario (RBAC)
1. **Estudiante / Practicante (Pregrado):** Solicita asesorías de TFG, aplica a retos o postula a pasantías, gestiona su Kanban de entrega y asiste a videollamadas.
2. **Investigador / Tesista (Posgrado):** Solicita asesorías metodológicas avanzadas para maestrías o doctorados.
3. **Consultor / Experto:** Atiende sesiones en salas Whereby, comparte pizarrones Miro, califica hitos en el Kanban y cobra honorarios en custodia.
4. **Empresa / Institución:** Publica retos técnicos, evalúa practicantes y supervisa avances.
5. **Administrador:** Modera disputas, supervisa el cumplimiento de políticas de uso y audita transacciones de escrow.

### 2.3 Restricciones Generales de Diseño
* **Duración Estricta de Sesión:** Las salas de videollamadas Whereby tienen vigencia acotada a **60 minutos**, con terminación programada y aviso al minuto 55.
* **Control de Tipos de Archivo (Whitelisting):** Solo se permiten formatos documentales ofimáticos y textuales (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.md`). Prohibida la subida de ejecutables, scripts o binarios no documentales.
* **Sesiones Stateless:** Autenticación basada en JSON Web Tokens (JWT) firmados con algoritmo asimétrico (RS256).

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (RF)

| ID | Requisito Funcional | Descripción y Flujo | Criterio de Aceptación (Verificable) |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Autenticación y Gestión de Perfiles** | Registro e inicio de sesión seguro con RBAC (5 roles), JWT, verificación de identidad y validación de perfiles profesionales. | Usuario autenticado recibe JWT con claims y rol. Contraseñas protegidas mediante Argon2id o bcrypt. |
| **RF-02** | **Catálogo de Solicitudes Académicas** | Publicación de necesidades formativas (`tesis_pregrado`, `tesis_posgrado`, `practica_profesional`) para cualquier carrera o instituto. | La solicitud se indexa en el catálogo y queda accesible para consultores validados del área. |
| **RF-03** | **Agenda y Matching Multizona** | Emparejamiento por área temática y cálculo de cruces de disponibilidad en UTC proyectado a las horas locales de los participantes. | El estudiante reserva la franja; se generan los eventos sincronizados en el calendario de ambas partes. |
| **RF-04** | **Publicación de Retos Empresariales** | Empresas publican retos técnicos delimitando entregables, requisitos y vacantes de pasantía / pre-hiring. | Reto activo en catálogo; postulación de estudiantes adjuntando propuesta o CV. |
| **RF-05** | **Motor de Custodia (Escrow) y Pasarela dLocal** | Pago inicial (*pay-in*) retenido en custodia temporal vía dLocal for Platforms aplicando comisiones:<br>- Monto < 300 BOB: **15%** de comisión.<br>- Monto ≥ 300 BOB: **10%** de comisión. | Fondos en estado `EN_CUSTODIA`. Ningún desembolso ocurre antes de validar el hito. |
| **RF-06** | **Gestión y Aprobación de Hitos** | Ciclo de entrega por etapas. Al aprobar el estudiante el hito, el motor ejecuta el *pay-out* neto al consultor. | Al confirmar `Aprobar Hito`, se dispara la orden de dispersión a la cuenta de dLocal del consultor. |
| **RF-07** | **Almacenamiento Documental con Restricción de Tipos** | Subida/descarga mediante URLs firmadas directas a Cloudflare R2 con validación estricta de extensiones y tipos MIME documentales (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.md`) y límite de 25 MB por archivo. | El sistema rechaza cualquier archivo binario/ejecutable y deniega subidas mayores a la cuota estipulada. |
| **RF-08** | **Notificaciones Push y PWA** | Instalación como app web y notificaciones push para avisos de inicio de videollamada, fondos retenidos y entregas de tareas. | PWA instalable con Service Worker gestionando alertas push y modo sin conexión básico. |
| **RF-09** | **Gestión de Disputas y Arbitraje** | Posibilidad de congelar la dispersión de fondos ante inconformidad para resolución por el Administrador. | Estado transaccional pasa a `EN_DISPUTA` bloqueando la liquidación hasta dictamen. |
| **RF-10** | **Salas de Videollamada Embebidas (Whereby API)** | Integración de salas virtuales de 60 minutos mediante Whereby Embedded API para las sesiones entre consultor y estudiante. | La sala se genera bajo demanda con URL efímera, expira a los 60 minutos y muestra temporizador en pantalla. |
| **RF-11** | **Pizarrón Interactivo (Miro) y Transcripción IA** | Embeber pizarra colaborativa de Miro dentro de la sala de videollamada y activar la opción de transcripción con IA nativa de Whereby para generar el acta/resumen de la sesión. | Los participantes interactúan en el pizarrón Miro durante la llamada y el resumen transcrito queda asociado a la sesión al finalizar. |
| **RF-12** | **Tablero Kanban Colaborativo de Seguimiento** | Cada proyecto/asesoría cuenta con un tablero Kanban simple (*Por Hacer*, *En Progreso*, *En Revisión*, *Completado*) editable por estudiante y consultor. | Las tareas del proyecto se mueven de columna reflejando el progreso del TFG o práctica en tiempo real. |
| **RF-13** | **Políticas de Uso y Prevención de Desintermediación** | Módulo de aceptación obligatoria de Términos y Condiciones, acuerdos de confidencialidad (NDA), deberes éticos y cláusulas de prohibición estricta de pagos y acuerdos fuera de la plataforma con penalización de suspensión y pérdida de fondos. | El usuario debe firmar digitalmente las políticas previo a su primera interacción en la plataforma; se registran logs de auditoría. |

---

### 3.2 Requisitos No Funcionales (RNF)

| ID | Categoría | Requisito Técnico | Métrica / Umbral Verificable |
| :--- | :--- | :--- | :--- |
| **RNF-01** | **Rendimiento / Latencia** | Rendimiento óptimo en backend REST. | Tiempo de respuesta p95 < 200 ms en APIs propias (excluyendo llamadas a dLocal/Whereby). |
| **RNF-02** | **Rendimiento Web (CWV)** | Optimización PWA según métricas Google. | LCP < 2.5 s; INP < 200 ms; CLS < 0.1. |
| **RNF-03** | **Seguridad en Tránsito y Reposo** | Cifrado integral y protección documental. | TLS 1.3 forzado en toda la red; datos contables y bancarios cifrados con AES-256; URLs firmadas con vigencia ≤ 15 min. |
| **RNF-04** | **Calidad de Transmisión WebRTC** | Estabilidad de videollamadas embebidas. | Conexiones Whereby con latencia de audio/video < 150 ms bajo conexiones estándar de banda ancha (≥ 5 Mbps). |
| **RNF-05** | **Integridad Documental y Almacenamiento** | Prevención de código malicioso en repositorios. | Validación de Magic Bytes en la subida para impedir spoofing de extensiones en archivos Office y PDF. |
| **RNF-06** | **Disponibilidad** | Tolerancia a fallos por desacoplamiento. | Disponibilidad 99.9%. Fallas temporales en Whereby o dLocal no interrumpen el acceso a documentos ni al Kanban. |

---

## 4. Matriz de Trazabilidad

| Objetivo Estratégico (Envisioning) | Requisitos Funcionales Asociados | Requisitos No Funcionales |
| :--- | :--- | :--- |
| Asesorías protegidas y seguimiento de tesis/prácticas | RF-01, RF-02, RF-03, RF-06, RF-10, RF-11, RF-12 | RNF-01, RNF-04, RNF-06 |
| Vinculación con retos corporativos y pre-hiring | RF-01, RF-04, RF-06, RF-12 | RNF-01, RNF-06 |
| Monetización garantizada y pagos locales | RF-05, RF-06, RF-09, RF-13 | RNF-03, RNF-06 |
| Prevención de desintermediación y marco normativo | RF-13 | RNF-03, RNF-06 |
| Gestión documental acotada y segura | RF-07, RF-12 | RNF-03, RNF-05 |
| Accesibilidad universal sin costo de tiendas de apps | RF-08, RF-10 | RNF-02, RNF-04 |
