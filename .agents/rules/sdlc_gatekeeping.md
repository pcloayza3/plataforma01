# Regla: Gatekeeping Estricto por Fase del SDLC

## Propósito
Garantizar que ninguna fase del Ciclo de Vida del Software se considere finalizada o avance a la siguiente sin la revisión y aprobación explícita del usuario.

## Protocolo de Gatekeeping

Para cada fase:
1. **Inicio de Fase:** Verificar que la fase anterior cuente con aprobación registrada.
2. **Ejecución:** Generar los entregables correspondientes a la fase aplicando la metodología prescrita.
3. **Cierre de Fase:**
   - Presentar al usuario un resumen de los entregables generados.
   - Detener explícitamente cualquier acción posterior.
   - Formular la pregunta de control: *"¿Aprueba los entregables de la fase [Nombre de Fase] para proceder a [Siguiente Fase]?"*.
4. **Acción tras Aprobación:** Solo cuando el usuario responda afirmativamente, mover el Issue de la fase a `Done` en el Kanban y desbloquear el inicio de la siguiente etapa.
