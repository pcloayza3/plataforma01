import crypto from "crypto";

export class DLocalAdapter {
  constructor({ apiKey = "dlocal_sandbox_key", secretKey = "dlocal_secret", isLive = false } = {}) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.isLive = isLive;
  }

  executePayIn({ studentId, amount, currency = "BOB", paymentMethod = "QR_SIMPLE", description }) {
    if (!amount || amount <= 0) throw new Error("Monto inválido para pay-in.");
    
    // Simulación de dLocal Pay-in API
    return {
      paymentId: `pay_${crypto.randomUUID()}`,
      status: "PAID",
      amount,
      currency,
      paymentMethod,
      studentId,
      description,
      gatewayFeeBOB: Math.round(amount * 0.02 * 100) / 100, // Costo de pasarela
      processedAt: new Date().toISOString()
    };
  }

  executePayout({ recipientAccount, amount, currency = "BOB" }) {
    if (!amount || amount <= 0) throw new Error("Monto inválido para pay-out.");
    if (!recipientAccount) throw new Error("Cuenta bancaria de destino requerida para pay-out.");

    // Simulación de dLocal Payouts API
    return {
      transferId: `trf_${crypto.randomUUID()}`,
      status: "COMPLETED",
      amount,
      currency,
      recipientAccount,
      disbursedAt: new Date().toISOString()
    };
  }
}
