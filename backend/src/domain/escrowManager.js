import crypto from "crypto";
import { CommissionCalculator } from "./commissionCalculator.js";

export const EscrowStatus = {
  PENDING_PAYMENT: "PENDIENTE_DE_PAGO",
  IN_ESCROW: "EN_CUSTODIA",
  DISPERSED: "LIQUIDADO_AL_CONSULTOR",
  DISPUTED: "EN_DISPUTA",
  REFUNDED: "REEMBOLSADO"
};

export class EscrowManager {
  constructor(paymentGateway) {
    this.paymentGateway = paymentGateway;
    this.transactions = new Map();
  }

  createEscrow({ milestoneId, studentId, consultantId, amountBOB, paymentOption = "MILESTONE" }) {
    const calc = CommissionCalculator.calculate(amountBOB);
    const id = `esc_${crypto.randomUUID()}`;

    const escrow = {
      id,
      milestoneId,
      studentId,
      consultantId,
      grossAmount: calc.grossAmount,
      currency: "BOB",
      ratePercentage: calc.ratePercentage,
      commissionAmount: calc.commissionAmount,
      netAmount: calc.netAmount,
      paymentOption,
      status: EscrowStatus.PENDING_PAYMENT,
      createdAt: new Date().toISOString()
    };

    this.transactions.set(id, escrow);
    return escrow;
  }

  confirmPayment(escrowId) {
    const escrow = this.transactions.get(escrowId);
    if (!escrow) throw new Error(`Transacción de custodia ${escrowId} no encontrada.`);

    escrow.status = EscrowStatus.IN_ESCROW;
    escrow.fundedAt = new Date().toISOString();
    return escrow;
  }

  approveAndRelease(escrowId, consultantBankAccount) {
    const escrow = this.transactions.get(escrowId);
    if (!escrow) throw new Error(`Transacción de custodia ${escrowId} no encontrada.`);
    if (escrow.status !== EscrowStatus.IN_ESCROW) {
      throw new Error("No se pueden liberar fondos que no estén resguardados en custodia.");
    }

    // Dispersión mediante pasarela dLocal
    const payoutResult = this.paymentGateway.executePayout({
      recipientAccount: consultantBankAccount,
      amount: escrow.netAmount,
      currency: "BOB"
    });

    escrow.status = EscrowStatus.DISPERSED;
    escrow.dispersedAt = new Date().toISOString();
    escrow.payoutDetails = payoutResult;

    return escrow;
  }

  getById(escrowId) {
    return this.transactions.get(escrowId);
  }
}
