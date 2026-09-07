import express from "express";
import { RatingService } from "../services/ratingService.js";

export const ratingRouter = express.Router();

/**
 * POST /api/ratings
 * Registrar calificación multilateral de 1 a 5 estrellas
 */
ratingRouter.post("/", async (req, res) => {
  try {
    const { sourceUserId, sourceRole, targetUserId, targetRole, projectId, milestoneId, stars, comment } = req.body;
    const rating = await RatingService.recordRating({
      sourceUserId,
      sourceRole,
      targetUserId,
      targetRole,
      projectId,
      milestoneId,
      stars,
      comment
    });
    return res.status(201).json({
      message: "Calificación registrada con éxito en PostgreSQL.",
      rating
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/ratings/user/:userId
 * Obtener resumen de reputación y promedios de estrellas
 */
ratingRouter.get("/user/:userId", async (req, res) => {
  try {
    const summary = await RatingService.getSummary(req.params.userId);
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
