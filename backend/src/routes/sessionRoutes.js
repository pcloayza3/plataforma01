import express from "express";
import { SessionService } from "../services/sessionService.js";

export const sessionRouter = express.Router();

/**
 * POST /api/sessions
 * Crear sala de videollamada Whereby 60m + Pizarra Miro y registrar en MongoDB
 */
sessionRouter.post("/", async (req, res) => {
  try {
    const { projectId, milestoneId, studentId, consultantId, miroBoardId, durationMinutes } = req.body;
    const session = await SessionService.createSession({
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

/**
 * GET /api/sessions/project/:projectId
 * Obtener historial de sesiones de un proyecto
 */
sessionRouter.get("/project/:projectId", async (req, res) => {
  try {
    const sessions = await SessionService.getProjectSessions(req.params.projectId);
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/sessions/:id
 * Consultar datos de una sesión
 */
sessionRouter.get("/:id", async (req, res) => {
  try {
    const session = await SessionService.getSession(req.params.id);
    return res.json(session);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/sessions/:id/end
 * Finalizar videollamada y guardar acuerdos y transcripción IA en MongoDB
 */
sessionRouter.post("/:id/end", async (req, res) => {
  try {
    const { summary, agreements, actionItems } = req.body;
    const result = await SessionService.endSessionAndSaveAgreements(req.params.id, {
      summary,
      agreements,
      actionItems
    });
    return res.json({
      message: "Sesión completada y acta de acuerdos resguardada en MongoDB.",
      session: result.session,
      transcript: result.transcript
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
