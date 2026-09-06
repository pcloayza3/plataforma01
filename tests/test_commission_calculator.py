import unittest
from decimal import Decimal
from src.core.services.commission_calculator import DynamicCommissionCalculator
from src.core.domain.value_objects import Money


class TestCommissionCalculator(unittest.TestCase):
    """Pruebas unitarias para el cálculo de comisiones dinámicas (XP / TDD)."""

    def setUp(self):
        self.calculator = DynamicCommissionCalculator()

    def test_micropayment_below_300_bob_applies_15_percent(self):
        # 200 BOB < 300 BOB -> Comisión 15% (30 BOB), Neto consultor 170 BOB
        amount = Money(Decimal("200.00"), "BOB")
        result = self.calculator.calculate(amount)

        self.assertEqual(result.commission_rate, Decimal("0.15"))
        self.assertEqual(result.commission_amount.amount, Decimal("30.00"))
        self.assertEqual(result.net_consultant_amount.amount, Decimal("170.00"))

    def test_micropayment_299_99_bob_applies_15_percent(self):
        amount = Money(Decimal("299.99"), "BOB")
        result = self.calculator.calculate(amount)

        self.assertEqual(result.commission_rate, Decimal("0.15"))
        self.assertAlmostEqual(float(result.commission_amount.amount), 45.00, places=2)

    def test_threshold_300_bob_applies_10_percent(self):
        # 300 BOB exactos -> Comisión 10% (30 BOB), Neto consultor 270 BOB
        amount = Money(Decimal("300.00"), "BOB")
        result = self.calculator.calculate(amount)

        self.assertEqual(result.commission_rate, Decimal("0.10"))
        self.assertEqual(result.commission_amount.amount, Decimal("30.00"))
        self.assertEqual(result.net_consultant_amount.amount, Decimal("270.00"))

    def test_standard_payment_above_300_bob_applies_10_percent(self):
        # 1000 BOB > 300 BOB -> Comisión 10% (100 BOB), Neto consultor 900 BOB
        amount = Money(Decimal("1000.00"), "BOB")
        result = self.calculator.calculate(amount)

        self.assertEqual(result.commission_rate, Decimal("0.10"))
        self.assertEqual(result.commission_amount.amount, Decimal("100.00"))
        self.assertEqual(result.net_consultant_amount.amount, Decimal("900.00"))

    def test_negative_or_zero_amount_raises_error(self):
        with self.assertRaises(ValueError):
            self.calculator.calculate(Money(Decimal("0.00"), "BOB"))

        with self.assertRaises(ValueError):
            self.calculator.calculate(Money(Decimal("-50.00"), "BOB"))


if __name__ == "__main__":
    unittest.main()
