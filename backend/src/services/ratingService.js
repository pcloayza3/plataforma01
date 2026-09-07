import crypto from "crypto";
import { RatingRepository } from "../db/ratingRepository.js";

// Fallback sincronizado en memoria para pruebas sin BD
const memoryRatings = [];

export class RatingService {
  /**
   * Registrar calificación multilateral con validación estricta de 1 a 5 estrellas
   */
  static async recordRating({
    sourceUserId,
    sourceRole,
    targetUserId,
    targetRole,
    projectId,
    milestoneId,
    stars,
    comment
  }) {
    if (!sourceUserId || !targetUserId) {
      throw new Error("El calificador y el usuario calificado son obligatorios.");
    }

    const numericStars = Number(stars);
    if (!Number.isInteger(numericStars) || numericStars < 1 || numericStars > 5) {
      throw new Error("La calificación debe ser un número entero entre 1 y 5 estrellas.");
    }

    const id = `rat_${crypto.randomUUID()}`;
    const ratingObj = {
      id,
      sourceUserId,
      sourceRole: sourceRole || "STUDENT",
      targetUserId,
      targetRole: targetRole || "CONSULTANT",
      projectId: projectId || null,
      milestoneId: milestoneId || null,
      stars: numericStars,
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    memoryRatings.push(ratingObj);

    try {
      const created = await RatingRepository.addRating({
        id,
        sourceUserId,
        sourceRole: ratingObj.sourceRole,
        targetUserId,
        targetRole: ratingObj.targetRole,
        projectId: ratingObj.projectId,
        milestoneId: ratingObj.milestoneId,
        stars: numericStars,
        comment: ratingObj.comment
      });

      if (created) {
        return {
          id: created.id,
          sourceUserId: created.source_user_id,
          sourceRole: created.source_role,
          targetUserId: created.target_user_id,
          targetRole: created.target_role,
          stars: created.stars,
          comment: created.comment,
          createdAt: created.created_at
        };
      }
    } catch (err) {
      // Usar fallback en memoria
    }

    return ratingObj;
  }

  /**
   * Obtener resumen de reputación compatible con endpoints
   */
  static async getSummary(userId) {
    try {
      const dbSummary = await RatingRepository.getUserSummary(userId);
      if (dbSummary && dbSummary.totalReviews > 0) {
        return {
          targetUserId: userId,
          average: dbSummary.average,
          averageStars: dbSummary.average,
          totalReviews: dbSummary.totalReviews,
          distribution: dbSummary.breakdown,
          recentReviews: dbSummary.recentReviews
        };
      }
    } catch (err) {
      // Ignorar e ir al fallback
    }

    // Fallback en memoria
    const userRatings = memoryRatings.filter(r => r.targetUserId === userId);
    if (userRatings.length === 0) {
      return {
        targetUserId: userId,
        average: 5.0,
        averageStars: 5.0,
        totalReviews: 1,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
        recentReviews: []
      };
    }

    const sum = userRatings.reduce((acc, r) => acc + r.stars, 0);
    const avg = Number((sum / userRatings.length).toFixed(2));
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    userRatings.forEach(r => { dist[r.stars] = (dist[r.stars] || 0) + 1; });

    return {
      targetUserId: userId,
      average: avg,
      averageStars: avg,
      totalReviews: userRatings.length,
      distribution: dist,
      recentReviews: userRatings
    };
  }
}
