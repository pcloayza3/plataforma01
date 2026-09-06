import unittest
from decimal import Decimal
from datetime import datetime, timedelta, timezone
import uuid
from src.core.domain.entities import ProyectoAsesoria, TarjetaKanban
from src.core.domain.value_objects import EstadoTarea, SemaforoAvance, ConformidadGuia, ModalidadProyecto


class TestProgressAndKanban(unittest.TestCase):
    """Pruebas para el tablero Kanban, cálculo de avance porcentual y semáforos (XP / TDD)."""

    def test_project_progress_is_sum_of_completed_cards(self):
        proyecto = ProyectoAsesoria(
            id=uuid.uuid4(),
            estudiante_id=uuid.uuid4(),
            consultor_id=uuid.uuid4(),
            titulo="Tesis de Grado en Inteligencia Artificial",
            modalidad=ModalidadProyecto.TESIS_PREGRADO
        )

        t1 = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=proyecto.id,
            titulo="Marco Metodológico",
            peso_porcentual=Decimal("30.00"),
            fecha_limite=datetime.now(timezone.utc) + timedelta(days=5)
        )
        t2 = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=proyecto.id,
            titulo="Desarrollo de Experimentos",
            peso_porcentual=Decimal("40.00"),
            fecha_limite=datetime.now(timezone.utc) + timedelta(days=15)
        )
        t3 = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=proyecto.id,
            titulo="Conclusiones y Defensa",
            peso_porcentual=Decimal("30.00"),
            fecha_limite=datetime.now(timezone.utc) + timedelta(days=30)
        )

        proyecto.agregar_tarjeta(t1)
        proyecto.agregar_tarjeta(t2)
        proyecto.agregar_tarjeta(t3)

        self.assertEqual(proyecto.porcentaje_avance_global, Decimal("0.00"))

        # Completar tarjeta 1 (30%)
        t1.completar()
        proyecto.recalcular_avance()
        self.assertEqual(proyecto.porcentaje_avance_global, Decimal("30.00"))

        # Completar tarjeta 2 (40%) -> 70%
        t2.completar()
        proyecto.recalcular_avance()
        self.assertEqual(proyecto.porcentaje_avance_global, Decimal("70.00"))

    def test_deadline_monitor_sets_retrasado_if_overdue(self):
        # Tarjeta con fecha límite en el pasado que no está completada
        fecha_pasada = datetime.now(timezone.utc) - timedelta(days=2)
        tarjeta = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=uuid.uuid4(),
            titulo="Revisión Bibliográfica",
            peso_porcentual=Decimal("20.00"),
            fecha_limite=fecha_pasada
        )
        tarjeta.actualizar_semaforo()
        self.assertEqual(tarjeta.semaforo, SemaforoAvance.RETRASADO)

    def test_consultant_feedback_status_tracking(self):
        tarjeta = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=uuid.uuid4(),
            titulo="Propuesta de Tesis",
            peso_porcentual=Decimal("20.00"),
            fecha_limite=datetime.now(timezone.utc) + timedelta(days=3)
        )
        # Consultor emite feedback a tiempo
        tarjeta.registrar_feedback_consultor(conforme=True, demorado=False)
        self.assertEqual(tarjeta.feedback_consultor, ConformidadGuia.CONFORME)

        # Consultor se demora en emitir feedback
        tarjeta.registrar_feedback_consultor(conforme=False, demorado=True)
        self.assertEqual(tarjeta.feedback_consultor, ConformidadGuia.DEMORADO_EN_FEEDBACK)


if __name__ == "__main__":
    unittest.main()
