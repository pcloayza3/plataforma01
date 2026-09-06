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
* Seguimiento de asesorías mediante **tableros Kanban colaborativos** con **métricas de avance porcentual y semáforo de conformidad/retraso**.
* Perfiles estructurados con currículum, presentación y fotos/logos oficiales, **restringidos estrictamente contra la inclusión de enlaces externos**.
* Sistema multilateral de **calificación por estrellas (1 a 5 estrellas)** cruzado entre estudiantes, consultores, empresas e instituciones.
* Repositorio documental con cuotas y filtrado estricto a formatos de texto y ofimática (Office/PDF).
* Marco normativo y políticas estrictas anti-desintermediación para proteger el ecosistema.

### 1.3 Referencias Normativas y Fuentes Técnicas
* **IEEE Std 830-1998:** *IEEE Recommended Practice for Software Requirements Specifications*.
* **Whereby Embedded API Documentation:** *Video Calls, Rooms Management & AI Transcription Webhooks*.
* **Miro Live Embed API:** *Collaborative Interactive Whiteboards*.
* **dLocal for Platforms API Documentation:** *Marketplace Split Payments & Escrow Engine*.
* **W3C Progressive Web App Specification:** *Service Workers & Web App Manifest*.
* **S3 API Standard Specification:** *Cloudflare R2 Object Storage Compatibility*.
* **Documentos Base:** `docs/01_envisioning_and_planning.md` y `docs/02_platform_policies_and_rules.md`.

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
`plataforma01` opera como un sistema autónomo distribuido, estructurado en una interfaz unificada (PWA) conectada mediante HTTPS/REST a una suite de microservicios independientes con bases de datos aisladas (Database-per-Service).

### 2.2 Roles y Perfiles de Usuario (RBAC)
1. **Estudiante / Practicante (Pregrado):** Solicita asesorías de TFG, aplica a retos o postula a pasantías, gestiona su perfil con foto, evalúa a consultores/empresas y reporta avance.
2. **Investigador / Tesista (Posgrado):** Solicita asesorías metodológicas avanzadas para maestrías o doctorados.
3. **Consultor / Experto:** Publica su currículum estructurado en la plataforma (sin enlaces externos), atiende sesiones en Whereby, califica estudiantes y reporta conformidad de hitos.
4. **Empresa / Corporación:** Perfil con logo corporativo, publica retos técnicos, evalúa practicantes y recibe calificaciones de participantes.
5. **Institución Académica (Universidad / Instituto):** Perfil institucional con logo oficial, oferta de carreras/facultades y seguimiento de sus alumnos.
6. **Administrador:** Modera disputas, supervisa el cumplimiento de políticas de uso y audita transacciones de escrow.

