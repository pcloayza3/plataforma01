# Especificación y Maquetación de Pantallas UI
## MicroApp 2: PostyLocal (Recordatorio, Voz y Notas Visuales Inteligentes)

---

## 1. Filosofía de Diseño: *Visual Post-it & Minimalist Glance*

El diseño de **PostyLocal** emula la inmediatez física de las notas adhesivas (*post-its* y papelitos), eliminando formularios extensos y navegación laberíntica:
1. **Regla de los 2 Toques:** Registrar una nota toma máximo 2 interacciones (pulsar micrófono y dictar, o presionar "+" y escribir).
2. **Prioridad Visual Diaria (Semáforo de Urgencia):**
   * 🔴 **Urgente / Vence Hoy:** Encabezado superior con tarjetas destacadas y borde de acento.
   * 🟡 **Próximas (24-48 horas o Geocerca Activa):** Bloque intermedio.
   * 🟢 **Pendientes Generales:** Visualización libre estilo tablero de notas.
3. **Tarjeta Dual (Lectura + Escucha Inmediata):**
   * El texto transcrito se lee de inmediato en primer plano.
   * Si la nota fue grabada por voz, incluye un reproductor minimalista con botón Play/Pausa y barra de onda sonora para escuchar el audio original con un solo toque.
4. **Paleta Cromática Post-it (Colores Pasteles Cálidos):**
   * **Amarillo Clásico:** `#FEF08A` / borde `#FACC15` (nota cotidiana).
   * **Azul Cielo:** `#BAE6FD` / borde `#38BDF8` (trámites y llamadas).
   * **Verde Menta:** `#BBF7D0` / borde `#4ADE80` (salud y compras).
   * **Coral / Rosa:** `#FECDD3` / borde `#FB7185` (urgente y personal).
   * **Lavanda:** `#E9D5FF` / borde `#C084FC` (ideas y recordatorios varios).
5. **Modo Protector de Pantalla (OLED Minimalist Glance):**
   * Fondo negro puro (`#000000`), reloj ambiental y las 3 notas prioritarias atenuadas para consulta sin tocar el teléfono.

---

## 2. Mapa de Navegación del Sistema

```
[ PANTALLA PRINCIPAL: TABLERO DIARIO (PostyBoard) ]
   │
   ├── 🔴 Sección 1: Urgente / Vence Hoy
   │    └── Tarjetas de Post-it con audio player, hora y botón "Hecho"
   ├── 🟡 Sección 2: Próximas & Geocercas Activas
   │    └── Tarjetas con etiquetas de proximidad ("📍 Cerca del súper", "🏠 Al salir")
   ├── 🟢 Sección 3: Pendientes Generales
   │    └── Notas libres sin fecha de vencimiento estricta
   │
   ├── 🎙️ Botón Central Inferior: Captura Rápida por Voz
   │    └── Despliega MODAL DE DICTADO & ALARMAS (Onda de audio, presets +15m, +1h, Geofence)
   │
   ├── ➕ Botón Inferior Secundario: Nota Manual
   │
   ├── 🌙 Botón Cabecera: Activar Modo Protector de Pantalla / AOD
   │    └── Abre VISTA AMBIENTE PROTECTOR DE PANTALLA (Reloj grande + 3 tareas urgentes)
   │
   └── ⚙️ Botón Cabecera: Configuración & Geocercas Locales
        └── Gestión de lugares ("Casa", "Súper", "Trabajo") y Respaldo JSON
```

---

## 3. Especificación Detallada de Pantallas

### 3.1. Pantalla 1: Tablero Principal Diario (PostyBoard)
* **Objetivo:** Visualizar de un vistazo todas las notas del día jerarquizadas por urgencia.
* **Componentes clave:**
  * **Cabecera:** Día actual (ej. *"Jueves, 15 de Octubre"*), contador de pendientes urgentes hoy y botones de acceso al Protector de Pantalla y Configuración.
  * **Grid Responsivo de Tarjetas Post-it:**
    * Código de color pastel seleccionado.
    * Texto de alta legibilidad (fuente sans-serif limpia de 16-18px).
    * **Mini-Player de Audio Embebido:** Icono circular de Play/Pause, barra de tiempo transcurrido (ej. `0:08 / 0:14`) y control de volumen.
    * **Insignia de Alerta:** `⏰ En 15m`, `⏰ 18:00` o `📍 Cerca del súper`.
    * **Acción de Cumplimiento:** Casilla circular para tachar la nota; al completarse, pasa a estado atenuado con animación suave.
  * **Barra de Acción Flotante Inferior:** Botón grande de micrófono (mic) central con pulso visual para dictado instantáneo.

```
+------------------------------------------+
| ☀️ Hoy: Jueves 15 Oct      🌙 [AOD]  ⚙️  |
| 3 pendientes para hoy (1 urgente)        |
+------------------------------------------+
| 🔴 URGENTE / HOY                         |
| +--------------------------------------+ |
| | [🟡 Post-it Amarillo]                | |
| | Pagar servicio de luz antes de 6pm   | |
| | ▶️ [====|------] 0:06 / 0:12         | |
| | ⏰ Vence 18:00             [✓ Hecho] | |
| +--------------------------------------+ |
|                                          |
| 🟡 CONTEXTO / PRÓXIMAS                   |
| +--------------------------------------+ |
| | [🟢 Post-it Menta]                   | |
| | Comprar leche descremada y fruta     | |
| | ▶️ [===|-------] 0:03 / 0:08         | |
| | 📍 Al estar cerca del súper [✓ Hecho]| |
| +--------------------------------------+ |
|                                          |
| 🟢 PENDIENTES LIBRES                     |
| +--------------------------------------+ |
| | [🔵 Post-it Celeste]                 | |
| | Revisar cotización de pintura        | |
| |                              [✓ Hecho] | |
| +--------------------------------------+ |
+------------------------------------------+
|         [  🎙️ DICTAR NOTA  ]    [ ➕ ]   |
+------------------------------------------+
```

