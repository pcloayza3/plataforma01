# Documento de Análisis y Diseño Dinámico - Metodología ICONIX

## 1. Modelo de Dominio
Entidades fundamentales del negocio y sus relaciones estructurales.

```mermaid
classDiagram
    class EntidadPrincipal {
        +UUID id
        +String nombre
        +DateTime createdAt
        +validarEstado() Boolean
    }
    class ObjetoValor {
        +String codigo
        +Decimal monto
    }
    EntidadPrincipal "1" *-- "many" ObjetoValor : contiene
```

---

## 2. Análisis de Robustez (Robustness Analysis)
Conecta la especificación de caso de uso (IEEE 830) con el diseño de objetos clasificándolos en:
- **Boundary (Frontera):** UI o Endpoint.
- **Control (Controlador/Caso de Uso):** Orquestación de lógica.
- **Entity (Entidad):** Datos de negocio persistentes.

```mermaid
graph LR
    Actor["👤 Usuario"]
    B1["[Boundary]<br/>Formulario / API Endpoint"]
    C1["[Control]<br/>Validador de Entrada"]
    C2["[Control]<br/>Procesador de Regla de Negocio"]
    E1[("[Entity]<br/>Entidad en Base de Datos")]

    Actor --> B1
    B1 --> C1
    C1 --> C2
    C2 --> E1
```

---

## 3. Diagrama de Secuencia
Flujo temporal de interacción entre los componentes diseñados.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant B as Boundary (API Endpoint)
    participant C as Control (Servicio / Caso de Uso)
    participant E as Entity (Modelo Dominio)
    participant R as Repositorio (Persistencia)

    U->>B: Enviar solicitud con parámetros
    B->>C: Invocar ejecución de caso de uso
    C->>E: Instanciar y verificar invariantes
    alt Regla válida
        C->>R: Guardar entidad
        R-->>C: Confirmación de persistencia
        C-->>B: Respuesta exitosa DTO
        B-->>U: HTTP 200 / 201 OK
    else Regla inválida
        C-->>B: Excepción de dominio
        B-->>U: HTTP 400 / 422 Error
    end
```
