# Documento de Envisioning y Planificación

## 1. Declaración de Visión
* **Producto:** Plataforma Global de Intermediación Académica y Profesional (`plataforma01`).
* **Visión General:** Ecosistema digital que conecta a estudiantes universitarios en fase de Trabajo Final de Grado (TFG), consultores expertos para asesorías metodológicas y empresas interesadas en innovación abierta y captación de talento temprano (*pre-hiring*), con foco operativo inicial en Sudamérica y proyección global.
* **Declaración del Problema:**
  > Los estudiantes universitarios carecen de orientación experta accesible y vinculación con el sector productivo real para sus tesis; paralelamente, los consultores en mercados emergentes enfrentan severas barreras de bancarización y recepción de pagos transfronterizos, y las empresas asumen altos costos en captación de talento e investigación sin acceso directo a la producción académica universitaria.

---

## 2. Mapa de Actores (Stakeholders y Arquetipos de Usuario)

| Actor | Perfil / Rol | Necesidad Principal | Dolor Actual |
| :--- | :--- | :--- | :--- |
| **Estudiante** | Tesista universitario de pregrado o posgrado. | Asesoría metodológica continua, pagos locales protegidos y temas de tesis aplicados al mercado. | Deserción por trabas metodológicas, falta de medios de pago en moneda local y aislamiento laboral. |
| **Consultor / Experto** | Profesional con experiencia académica o de industria. | Monetizar tiempo en asesorías especializadas con cobros asegurados en su moneda local. | Dificultad para recibir giros internacionales, altas comisiones bancarias e incertidumbre de cobro. |
| **Empresa** | Startups, PyMEs y corporaciones con retos técnicos. | Resolver problemas reales y evaluar talento antes de contratación. | Procesos de contratación lentos y costosos; poca conexión con universidades. |
| **Administrador** | Equipo de operaciones y finanzas de la plataforma. | Monitorear transacciones, dispersión de fondos (*payouts*), disputas y comisiones. | Fricción cambiaria, cumplimiento regulatorio y riesgo de desintermediación. |

---

## 3. Propuesta de Valor y Modelo Financiero

* **Propuesta de Valor:**
  * **Estudiantes:** Asesorías estructuradas por hitos, custodia segura de fondos (*escrow*) y medios de pago locales (tarjetas, transferencias bancarias locales y pagos en efectivo/QR).
  * **Consultores:** Garantía de cobro en moneda local mediante retención previa del pago y tarifas estructuradas.
  * **Empresas:** Banco de retos de innovación abierta con acceso prioritario al talento ejecutor de las soluciones.

* **Modelo Financiero y Política de Comisiones Dinámicas:**
  * **Micropagos (< 300 BOB):** Comisión de la plataforma del **15%** por transacción.
  * **Transacciones Estándar (≥ 300 BOB):** Comisión de la plataforma del **10%** por transacción.
  * **Dispersión:** El monto neto restante se transfiere al consultor una vez validado y aprobado el hito por el estudiante.

* **Estructura Legal y Blindaje:**
  * **Entidad Operadora:** Empresa constituida bajo el marco legal de Estados Unidos (LLC).
  * **Contratos:** Cesión de Propiedad Intelectual (PI) entre estudiantes, empresas y consultores.
  * **Prevención de Desintermediación:** Cláusulas de exclusividad transaccional dentro de la plataforma en Términos y Condiciones.

---

## 4. Alcance Técnico y Arquitectura de la Solución

* **Punto de Partida del Repositorio:** Desarrollo directo del núcleo de software (PWA y microservicios prioritarios), permitiendo validar flujos en paralelo.
* **Frontend (Capa de Interfaz):**
  * Progressive Web App (PWA) construida sobre Next.js / React.
  * Instalable en escritorio y dispositivos móviles sin costos de tiendas de aplicaciones.
  * Soporte offline básico y notificaciones push web para avisos de sesiones y estados de pago.
* **Backend (Arquitectura de Microservicios Desacoplados):**
  1. `auth-service`: Autenticación centralizada, JWT, gestión de roles (Estudiante, Consultor, Empresa, Admin).
  2. `matching-scheduling-service`: Disponibilidad horaria, normalización de husos horarios y agenda de sesiones.
  3. `payment-escrow-service`: Motor de custodia (*escrow*), cálculo dinámico de comisiones (15% < 300 BOB / 10% ≥ 300 BOB) y gestión de dispersión. Integración mediante **dLocal for Platforms** para soportar cobros locales (*pay-ins*) y dispersión de fondos (*pay-outs*) en Sudamérica operando desde la entidad legal estadounidense. Diseñado bajo el patrón **Gateway / Adapter**.
  4. `challenge-project-service`: Catálogo de retos empresariales y vinculación con entregables de tesis.
* **Almacenamiento y Persistencia:**
  * **Bases de Datos:** PostgreSQL para usuarios, transacciones contables y estados de escrow; MongoDB / Documental para bitácoras y catálogos dinámicos.
  * **Almacenamiento de Archivos (Tesis y Retos):** Arquitectura compatible con el estándar S3 API, utilizando **Cloudflare R2** en etapa inicial (10 GB gratuitos y $0 en egress/transferencia) con portabilidad garantizada a **Google Cloud Storage** o **AWS S3**.

---

## 5. Roadmap de Ejecución del SDLC

| Hito | Fase SDLC | Metodología | Entregable Formal | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **M1** | **Envisioning & Planning** | *Design Thinking* | `docs/01_envisioning_and_planning.md` | **Actualizado - Listo para Aprobación** |
| **M2** | **Análisis de Requisitos** | *IEEE 830 (SRS)* | `docs/02_requirements_ieee830.md` | Bloqueado por Gate 1 |
| **M3** | **Arquitectura y Diseño** | *C4 Model + ICONIX* | `docs/03_architecture_and_design.md` | Bloqueado por Gate 2 |
| **M4** | **Desarrollo e Implementación** | *XP (TDD / Clean Code)* | Código modular en ramas `feature/*` | Bloqueado por Gate 3 |
| **M5** | **Pruebas y QA** | *Testing Sistemático* | Reporte de pruebas y cobertura | Bloqueado por Gate 4 |
| **M6** | **Despliegue y Mantenimiento**| *GitFlow & CI/CD* | Despliegue en Cloud Run / Koyeb | Bloqueado por Gate 5 |
