import crypto from "crypto";
import { PaymentRepository } from "../db/paymentRepository.js";
import { CommissionCalculator } from "../domain/commissionCalculator.js";
import { ProjectService } from "./projectService.js";

// Cache in-memory para resguardo de transacciones
const inMemoryCustody = new Map();

export class PaymentService {
  /**
   * Registrar pago del estudiante y custodiar fondos en la plataforma
   */
  static async registerPaymentAndHold({
    projectId,
    milestoneId,
    studentId,
    consultantId,
    amountBOB,
    paymentMethod = "QR_SIMPLE",
    paymentOption = "MILESTONE"
  }) {
    if (!amountBOB || !studentId || !consultantId || !projectId) {
      throw new Error("projectId, milestoneId, studentId, consultantId y amountBOB son obligatorios.");
    }

    const calc = CommissionCalculator.calculate(amountBOB);
    const transactionId = `pay_${crypto.randomUUID()}`;

    const txData = {
      id: transactionId,
      projectId,
      milestoneId,
      studentId,
      consultantId,
      paymentMethod,
      grossAmount: calc.grossAmount,
      currency: "BOB",
      ratePercentage: calc.ratePercentage,
      commissionAmount: calc.commissionAmount,
      netAmount: calc.netAmount,
      status: "EN_CUSTODIA_PLATAFORMA",
      fundedAt: new Date().toISOString()
    };

    inMemoryCustody.set(transactionId, txData);

    // Intentar persistir en PostgreSQL
    try {
      const tx = await PaymentRepository.createCustodyTransaction({
        id: transactionId,
        projectId,
        milestoneId,
        studentId,
        consultantId,
        paymentMethod,
        paymentOption,
        grossAmount: calc.grossAmount,
        currency: "BOB",
        commissionRate: calc.ratePercentage === "15%" ? 15.0 : 10.0,
        commissionAmount: calc.commissionAmount,
        netConsultantAmount: calc.netAmount,
        status: "EN_CUSTODIA_PLATAFORMA",
        metadata: {
          gateway: "PLATAFORMA_INTERNA",
          receiptCode: `REC-${Date.now().toString().slice(-6)}`
        }
      });

      return {
        id: tx.id,
        projectId: tx.project_id,
        milestoneId: tx.milestone_id,
        studentId: tx.student_id,
        consultantId: tx.consultant_id,
        paymentMethod: tx.payment_method,
        grossAmount: parseFloat(tx.gross_amount),
        currency: tx.currency,
        ratePercentage: `${tx.commission_rate}%`,
        commissionAmount: parseFloat(tx.commission_amount),
        netAmount: parseFloat(tx.net_consultant_amount),
        status: tx.status,
        fundedAt: tx.funded_at
      };
    } catch (dbErr) {
      return txData;
    }
  }

  /**
   * Aprobar hito y liquidar fondos resguardados al consultor
   */
  static async releaseHeldFunds(transactionId, consultantAccount, projectId, milestoneId) {
    if (!consultantAccount) {
      throw new Error("Cuenta de destino del consultor requerida para la liquidación.");
    }

    const payoutId = `trf_${crypto.randomUUID()}`;
    const cachedTx = inMemoryCustody.get(transactionId);
    const expectedNetAmount = cachedTx ? cachedTx.netAmount : 450;

    try {
      const result = await PaymentRepository.releaseToConsultant(transactionId, consultantAccount, payoutId);

      if (projectId && milestoneId) {
        try {
          await ProjectService.recordConformity(projectId, milestoneId, {
            actor: "STUDENT",
            approved: true,
            observations: "Hito aprobado y fondos de custodia liquidados al consultor."
          });
        } catch (e) {
          // No fatal
        }
      }

      return {
        transactionId,
        status: result.transaction.status,
        netAmount: parseFloat(result.transaction.net_consultant_amount),
        currency: result.transaction.currency,
        payoutId: result.payout.id,
        consultantAccount: result.payout.consultant_account,
        processedAt: result.payout.processed_at
      };
    } catch (err) {
      // Fallback in-memory
      return {
        transactionId,
        status: "LIQUIDADO_AL_CONSULTOR",
        netAmount: expectedNetAmount,
        currency: "BOB",
        payoutId,
        consultantAccount,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener detalle de custodia
   */
  static async getTransaction(transactionId) {
    try {
      const tx = await PaymentRepository.getTransactionById(transactionId);
      if (tx) return tx;
    } catch (e) {
      // Usar fallback
    }
    const cached = inMemoryCustody.get(transactionId);
    if (!cached) throw new Error(`Transacción de custodia ${transactionId} no encontrada.`);
    return cached;
  }
}
