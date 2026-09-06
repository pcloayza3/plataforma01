import unittest
from decimal import Decimal
import uuid
from datetime import datetime, timezone, timedelta

from src.core.domain.value_objects import Money, EstadoEscrow, EstadoTarea, EstadoHito, ModalidadProyecto
from src.core.domain.entities import ProyectoAsesoria, TarjetaKanban, HitoEntrega, TransaccionEscrow
from src.core.services.commission_calculator import DynamicCommissionCalculator
from src.core.use_cases.escrow_use_cases import InitEscrowPaymentUseCase, ApproveMilestonePayoutUseCase
from src.core.use_cases.project_use_cases import CreateProjectUseCase, UpdateKanbanTaskStatusUseCase


class InMemoryEscrowRepository:
    def __init__(self):
        self.escrows = {}

    def save(self, escrow: TransaccionEscrow):
        self.escrows[escrow.id] = escrow

    def get_by_id(self, escrow_id: uuid.UUID):
        return self.escrows.get(escrow_id)


class InMemoryProjectRepository:
    def __init__(self):
        self.projects = {}

    def save(self, project: ProyectoAsesoria):
        self.projects[project.id] = project

    def get_by_id(self, project_id: uuid.UUID):
        return self.projects.get(project_id)


class DummyPaymentGateway:
    def __init__(self):
        self.payouts = []

    def execute_payout(self, recipient_account: str, amount: Money):
        self.payouts.append((recipient_account, amount))
        return {"status": "SUCCESS"}


class TestUseCases(unittest.TestCase):
    """Pruebas de los Casos de Uso de la Arquitectura Hexagonal (XP / TDD)."""

    def setUp(self):
        self.escrow_repo = InMemoryEscrowRepository()
        self.project_repo = InMemoryProjectRepository()
        self.calc = DynamicCommissionCalculator()
        self.gateway = DummyPaymentGateway()

    def test_init_escrow_payment_use_case(self):
        use_case = InitEscrowPaymentUseCase(escrow_repo=self.escrow_repo, calculator=self.calc)
        hito_id = uuid.uuid4()
        estudiante_id = uuid.uuid4()
        consultor_id = uuid.uuid4()
        monto = Money(Decimal("600.00"), "BOB")

        escrow = use_case.execute(hito_id, estudiante_id, consultor_id, monto)

        self.assertIsNotNone(escrow.id)
        self.assertEqual(escrow.estado, EstadoEscrow.CREADO)
        self.assertEqual(escrow.monto_bruto.amount, Decimal("600.00"))
        # 10% de comisión (60 BOB)
        self.assertEqual(escrow.comision_calculada.amount, Decimal("60.00"))
        self.assertEqual(escrow.monto_neto_consultor.amount, Decimal("540.00"))
        self.assertIn(escrow.id, self.escrow_repo.escrows)

    def test_approve_milestone_payout_use_case(self):
        # Preparar escrow en custodia
        escrow = TransaccionEscrow.crear(
            hito_id=uuid.uuid4(),
            estudiante_id=uuid.uuid4(),
            consultor_id=uuid.uuid4(),
            monto=Money(Decimal("250.00"), "BOB"), # < 300 -> 15% (37.50 BOB), neto 212.50 BOB
            calculator=self.calc
        )
        escrow.confirmar_pago_anticipado()
        self.escrow_repo.save(escrow)

        use_case = ApproveMilestonePayoutUseCase(escrow_repo=self.escrow_repo, payment_gateway=self.gateway)
        cuenta_destino = "acc_banco_consultor_xyz"
        updated_escrow = use_case.execute(escrow.id, cuenta_destino)

        self.assertEqual(updated_escrow.estado, EstadoEscrow.LIQUIDADO_AL_CONSULTOR)
        self.assertEqual(len(self.gateway.payouts), 1)
        recipient, amt = self.gateway.payouts[0]
        self.assertEqual(recipient, cuenta_destino)
        self.assertEqual(amt.amount, Decimal("212.50"))

    def test_create_project_and_update_task_status_use_case(self):
        create_uc = CreateProjectUseCase(project_repo=self.project_repo)
        estudiante_id = uuid.uuid4()
        consultor_id = uuid.uuid4()

        project = create_uc.execute(
            estudiante_id=estudiante_id,
            consultor_id=consultor_id,
            titulo="Tesis de Postgrado en Robótica",
            modalidad=ModalidadProyecto.TESIS_POSGRADO
        )
        self.assertEqual(project.titulo, "Tesis de Postgrado en Robótica")

        # Agregar tarjeta y actualizar estado
        task = TarjetaKanban(
            id=uuid.uuid4(),
            proyecto_id=project.id,
            titulo="Diseño Cinemático",
            peso_porcentual=Decimal("50.00"),
            fecha_limite=datetime.now(timezone.utc) + timedelta(days=10)
        )
        project.agregar_tarjeta(task)
        self.project_repo.save(project)

        update_uc = UpdateKanbanTaskStatusUseCase(project_repo=self.project_repo)
        updated_project = update_uc.execute(project.id, task.id, EstadoTarea.COMPLETADA)

        self.assertEqual(updated_project.porcentaje_avance_global, Decimal("50.00"))


if __name__ == "__main__":
    unittest.main()
