import express from "express";
import { EscrowManager } from "../domain/escrowManager.js";
import { DLocalAdapter } from "../adapters/dLocalAdapter.js";
import { kanbanManager } from "./projectRoutes.js";
import { MilestoneStatus } from "../domain/projectKanbanManager.js";

export const escrowRouter = express.Router();
export const dlocalAdapter = new DLocalAdapter();
export const escrowManager = new EscrowManager(dlocalAdapter);

// Depósito en custodia (Pay-in por adelantado)
escrowRouter.post("/deposit", (req, res) => {
  try {
    const { projectId, milestoneId, studentId, consultantId, amountBOB, paymentOption, paymentMethod } = req.body;

    if (!amountBOB || !studentId || !consultantId) {
      return res.status(400).json({ error: "Monto en BOB, estudiante y consultor son obligatorios." });
    }

    // 1. Crear registro de custodia y cálculo de comisiones
    const escrow = escrowManager.createEscrow({
      milestoneId,
      studentId,
      consultantId,
      amountBOB,
      paymentOption: paymentOption || "MILESTONE"
    });

    // 2. Ejecutar Pay-in simulado con dLocal (QR Simple / Tarjeta)
    const payInResult = dlocalAdapter.executePayIn({
      studentId,
      amount: escrow.grossAmount,
      currency: "BOB",
      paymentMethod: paymentMethod || "QR_SIMPLE",
      description: `Pago en custodia para ${milestoneId ? `Hito ${milestoneId}` : "Proyecto Completo"}`
    });

    // 3. Confirmar resguardo en custodia
    escrowManager.confirmPayment(escrow.id);
    escrow.payInDetails = payInResult;

    // Actualizar estado del hito en el proyecto si aplica
    if (projectId && milestoneId) {
      const project = kanbanManager.getProject(projectId);
      if (project) {
        const ms = project.milestones.find(m => m.id === milestoneId);
        if (ms) ms.status = MilestoneStatus.FUNDED;
      }
    }

    return res.status(201).json({
      message: "Pago recibido por adelantado y resguardado en custodia de forma segura.",
      escrow
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Consultar estado de custodia
escrowRouter.get("/:id", (req, res) => {
  const escrow = escrowManager.getById(req.params.id);
  if (!escrow) return res.status(404).json({ error: "Custodia no encontrada." });
  return res.json(escrow);
});

// Aprobación de hito y liberación de fondos al consultor (Payout)
escrowRouter.post("/:id/approve-payout", async (req, res) => {
  try {
    const { consultantBankAccount, projectId, milestoneId } = req.body;
    if (!consultantBankAccount) {
      return res.status(400).json({ error: "Cuenta bancaria del consultor requerida para el desembolso." });
    }

    const updatedEscrow = escrowManager.approveAndRelease(req.params.id, consultantBankAccount);

    // Actualizar hito si se pasa proyecto
    if (projectId && milestoneId) {
      try {
        const { ProjectService } = await import("../services/projectService.js");
        await ProjectService.recordConformity(projectId, milestoneId, {
          actor: "STUDENT",
          approved: true,
          observations: "Hito aprobado por el estudiante y pago liberado al consultor."
        });
      } catch (err) {
        // En caso de que el proyecto solo exista en memoria de test
      }
    }

    return res.json({
      message: "Fondos liberados y transferidos exitosamente al consultor vía dLocal.",
      escrow: updatedEscrow
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
