# Documento de Arquitectura y Diseño de Software (C4 Model + ICONIX)

## 1. Introducción y Enfoque Metodológico
Este documento formaliza el diseño técnico y arquitectónico de `plataforma01`, integrando:
1. **C4 Model:** Representación estática y jerárquica de la arquitectura (Contexto, Contenedores y Componentes).
2. **ICONIX Process:** Conexión dinámica entre requisitos (IEEE 830) y código ejecutable mediante Modelado de Dominio, Análisis de Robustez y Diagramas de Secuencia.
3. **Patrones de Software:** Clean Architecture (Hexagonal), Gateway/Adapter, Strategy y Repository.

---

## 2. C4 Model - Arquitectura de Software

### 2.1 C4 - Nivel 1: Diagrama de Contexto del Sistema
Define los límites del sistema, los usuarios y los servicios externos con los que interactúa.

```mermaid
graph TD
    subgraph Actores
        E["🎓 Estudiante / Tesista / Practicante"]
        C["👨‍🏫 Consultor / Experto"]
        Emp["🏢 Empresa / Institución"]
        A["🛡️ Administrador / Compliance"]
    end

    Sys["💻 Plataforma01<br/>[Sistema Central de Intermediación]"]

    subgraph Servicios Externos
        DL["💳 dLocal for Platforms<br/>[Pay-ins locales, Escrow y Pay-outs]"]
        WB["📹 Whereby Embedded API<br/>[Salas de 60 min y Transcripción IA]"]
        MR["📋 Miro Live Embed API<br/>[Pizarrón Interactivo Colaborativo]"]
        R2["🗄️ Cloudflare R2<br/>[Storage S3 API: Documentos Office/PDF]"]
    end

    E -->|Reserva asesorías, sube TFG, paga en moneda local| Sys
    C -->|Define agenda, asesora por video, valida Kanban| Sys
    Emp -->|Publica retos, evalúa practicantes| Sys
    A -->|Modera disputas, supervisa escrow| Sys

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
        PWA["📱 PWA Frontend App<br/>[Next.js 14+ / React / Tailwind]<br/>Service Workers, Push Web, Miro Embed"]
    end

    subgraph Backend Microservicios
        GW["🚪 API Gateway & Reverse Proxy<br/>[JWT Verify, Rate Limiting, SSL]"]
        
        AUTH["🔑 Auth & User Service<br/>[RBAC 5 roles, Argon2id, JWT RS256]"]
        MATCH["📅 Scheduling & Matching Service<br/>[Husos Horarios, Integración Whereby]"]
        PAY["💰 Payment & Escrow Service<br/>[Comisiones 15%/10%, dLocal Adapter]"]
        PROJ["📊 Project & Kanban Service<br/>[Tablero Kanban, Validación Documentos]"]
        CHALL["🎯 Corporate Challenge Service<br/>[Retos de Innovación, Pre-hiring]"]
    end

    subgraph Persistencia y Almacenamiento
        DB_PG[("🐘 PostgreSQL Cluster<br/>[Usuarios, Transacciones Escrow, Agenda]")]
        DB_MG[("🍃 MongoDB Cluster<br/>[Kanban Cards, Actas IA, Bitácoras]")]
        R2_STORE[("☁️ Cloudflare R2 Bucket<br/>[PDF, DOCX, XLSX máx 25MB]")]
    end

    PWA -->|HTTPS / REST / WSS| GW
    GW --> AUTH
    GW --> MATCH
    GW --> PAY
    GW --> PROJ
    GW --> CHALL

    AUTH --> DB_PG
    PAY --> DB_PG
    MATCH --> DB_PG
    
    PROJ --> DB_MG
    CHALL --> DB_MG
    
    PROJ -.->|Presigned URLs| R2_STORE
    PAY -.->|REST API| DL_EXT["💳 dLocal API"]
    MATCH -.->|REST API / Webhooks| WB_EXT["📹 Whereby API"]
```

---

### 2.3 C4 - Nivel 3: Diagrama de Componentes (`payment-escrow-service`)
Estructurado estrictamente bajo **Clean Architecture / Arquitectura Hexagonal**.

