import express from "express";
import { RatingManager } from "../domain/ratingManager.js";

export const ratingRouter = express.Router();
export const ratingManager = new RatingManager();

// Seed de algunas calificaciones iniciales
ratingManager.addRating({
  sourceUserId: "usr_student_01",
  sourceRole: "STUDENT",
  targetUserId: "usr_consultant_01",
  targetRole: "CONSULTANT",
  type: "SESION_VIDEOLLAMADA",
  stars: 5,
  comment: "Excelente asesoría, me aclaró toda la metodología para la redacción de la tesis."
});

ratingManager.addRating({
  sourceUserId: "usr_consultant_01",
  sourceRole: "CONSULTANT",
  targetUserId: "usr_student_01",
  targetRole: "STUDENT",
  type: "SESION_VIDEOLLAMADA",
  stars: 5,
  comment: "Estudiante muy dedicada y puntual con sus entregas previas."
});

// Registrar calificación
ratingRouter.post("/", (req, res) => {
  try {
    const { sourceUserId, sourceRole, targetUserId, targetRole, type, referenceId, stars, comment } = req.body;
    const rating = ratingManager.addRating({
      sourceUserId,
      sourceRole,
      targetUserId,
      targetRole,
      type,
      referenceId,
      stars,
      comment
    });
    return res.status(201).json({
      message: "Calificación registrada con éxito.",
      rating
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Obtener resumen de calificaciones de un usuario
ratingRouter.get("/user/:userId", (req, res) => {
  const summary = ratingManager.getUserRatingSummary(req.params.userId);
  return res.json(summary);
});