### 2.3 Restricciones Generales de Diseño
* **Aislamiento de Contacto (Zero External Links):** En los perfiles y campos de currículum o presentación queda prohibida la inserción de hipervínculos, URLs, números de teléfono o correos externos mediante sanitización estricta en frontend y backend.
* **Duración Estricta de Sesión:** Salas Whereby con vigencia acotada a **60 minutos**.
* **Control de Tipos de Archivo (Whitelisting):** Solo formatos documentales ofimáticos y textuales (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.md`) hasta 25 MB por archivo.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales (RF)

| ID | Requisito Funcional | Descripción y Flujo | Criterio de Aceptación (Verificable) |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Autenticación y Gestión de Perfiles** | Registro e inicio de sesión con RBAC (6 roles), JWT RS256, verificación de identidad y gestión de perfiles. | Usuario autenticado recibe JWT con claims y rol. Contraseñas protegidas mediante Argon2id o bcrypt. |
| **RF-02** | **Catálogo de Solicitudes Académicas** | Publicación de necesidades formativas (`tesis_pregrado`, `tesis_posgrado`, `practica_profesional`) para cualquier carrera o instituto. | La solicitud se indexa en el catálogo y queda accesible para consultores validados del área. |
| **RF-03** | **Agenda y Matching Multizona** | Emparejamiento por área temática y cálculo de disponibilidad en UTC proyectado a horas locales. | El estudiante reserva la franja; se generan eventos en los calendarios de ambas partes. |
| **RF-04** | **Publicación de Retos Empresariales** | Empresas publican retos delimitando entregables, requisitos y plazas de pasantía / pre-hiring. | Reto activo en catálogo corporativo con postulación de estudiantes. |
| **RF-05** | **Motor de Custodia (Escrow) y Pasarela dLocal** | Pago inicial (*pay-in*) retenido en custodia temporal vía dLocal for Platforms con comisiones:<br>- Monto < 300 BOB: **15%** de comisión.<br>- Monto ≥ 300 BOB: **10%** de comisión. | Fondos en estado `EN_CUSTODIA`. Ningún desembolso ocurre antes de validar el hito. |
| **RF-06** | **Gestión y Aprobación de Hitos** | Ciclo de entrega por etapas. Al aprobar el estudiante el hito, el motor ejecuta el *pay-out* neto al consultor. | Al confirmar `Aprobar Hito`, se dispara la orden de dispersión a la cuenta de dLocal del consultor. |
| **RF-07** | **Almacenamiento Documental con Restricción de Tipos** | Subida/descarga mediante URLs firmadas directas a Cloudflare R2 con validación de extensiones ofimáticas/PDF y límite de 25 MB por archivo. | El sistema rechaza cualquier archivo binario/ejecutable y deniega subidas mayores a la cuota estipulada. |
| **RF-08** | **Notificaciones Push y PWA** | Instalación como app web y notificaciones push para recordatorios de videollamadas, fondos y entregas. | PWA instalable con Service Worker gestionando alertas push y modo offline básico. |
| **RF-09** | **Gestión de Disputas y Arbitraje** | Congelamiento de fondos ante inconformidad de entrega para revisión administrativa. | Transacción en `EN_DISPUTA` bloqueando la liquidación hasta resolución. |
| **RF-10** | **Salas de Videollamada Embebidas (Whereby API)** | Salas virtuales de 60 minutos generadas bajo demanda con temporizador en pantalla y cierre automático. | La sala expira a los 60 minutos con aviso visual al minuto 55. |
| **RF-11** | **Pizarrón Interactivo (Miro) y Transcripción IA** | Pizarra interactiva colaborativa de Miro dentro de la llamada y transcripción IA nativa de Whereby para el acta de sesión. | Los participantes interactúan en Miro y el resumen transcrito queda adjunto a la sesión al finalizar. |
| **RF-12** | **Tablero Kanban Colaborativo de Proyecto** | Tablero simple (*Por Hacer*, *En Progreso*, *En Revisión*, *Completado*) editable por estudiante y consultor. | Tareas se sincronizan en tiempo real reflejando el estado de avance. |
| **RF-13** | **Políticas y Prevención de Desintermediación** | Aceptación contractual obligatoria de no elusión, confidencialidad (NDA) y arbitraje legal. | Firma digital requerida antes de habilitar transacciones o mensajería en la plataforma. |
| **RF-14** | **Perfiles Estructurados con Foto/Logo (Sin Enlaces)** | Página de perfil dedicada para cada rol:<br>- **Consultor:** Curriculum vitae estructurado (experiencia, grados, especialidades) con foto de perfil.<br>- **Estudiante:** Presentación académica, carrera, universidad y foto.<br>- **Empresas e Instituciones:** Presentación corporativa/académica con logo oficial.<br>Todos los campos textuales cuentan con sanitización estricta que bloquea y rechaza URLs, correos y teléfonos externos. | El perfil renderiza foto/logo oficial y campos estructurados. Cualquier intento de inyectar enlaces o números de contacto es rechazado con error de validación. |
| **RF-15** | **Sistema Multilateral de Calificación por Estrellas** | Calificación cruzada obligatoria (1 a 5 estrellas + reseña cualitativa) tras cada sesión o hito:<br>- Estudiante califica al Consultor.<br>- Consultor califica al Estudiante.<br>- Estudiante y Consultor califican a la Empresa o Institución participante. | Las calificaciones alimentan la reputación pública ponderada visible en los perfiles de cada actor. |
| **RF-16** | **Métricas de Avance Porcentual y Semáforo de Conformidad** | Monitoreo visual del estado del proyecto:<br>- **Estudiante:** Porcentaje de avance acumulado (% completado vs planificado).<br>- **Semáforo de Hitos:** Estado visual (*A tiempo / Trabajando*, *Retrasado*, *En revisión*, *Conforme / Aprobado*).<br>- **Evaluación de la Guía:** El estudiante califica la oportunidad de respuesta y feedback del consultor (*A tiempo*, *Demorado en feedback*, *Conforme*). | El tablero de control calcula y muestra la barra de progreso (%) y alerta en rojo/amarillo si los plazos del hito están vencidos. |

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
| **RNF-07** | **Sanitización y Detección de Desintermediación** | Filtro regex y NLP ligero para detectar enlaces, teléfonos y correos en perfiles y chats. | Tasa de detección de URLs y patrones de contacto externo > 99.5% con bloqueo en tiempo real. |

---

## 4. Matriz de Trazabilidad

| Objetivo Estratégico (Envisioning) | Requisitos Funcionales Asociados | Requisitos No Funcionales |
| :--- | :--- | :--- |
| Asesorías protegidas y seguimiento de tesis/prácticas | RF-01, RF-02, RF-03, RF-06, RF-10, RF-11, RF-12, RF-16 | RNF-01, RNF-04, RNF-06 |
| Vinculación con retos corporativos y pre-hiring | RF-01, RF-04, RF-06, RF-12, RF-15 | RNF-01, RNF-06 |
| Monetización garantizada y pagos locales | RF-05, RF-06, RF-09, RF-13 | RNF-03, RNF-06 |
| Prevención de desintermediación y perfiles sin enlaces | RF-13, RF-14 | RNF-03, RNF-07 |
| Confianza, reputación y métricas de avance continuo | RF-14, RF-15, RF-16 | RNF-01, RNF-07 |
| Gestión documental acotada y segura | RF-07, RF-12 | RNF-03, RNF-05 |
| Accesibilidad universal sin costo de tiendas de apps | RF-08, RF-10 | RNF-02, RNF-04 |
