# Documento de Arquitectura y Diseño de Software (C4 Model + ICONIX)
## MicroApp 2: Recordatorio y Notas Visuales Inteligentes (*PostyLocal*)

---

## 1. Patrón Arquitectónico Seleccionado

* **Patrón:** **Clean Architecture Local-First** (Arquitectura Limpia con orientación a datos locales).
* **Justificación Técnica:**
  * **Independencia de Frameworks y Hardware:** La lógica de negocio (priorización de tareas, cálculo del semáforo de urgencia, parsing sintáctico de voz y reglas de recordatorio) queda completamente desacoplada de los plugins de Android (`speech_to_text`, `record`, `geolocator`, `flutter_local_notifications`).
  * **Facilidad de Pruebas Unitarias (XP / TDD):** Permite probar el 100% de los casos de uso y algoritmos mediante pruebas unitarias rápidas utilizando repositorios y servicios simulados en memoria (Mock/In-Memory), sin necesidad de levantar emuladores ni depender de hardware físico de sensores.
  * **Soberanía y Privacidad Absoluta:** La capa de infraestructura garantiza que toda la persistencia se realice en SQLite local y en el sistema de archivos privado del dispositivo (*sandbox*), sin fugas hacia servidores en la nube.

```mermaid
graph TD
    subgraph "Capa de Presentación (UI & Native Bridges)"
        UI["Widgets Flutter (Post-it Board, Audio Player, Note Editor)"]
        NativeBridge["Android DreamService & Lockscreen Integration"]
    end

    subgraph "Capa de Aplicación (Casos de Uso)"
        UC1["CreateVoiceNoteUseCase"]
        UC2["ScheduleReminderUseCase"]
        UC3["EvaluateUrgencyUseCase"]
        UC4["TriggerGeofenceAlertUseCase"]
        UC5["ExportImportNotesUseCase"]
    end

    subgraph "Capa de Dominio (Entidades & Reglas)"
        Domain["Entidad Note, AudioAttachment, ReminderTrigger"]
        Rules["DailyUrgencyClassifier, VoiceIntentParser"]
    end

    subgraph "Capa de Infraestructura (Adaptadores & Hardware)"
        SQLiteRepo["SQLite Note Repository (sqflite)"]
        AudioAdapter["Audio Recording & Playback Adapter"]
        STTAdapter["Speech Recognition Adapter"]
        NotifAdapter["Local Notifications Adapter (AlarmManager)"]
        GeoAdapter["Geofencing Service Adapter (Android Location)"]
    end

    UI --> UC1
    UI --> UC2
    UI --> UC3
    NativeBridge --> UC3
    UC1 --> Domain
    UC2 --> Domain
    UC3 --> Rules
    UC4 --> Rules
    UC1 --> SQLiteRepo
    UC1 --> AudioAdapter
    UC1 --> STTAdapter
    UC2 --> NotifAdapter
    UC4 --> GeoAdapter
```

---

## 2. C4 Model (Visualización Arquitectónica Estática)

### 2.1. C4 - Nivel 1: Diagrama de Contexto del Sistema
Representa los límites del sistema *PostyLocal*, sus actores y los servicios nativos del smartphone con los que interactúa.

```mermaid
graph TD
    User["👤 Usuario Final (Voz / Pantalla Táctil)"]
    PostyApp["📱 PostyLocal (MicroApp Móvil Autónoma)"]

    subgraph "Servicios Nativos del Smartphone (Android OS)"
        MicSens["🎙️ Micrófono / Reconocedor Fonético"]
        LocSens["🛰️ Proveedor de Ubicación & Geofencing"]
        AlarmSvc["⏰ AlarmManager & Notificaciones Push Locales"]
        DreamSvc["🌙 Android DreamService (Protector de Pantalla)"]
        Storage["💾 Almacenamiento Local Privado (Sandbox)"]
    end

    User -->|Dicta o escribe notas, configura alertas| PostyApp
    User -->|Observa pendientes en reposo/carga| DreamSvc
    PostyApp -->|Captura voz y transcribe| MicSens
    PostyApp -->|Registra geocercas pasivas| LocSens
    PostyApp -->|Programa alertas exactas locales| AlarmSvc
    PostyApp -->|Alimenta estado para protector de pantalla| DreamSvc
    PostyApp -->|Lee y guarda notas y audios| Storage
    AlarmSvc -->|Emite notificación push con sonido/vibración| User
    LocSens -->|Detona evento al entrar/salir de zona| PostyApp
```

