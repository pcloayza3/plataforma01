# Especificación y Maquetación de Pantallas UI
## MicroApp 1: ClinikLocal (Gestión Clínica y Dental Local-First)

---

## 1. Filosofía de Diseño: *Clean Medical Minimalist*

Para asegurar una experiencia de usuario rápida y sin fricciones durante la consulta médica, el diseño sigue principios estrictos:
1. **No cargado ni saturado:** Márgenes generosos (espaciado de 16px/24px), tipografía limpia (Inter / Roboto / System Sans), y ausencia de elementos visuales superfluos o distractores.
2. **Explicativo:** Microtextos sutiles (*microcopy*) debajo de los campos y en encabezados de tarjetas que guían al médico de inmediato sin manuales.
3. **Jerarquía visual clara:** Acciones primarias destacadas (ej. botón "Nueva Consulta" o "Enviar Recordatorio WhatsApp") y acciones secundarias con bordes sutiles.
4. **Paleta cromática serena y profesional:**
   * **Fondo Principal:** `#F8FAFC` (Slate 50 neutro).
   * **Contenedores y Tarjetas:** `#FFFFFF` con bordes suaves `#E2E8F0`.
   * **Acento Clínico Primario:** `#0D9488` (Teal 600 - serenidad y salud).
   * **Acento WhatsApp:** `#25D366` (Verde oficial WhatsApp para reconocimiento inmediato).
   * **Tipografía Primaria:** `#0F172A` (Slate 900 - máxima legibilidad).
   * **Texto Guía / Secundario:** `#64748B` (Slate 500).

---

## 2. Mapa de Navegación del Sistema

```
[ CLINIKLOCAL (Barra de Navegación Lateral o Inferior) ]
   ├── 1. Pacientes (Directorio, búsqueda rápida y ficha personal)
   ├── 2. Historia Clínica (Consultas cronológicas, tratamientos y odontograma)
   ├── 3. Agenda & Turnos (Citas del día/semana y recordatorios WhatsApp)
   ├── 4. Recetas Médicas (Prescripción, generador PDF y envío directo)
   └── 5. Respaldo Local & Nube (Gestor de persistencia y copia de seguridad)
```

---

## 3. Especificación Detallada de las 5 Pantallas

### 3.1. Pantalla 1: Directorio y Perfil de Pacientes
* **Objetivo:** Localizar a un paciente en menos de 2 segundos o dar de alta a uno nuevo con sus datos esenciales.
* **Componentes clave:**
  * Barra superior: Buscador en tiempo real por nombre, documento o teléfono + botón primario `+ Nuevo Paciente`.
  * Contador informativo: *"34 pacientes registrados en este equipo"*.
  * Tarjetas de paciente con avatar inicial, nombre completo, edad, teléfono WhatsApp (con botón de acceso rápido), última consulta y etiqueta de alergias si existen.
  * Modal/Panel lateral de creación de paciente con campos limpios y validación de código de país para WhatsApp.

### 3.2. Pantalla 2: Ficha Médica y Odontograma
* **Objetivo:** Registrar y consultar diagnósticos, evolución, tratamientos y piezas dentales en segundos.
* **Componentes clave:**
  * Cabecera del paciente seleccionado con datos de alerta médica (ej. *Alergia a la Penicilina* en pastilla ámbar suave).
  * Selector de Modo: `Modo Medicina General / Especialidad` o `Modo Odontología`.
  * **Odontograma simplificado e interactivo:** Cuadrantes superior e inferior con piezas dentales numeradas (FDI). Al hacer clic en un diente, se abre un selector limpio de intervención (Sano, Caries, Obturado, Corona, Extracción).
  * Cronología de consultas pasadas con fecha, motivo y tratamiento aplicado.

### 3.3. Pantalla 3: Agenda de Turnos y Recordatorios WhatsApp
* **Objetivo:** Organizar las consultas diarias y reducir el ausentismo mediante recordatorios rápidos por WhatsApp.
* **Componentes clave:**
  * Selector de fecha con vista de "Hoy", "Mañana" o calendario mensual.
  * Tarjetas de turnos con hora, paciente, motivo de consulta y badge de estado (*Pendiente*, *Confirmada*, *Atendida*).
  * **Botón Explicativo Destacado:** `💬 Recordatorio WhatsApp`. Al pulsarlo, abre WhatsApp con el mensaje precargado:
    > *"Hola [Nombre], le recordamos su cita con el Dr. [Médico] programada para el [Día] a las [Hora]. Por favor confirme su asistencia respondiendo a este mensaje."*

### 3.4. Pantalla 4: Emisión de Recetas y Prescripción en PDF
* **Objetivo:** Redactar prescripciones legibles y entregarlas al paciente en formato digital o impreso.
* **Componentes clave:**
  * Selector de paciente asociado.
  * Lista dinámica de medicamentos: Nombre del fármaco, concentración, dosis/posología y duración del tratamiento.
  * Campo de indicaciones adicionales o cuidados generales.
  * **Botón Primario:** `📄 Previsualizar y Generar Receta PDF` (con membrete, fecha y firma digital).
  * **Botón Secundario:** `💬 Enviar Receta a WhatsApp` (adjunta o redacta el resumen de medicación directamente al chat).

### 3.5. Pantalla 5: Respaldo y Recuperación Local-First (Seguridad de Datos)
* **Objetivo:** Dar tranquilidad total al profesional sobre la propiedad de sus datos y ofrecer la opción comercial de copia en la nube.
* **Componentes clave:**
  * **Tarjeta 1: Almacenamiento Local (Activo):**
    * Mensaje explicativo: *"Tus datos se encuentran 100% resguardados en este dispositivo. No dependen de servidores externos ni de conexión a internet."*
    * Botón: `Exportar Respaldo Local (.clinik / .json)` para guardar en memoria USB o disco externo.
  * **Tarjeta 2: Respaldo Centralizado en la Nube (Add-on Premium):**
    * Mensaje explicativo: *"Protege tus historias clínicas contra robo, rotura o pérdida de este equipo. Los respaldos se transmiten con cifrado de conocimiento cero (AES-256)."*
    * Estado: `Suscripción Opcional Disponible` / `Respaldar ahora a la Nube`.
    * Historial de últimas copias de seguridad remotas con fecha y peso del archivo.
