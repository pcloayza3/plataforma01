import uuid
from src.core.domain.entities import TransaccionEscrow
from src.core.domain.value_objects import Money
from src.core.services.commission_calculator import DynamicCommissionCalculator
from src.core.domain.exceptions import DomainException


class InitEscrowPaymentUseCase:
    """Caso de uso: Inicializar pago en custodia con cálculo de comisión dinámica."""

    def __init__(self, escrow_repo, calculator: DynamicCommissionCalculator):
        self.escrow_repo = escrow_repo
        self.calculator = calculator

    def execute(self, hito_id: uuid.UUID, estudiante_id: uuid.UUID, consultor_id: uuid.UUID, monto: Money) -> TransaccionEscrow:
        escrow = TransaccionEscrow.crear(
            hito_id=hito_id,
            estudiante_id=estudiante_id,
            consultor_id=consultor_id,
            monto=monto,
            calculator=self.calculator
        )
        self.escrow_repo.save(escrow)
        return escrow


class ApproveMilestonePayoutUseCase:
    """Caso de uso: Aprobar hito y desembolsar honorarios netos al consultor vía dLocal."""

    def __init__(self, escrow_repo, payment_gateway):
        self.escrow_repo = escrow_repo
        self.payment_gateway = payment_gateway

    def execute(self, escrow_id: uuid.UUID, cuenta_destino: str) -> TransaccionEscrow:
        escrow = self.escrow_repo.get_by_id(escrow_id)
        if not escrow:
            raise DomainException(f"Transacción de custodia {escrow_id} no encontrada.")

        escrow.liberar_fondos_a_consultor(gateway=self.payment_gateway, cuenta_destino=cuenta_destino)
        self.escrow_repo.save(escrow)
        return escrow