```mermaid
graph TB
    subgraph Payment & Escrow Service
        subgraph Primary Adapters [Adaptadores de Entrada]
            Ctrl["PaymentController<br/>[REST Endpoints]"]
            Hook["DLocalWebhookHandler<br/>[Notificaciones asíncronas]"]
        end

        subgraph Application Core [Capa de Aplicación - Casos de Uso]
            UC_Pay["CreateEscrowPaymentUseCase"]
            UC_Rel["ReleaseEscrowFundsUseCase"]
            UC_Disp["OpenDisputeUseCase"]
        end

        subgraph Domain Core [Capa de Dominio]
            Entity_Escrow["EscrowTransaction (Aggregate)"]
            Strat_Comm["DynamicCommissionCalculator<br/>[Strategy Pattern: 15% < 300 BOB, 10% >= 300 BOB]"]
            Rules["DisputeRuleEngine"]
        end

        subgraph Secondary Adapters [Adaptadores de Salida - Infraestructura]
            Adapter_DL["DLocalPlatformAdapter<br/>[Implementa PaymentGatewayPort]"]
            Adapter_Repo["PostgresEscrowRepository<br/>[Implementa EscrowRepositoryPort]"]
            Adapter_Outbox["TransactionalOutboxPublisher<br/>[Eventos de Dominio]"]
        end
    end

    Ctrl --> UC_Pay
    Ctrl --> UC_Rel
    Hook --> UC_Rel

    UC_Pay --> Entity_Escrow
    UC_Pay --> Strat_Comm
    UC_Pay --> Adapter_DL
    UC_Pay --> Adapter_Repo

    UC_Rel --> Entity_Escrow
    UC_Rel --> Adapter_DL
    UC_Rel --> Adapter_Repo
    UC_Rel --> Adapter_Outbox
```

---

## 3. ICONIX Process - Dinámica del Software

### 3.1 Modelo de Dominio (Domain Model)
Entidades centrales, agregados y sus relaciones directas:

```mermaid
classDiagram
    class Usuario {
        +UUID id
        +String email
        +RolUsuario rol
        +Boolean termsAccepted
    }

    class PerfilAcademico {
        +String universidadInstituto
        +String carrera
        +NivelAcademico nivel
    }

    class ProyectoAsesoria {
        +UUID id
        +UUID estudianteId
        +UUID consultorId
        +Modalidad modalidad
        +EstadoProyecto estado
    }

    class TableroKanban {
        +UUID id
        +UUID proyectoId
        +List~ColumnaKanban~ columnas
    }

    class TarjetaKanban {
        +UUID id
        +String titulo
        +EstadoTarea estado
        +List~UUID~ entregablesIds
    }

    class SesionVideollamada {
        +UUID id
        +DateTime fechaHoraUTC
        +Int duracionMinutos
        +String wherebyRoomUrl
        +String miroBoardUrl
        +String transcripcionResumenIA
    }

    class TransaccionEscrow {
        +UUID id
        +Decimal montoTotalBOB
        +Decimal porcentajeComision
        +Decimal montoComisionBOB
        +Decimal montoNetoConsultorBOB
        +EstadoEscrow estado
    }

    Usuario "1" -- "1" PerfilAcademico
    Usuario "1" -- "many" ProyectoAsesoria
    ProyectoAsesoria "1" *-- "1" TableroKanban
    TableroKanban "1" *-- "many" TarjetaKanban
    ProyectoAsesoria "1" *-- "many" SesionVideollamada
    ProyectoAsesoria "1" *-- "1" TransaccionEscrow
```

---

### 3.2 Diagrama de Robustez: Reserva de Videollamada (Whereby + Miro)
Conecta la UI de agenda con la creación de la sala interactiva de 60 minutos.

```mermaid
graph LR
    Actor["👤 Estudiante / Consultor"]
    B1["[Boundary]<br/>Vista de Agenda PWA"]
    C1["[Control]<br/>Validar Disponibilidad y Cruce UTC"]
    C2["[Control]<br/>WherebyRoomManager (Crea sala 60m)"]
    C3["[Control]<br/>MiroBoardProvisioner (Crea canvas)"]
    E1[("[Entity]<br/>SesionVideollamada")]
    E2[("[Entity]<br/>AgendaConsultor")]

    Actor --> B1
    B1 --> C1
    C1 --> E2
    C1 --> C2
    C2 --> C3
    C3 --> E1
```

