# Arquitectura y Diseño Técnico (C4 Model + ICONIX Process)
## MicroApp 1: ClinikLocal (Gestión Clínica y Dental Local-First)

---

## 1. C4 Model (Visualización Arquitectónica)

### 1.1. Nivel 1: Diagrama de Contexto del Sistema

```mermaid
flowchart TD
    MEDICO["Médico Especialista / Odontólogo\n[Persona]"]
    PACIENTE["Paciente\n[Persona]"]
    
    CLINIK_APP["ClinikLocal App\n[Sistema de Software Local-First]\nGestión de pacientes, consultas, agenda, recetas y WhatsApp local"]
    
    WHATSAPP["WhatsApp (Móvil / Web / Desktop)\n[Sistema Externo]\nCanal de mensajería del paciente"]
    
    CLOUD_BACKUP["Servicio de Respaldo Cloud (Add-on)\n[Sistema Externo Opcional]\nAlmacenamiento seguro cifrado de snapshots"]
    
    MEDICO -->|"Registra pacientes, historias, recetas y citas"| CLINIK_APP
    CLINIK_APP -->|"Abre mensaje formateado en 1 clic"| WHATSAPP
    WHATSAPP -->|"Envía recordatorio y receta"| PACIENTE
    CLINIK_APP -.->|"Copia de seguridad cifrada a demanda"| CLOUD_BACKUP
```

---

### 1.2. Nivel 2: Diagrama de Contenedores

```mermaid
flowchart TD
    subgraph Dispositivo_Profesional["Dispositivo del Profesional (Windows, macOS, Linux, Android, iOS)"]
        UI_CONTAINER["Aplicación Cliente Multiplataforma (Flutter / Dart)\nCapa de presentación minimalista responsiva"]
        CORE_CONTAINER["Motor de Lógica de Negocio y Dominio\nValidaciones, formateo de plantillas, orquestación"]
        SQLITE_DB[("Base de Datos Local (SQLite / Drift)\nPersistencia relacional con cifrado local")]
        PDF_ENGINE["Motor Generador de Documentos\nGenerador nativo de recetas en PDF"]
        WA_LAUNCHER["Lanzador de Protocolo WhatsApp\nDeep-linking a wa.me / URI esquemas"]
        
        UI_CONTAINER --> CORE_CONTAINER
        CORE_CONTAINER --> SQLITE_DB
        CORE_CONTAINER --> PDF_ENGINE
        CORE_CONTAINER --> WA_LAUNCHER
    end

    subgraph Nube_Addon["Infraestructura de Respaldo Centralizado (Opcional)"]
        BACKUP_API["API Gateway de Respaldo (Node.js / Go)\nAutenticación y cuotas de snapshot"]
        OBJ_STORAGE[("Almacenamiento Seguro (Cloudflare R2 / S3)\nBlobs cifrados AES-256")]
        
        CORE_CONTAINER -. "POST /backups (Payload Cifrado)" .-> BACKUP_API
        BACKUP_API --> OBJ_STORAGE
    end
```

---

### 1.3. Nivel 3: Diagrama de Componentes (Cliente Local)

```mermaid
flowchart TD
    subgraph UI_Layer["Capa de Presentación (Clean Architecture)"]
        V_PACIENTES["Pantalla Directorio Pacientes"]
        V_HISTORIAL["Pantalla Historia Médica / Odontograma"]
        V_AGENDA["Pantalla Agenda y Citas"]
        V_RECETAS["Pantalla Emisión Recetas"]
        V_BACKUP["Pantalla Respaldo y Ajustes"]
    end

    subgraph Domain_Layer["Capa de Dominio (Casos de Uso)"]
        UC_PACIENTES["GestionarPacientesUseCase"]
        UC_HISTORIAL["RegistrarConsultaUseCase"]
        UC_AGENDA["AgendarCitaUseCase"]
        UC_WHATSAPP["GenerarMensajeWhatsAppUseCase"]
        UC_RECETA["ExportarRecetaPdfUseCase"]
        UC_BACKUP["CifrarYRespaldarUseCase"]
    end

    subgraph Data_Layer["Capa de Datos y Persistencia"]
        REPO_LOCAL["LocalDatabaseRepository"]
        DAO_PACIENTE["PacienteDao"]
        DAO_CONSULTA["ConsultaDao"]
        DAO_CITA["CitaDao"]
        SYNC_SERVICE["CloudBackupService"]
    end

    V_PACIENTES --> UC_PACIENTES
    V_HISTORIAL --> UC_HISTORIAL
    V_AGENDA --> UC_AGENDA
    V_AGENDA --> UC_WHATSAPP
    V_RECETAS --> UC_RECETA
    V_RECETAS --> UC_WHATSAPP
    V_BACKUP --> UC_BACKUP

    UC_PACIENTES --> REPO_LOCAL
    UC_HISTORIAL --> REPO_LOCAL
    UC_AGENDA --> REPO_LOCAL
    REPO_LOCAL --> DAO_PACIENTE
    REPO_LOCAL --> DAO_CONSULTA
    REPO_LOCAL --> DAO_CITA
    UC_BACKUP --> SYNC_SERVICE
```

