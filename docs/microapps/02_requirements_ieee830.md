# Especificación de Requisitos de Software (SRS) - IEEE 830
## MicroApp 1: ClinikLocal (Gestión Clínica y Dental Local-First)

---

## 1. Introducción

### 1.1. Propósito
El presente documento define la Especificación de Requisitos de Software (SRS) conforme al estándar **IEEE 830** para la aplicación **ClinikLocal**, una microaplicación local-first multiplataforma dirigida a odontólogos y médicos especialistas independientes.

### 1.2. Alcance del Sistema
ClinikLocal permite a profesionales de la salud gestionar su cartera de pacientes, historias clínicas, análisis, tratamientos, recetas, calendario de turnos y envíos de avisos por WhatsApp de forma 100% local, con módulo adicional para respaldo y restauración cifrada en la nube.

### 1.3. Definiciones y Acrónimos
* **Local-First:** Paradigma de software donde los datos primarios y las operaciones se ejecutan y persisten en el dispositivo del usuario sin requerir conectividad de red.
* **SRS:** Software Requirements Specification (IEEE 830).
* **Deep Link:** URI que redirige a una aplicación instalada específica (ej. protocolo de WhatsApp).
* **AES-256-GCM:** Estándar de cifrado autenticado de alta seguridad para proteger la base de datos local y los respaldos en la nube.

---

## 2. Descripción General

### 2.1. Perspectiva del Producto
ClinikLocal es un sistema autónomo multiplataforma (Android, iOS, Windows, macOS, Linux). No requiere servidor central para su operativa regular diaria. Dispone de un conector opcional a una API de respaldo cloud para usuarios que contraten el servicio de copia remota.

### 2.2. Restricciones de Diseño
1. **Multiplataforma:** Debe compilar y funcionar de manera idéntica en Android, iOS, Windows, macOS y Linux.
2. **Interfaz Minimalista y Limpia:** Interfaz sin saturación de elementos, con amplios espacios en blanco, tipografía altamente legible, colores neutros con acentos médicos sutiles y flujos directos en máximo 2 clics.
3. **Privacidad Médica Estricta:** Cero telemetría invasiva y cero envío de datos del paciente a servidores sin autorización del profesional.

---

## 3. Requisitos Específicos

### 3.1. Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Criterio de Aceptación (Gherkin / Verificación) |
| :--- | :--- | :--- | :--- |
| **RF-01** | **Directorio de Pacientes** | Registro, edición, búsqueda y filtrado de pacientes (Nombre, teléfono internacional WhatsApp, documento, email opcional, fecha nacimiento, alergias, notas generales). | **Given** un paciente nuevo, **When** el médico ingresa sus datos y teléfono válido, **Then** se guarda instantáneamente en local y aparece en la lista indexada. |
| **RF-02** | **Historia Clínica Cronológica** | Registro cronológico de consultas: motivo de consulta, examen físico/diagnóstico, tratamiento realizado y evolución. | **Given** un paciente registrado, **When** se crea una nueva consulta médica/dental, **Then** se asocia a su historial inmutable con fecha y hora exacta. |
| **RF-03** | **Ficha Dental / Odontograma** | Para odontólogos: selección visual rápida de cuadrantes y piezas dentales intervenidas (tratamientos, obturaciones, extracciones, limpiezas). | **Given** el modo odontológico, **When** el profesional marca una pieza dental, **Then** se asocia el tratamiento correspondiente a la consulta del paciente. |
| **RF-04** | **Emisión de Recetas e Indicaciones** | Prescripción de fármacos (nombre, concentración, posología, duración) y notas. Exportación a PDF limpio con membrete del profesional. | **Given** una receta completada, **When** el médico presiona "Generar Receta", **Then** se produce un PDF profesional imprimible y compartible. |
| **RF-05** | **Agenda y Control de Citas** | Calendario interactivo (diario/semanal) para programar citas con horario, paciente, motivo y estado (*Pendiente*, *Confirmada*, *Atendida*, *Cancelada*). | **Given** una fecha seleccionada, **When** se agenda un turno, **Then** se valida ausencia de superposición horaria y se registra en la agenda local. |
| **RF-06** | **Integración WhatsApp en 1 Clic** | Envío de confirmaciones, recordatorios de citas y recetas generadas a través del protocolo `https://wa.me/{telefono}?text={mensaje}` o URI nativo. | **Given** una cita o receta, **When** el usuario presiona "Recordatorio WhatsApp", **Then** se abre WhatsApp con el mensaje formateado listo para enviar. |
| **RF-07** | **Persistencia Local y Cifrado** | Todos los datos se guardan en el almacenamiento local del equipo mediante SQLite/Drift con soporte de cifrado en reposo. | **Given** la app en modo avión o sin internet, **When** el usuario realiza cualquier operación, **Then** funciona sin demora ni errores de conexión. |
| **RF-08** | **Módulo Cloud Backup & Restore** | Exportación de snapshot cifrado de la base de datos a la nube a demanda, y restauración en caso de cambio o pérdida de equipo. | **Given** un usuario con servicio de respaldo activo, **When** solicita "Respaldar en la Nube", **Then** se genera un paquete encriptado y se almacena en la nube. |

---

### 3.2. Requisitos No Funcionales (RNF)

* **RNF-01 (Rendimiento):** Tiempo de apertura de la aplicación menor a 1.5 segundos; respuesta a consultas y filtrados locales en menos de 50 milisegundos.
* **RNF-02 (Diseño UI Minimalista y Explicativo):** Cada pantalla debe tener jerarquía visual clara, botones de acción primarios destacados, tooltips explicativos discretos y diseño responsivo adaptativo a pantallas táctiles móviles y monitores de escritorio.
* **RNF-03 (Seguridad y Privacidad):** Los respaldos en la nube deben utilizar cifrado de conocimiento cero (*Zero-Knowledge Encryption*), donde la clave criptográfica nunca se almacena en el servidor.
* **RNF-04 (Portabilidad):** El código debe compilar de forma nativa en Android, iOS, Windows 10/11, macOS (Intel y Apple Silicon) y distribuciones Linux (Ubuntu/Debian/Fedora).

---

## 4. Matriz de Trazabilidad

| Necesidad de Negocio (Envisioning) | Requisito Funcional | Requisito No Funcional |
| :--- | :--- | :--- |
| Gestión de pacientes y contactos | RF-01 | RNF-01, RNF-02 |
| Historial médico, análisis, tratamientos, recetas | RF-02, RF-03, RF-04 | RNF-01, RNF-03 |
| Agenda de citas y recordatorios | RF-05 | RNF-01, RNF-02 |
| Comunicación fluida por WhatsApp | RF-06 | RNF-01, RNF-04 |
| Almacenamiento 100% local | RF-07 | RNF-01, RNF-03 |
| Respaldo cloud opcional | RF-08 | RNF-03 |