---

### 3.3 Diagrama de Robustez: Procesamiento de Escrow y Comisiones Dinámicas

```mermaid
graph LR
    Actor["👤 Estudiante"]
    B1["[Boundary]<br/>Checkout dLocal PWA"]
    C1["[Control]<br/>Calculador de Comisión Dinámica"]
    C2["[Control]<br/>dLocal Pay-In Processor"]
    E1[("[Entity]<br/>TransaccionEscrow [EN_CUSTODIA]")]
    E2[("[Entity]<br/>CuentaPlataforma")]

    Actor --> B1
    B1 --> C1
    C1 -->|monto < 300 BOB: 15% / >= 300 BOB: 10%| C2
    C2 --> E1
    C2 --> E2
```

---

### 3.4 Diagrama de Secuencia: Aprobación de Hito en Kanban y Dispersión (*Pay-out*)

```mermaid
sequenceDiagram
    autonumber
    actor E as 🎓 Estudiante
    participant PWA as 📱 PWA Frontend
    participant GW as 🚪 API Gateway
    participant PKS as 📊 Project Kanban Service
    participant PES as 💰 Payment Escrow Service
    participant DL as 💳 dLocal API
    actor C as 👨‍🏫 Consultor

    E->>PWA: Clic en "Aprobar Hito" en tarjeta Kanban
    PWA->>GW: PATCH /api/v1/projects/{id}/tasks/{taskId}/approve
    GW->>PKS: Validar estado de la tarjeta y archivos PDF/Office
    PKS->>PKS: Marcar Tarjeta como "Completada"
    PKS->>PES: Evento: HitoAprobadoEvent (proyectoId, montoNeto, consultorId)
    PES->>PES: Cargar TransaccionEscrow (Verificar estado EN_CUSTODIA)
    PES->>DL: POST /v1/payouts (montoNeto, cuentaDestinoConsultor)
    DL-->>PES: HTTP 200 OK (payout_id, status: PROCESSED)
    PES->>PES: Actualizar estado a LIQUIDADO_AL_CONSULTOR
    PES-->>PKS: Confirmación de liquidación
    PKS-->>GW: HTTP 200 OK (Hito Aprobado y Fondos Liberados)
    GW-->>PWA: Renderizar éxito en Kanban
    PES-)C: Notificación Push / Email: "Honorarios acreditados en su cuenta"
```

---

## 4. Patrones de Arquitectura y Diseño Seleccionados

| Patrón | Capa / Módulo | Justificación Técnica |
| :--- | :--- | :--- |
| **Clean Architecture (Hexagonal)** | Todos los Microservicios | Aísla la lógica de negocio central de los frameworks, bases de datos y APIs externas. Facilita pruebas TDD puras. |
| **Strategy Pattern** | `payment-escrow-service` | Encapsula el algoritmo de comisión dinámica (`15% < 300 BOB` y `10% ≥ 300 BOB`), permitiendo incorporar nuevas reglas tarifarias sin modificar el Aggregate de Escrow. |
| **Gateway / Adapter Pattern** | Integraciones (`dLocal`, `Whereby`, `Miro`, `Cloudflare R2`) | Oculta los detalles del SDK externo tras una interfaz/puerto propio del dominio, posibilitando sustituir proveedores sin impacto en el núcleo. |
| **Repository Pattern** | Capa de Infraestructura | Desacopla la persistencia física (SQL / NoSQL) de los agregados del dominio, facilitando el uso de mocks en TDD. |
| **Transactional Outbox** | Consistencia entre microservicios | Garantiza que la aprobación en el Kanban y la dispersión del Escrow sean atómicas y tolerantes a caídas de red asíncronas. |
| **Presigned URL Pattern** | `project-kanban-service` y Cloudflare R2 | Descarga al servidor de backend del tráfico de archivos binarios; el navegador interactúa directamente con el bucket S3 bajo credenciales efímeras seguras. |