---

### 2.2. C4 - Nivel 2: Diagrama de Contenedores
Desglose de los componentes de ejecución dentro del dispositivo móvil.

```mermaid
graph TB
    subgraph "Dispositivo Móvil (Smartphone)"
        subgraph "Contenedor de Aplicación PostyLocal (Flutter)"
            FlutterUI["🎨 Flutter Presentation UI<br/>(Grid de Post-its, Player, Visualizador AOD)"]
            AppCore["⚙️ App Core & Logic Engine<br/>(Casos de Uso, Parser Sintáctico, Semáforo)"]
            NativeBridge["🔌 Platform Channels / Android Native Bridge<br/>(Kotlin Service para DreamService)"]
        end

        subgraph "Contenedor de Almacenamiento Local"
            SQLiteDB[("🗄️ SQLite Database<br/>(posty_local.db)")]
            AudioDir["📁 Directorio Local de Audios<br/>(/app_flutter/audio/*.m4a)"]
        end

        subgraph "Subsistema Android OS"
            AlarmManagerOS["⏰ Android AlarmManager"]
            GeofenceClientOS["📍 Google GeofencingClient"]
            NotificationManagerOS["🔔 Android NotificationManager"]
            DreamServiceOS["🌙 Android DreamService"]
        end
    end

    FlutterUI --> AppCore
    AppCore --> SQLiteDB
    AppCore --> AudioDir
    AppCore --> NativeBridge
    NativeBridge --> DreamServiceOS
    AppCore --> AlarmManagerOS
    AppCore --> GeofenceClientOS
    AlarmManagerOS --> NotificationManagerOS
    GeofenceClientOS --> NotificationManagerOS
```

---

### 2.3. C4 - Nivel 3: Diagrama de Componentes (App Core & Logic Engine)
Estructura modular interna del núcleo de la aplicación.

```mermaid
graph TB
    subgraph "Controladores & BLoCs"
        NoteBoardBloc["NoteBoardBloc<br/>(Manejo de estado del tablero y semáforo)"]
        VoiceCaptureBloc["VoiceCaptureBloc<br/>(Grabación y transcripción simultánea)"]
        ReminderBloc["ReminderBloc<br/>(Gestión de alertas de tiempo y lugar)"]
    end

    subgraph "Servicios de Aplicación & Casos de Uso"
        VoiceParser["VoiceIntentParser<br/>(Detección semántica de tiempo y ubicación)"]
        UrgencyEvaluator["UrgencyEvaluatorService<br/>(Cálculo dinámico de prioridad diaria)"]
        AudioFileManager["AudioFileManager<br/>(Gestión de archivos AAC/M4A)"]
    end

    subgraph "Adaptadores de Infraestructura"
        NoteRepository["NoteSqliteRepository<br/>(Implementación de INoteRepository)"]
        PushNotificationAdapter["LocalNotificationAdapter<br/>(Implementación de INotificationService)"]
        GeofenceAdapter["GeofenceServiceAdapter<br/>(Implementación de IGeofenceService)"]
    end

    VoiceCaptureBloc --> VoiceParser
    VoiceCaptureBloc --> AudioFileManager
    VoiceCaptureBloc --> NoteRepository
    ReminderBloc --> PushNotificationAdapter
    ReminderBloc --> GeofenceAdapter
    NoteBoardBloc --> UrgencyEvaluator
    NoteBoardBloc --> NoteRepository
```

---

### 2.4. C4 - Nivel 4: Código y Modelos Estructurales

