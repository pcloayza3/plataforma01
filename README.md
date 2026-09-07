# ThesisBridge - Sistema Integral de Intermediación Académica y Profesional

Repositorio oficial del sistema de producción **ThesisBridge**, diseñado para la intermediación de proyectos de grado, tesis de pre/posgrado y consultorías académicas en Sudamérica, con custodia de pagos, salas efímeras Whereby de 60 minutos con pizarras Miro, tablero Kanban con semáforo temporal y repositorio documental seguro.

---

## 🚀 Despliegue y Ejecución Local (Docker)

El sistema se encuentra 100% contenerizado y listo para producción local:

```bash
# Iniciar todos los servicios (Frontend, Backend, PostgreSQL 15, MongoDB 7)
docker compose up -d

# Ejecutar suite completa de pruebas TDD / E2E (37/37 tests)
./scripts/test_backend.sh
```

### URLs de Acceso Local:
* **Frontend Web ThesisBridge:** [http://localhost:3001](http://localhost:3001)
* **Backend REST API:** [http://localhost:4000/health](http://localhost:4000/health)
* **Base de Datos Relacional (PostgreSQL):** `localhost:5432` (`plataforma01_db`)
* **Base de Datos Documental (MongoDB):** `localhost:27017` (`plataforma01_logs`)

---

## 🧭 Metodologías por Etapa (Gobernanza SDLC)

| Etapa SDLC | Metodología Principal | Entregable Formal | Puerta de Calidad (Gatekeeping) |
| :--- | :--- | :--- | :--- |
| **1. Envisioning & Planning** | *Design Thinking* | `docs/01_envisioning_and_planning.md` | Aprobado por el usuario |
| **2. Análisis de Requisitos** | *IEEE 830 (SRS)* | `docs/02_requirements_ieee830.md` | Aprobado por el usuario |
| **3. Arquitectura y Diseño** | *C4 Model + ICONIX* | `docs/03_architecture_and_design.md` | Aprobado por el usuario |
| **4. Desarrollo e Implementación**| *Extreme Programming (XP / TDD)* | 37 Pruebas Unitarias e Integración | Aprobado por el usuario |
| **5. Pruebas y QA** | Testing sistemático / E2E Master | Cobertura 100% en Docker | Aprobado por el usuario |
| **6. Despliegue y Mantenimiento**| *GitFlow* | Release Oficial `v1.0.0` en `main` | Aprobado por el usuario |

---

## 🛡️ Reglas de Operación de los Agentes

1. **Gatekeeping Estricto:** Ningún agente avanza a la siguiente fase sin validación y aprobación humana expresa.
2. **Cero Alucinación:** Queda prohibido inventar supuestos o librerías no confirmadas.
3. **Trazabilidad Kanban en GitHub:** Todos los issues sincronizados en el repositorio `pcloayza3/plataforma01`.
4. **GitFlow:** Trabajo formal en ramas `feature/*`, `develop`, `release/*` y `main`.
