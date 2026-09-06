# Documento de Desarrollo e Implementación (Extreme Programming - XP / TDD)

## 1. Enfoque de Desarrollo: Extreme Programming (XP)
La implementación del núcleo de `plataforma01` se ha realizado siguiendo rigurosamente las prácticas de **Extreme Programming (XP)**:

1. **Test-Driven Development (TDD):**
   * **Rojo (Red):** Se diseñaron y codificaron primero las 24 pruebas unitarias cubriendo los casos de uso, entidades, reglas de negocio y casos de borde.
   * **Verde (Green):** Se implementó el código de producción mínimo indispensable para satisfacer el 100% de las pruebas.
   * **Refactorización (Refactor):** Se limpiaron las abstracciones bajo los principios SOLID y Arquitectura Hexagonal.
2. **Diseño Simple (Simple Design):**
   * Cumplimiento estricto de las 4 reglas de Kent Beck (pasa todas las pruebas, revela intención, sin duplicación, mínimo número de elementos).
3. **Estándares de Código Limpio (Clean Code):**
   * Separación por capas (Dominio, Casos de Uso, Servicios, Puertos e Infraestructura).
   * Tipado estricto, manejo inmutable de dinero con `Decimal` y prevención de efectos secundarios.

---

## 2. Estructura Modular Implementada

```
src/
└── core/
    ├── domain/
    │   ├── entities.py         # Usuario, CurriculumConsultor, PerfilEstudiante, ProyectoAsesoria, TarjetaKanban, TransaccionEscrow
    │   ├── value_objects.py    # Money, CommissionCalculationResult, Estados de Hito/Escrow/Tarea/Semaforo
    │   └── exceptions.py       # DisintermediationViolationException, EscrowNotFundedException, etc.
    ├── ports/
    │   └── payment_gateway_port.py # Puerto desacoplado para dLocal for Platforms
    ├── services/
    │   ├── commission_calculator.py # Strategy: 15% < 300 BOB, 10% >= 300 BOB
    │   └── anti_link_sanitizer.py   # Sanitizador y filtro de desintermediación
    └── use_cases/
        ├── escrow_use_cases.py  # InitEscrowPayment, ApproveMilestonePayout
        └── project_use_cases.py # CreateProject, UpdateKanbanTaskStatus
```

---

## 3. Resultados de la Suite de Pruebas Automatizadas (TDD)

```bash
python3 -m unittest discover -s tests -v
```

* **Total de Pruebas:** 24 pruebas unitarias y de integración de casos de uso.
* **Tasa de Éxito:** 100% (24 pasadas, 0 fallos, 0 errores).
* **Tiempo de Ejecución:** 0.001 s.

### Desglose de Pruebas:
1. `test_commission_calculator.py` (5 pruebas):
   * Micropago < 300 BOB aplica 15%.
   * Pago estándar ≥ 300 BOB aplica 10%.
   * Caso de borde exacto en 300.00 BOB.
   * Validación de montos negativos o cero.
2. `test_anti_link_sanitizer.py` (7 pruebas):
   * Detección y bloqueo de URLs (`http://`, `https://`, `www.`).
   * Detección y bloqueo de correos electrónicos.
   * Detección y bloqueo de números telefónicos internacionales/locales.
   * Sanitización y reemplazo por etiqueta censurada.
3. `test_escrow_lifecycle.py` (3 pruebas):
   * Bloqueo de inicio de hito si no cuenta con pago previo en custodia.
   * Desbloqueo tras confirmación de depósito anticipado.
   * Dispersión automática del neto al consultor tras la aprobación del hito.
4. `test_progress_and_kanban.py` (3 pruebas):
   * Recálculo automático del porcentaje global de avance sumando hitos completados.
   * Activación de semáforo `RETRASADO` ante fechas límite vencidas.
   * Registro de conformidad y tiempos de respuesta del consultor.
5. `test_multilateral_ratings.py` (3 pruebas):
   * Validación estricta de 1 a 5 estrellas.
   * Rechazo de calificaciones inválidas (< 1 o > 5).
   * Cálculo acumulado del promedio ponderado del consultor.
6. `test_use_cases.py` (3 pruebas):
   * Ejecución desacoplada de `InitEscrowPaymentUseCase`.
   * Ejecución desacoplada de `ApproveMilestonePayoutUseCase`.
   * Creación y orquestación de `CreateProjectUseCase` y `UpdateKanbanTaskStatusUseCase`.

---

## 4. Script de Demostración del Core
Para reproducir interactivamente el ciclo completo:
```bash
python3 scripts/demo_sdlc_core.py
```
