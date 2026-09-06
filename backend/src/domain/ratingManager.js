import crypto from "crypto";

export const RatingType = {
  SESSION: "SESION_VIDEOLLAMADA",
  MILESTONE: "HITO_PROYECTO",
  INSTITUTION: "INSTITUCION_EMPRESA"
};

export class RatingManager {
  constructor() {
    this.ratings = [];
  }

  addRating({
    sourceUserId,
    sourceRole,
    targetUserId,
    targetRole,
    type = RatingType.SESSION,
    referenceId,
    stars,
    comment = ""
  }) {
    const starCount = Number(stars);
    if (!Number.isInteger(starCount) || starCount < 1 || starCount > 5) {
      throw new Error("La calificación debe ser un número entero entre 1 y 5 estrellas.");
    }

    if (!sourceUserId || !targetUserId) {
      throw new Error("Se requiere el identificador de origen y destino para registrar la calificación.");
    }

    const rating = {
      id: `rat_${crypto.randomUUID()}`,
      sourceUserId,
      sourceRole,
      targetUserId,
      targetRole,
      type,
      referenceId,
      stars: starCount,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    this.ratings.push(rating);
    return rating;
  }

  getUserRatingSummary(targetUserId) {
    const userRatings = this.ratings.filter(r => r.targetUserId === targetUserId);
    if (userRatings.length === 0) {
      return {
        targetUserId,
        averageStars: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const sum = userRatings.reduce((acc, curr) => acc + curr.stars, 0);
    const averageStars = Math.round((sum / userRatings.length) * 10) / 10;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    userRatings.forEach(r => {
      distribution[r.stars] = (distribution[r.stars] || 0) + 1;
    });

    return {
      targetUserId,
      averageStars,
      totalReviews: userRatings.length,
      distribution,
      recentComments: userRatings.slice(-5).reverse()
    };
  }
}
