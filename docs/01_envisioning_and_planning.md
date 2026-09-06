# Documento de Envisioning y Planificación

## 1. Declaración de Visión
* **Producto:** Plataforma Global de Intermediación Académica y Profesional (`plataforma01`).
* **Visión General:** Ecosistema digital integral y multi-disciplinario que conecta a estudiantes y egresados con consultores expertos y empresas, adaptándose a las necesidades cambiantes de la comunidad, la sociedad y el mercado laboral global. La plataforma intermedia:
  1. **Trabajos Finales de Grado (TFG / Tesis) de Pregrado.**
  2. **Tesis y Proyectos de Posgrado (Especialidades, Maestrías y Doctorados).**
  3. **Prácticas Profesionales y Pasantías de Pregrado.**
  4. **Retos de Innovación Abierta y Captación de Talento Temprano (*Pre-hiring*).**
* **Alcance Institucional y Disciplinario:** Abierto a **todas las carreras universitarias e institutos técnicos/tecnológicos**, sin restricciones disciplinares ni geográficas.
* **Declaración del Problema:**
  > Estudiantes de universidades e institutos (pregrado y posgrado) carecen de orientación metodológica especializada y de conexiones reales con el sector productivo para sus proyectos de titulación y prácticas profesionales; paralelamente, consultores y profesionales en mercados emergentes enfrentan severas barreras de monetización y bancarización transfronteriza, y las empresas asumen elevados costos en captación de talento temprano y resolución de retos operativos sin acceso directo al ecosistema académico.

---

## 2. Mapa de Actores (Stakeholders y Arquetipos de Usuario)

| Actor | Perfil / Rol | Necesidad Principal | Dolor Actual |
| :--- | :--- | :--- | :--- |
| **Estudiante / Practicante (Pregrado)** | Alumnos de universidades e institutos en etapa de titulación o pasantías. | Asesoría metodológica, vinculación para prácticas profesionales y temas aplicados. | Falta de convenios empresariales, desorientación en el TFG y aislamiento laboral. |
| **Investigador / Egresado (Posgrado)** | Profesionales cursando especialidades, maestrías o doctorados. | Asesoría técnica/científica avanzada, revisión de pares y validación metodológica. | Escasez de mentores hiperespecializados y tiempos de revisión dilatados. |
| **Consultor / Experto** | Docentes, investigadores y profesionales de la industria de diversas ramas. | Monetizar experiencia ofreciendo mentorías y tutorías con cobros asegurados en moneda local. | Dificultad para recibir pagos transfronterizos, altas comisiones y riesgo de impago. |
| **Empresa / Institución** | Startups, PyMEs y corporaciones con proyectos y plazas de pasantía. | Publicar retos técnicos, captar practicantes calificados y evaluar talento pre-hiring. | Procesos lentos y costosos de selección temprana; brecha entre la academia y la industria. |
| **Administrador** | Equipo de operaciones, finanzas y gobernanza de la plataforma. | Monitorear la calidad del servicio, dispersión de fondos (*payouts*), disputas y cumplimiento legal. | Riesgo de desintermediación, fricción cambiaria y cumplimiento normativo. |

---

## 3. Propuesta de Valor y Modelo Financiero

* **Propuesta de Valor Multidimensional:**
  * **Estudiantes (Pregrado y Posgrado):** Asesorías estructuradas por hitos, custodia segura de fondos (*escrow*), acceso a prácticas profesionales y medios de pago en moneda local (tarjetas, transferencias bancarias y códigos QR).
  * **Consultores:** Garantía de liquidación en moneda local mediante retención previa del pago y tarifas estructuradas según nivel de experticia.
  * **Empresas:** Canal directo de talento calificado (practicantes y tesistas de pregrado/posgrado) y resolución de desafíos de innovación abierta a bajo costo.

* **Modelo Financiero y Política de Comisiones Dinámicas:**
  * **Micropagos (< 300 BOB):** Comisión de la plataforma del **15%** por transacción.
  * **Transacciones Estándar (≥ 300 BOB):** Comisión de la plataforma del **10%** por transacción.
  * **Dispersión:** Liquidación al consultor tras la aprobación expresa del entregable/hito por parte del estudiante o la empresa solicitante.

* **Estructura Legal y Blindaje:**
  * **Entidad Operadora:** Empresa constituida bajo el marco legal de Estados Unidos (LLC).
  * **Contratos:** Cesión y licenciamiento de Propiedad Intelectual (PI), acuerdos de confidencialidad (NDA) para pasantías y cláusulas anti-desintermediación en Términos y Condiciones.

---

## 4. Alcance Técnico y Arquitectura de la Solución

* **Diseño Extensible y Agnóstico al Dominio:** La plataforma y sus esquemas de base de datos se modelan con tipificación dinámica (`modality`: `thesis_undergrad`, `thesis_postgrad`, `internship_practice`) y taxonomía abierta de áreas de conocimiento y carreras.
* **Frontend (Capa de Interfaz):**
  * Progressive Web App (PWA) construida sobre Next.js / React.
  * Instalable en escritorio y dispositivos móviles, con notificaciones push web y soporte offline básico.
* **Backend (Arquitectura de Microservicios Desacoplados):**
  1. `auth-service`: Autenticación, JWT, roles y perfiles multinivel (Estudiante Pregrado, Posgrado, Consultor, Empresa, Admin).
  2. `matching-scheduling-service`: Emparejamiento por área de conocimiento, nivel académico, disponibilidad horaria y agenda de sesiones/entrevistas de pasantía.
  3. `payment-escrow-service`: Motor de custodia (*escrow*), comisiones dinámicas (15% < 300 BOB / 10% ≥ 300 BOB) e integración con **dLocal for Platforms** (*pay-ins* locales y *pay-outs* en Sudamérica).
  4. `challenge-project-service`: Publicación y postulación a retos de innovación, plazas de prácticas profesionales y vinculación de entregables académicos.
* **Almacenamiento y Persistencia:**
  * **Bases de Datos:** PostgreSQL para usuarios, transacciones contables y estados de escrow; MongoDB / Documental para bitácoras, currículums, propuestas y catálogos de retos.
  * **Almacenamiento de Archivos (Tesis, Informes y Portafolios):** API estándar S3 sobre **Cloudflare R2** (10 GB gratis y $0 egress), con portabilidad a **Google Cloud Storage** o **AWS S3**.

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
