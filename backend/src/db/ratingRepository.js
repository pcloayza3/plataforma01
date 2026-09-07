import { query } from "./index.js";

export class RatingRepository {
  /**
   * Registrar una calificación en PostgreSQL
   */
  static async addRating({
    id,
    sourceUserId,
    sourceRole,
    targetUserId,
    targetRole,
    projectId = null,
    milestoneId = null,
    stars,
    comment
  }) {
    const text = `
      INSERT INTO ratings (
        id, source_user_id, source_role, target_user_id, target_role,
        project_id, milestone_id, stars, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      id, sourceUserId, sourceRole, targetUserId, targetRole,
      projectId, milestoneId, stars, comment
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Obtener resumen y promedio de un usuario
   */
  static async getUserSummary(userId) {
    const text = `
      SELECT 
        COUNT(*)::int AS total_reviews,
        COALESCE(ROUND(AVG(stars), 2), 5.0) AS average_stars,
        COALESCE(SUM(CASE WHEN stars = 5 THEN 1 ELSE 0 END), 0)::int AS five_star_count,
        COALESCE(SUM(CASE WHEN stars = 4 THEN 1 ELSE 0 END), 0)::int AS four_star_count,
        COALESCE(SUM(CASE WHEN stars = 3 THEN 1 ELSE 0 END), 0)::int AS three_star_count,
        COALESCE(SUM(CASE WHEN stars = 2 THEN 1 ELSE 0 END), 0)::int AS two_star_count,
        COALESCE(SUM(CASE WHEN stars = 1 THEN 1 ELSE 0 END), 0)::int AS one_star_count
      FROM ratings
      WHERE target_user_id = $1;
    `;
    const res = await query(text, [userId]);
    const summary = res.rows[0];

    const listText = `
      SELECT r.*, u.full_name AS reviewer_name
      FROM ratings r
      LEFT JOIN profiles u ON u.user_id = r.source_user_id
      WHERE r.target_user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 20;
    `;
    const listRes = await query(listText, [userId]);

    return {
      userId,
      average: parseFloat(summary.average_stars),
      totalReviews: summary.total_reviews,
      breakdown: {
        5: summary.five_star_count,
        4: summary.four_star_count,
        3: summary.three_star_count,
        2: summary.two_star_count,
        1: summary.one_star_count
      },
      recentReviews: listRes.rows
    };
  }
}