---

## 2. Metodología ICONIX

### 2.1. Modelo de Dominio de Datos

```mermaid
classDiagram
    class Paciente {
        +String id
        +String nombreCompleto
        +String telefonoWhatsapp
        +String documentoIdentidad
        +DateTime fechaNacimiento
        +List~String~ alergias
        +String notasGenerales
        +DateTime creadoEn
    }

    class ConsultaMedica {
        +String id
        +String pacienteId
        +DateTime fechaConsulta
        +String tipoEspecialidad
        +String motivoConsulta
        +String examenFisico
        +String diagnostico
        +String tratamientoRealizado
        +List~String~ piezasDentales
    }

    class RecetaMedica {
        +String id
        +String consultaId
        +String pacienteId
        +DateTime fechaEmision
        +List~ItemMedicamento~ medicamentos
        +String indicacionesGenerales
    }

    class ItemMedicamento {
        +String farmaco
        +String concentracion
        +String posologia
        +String duracion
    }

    class CitaAgenda {
        +String id
        +String pacienteId
        +DateTime fechaHoraInicio
        +DateTime fechaHoraFin
        +String motivo
        +String estado
        +String notaInterna
    }

    Paciente "1" --> "*" ConsultaMedica : posee
    ConsultaMedica "1" --> "0..1" RecetaMedica : genera
    RecetaMedica "1" --> "*" ItemMedicamento : contiene
    Paciente "1" --> "*" CitaAgenda : programa
```

---

### 2.2. Diagrama de Secuencia: Recordatorio de Cita por WhatsApp

```mermaid
sequenceDiagram
    autonumber
    actor Medico as Profesional de Salud
    participant UI as AgendaView (UI)
    participant UC as GenerarMensajeWhatsAppUseCase
    participant Repo as LocalDatabaseRepository
    participant Launcher as WhatsAppLauncher (Deep Link)
    actor Paciente as Paciente (WhatsApp)

    Medico ->> UI: Clic en botón "WhatsApp Recordatorio" de la cita
    UI ->> UC: ejecutar(citaId)
    UC ->> Repo: obtenerDetalleCita(citaId)
    Repo -->> UC: Cita con Paciente y Horario
    UC ->> UC: Formatear plantilla amigable y sanitizar teléfono
    UC ->> Launcher: abrirEnlace(telefono, mensajeTexto)
    Launcher ->> Launcher: invocar URL https://wa.me/{telefono}?text={encoded}
    Launcher -->> Medico: Abre WhatsApp nativo con mensaje pre-cargado
    Medico ->> Paciente: Presiona Enviar en WhatsApp
    Paciente -->> Medico: Responde confirmando asistencia
```

---

## 3. Patrones de Diseño Aplicados

1. **Clean Architecture (Onion):** Separación rigurosa de Presentación (Widgets reactivos), Dominio (Entidades y Casos de Uso puros) e Infraestructura (SQLite, Launcher, PDF).
2. **Repository Pattern:** Abstracción unificada del acceso a los datos locales para desacoplar el motor SQLite de la lógica de negocio.
3. **Template Method / Strategy Pattern:** Formateo dinámico de plantillas de WhatsApp según el tipo de comunicación (Confirmación de Cita, Recordatorio 24h, Envío de Receta, Indicación Post-Tratamiento).
4. **Zero-Knowledge Encryption Pattern:** Para el módulo de respaldo opcional, la clave secreta derivada de la contraseña del médico se usa para cifrar localmente el archivo antes de cualquier transmisión a la nube.
