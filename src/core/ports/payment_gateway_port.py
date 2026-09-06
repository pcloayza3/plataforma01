from abc import ABC, abstractmethod
from typing import Dict, Any
from src.core.domain.value_objects import Money


class PaymentGatewayPort(ABC):
    """
    Puerto desacoplado para pasarelas de pago (dLocal for Platforms).
    Permite intercambiar el proveedor de pagos sin modificar la lógica de dominio.
    """

    @abstractmethod
    def create_payment_intent(self, amount: Money, customer_id: str) -> Dict[str, Any]:
        """Inicia el cobro (pay-in) en moneda local."""
        pass

    @abstractmethod
    def execute_payout(self, recipient_account: str, amount: Money) -> Dict[str, Any]:
        """Dispersa los fondos (pay-out) al consultor en su cuenta bancaria local."""
        pass
