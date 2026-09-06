import unittest
from decimal import Decimal
import uuid
from src.core.domain.entities import TransaccionEscrow, HitoEntrega
from src.core.domain.value_objects import EstadoEscrow, EstadoHito, Money
from src.core.domain.exceptions import EscrowNotFundedException, InvalidEscrowStateException
from src.core.services.commission_calculator import DynamicCommissionCalculator


class MockPaymentGateway:
    def __init__(self):
        self.payouts_executed = []

    def execute_payout(self, recipient_account: str, amount: Money):
        self.payouts_executed.append({"recipient": recipient_account, "amount": amount})
        return {"status": "PROCESSED", "payout_id": f"pay_{uuid.uuid4().hex[:8]}"}


class TestEscrowLifecycle(unittest.TestCase):
    """Pruebas del ciclo de vida de custodia y pagos por hito (XP / TDD)."""

    def setUp(self):
        self.calculator = DynamicCommissionCalculator()
        self.gateway = MockPaymentGateway()

    def test_milestone_cannot_start_without_escrow_deposit(self):
        # Un hito no puede iniciar si no tiene fondos en custodia confirmados
        hito = HitoEntrega(
            id=uuid.uuid4(),
            proyecto_id=uuid.uuid4(),
            titulo="Capítulo 1: Marco Teórico",
            monto_bob=Decimal("400.00"),
            peso_porcentual=Decimal("25.00")
        )
        self.assertEqual(hito.estado, EstadoHito.PENDIENTE_DE_PAGO)
        with self.assertRaises(EscrowNotFundedException):
            hito.iniciar_trabajo()

    def test_escrow_deposit_unlocks_milestone(self):
        hito = HitoEntrega(
            id=uuid.uuid4(),
            proyecto_id=uuid.uuid4(),
            titulo="Capítulo 1: Marco Teórico",
            monto_bob=Decimal("400.00"),
            peso_porcentual=Decimal("25.00")
        )
        escrow = TransaccionEscrow.crear(
            hito_id=hito.id,
            estudiante_id=uuid.uuid4(),
            consultor_id=uuid.uuid4(),
            monto=Money(Decimal("400.00"), "BOB"),
            calculator=self.calculator
        )

        self.assertEqual(escrow.estado, EstadoEscrow.CREADO)
        # Confirmar pago anticipado por parte del estudiante
        escrow.confirmar_pago_anticipado()
        self.assertEqual(escrow.estado, EstadoEscrow.EN_CUSTODIA)

        # Ahora el hito se desbloquea para el trabajo
        hito.vincular_escrow(escrow)
        hito.iniciar_trabajo()
        self.assertEqual(hito.estado, EstadoHito.EN_PROCESO)

    def test_milestone_approval_triggers_net_payout_to_consultant(self):
        consultor_cuenta = "acc_consultor_dlocal_123"
        monto_total = Money(Decimal("500.00"), "BOB") # >= 300 -> 10% comision (50 BOB), neto 450 BOB
        escrow = TransaccionEscrow.crear(
            hito_id=uuid.uuid4(),
            estudiante_id=uuid.uuid4(),
            consultor_id=uuid.uuid4(),
            monto=monto_total,
            calculator=self.calculator
        )
        escrow.confirmar_pago_anticipado()

        # Al aprobar el hito, se libera el monto neto al consultor
        escrow.liberar_fondos_a_consultor(gateway=self.gateway, cuenta_destino=consultor_cuenta)

        self.assertEqual(escrow.estado, EstadoEscrow.LIQUIDADO_AL_CONSULTOR)
        self.assertEqual(len(self.gateway.payouts_executed), 1)
        payout = self.gateway.payouts_executed[0]
        self.assertEqual(payout["recipient"], consultor_cuenta)
        self.assertEqual(payout["amount"].amount, Decimal("450.00"))


if __name__ == "__main__":
    unittest.main()
