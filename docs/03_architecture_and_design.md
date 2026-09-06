# Documento de Arquitectura y Diseño de Software (C4 Model + ICONIX)

## 1. Introducción y Enfoque Metodológico
Este documento formaliza el diseño técnico y arquitectónico de `plataforma01`, integrando:
1. **C4 Model:** Representación estática y jerárquica de la arquitectura (Contexto, Contenedores y Componentes).
2. **ICONIX Process:** Conexión dinámica entre requisitos (IEEE 830) y código ejecutable mediante Modelado de Dominio, Análisis de Robustez y Diagramas de Secuencia.
3. **Patrones de Software:** Clean Architecture (Hexagonal), Gateway/Adapter, Strategy, Repository y Sanitizer/Filter.

---

## 2. C4 Model - Arquitectura de Software

### 2.1 C4 - Nivel 1: Diagrama de Contexto del Sistema
Define los límites del sistema, los usuarios y los servicios externos con los que interactúa.

```mermaid
graph TD
    subgraph Actores
        E["🎓 Estudiante / Tesista / Practicante"]
        C["👨‍🏫 Consultor / Experto"]
        Emp["🏢 Empresa / Corporación"]
        Inst["🏛️ Institución Académica (Universidad/Instituto)"]
        A["🛡️ Administrador / Compliance"]
    end

    Sys["💻 Plataforma01<br/>[Sistema Central de Intermediación]<br/>• Perfiles sin Enlaces Externos<br/>• Ratings Multilaterales (1 a 5 Estrellas)<br/>• Semáforo de Avance / Retraso"]

    subgraph Servicios Externos
        DL["💳 dLocal for Platforms<br/>[Pay-ins locales, Escrow y Pay-outs]"]
        WB["📹 Whereby Embedded API<br/>[Salas de 60 min y Transcripción IA]"]
        MR["📋 Miro Live Embed API<br/>[Pizarrón Interactivo Colaborativo]"]
        R2["🗄️ Cloudflare R2<br/>[Storage S3 API: Documentos Office/PDF, Fotos y Logos]"]
    end

    E -->|Reserva asesorías, sube avances, califica con estrellas| Sys
    C -->|Publica CV sin links, asesora por video, califica| Sys
    Emp -->|Publica retos con logo corporativo, evalúa| Sys
    Inst -->|Monitorea egresados/practicantes con logo oficial| Sys
    A -->|Modera disputas, audita desintermediación| Sys

    Sys -->|Crea transferencias de custodia y liquidaciones| DL
    Sys -->|Genera salas efímeras de 60 min y recibe transcripciones| WB
    Sys -->|Provee canvas interactivo en sesión| MR
    Sys -->|Genera Presigned URLs para carga/descarga segura| R2
```

---

### 2.2 C4 - Nivel 2: Diagrama de Contenedores
Descompone el sistema en aplicaciones ejecutables, microservicios y almacenes de datos.

