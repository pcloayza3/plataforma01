# Implementación Core bajo Extreme Programming (XP / TDD)
## MicroApp 2: Recordatorio y Notas Visuales Inteligentes (*PostyLocal*)

---

## 1. Metodología de Desarrollo: Extreme Programming (XP / TDD)

La implementación del núcleo de **PostyLocal** se realizó siguiendo de forma estricta el ciclo **Red-Green-Refactor**:
1. **Fase Roja (Red):** Se diseñó e implementó la suite completa de pruebas unitarias (`apps/posty_local/test_posty_core.py`), estableciendo las aserciones para validación de notas, parser de voz, semáforo diario, motor de geocercas Haversine y persistencia SQLite.
2. **Fase Verde (Green):** Se desarrollaron los módulos de la capa de Dominio, Aplicación e Infraestructura hasta lograr el 100% de pruebas aprobadas (9/9).
3. **Fase Refactor:** Se optimizó el manejo de conexiones SQLite con administradores de contexto (`contextmanager`) y se integró el despachador de acciones rápidas para notificaciones push.

---

## 2. Módulos Core Implementados (`apps/posty_local/core/`)

```mermaid
graph TD
    subgraph "Capa de Dominio (core/models.py)"
        Note["Note (id, text, color, urgency, completed)"]
        Audio["AudioAttachment (aac, duration_ms, file_size_bytes)"]
        Trigger["ReminderTrigger (Time / Geofence)"]
    end

    subgraph "Capa de Lógica & Casos de Uso"
        Parser["VoiceIntentParser (core/voice_parser.py)<br/>Extracción de tareas, +15m, +1h, 18:00, Geocercas"]
        Classifier["DailyUrgencyClassifier (core/urgency_classifier.py)<br/>Semáforo: Rojo (Urgente/Hoy), Amarillo, Verde"]
        Geo["GeofenceEngine (core/geofence_engine.py)<br/>Cálculo Haversine offline y transiciones ENTER/EXIT"]
        Dispatcher["PushNotificationDispatcher (core/notification_dispatcher.py)<br/>Acciones rápidas 'Completar' y 'Posponer 15m'"]
    end

    subgraph "Capa de Persistencia (core/storage.py)"
        Repo["NoteRepository (SQLite Local & JSON Backup)<br/>posty_local.db"]
    end

    Parser --> Note
    Parser --> Trigger
    Classifier --> Note
    Geo --> Trigger
    Dispatcher --> Repo
    Repo --> Note
    Repo --> Audio
```

### 2.1. Detalle de Módulos
* **`models.py`:** Entidades inmutables y reglas de validación de post-it (colores pastel: amarillo, verde, azul, rosa, púrpura) y restricciones de audio (< 100 KB por nota en formato AAC).
* **`voice_parser.py`:** Extracción sintáctica mediante expresiones regulares compiladas que detecta intenciones temporales relativas (`"en 15 minutos"`, `"en 1 hora"`), absolutas (`"hoy a las 18:00"`) y geográficas (`"al salir de casa"`, `"cerca del súper"`).
* **`urgency_classifier.py`:** Algoritmo determinista del semáforo:
  * 🔴 **Rojo (Urgente / Vence Hoy):** Vencimiento en $\le 2$ horas o fecha de hoy.
  * 🟡 **Amarillo (Contexto / Próximas):** Geocerca armada activa o vencimiento en 24-48 horas.
  * 🟢 **Verde (Libre):** Sin plazo estricto de alarma.
* **`geofence_engine.py`:** Implementación matemática de la fórmula del semiverseno (*Haversine*), evaluando distancia en metros y transiciones de entrada/salida para un radio de 150m, con cero dependencia de servicios externos o internet.
* **`notification_dispatcher.py`:** Manejador de acciones detonadas desde la alerta push en pantalla de bloqueo.
* **`storage.py`:** Repositorio SQLite local con esquema transaccional, además de exportación/importación atómica en formato JSON.
* **`server.py`:** Servidor HTTP integrado para proveer API REST local y servir la interfaz móvil en el puerto `8092`.

---

## 3. Reporte de Ejecución de Pruebas Unitarias TDD

```
$ python3 apps/posty_local/test_posty_core.py
.........
----------------------------------------------------------------------
Ran 9 tests in 0.015s

OK
```

| Caso de Prueba | Componente Probado | Resultado |
| :--- | :--- | :--- |
| `test_note_creation_and_color_validation` | `models.Note` & `NoteColor` | ✅ PASS |
| `test_audio_attachment_constraints` | `models.AudioAttachment` (formato AAC y tamaño < 100KB) | ✅ PASS |
| `test_voice_intent_parser_relative_times` | `VoiceIntentParser` (+15m, +1h, +2h) | ✅ PASS |
| `test_voice_intent_parser_fixed_time` | `VoiceIntentParser` (Hora fija: 18:00) | ✅ PASS |
| `test_voice_intent_parser_geofencing` | `VoiceIntentParser` ("Salir de casa", "Cerca del súper") | ✅ PASS |
| `test_daily_urgency_classifier` | `DailyUrgencyClassifier` (Semáforo Rojo, Amarillo, Verde) | ✅ PASS |
| `test_geofence_haversine_engine` | `GeofenceEngine` (Distancia Haversine y transición EXIT) | ✅ PASS |
| `test_notification_dispatcher_actions` | `PushNotificationDispatcher` (Acciones Complete y Snooze) | ✅ PASS |
| `test_sqlite_local_repository_and_backup` | `NoteRepository` (SQLite CRUD y Respaldo/Restauración JSON) | ✅ PASS |

---

## 4. Control de Puerta de Calidad (Quality Gate)

* **Documento Técnico:** `docs/microapps/microapp2/04_development_and_xp_implementation.md`
* **Rama GitFlow:** `feature/microapp2-04-core-xp`
* **Issue Kanban:** `#35` (Asignado a `pcloayza3` en estado `In Progress`)
* **Estado:** Desarrollo e implementación Core completados bajo TDD y Clean Architecture.
