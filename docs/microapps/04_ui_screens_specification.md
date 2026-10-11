# Especificación y Maquetación de Pantallas UI
## MicroApp 1: ClinikLocal (Gestión Clínica y Dental Local-First)

---

## 1. Filosofía de Diseño: *Clean Medical Minimalist*

Para asegurar una experiencia de usuario rápida y sin fricciones durante la consulta médica, el diseño sigue principios estrictos:
1. **Menú Hamburguesa & Espacio Limpio:** Se eliminan barras saturadas de pestañas. La navegación se centraliza en un botón hamburguesa (`☰`) que despliega un cajón lateral (*drawer*) elegante con la identidad completa del consultorio.
2. **Explicativo:** Microtextos sutiles (*microcopy*) debajo de los campos y en encabezados de tarjetas que guían al médico de inmediato sin manuales.
3. **Jerarquía visual clara:** Acciones primarias destacadas (ej. botón "Nueva Consulta" o "Enviar Recordatorio WhatsApp") y acciones secundarias con bordes sutiles.
4. **Paleta cromática dinámica seleccionable:**
   * **Médico Teal (Predeterminado):** `#0D9488` (Teal 600 - serenidad y salud).
   * **Azul Clínico:** `#0284C7` (Sky 600 - confianza y sobriedad médica).
   * **Violeta Dental / Estética:** `#7C3AED` (Purple 600 - estética y ortodoncia).
   * **Grafito Minimalista:** `#334155` (Slate 700 - neutralidad ejecutiva).
   * **Acento WhatsApp:** `#25D366` (Verde oficial WhatsApp para reconocimiento inmediato).

---

## 2. Mapa de Navegación del Sistema

```
[ MENÚ HAMBURGUESA (☰ Drawer Lateral) ]
   ├── 🏥 Encabezado del Consultorio (Logo, Nombre, Subtítulo y Dr./Dra.)
   ├── 👤 1. Pacientes (Directorio, ordenación avanzada y ficha personal)
   ├── 📋 2. Historia Clínica (Consultas, multimedia: fotos/video/PDF y odontograma)
   ├── 📅 3. Agenda & Turnos (Citas del día/semana y recordatorios WhatsApp)
   ├── 💊 4. Recetas PDF (Prescripción, generador PDF y envío directo)
   ├── 🛡️ 5. Respaldo & Nube (Persistencia local y sincronización cada minuto)
   ├── ⚙️ 6. Configuración (Identidad, temas, módulos activos, QR/PayPal)
   └── 📍 Botón: Compartir Ubicación y Contacto del Consultorio
```

---

## 3. Especificación Detallada de Pantallas

### 3.1. Pantalla 1: Directorio de Pacientes y Ordenación Avanzada
* **Objetivo:** Localizar a un paciente en menos de 2 segundos con ordenación flexible.
* **Componentes clave:**
  * **Criterios de Ordenación:**
    1. *Más recientes atendidos (Por defecto):* Ordena según la fecha de su última consulta o atención.
    2. *Atendidos hoy / Con cita hoy:* Filtra primero los pacientes con turno o consulta en el día corriente.
    3. *Por Apellido (A - Z y Z - A).*
    4. *Por Nombre (A - Z y Z - A).*
  * Tarjetas de paciente con avatar inicial, nombre, teléfono WhatsApp con botón directo, última visita y etiqueta de alergias.

### 3.2. Pantalla 2: Historia Clínica con Soporte Multimedia & Odontograma
* **Objetivo:** Registrar evolución clínica con evidencia multimedia y gráfica.
* **Componentes clave:**
  * **Soporte Multimedia Integral:**
    * **Fotos / Radiografías:** Visualización en miniatura con lightbox a pantalla completa al hacer clic.
    * **Videos Clínicos:** Reproductor nativo embebido para procedimientos o ecografías.
    * **Documentos PDF:** Botón de descarga/visualización directa para análisis de laboratorio y estudios clínicos.
    * **Texto Clínico:** Anamnesis, diagnóstico y evolución detallada.
  * **Odontograma FDI (32 piezas):** Activable/desactivable según especialidad del médico.

### 3.3. Pantalla 3: Agenda de Turnos y Recordatorios WhatsApp
* **Objetivo:** Organizar las consultas diarias y reducir el ausentismo mediante recordatorios rápidos por WhatsApp.
* **Componentes clave:**
  * Selector de fecha con vista de "Hoy".
  * Botón directo con ícono de WhatsApp: abre el chat con el paciente con texto precargado, fecha, hora, ubicación del consultorio y solicitud de confirmación.

### 3.4. Pantalla 4: Emisión de Recetas y Prescripción en PDF
* **Objetivo:** Redactar prescripciones legibles y entregarlas al paciente en formato digital o impreso.
* **Componentes clave:**
  * Generador de membrete dinámico con nombre del consultorio y doctor configurados.
  * Botón para exportar/imprimir en PDF.
  * Botón para enviar la receta formateada directamente por WhatsApp.

### 3.5. Pantalla 5: Respaldo y Sincronización en la Nube (1 Minuto)
* **Objetivo:** Soberanía de datos en local y sincronización continua en la nube.
* **Componentes clave:**
  * Exportación e importación local de archivos `.clinik`.
  * **Sincronización Continua cada 60 Segundos:** Verificación automática de cambios locales y sincronización bidireccional mediante REST API con JWT.
  * Indicador de estado en tiempo real (Pill superior): `🟢 Nube al día`, `🟡 Cambios pendientes`, `⏳ Sincronizando`.

### 3.6. Pantalla 6: Configuración del Consultorio, Temas y Pagos
* **Objetivo:** Personalización integral de la aplicación y gestión de suscripción.
* **Componentes clave:**
  * **Identidad:** Nombre del consultorio, ícono/logo, subtítulo, Dr./Dra., matrícula, dirección física, link de Google Maps y teléfono.
  * **Botón de Compartir:** Envía la ficha completa del consultorio con link de Google Maps al WhatsApp del paciente.
  * **Plantilla de Colores:** Selector dinámico entre Teal, Sky, Purple y Slate.
  * **Switches de Módulos:** Activar/desactivar Odontograma FDI, Recetas PDF y Agenda.
  * **Gestión de Pago Previo (PayPal / QR):**
    * Panel para activar la copia de seguridad y multi-dispositivo.
    * Pasarela PayPal ($15 USD / mes) y Simple QR (Bs. 100 / mes).
  * **Bitácora de Auditoría (Audit Log):** Al estar la copia pagada, habilita la visualización histórica de todos los cambios realizados en personas, citas, recetas e historia clínica.