```mermaid
graph TB
    subgraph Frontend
        PWA["📱 PWA Frontend App<br/>[Next.js 14+ / React / Tailwind]<br/>Service Workers, Push Web, Miro Embed, Vistas de Perfil, Kanban y Rating"]
    end

    subgraph Backend Microservicios
        GW["🚪 API Gateway & Reverse Proxy<br/>[JWT Verify, Rate Limiting, Sanitizer Filter]"]
        
        AUTH["🔑 Auth & User Profile Service<br/>[RBAC 6 roles, CV estructurado, Fotos/Logos, Anti-Link Filter]"]
        MATCH["📅 Scheduling & Matching Service<br/>[Husos Horarios, Integración Whereby, Ratings Ponderados]"]
        PAY["💰 Payment & Escrow Service<br/>[Comisiones 15%/10%, dLocal Adapter]"]
        PROJ["📊 Project & Kanban Service<br/>[Tablero Kanban, Avance %, Semáforo Retraso/Conformidad]"]
        CHALL["🎯 Corporate Challenge Service<br/>[Retos de Innovación, Pasantías, Pre-hiring]"]
        REP["⭐ Reputation & Rating Service<br/>[Calificación Multilateral de 1 a 5 Estrellas]"]
    end

    subgraph Persistencia y Almacenamiento
        DB_PG[("🐘 PostgreSQL Cluster<br/>[Usuarios, Perfiles, Escrow, Ratings, Reservas]")]
        DB_MG[("🍃 MongoDB Cluster<br/>[Kanban Cards, Actas IA, Bitácoras de Avance]")]
        R2_STORE[("☁️ Cloudflare R2 Bucket<br/>[Office, PDF, Avatares y Logos]")]
    end

    PWA -->|HTTPS / REST / WSS| GW
    GW --> AUTH
    GW --> MATCH
    GW --> PAY
    GW --> PROJ
    GW --> CHALL
    GW --> REP

    AUTH --> DB_PG
    PAY --> DB_PG
    MATCH --> DB_PG
    REP --> DB_PG
    
    PROJ --> DB_MG
    CHALL --> DB_MG
    
    AUTH -.->|Presigned URLs - Avatares y Logos| R2_STORE
    PROJ -.->|Presigned URLs - Documentos| R2_STORE
    PAY -.->|REST API| DL_EXT["💳 dLocal API"]
    MATCH -.->|REST API / Webhooks| WB_EXT["📹 Whereby API"]
```

---

### 2.3 C4 - Nivel 3: Componentes de Perfil y Sanitización (`auth-user-profile-service`)
Garantiza el cumplimiento estricto de la política de cero enlaces externos.

```mermaid
graph TB
    subgraph Auth & Profile Service
        Ctrl["ProfileController<br/>[Endpoints REST: GET/PUT Perfil]"]
        
        subgraph Use Cases
            UC_UpdateCV["UpdateConsultantCVUseCase"]
            UC_UpdateStudent["UpdateStudentProfileUseCase"]
            UC_UpdateOrg["UpdateOrganizationProfileUseCase"]
        end

        subgraph Domain Services & Filters
            Filter_AntiLink["AntiLinkSanitizerService<br/>[Regex + NLP: Bloqueo de URLs, emails y teléfonos]"]
            Entity_CV["ConsultantCurriculum (Entity)"]
            Entity_Student["StudentPresentation (Entity)"]
            Entity_Org["OrganizationProfile (Entity)"]
        end

        subgraph Infrastructure Adapters
            Repo_User["PostgresProfileRepository"]
            Storage_Avatar["R2AvatarStorageAdapter"]
        end
    end

    Ctrl --> UC_UpdateCV
    Ctrl --> UC_UpdateStudent
    Ctrl --> UC_UpdateOrg

    UC_UpdateCV --> Filter_AntiLink
    UC_UpdateCV --> Entity_CV
    UC_UpdateCV --> Repo_User
    UC_UpdateCV --> Storage_Avatar

    UC_UpdateStudent --> Filter_AntiLink
    UC_UpdateStudent --> Entity_Student
    UC_UpdateStudent --> Repo_User

    UC_UpdateOrg --> Filter_AntiLink
    UC_UpdateOrg --> Entity_Org
    UC_UpdateOrg --> Repo_User
```

---

## 3. ICONIX Process - Dinámica del Software

### 3.1 Modelo de Dominio (Domain Model Expandido)
Entidades centrales, perfiles, métricas de avance y calificaciones:

