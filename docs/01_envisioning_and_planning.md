# Documento de Envisioning y Planificación

## 1. Declaración de Visión
* **Producto:** Plataforma Global de Intermediación Académica y Profesional (`plataforma01`).
* **Visión General:** Ecosistema digital global que conecta a estudiantes universitarios en fase de Trabajo Final de Grado (TFG), consultores expertos para asesorías metodológicas y empresas interesadas en innovación abierta y captación de talento temprano (*pre-hiring*), eliminando fronteras geográficas desde el primer día.
* **Declaración del Problema:**
  > Los estudiantes universitarios carecen de orientación experta accesible y vinculación con el sector productivo real para sus tesis; paralelamente, los consultores no cuentan con un canal internacional centralizado con pagos protegidos, y las empresas asumen altos costos en captación de talento e investigación sin acceso directo a la producción académica universitaria.

---

## 2. Mapa de Actores (Stakeholders y Arquetipos de Usuario)

| Actor | Perfil / Rol | Necesidad Principal | Dolor Actual |
| :--- | :--- | :--- | :--- |
| **Estudiante** | Tesista universitario de pregrado o posgrado. | Asesoría metodológica continua y temas de tesis aplicados al mercado. | Deserción por trabas metodológicas y aislamiento del mercado laboral. |
| **Consultor / Experto** | Profesional con experiencia académica o de industria. | Monetizar tiempo en asesorías especializadas con vitrina global. | Incertidumbre de cobro y fricción en la gestión de citas multizona. |
| **Empresa** | Startups, PyMEs y corporaciones con retos técnicos. | Resolver problemas reales y evaluar talento antes de contratación. | Procesos de contratación lentos y costosos; poca conexión con universidades. |
| **Administrador** | Equipo de operaciones y finanzas de la plataforma. | Monitorear transacciones, resolución de disputas y blindaje legal. | Riesgo de desintermediación y fraude transaccional. |

---

## 3. Propuesta de Valor y Modelo de Negocio

* **Propuesta de Valor:**
  * **Estudiantes:** Asesorías estructuradas por hitos, fondos en custodia (*escrow*) y acceso a desafíos corporativos reales.
  * **Consultores:** Cobro garantizado mediante retención previa del pago y fijación de tarifas por bandas de experiencia.
  * **Empresas:** Banco de retos de innovación abierta con acceso prioritario al talento ejecutor de las soluciones.
* **Modelo de Monetización:** Comisión porcentual sobre cada transacción (asesorías y contrataciones derivadas de retos).
* **Blindaje Legal y Fiscal:**
  * Entidad operadora: LLC constituida en Wyoming, EE.UU.
  * Contratos de cesión de Propiedad Intelectual (PI) entre partes.
  * Cláusulas estrictas anti-desintermediación en Términos y Condiciones.

---

## 4. Alcance Técnico y Arquitectura de la Solución

* **Punto de Partida del Repositorio:** Desarrollo directo del núcleo de software (PWA y microservicios prioritarios), permitiendo validar flujos en paralelo.
* **Frontend (Capa de Interfaz):**
  * Progressive Web App (PWA) construida sobre Next.js / React.
  * Instalable en escritorio y dispositivos móviles sin dependencias de tiendas de apps.
  * Notificaciones push nativas y soporte offline básico.
* **Backend (Arquitectura de Microservicios Desacoplados):**
  1. `auth-service`: Autenticación centralizada, JWT, gestión de roles (Estudiante, Consultor, Empresa, Admin).
  2. `matching-scheduling-service`: Disponibilidad horaria, normalización de husos horarios y agenda de sesiones.
  3. `payment-escrow-service`: Motor de custodia (*escrow*), retención de fondos y cálculo de comisiones. Diseñado bajo el patrón **Gateway / Adapter**, con integración inicial en **Stripe Connect** y capacidad de anexar pasarelas adicionales a futuro sin alterar la lógica de negocio.
  4. `challenge-project-service`: Catálogo de retos empresariales y vinculación con entregables de tesis.
* **Almacenamiento y Persistencia:**
  * **Bases de Datos:** PostgreSQL para entidades relacionales y transacciones; MongoDB / Documental para bitácoras y catálogos dinámicos.
  * **Almacenamiento de Archivos (Tesis y Retos):** Almacenamiento desacoplado basado en la API estándar S3, utilizando **Cloudflare R2** en etapa inicial (10 GB de almacenamiento gratuito y $0 en costos de transferencia/egress) con compatibilidad directa para migrar a **Google Cloud Storage** o **AWS S3** al escalar.

---

## 5. Roadmap de Ejecución del SDLC

| Hito | Fase SDLC | Metodología | Entregable Formal | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **M1** | **Envisioning & Planning** | *Design Thinking* | `docs/01_envisioning_and_planning.md` | **Listo para Aprobación** |
| **M2** | **Análisis de Requisitos** | *IEEE 830 (SRS)* | `docs/02_requirements_ieee830.md` | Bloqueado por Gate 1 |
| **M3** | **Arquitectura y Diseño** | *C4 Model + ICONIX* | `docs/03_architecture_and_design.md` | Bloqueado por Gate 2 |
| **M4** | **Desarrollo e Implementación** | *XP (TDD / Clean Code)* | Código modular en ramas `feature/*` | Bloqueado por Gate 3 |
| **M5** | **Pruebas y QA** | *Testing Sistemático* | Reporte de pruebas y cobertura | Bloqueado por Gate 4 |
| **M6** | **Despliegue y Mantenimiento**| *GitFlow & CI/CD* | Despliegue en Cloud Run / Koyeb | Bloqueado por Gate 5 |
