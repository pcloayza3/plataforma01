# Documento de Arquitectura de Software - C4 Model

## 1. Patrón Arquitectónico Seleccionado
* **Patrón:** [e.g., Clean Architecture / Hexagonal / Microservicios]
* **Justificación Técnica:** [Razón de la elección frente a los requisitos del sistema]

---

## 2. C4 - Nivel 1: Diagrama de Contexto del Sistema
Representa los límites del sistema, quién lo usa y con qué otros sistemas interactúa.

```mermaid
graph TD
    User["👤 Usuario Final"]
    System["💻 Plataforma01 [Sistema Central]"]
    ExtAPI["🌐 Servicio Externo"]

    User -->|Usa| System
    System -->|Consulta / Consume| ExtAPI
```

---

## 3. C4 - Nivel 2: Diagrama de Contenedores
Desglose en aplicaciones ejecutables, bases de datos y servicios.

```mermaid
graph TB
    subgraph Plataforma01
        SPA["🌐 Frontend App [Web SPA]"]
        API["⚙️ Backend API [REST/GraphQL]"]
        DB[("🗄️ Base de Datos")]
    end
    User["👤 Usuario"] --> SPA
    SPA -->|HTTPS / JSON| API
    API -->|TCP / SQL| DB
```

---

## 4. C4 - Nivel 3: Diagrama de Componentes (Backend API)
Desglose modular interno del contenedor principal siguiendo Clean Architecture.

```mermaid
graph TB
    subgraph Backend API
        Controller["Controlador / Endpoint"]
        Service["Servicio de Aplicación / Caso de Uso"]
        Domain["Entidad / Regla de Dominio"]
        Repo["Repositorio / Adaptador de Persistencia"]
    end
    Controller --> Service
    Service --> Domain
    Service --> Repo
```

---

## 5. Patrones de Diseño Aplicados
| Patrón (GoF / Clean) | Ubicación | Justificación |
| :--- | :--- | :--- |
| **Repository** | Capa de Infraestructura / Persistencia | Desacoplar la lógica de dominio del motor de base de datos. |
| **Factory / DI** | Contenedor de Inyección | Instanciación desacoplada y facilitación de pruebas unitarias. |
| **Strategy** | Lógica de cálculo o validación | Intercambiar algoritmos en tiempo de ejecución de forma limpia. |