---

### 3.2. Pantalla 2: Modal de Captura Rápida por Voz y Alertas
* **Objetivo:** Grabar la nota, transcribir en tiempo real y permitir seleccionar la alarma en 1 toque.
* **Componentes clave:**
  * **Indicador de Grabación:** Onda de audio reactiva y cronómetro de duración.
  * **Caja de Texto Transcrito:** Visualización editable del texto detectado por voz.
  * **Selector de Color del Post-it:** 5 círculos cromáticos interactivos.
  * **Barra de Presets Rápidos de Tiempo:**
    * `+15 min` | `+1 hora` | `+2 horas` | `⏰ Hora fija`
  * **Barra de Presets de Geocercas (Ubicación):**
    * `🏠 Al salir de casa` | `🛒 Cerca del súper` | `📍 Otro lugar`
  * **Botón de Guardar:** Guarda el audio `.m4a`, el texto y programa la alerta.

```
+------------------------------------------+
|             NUEVA NOTA RÁPIDA            |
+------------------------------------------+
|  [ 🎙️ Escuchando... 0:07 ]                |
|  ~~~~/\~~/\/\~~~/\~~~~ (Onda de voz)     |
|                                          |
|  "Comprar medicina para la tos"          |
|  (Texto transcrito en tiempo real)       |
+------------------------------------------+
| Color:  (🟡)  (🟢)  (🔵)  (🔴)  (🟣)      |
+------------------------------------------+
| ¿Cuándo alertar?                         |
| [ +15 min ]  [ +1 hora ]  [ +2 horas ]   |
| [ ⏰ Fijar Hora ]                        |
|                                          |
| ¿O por ubicación?                        |
| [ 🏠 Al salir de casa ]                  |
| [ 🛒 Cerca del súper ]                   |
| [ 📍 Definir lugar personalizado ]       |
+------------------------------------------+
|        [ CANCELAR ]   [ GUARDAR (✓) ]    |
+------------------------------------------+
```

---

### 3.3. Pantalla 3: Modo Protector de Pantalla (Screensaver / AOD Glance)
* **Objetivo:** Mostrar los pendientes en estado de reposo o carga sin agotar la batería ni saturar la vista.
* **Componentes clave:**
  * **Fondo Negro Puro (#000000):** Consumo mínimo de píxeles en pantallas OLED/AMOLED.
  * **Reloj Ambiental:** Hora en tipografía estilizada blanca suave (`21:45`).
  * **Fecha y Ubicación:** `Jueves, 15 de Octubre • En Casa`.
  * **Lista de 3 Pendientes Críticos:**
    * Fila 1: `🔴 18:00 - Pagar servicio de luz`.
    * Fila 2: `🟡 Al salir de casa - Cerrar llave de gas`.
    * Fila 3: `🟡 Cerca del súper - Comprar leche y fruta`.
  * **Mensaje de Salida:** *"Toca cualquier parte de la pantalla para volver"*.

```
+------------------------------------------+
|                                          |
|                 21:45                    |
|       Jueves, 15 de Octubre              |
|                                          |
|  --- ACTIVIDADES PENDIENTES ---          |
|                                          |
|  🔴 18:00 - Pagar servicio de luz        |
|  🟡 Al salir - Cerrar llave de gas       |
|  🟡 Cerca del súper - Comprar fruta      |
|                                          |
|                                          |
|                                          |
|                                          |
|                                          |
|     ( Toque la pantalla para salir )     |
+------------------------------------------+
```

---

### 3.4. Pantalla 4: Visualizador de Notificación Push Nativa (Pantalla de Bloqueo)
* **Objetivo:** Alertar al usuario en el momento exacto y permitir completar sin abrir la app.
* **Componentes clave:**
  * Banner nativo con icono de post-it.
  * Título: *"PostyLocal • Recordatorio"* o *"📍 Geocerca: Cerca del Súper"*.
  * Contenido de la nota.
  * Botones de Acción:
    * `[ ✓ Completar ]`: Tacha la nota de inmediato.
    * `[ ⏱️ +15 min ]`: Pospone la alerta 15 minutos más.

```
+------------------------------------------+
| 🔔 PostyLocal • Ahora                    |
| 🛒 Cerca del Supermercado                |
| Comprar leche descremada y fruta fresca  |
|                                          |
| [ ✓ Completar ]       [ ⏱️ Posponer 15m ] |
+------------------------------------------+
```

---

### 3.5. Pantalla 5: Configuración de Lugares y Respaldo Local
* **Objetivo:** Administrar coordenadas favoritas para geocercas y exportar/importar datos.
* **Componentes clave:**
  * **Mis Lugares Frecuentes:**
    * *Casa:* Radio 150m (Guardar ubicación actual como "Casa").
    * *Supermercado:* Radio 150m (Guardar ubicación actual como "Súper").
    * *Trabajo:* Radio 150m.
  * **Respaldo Local:**
    * Botón *"Exportar notas y audios (JSON/ZIP)"*.
    * Botón *"Restaurar copia de seguridad"*.
  * **Privacidad:** Indicador *"Almacenamiento 100% Local • Cero datos en la nube"*.

---

## 4. Control de Puerta de Calidad (Quality Gate)

* **Documento Técnico:** `docs/microapps/microapp2/04_ui_screens_specification.md`
* **Rama GitFlow:** `feature/microapp2-04-screens`
* **Issue Kanban:** `#34` (Asignado a `pcloayza3` en estado `In Progress`)
* **Estado:** Especificación de pantallas del flujo completo documentada formalmente.