```mermaid
classDiagram
    class Usuario {
        +UUID id
        +String email
        +RolUsuario rol
        +Boolean termsAccepted
        +String fotoUrl
    }

    class CurriculumConsultor {
        +UUID id
        +String biografiaSinLinks
        +List~String~ titulosAcademicos
        +List~String~ areasEspecialidad
        +Decimal ratingPromedio
        +Int totalSesionesAtendidas
    }

    class PerfilEstudiante {
        +UUID id
        +String presentacionSinLinks
        +String carrera
        +String universidadInstituto
        +Decimal porcentajeAvanceGlobal
        +Decimal ratingPromedio
    }

    class PerfilOrganizacion {
        +UUID id
        +TipoOrganizacion tipo
        +String nombreOficial
        +String logoUrl
        +String descripcionSinLinks
        +Decimal ratingPromedio
    }

    class CalificacionEstrellas {
        +UUID id
        +UUID emisorId
        +UUID receptorId
        +UUID sesionOHitoId
        +Int estrellas
        +String comentarioInterno
        +DateTime createdAt
    }

    class ProyectoAsesoria {
        +UUID id
        +String titulo
        +Modalidad modalidad
        +UUID estudianteId
        +UUID consultorId
        +UUID organizacionId
        +Decimal porcentajeAvanceGlobal
        +EstadoProyecto estado
    }

    class TableroKanban {
        +UUID id
        +UUID proyectoId
        +List~String~ columnas
    }

    class TarjetaKanban {
        +UUID id
        +UUID tableroId
        +String titulo
        +UUID responsableId
        +EstadoTarea estado
        +Decimal pesoPorcentual
        +SemaforoAvance semaforoEstudiante
        +ConformidadGuia feedbackConsultor
        +DateTime fechaLimite
    }

    Usuario "1" -- "0..1" CurriculumConsultor
    Usuario "1" -- "0..1" PerfilEstudiante
    Usuario "1" -- "0..1" PerfilOrganizacion
    Usuario "1" -- "many" CalificacionEstrellas : emite
    
    PerfilEstudiante "1" -- "many" ProyectoAsesoria : solicita
    CurriculumConsultor "1" -- "many" ProyectoAsesoria : asesora
    PerfilOrganizacion "0..1" -- "many" ProyectoAsesoria : auspicia
    
    ProyectoAsesoria "1" *-- "1" TableroKanban : gestiona
    TableroKanban "1" *-- "many" TarjetaKanban : organiza
```

---

### 3.2 Diagrama de Robustez: Calificación Post-Sesión (1 a 5 Estrellas)

```mermaid
graph LR
    Actor1["👤 Estudiante"]
    Actor2["👨‍🏫 Consultor"]
    B1["[Boundary]<br/>Modal de Calificación PWA"]
    C1["[Control]<br/>Validador de Rango (1..5 Estrellas)"]
    C2["[Control]<br/>Calculador de Reputación Ponderada"]
    E1[("[Entity]<br/>CalificacionEstrellas")]
    E2[("[Entity]<br/>CurriculumConsultor / PerfilEstudiante")]

    Actor1 --> B1
    Actor2 --> B1
    B1 --> C1
    C1 --> E1
    C1 --> C2
    C2 --> E2
```

---

### 3.3 Diagrama de Robustez: Cálculo de Avance Porcentual y Semáforo de Conformidad

```mermaid
graph LR
    ActorE["👤 Estudiante"]
    ActorC["👨‍🏫 Consultor"]
    B1["[Boundary]<br/>Vista Tablero Kanban PWA"]
    C1["[Control]<br/>ProgressCalculator (Suma pesos de tareas completadas)"]
    C2["[Control]<br/>SLA & Deadline Monitor (Compara fechaLimite vs hoy)"]
    C3["[Control]<br/>ConsultantFeedbackTracker (Evalúa tiempos de respuesta)"]
    E1[("[Entity]<br/>TarjetaKanban")]
    E2[("[Entity]<br/>ProyectoAsesoria [Avance % Global]")]

    ActorE --> B1
    ActorC --> B1
    B1 --> C1
    B1 --> C2
    B1 --> C3
    C1 --> E1
    C1 --> E2
    C2 -->|Retrasado si fechaLimite < hoy y no completada| E1
    C3 -->|A tiempo / Demorado en feedback| E1
```

---

### 3.4 Diagrama de Secuencia: Finalización de Videollamada, Calificación Multilateral y Actualización de Avance