```mermaid
classDiagram
    class Note {
        +String id
        +String title
        +String content
        +NoteColor color
        +DateTime createdAt
        +DateTime? dueDateTime
        +NoteStatus status
        +UrgencyLevel urgencyLevel
        +AudioAttachment? audioAttachment
        +ReminderTrigger? trigger
        +markAsCompleted() void
        +calculateUrgency() UrgencyLevel
    }

    class AudioAttachment {
        +String id
        +String filePath
        +int durationMs
        +int fileSizeBytes
        +bool existsLocally()
    }

    class ReminderTrigger {
        <<abstract>>
        +String id
        +TriggerType type
        +bool isFired
        +executeTrigger() void
    }

    class TimeReminderTrigger {
        +DateTime scheduledDateTime
        +TimePreset? preset
    }

    class GeofenceReminderTrigger {
        +double latitude
        +double longitude
        +double radiusMeters
        +GeofenceTransition transitionType
        +String locationLabel
    }

    ReminderTrigger <|-- TimeReminderTrigger
    ReminderTrigger <|-- GeofenceReminderTrigger
    Note "1" *-- "0..1" AudioAttachment : contiene
    Note "1" *-- "0..1" ReminderTrigger : configurado con
```

---

## 3. Metodología ICONIX (Diseño Dinámico)

### 3.1. Modelo de Dominio
El modelo encapsula el concepto de "Nota Adhesiva Inteligente":
* **Note:** Entidad principal que representa un post-it virtual.
* **AudioAttachment:** Objeto de valor/entidad que representa el audio capturado con voz natural.
* **ReminderTrigger:** Estrategia abstracta que soporta alarmas basadas en tiempo (`TimeReminderTrigger`) o en contexto geográfico (`GeofenceReminderTrigger`).
* **UrgencyLevel:** Enumeración que gobierna el semáforo visual:
  * `URGENT_TODAY` (Rojo: vence hoy o en < 2 horas).
  * `UPCOMING` (Amarillo: vence en 24-48 horas o geocerca armada).
  * `NORMAL` (Verde: sin vencimiento inminente).

---

### 3.2. Análisis de Robustez (Robustness Diagrams)

#### Caso de Uso 1: Captura por Voz Dual (Texto + Audio + Auto-Alerta)
Conecta la interfaz del micrófono con los objetos de negocio y persistencia.

```mermaid
graph LR
    Actor["👤 Usuario"]
    B_Mic["[Boundary]<br/>BotonMicrofono"]
    C_STT["[Control]<br/>SpeechRecognizer"]
    C_Rec["[Control]<br/>AudioRecorder"]
    C_Parse["[Control]<br/>VoiceIntentParser"]
    C_Save["[Control]<br/>NoteCreator"]
    E_Audio[("[Entity]<br/>AudioFile (.m4a)")]
    E_Note[("[Entity]<br/>Note (SQLite)")]
    C_Sched["[Control]<br/>AlarmScheduler"]

    Actor --> B_Mic
    B_Mic --> C_STT
    B_Mic --> C_Rec
    C_Rec --> E_Audio
    C_STT --> C_Parse
    C_Parse --> C_Save
    C_Save --> E_Note
    C_Parse --> C_Sched
```

#### Caso de Uso 2: Detección de Geocerca ("Al salir de casa" / "Cerca del súper")
Monitoreo pasivo y emisión de notificación sin intervención manual.

```mermaid
graph LR
    OS_Geo["🛰️ Sensor Ubicación OS"]
    B_GeoReceiver["[Boundary]<br/>GeofenceBroadcastReceiver"]
    C_GeoHandler["[Control]<br/>GeofenceTransitionHandler"]
    E_Note[("[Entity]<br/>Note & GeofenceTrigger")]
    C_Notif["[Control]<br/>PushNotificationDispatcher"]
    B_Push["[Boundary]<br/>Alerta Pantalla Bloqueo"]

    OS_Geo --> B_GeoReceiver
    B_GeoReceiver --> C_GeoHandler
    C_GeoHandler --> E_Note
    C_GeoHandler --> C_Notif
    C_Notif --> B_Push
```

