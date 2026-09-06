import express from "express";
import { WherebySessionManager } from "../domain/wherebySessionManager.js";
import { WherebyAdapter } from "../adapters/wherebyAdapter.js";

export const sessionRouter = express.Router();
export const wherebyAdapter = new WherebyAdapter();
export const sessionManager = new WherebySessionManager(wherebyAdapter);

// Crear videollamada Whereby 60m + Miro
sessionRouter.post("/", async (req, res) => {
  try {
    const { projectId, milestoneId, studentId, consultantId, miroBoardId, durationMinutes } = req.body;
    const session = await sessionManager.createSession({
      projectId,
      milestoneId,
      studentId,
      consultantId,
      miroBoardId,
      durationMinutes: durationMinutes || 60
    });
    return res.status(201).json(session);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Obtener sesión
sessionRouter.get("/:id", (req, res) => {
  const session = sessionManager.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Sesión no encontrada." });
  return res.json(session);
});

// Finalizar sesión y generar transcripción con IA
sessionRouter.post("/:id/end", (req, res) => {
  try {
    const { summary } = req.body;
    const session = sessionManager.endSession(req.params.id, summary);
    return res.json({
      message: "Sesión completada y transcripción IA procesada exitosamente.",
      session
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
