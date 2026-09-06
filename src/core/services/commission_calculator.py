from decimal import Decimal, ROUND_HALF_UP
from src.core.domain.value_objects import Money, CommissionCalculationResult


class DynamicCommissionCalculator:
    """
    Calculador de comisiones dinámicas basado en el umbral monetario:
    - Monto < 300 BOB: 15% de comisión
    - Monto >= 300 BOB: 10% de comisión
    """

    THRESHOLD_BOB = Decimal("300.00")
    RATE_MICROPAYMENT = Decimal("0.15")
    RATE_STANDARD = Decimal("0.10")

    def calculate(self, gross_amount: Money) -> CommissionCalculationResult:
        if gross_amount.amount <= Decimal("0.00"):
            raise ValueError("El monto a calcular debe ser estrictamente mayor a 0.")

        if gross_amount.amount < self.THRESHOLD_BOB:
            rate = self.RATE_MICROPAYMENT
        else:
            rate = self.RATE_STANDARD

        commission_val = (gross_amount.amount * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        net_val = gross_amount.amount - commission_val

        return CommissionCalculationResult(
            gross_amount=gross_amount,
            commission_rate=rate,
            commission_amount=Money(commission_val, gross_amount.currency),
            net_consultant_amount=Money(net_val, gross_amount.currency)
        )