---

### 3.3. Diagramas de Secuencia

#### Secuencia 1: Dictado, Transcripción y Auto-Alarma
```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant UI as Interfaz PostyBoard
    participant STT as Servicio Speech-to-Text
    participant REC as Grabador Audio (AAC)
    participant Parser as VoiceIntentParser
    participant Repo as NoteSqliteRepository
    participant Alarm as LocalNotificationService

    U->>UI: Mantener presionado micrófono y dictar
    UI->>REC: Iniciar grabación local (audio.m4a)
    UI->>STT: Iniciar streaming fonético
    U->>UI: Soltar botón (finalizar dictado)
    REC-->>UI: Retornar ruta de archivo (/audio/nota_01.m4a)
    STT-->>UI: Retornar texto transcrito ("Comprar leche en 15 minutos")
    UI->>Parser: Analizar texto("Comprar leche en 15 minutos")
    Parser-->>UI: Entidades(tarea: "Comprar leche", delta: +15min)
    UI->>Repo: GuardarNota(Note con AudioAttachment y TimeTrigger)
    Repo-->>UI: Nota persistida con ID único
    UI->>Alarm: ProgramarAlarmaExacta(timestamp = now + 15m, noteId)
    Alarm-->>UI: Alarma registrada en AlarmManager
    UI-->>U: Mostrar tarjeta tipo post-it con audio listo y temporizador
```

#### Secuencia 2: Detonación de Geocerca y Acción Rápida "Completar"
```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant OS as Android GeofencingClient
    participant Recv as GeofenceReceiver
    participant Svc as GeofenceAlertService
    participant Notif as NotificationManager
    participant Repo as NoteSqliteRepository

    OS->>Recv: Transición detectada (Salida de radio 'Casa')
    Recv->>Svc: ProcesarTransicion(triggerId)
    Svc->>Repo: ObtenerNotaPorTrigger(triggerId)
    Repo-->>Svc: Note("Cerrar la llave de paso")
    Svc->>Notif: DesplegarNotificacionPush(Prioridad Alta, Botón 'Completar')
    Notif-->>U: Alarma sonora/vibración en pantalla de bloqueo
    U->>Notif: Pulsar botón rápido "Completar"
    Notif->>Repo: ActualizarEstadoNota(noteId, COMPLETED)
    Repo-->>Notif: Estado actualizado
    Notif-->>U: Notificación cancelada y nota tachada
```

---

## 4. Patrones de Diseño de Software (GoF) Aplicados

| Patrón (GoF) | Ubicación | Justificación Técnica |
| :--- | :--- | :--- |
| **Repository Pattern** | `domain/repositories/i_note_repository.dart` | Aísla completamente las operaciones CRUD de base de datos SQLite de la lógica de presentación y casos de uso. |
| **Strategy Pattern** | `domain/triggers/reminder_strategy.dart` | Permite procesar de manera uniforme alarmas temporales (`TimeStrategy`) y geográficas (`GeofenceStrategy`) bajo una misma interfaz de disparo. |
| **Observer Pattern** | `presentation/blocs/` (BLoC Streams) | Notifica de forma reactiva a la UI los cambios de estado (inicio de dictado, finalización de audio, actualización del semáforo diario). |
| **Factory / Builder Pattern** | `domain/factories/note_factory.dart` | Construye objetos complejos `Note` ensamblando el texto parseado, el audio adjunto y las condiciones de alarma a partir del dictado. |

---

## 5. Control de Puerta de Calidad (Quality Gate)

* **Documento Técnico:** `docs/microapps/microapp2/03_architecture_and_design.md`
* **Rama GitFlow:** `feature/microapp2-03-design`
* **Issue Kanban:** `#32` (Asignado a `pcloayza3` en estado `In Progress`)
* **Estado:** Diseño arquitectónico y dinámico completo para validación y aprobación formal del usuario.
