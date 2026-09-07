import express from "express";
import { PaymentService } from "../services/paymentService.js";
import { PaymentRepository } from "../db/paymentRepository.js";

export const paymentRouter = express.Router();

/**
 * POST /api/payments/deposit
 * Registrar pago anticipado y resguardar en custodia interna de la plataforma
 */
paymentRouter.post("/deposit", async (req, res) => {
  try {
    const { projectId, milestoneId, studentId, consultantId, amountBOB, paymentOption, paymentMethod } = req.body;

    if (!amountBOB || !studentId || !consultantId || !projectId) {
      return res.status(400).json({
        error: "Monto en BOB, estudiante, consultor y projectId son obligatorios."
      });
    }

    const transaction = await PaymentService.registerPaymentAndHold({
      projectId,
      milestoneId,
      studentId,
      consultantId,
      amountBOB,
      paymentMethod: paymentMethod || "QR_SIMPLE",
      paymentOption: paymentOption || "MILESTONE"
    });

    return res.status(201).json({
      message: "Pago recibido exitosamente. Fondos resguardados en custodia de la plataforma.",
      transaction
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/payments/:id
 * Consultar estado de custodia
 */
paymentRouter.get("/:id", async (req, res) => {
  try {
    const tx = await PaymentService.getTransaction(req.params.id);
    return res.json(tx);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * GET /api/payments/project/:projectId
 * Consultar todas las transacciones de un proyecto
 */
paymentRouter.get("/project/:projectId", async (req, res) => {
  try {
    const txs = await PaymentRepository.getTransactionsByProject(req.params.projectId);
    return res.json(txs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payments/:id/release
 * Liquidación al consultor tras aprobación de hito
 */
paymentRouter.post("/:id/release", async (req, res) => {
  try {
    const { consultantBankAccount, projectId, milestoneId } = req.body;
    if (!consultantBankAccount) {
      return res.status(400).json({
        error: "Cuenta bancaria o de cobro del consultor requerida para el desembolso."
      });
    }

    const payout = await PaymentService.releaseHeldFunds(
      req.params.id,
      consultantBankAccount,
      projectId,
      milestoneId
    );

    return res.json({
      message: "Hito aprobado y liquidación transferida exitosamente al consultor por la plataforma.",
      payout
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
