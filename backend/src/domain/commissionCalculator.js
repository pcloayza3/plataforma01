/**
 * Calculador de comisiones dinámicas de plataforma01
 * - Monto < 300 BOB: 15% de comisión
 * - Monto >= 300 BOB: 10% de comisión
 */
export class CommissionCalculator {
  static THRESHOLD_BOB = 300.0;
  static RATE_MICROPAYMENT = 0.15;
  static RATE_STANDARD = 0.10;

  static calculate(grossAmount) {
    const amount = Number(grossAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("El monto a calcular debe ser un número estrictamente mayor a 0.");
    }

    const rate = amount < this.THRESHOLD_BOB ? this.RATE_MICROPAYMENT : this.RATE_STANDARD;
    const commissionAmount = Math.round(amount * rate * 100) / 100;
    const netAmount = Math.round((amount - commissionAmount) * 100) / 100;

    return {
      grossAmount: amount,
      currency: "BOB",
      rate,
      ratePercentage: `${rate * 100}%`,
      commissionAmount,
      netAmount
    };
  }
}