```mermaid
sequenceDiagram
    autonumber
    actor E as 🎓 Estudiante
    actor C as 👨‍🏫 Consultor
    participant PWA as 📱 PWA Frontend
    participant GW as 🚪 API Gateway
    participant MATCH as 📅 Scheduling Service
    participant REP as ⭐ Reputation Service
    participant PROJ as 📊 Kanban & Progress Service

    Note over E,C: Finalizan los 60 minutos de la sesión Whereby
    PWA->>GW: POST /api/v1/sessions/{id}/end
    GW->>MATCH: Cerrar sala Whereby y adjuntar transcripción IA
    MATCH-->>PWA: Solicitar Calificación Obligatoria
    
    E->>PWA: Califica al Consultor (5 ⭐) + Confirma avance de hito
    C->>PWA: Califica al Estudiante (5 ⭐) + Registra estado del hito
    
    par Enviar calificación
        PWA->>GW: POST /api/v1/ratings (emisor: E, receptor: C, estrellas: 5)
        GW->>REP: Registrar CalificacionEstrellas y recalcular promedio del Consultor
    and Actualizar avance en Kanban
        PWA->>GW: PATCH /api/v1/projects/{id}/progress
        GW->>PROJ: Recalcular % de avance acumulado y actualizar semáforo de conformidad
        PROJ-->>PWA: Nuevo avance: 45% [Estado: A_TIEMPO / TRABAJANDO]
    end
    
    PWA-->>E: Tablero Kanban actualizado con nueva barra de progreso
    PWA-->>C: Notificación de feedback y reputación incrementada
```

---

### 3.5 Diagrama de Secuencia End-to-End: Ciclo de Vida Completo de la Asesoría
Ilustra el flujo integral desde la búsqueda inicial hasta el pago en cada hito completado:

```mermaid
sequenceDiagram
    autonumber
    actor E as 🎓 Estudiante
    actor C as 👨‍🏫 Consultor
    participant PWA as 📱 PWA Frontend
    participant GW as 🚪 API Gateway
    participant AUTH as 🔑 User & Profile Service
    participant MATCH as 📅 Matching & Scheduling
    participant PAY as 💰 Payment & Escrow Service
    participant PROJ as 📊 Kanban & Document Service
    participant DL as 💳 dLocal API
    participant WB as 📹 Whereby API
    participant R2 as 🗄️ Cloudflare R2

    %% 1. Búsqueda y Enlace
    rect rgb(240, 248, 255)
    Note over E,AUTH: 1. Búsqueda y Enlace
    E->>PWA: Buscar consultores (Área, Carrera, Calificación)
    PWA->>GW: GET /api/v1/consultants?area=Ingenieria&minRating=4.5
    GW->>AUTH: Consultar CVs estructurados (Sin enlaces externos)
    AUTH-->>PWA: Lista de perfiles con fotos y estrellas
    E->>PWA: Selecciona consultor y solicita asesoría para TFG
    PWA->>GW: POST /api/v1/projects/request (estudianteId, consultorId, modalidad)
    GW->>PROJ: Crear ProyectoAsesoria + TableroKanban inicial
    PROJ-->>C: Notificar propuesta de asesoría e hitos
    C->>PWA: Acepta asesoría y confirma hitos acordados
    end

    %% 2. Pago en Custodia (Escrow Pay-In por Hito)
    rect rgb(255, 250, 240)
    Note over E,DL: 2. Pago en Custodia del Hito 1
    E->>PWA: Pagar Hito 1 (ej. 500 BOB) en moneda local
    PWA->>GW: POST /api/v1/payments/escrow/init
    GW->>PAY: Procesar cobro con dLocal for Platforms
    PAY->>PAY: Aplicar comisión dinámica (10% si >= 300 BOB, 15% si < 300 BOB)
    PAY->>DL: POST /v1/payments (monto: 500 BOB, método local)
    DL-->>E: Redirección / Confirmación de cobro exitoso
    DL-)PAY: Webhook: PAYMENT_CONFIRMED
    PAY->>PAY: Registrar TransaccionEscrow en estado EN_CUSTODIA
    PAY-)PROJ: Evento: HitoPagadoEvent (Habilitar agenda y tareas)
    end

    %% 3. Videollamada y Pizarra Interactiva
    rect rgb(245, 255, 250)
    Note over E,WB: 3. Sesión de Videollamada (60 min)
    E->>PWA: Reservar fecha/hora de sesión según disponibilidad
    PWA->>GW: POST /api/v1/sessions/book
    GW->>MATCH: Agendar y normalizar husos horarios a UTC
    MATCH->>WB: POST /v1/meetings (roomDuration: 60m, aiTranscription: true)
    WB-->>MATCH: Return roomUrl efímera + embed Miro canvas
    MATCH-->>PWA: Sala lista para Estudiante y Consultor
    Note over E,C: Realizan videollamada de 60 min en Whereby con pizarra Miro
    WB-)MATCH: Webhook: Sesión concluida + Resumen transcripción IA
    MATCH->>PROJ: Adjuntar acta IA de sesión a la tarjeta del hito
    E->>PWA: Calificar al Consultor (1..5 ⭐)
    C->>PWA: Calificar al Estudiante (1..5 ⭐)
    end

    %% 4. Trabajo, Seguimiento y Entrega en Kanban
    rect rgb(255, 245, 245)
    Note over E,R2: 4. Seguimiento de Tarea y Entrega Documental
    PROJ->>PWA: Mostrar Kanban con Semáforo de Avance (A tiempo / Trabajando)
    E->>PWA: Solicitar subida de documento (Tesis borrador .docx / .pdf)
    PWA->>GW: POST /api/v1/documents/presigned-url
    GW->>PROJ: Validar tipo MIME ofimático y cuota máx 25 MB
    PROJ->>R2: Generar Presigned PUT URL
    R2-->>PWA: Presigned URL temporal (15 min)
    PWA->>R2: PUT binario directo del archivo
    E->>PWA: Mover tarjeta Kanban a "En Revisión"
    C->>PWA: Revisa documento, registra feedback y marca "Conforme"
    end

    %% 5. Aprobación y Dispersión (Pay-Out por Hito)
    rect rgb(240, 255, 240)
    Note over E,C: 5. Aprobación del Hito y Pago al Consultor
    E->>PWA: Clic en "Aprobar Hito 1"
    PWA->>GW: POST /api/v1/projects/{id}/milestones/1/approve
    GW->>PROJ: Marcar Tarjeta Kanban como "Completada"
    PROJ->>PROJ: Recalcular Porcentaje de Avance Global (ej. 25% completado)
    PROJ->>PAY: Evento: LiberarFondosHitoEvent (montoNeto: 450 BOB)
    PAY->>DL: POST /v1/payouts (montoNeto: 450 BOB, cuentaConsultor)
    DL-->>C: Acreditación bancaria en moneda local
    PAY->>PAY: Actualizar TransaccionEscrow a LIQUIDADO_AL_CONSULTOR
    PWA-->>E: Hito 1 finalizado con éxito. Habilitar Hito 2.
    end
```

---

## 4. Patrones de Arquitectura y Diseño Aplicados

| Patrón | Capa / Módulo | Justificación Técnica |
| :--- | :--- | :--- |
| **Sanitizer / Interceptor Filter** | `auth-user-profile-service` | Detecta e intercepta enlaces externos, teléfonos y correos en perfiles de consultores, estudiantes y empresas para prevenir la desintermediación. |
| **Strategy Pattern** | `payment-escrow-service` y `reputation-rating-service` | Encapsula el cálculo de comisiones dinámicas y la ponderación matemática del rating de estrellas (Bayesian Average). |
| **Clean Architecture (Hexagonal)** | Todos los Microservicios | Desacopla reglas de negocio centrales de bases de datos y APIs externas. |
| **Gateway / Adapter Pattern** | Integraciones (`dLocal`, `Whereby`, `Miro`, `Cloudflare R2`) | Oculta los detalles del SDK externo tras una interfaz del dominio. |
| **Observer / Event-Driven** | `scheduling-service` y `reputation-service` | Al concluir la sesión Whereby, dispara automáticamente los eventos de solicitud de rating y recalculo de progreso en el Kanban. |
