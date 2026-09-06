import test from "node:test";
import assert from "node:assert/strict";
import { RatingManager, RatingType } from "../src/domain/ratingManager.js";

test("RatingManager: registra calificación de 1 a 5 estrellas y calcula promedio", () => {
  const manager = new RatingManager();

  // Alumno califica a asesor con 5 estrellas
  manager.addRating({
    sourceUserId: "usr_student_01",
    sourceRole: "STUDENT",
    targetUserId: "usr_consultant_01",
    targetRole: "CONSULTANT",
    type: RatingType.SESSION,
    stars: 5,
    comment: "Excelente apoyo metodológico"
  });

  // Otro alumno califica al mismo asesor con 4 estrellas
  manager.addRating({
    sourceUserId: "usr_student_02",
    sourceRole: "STUDENT",
    targetUserId: "usr_consultant_01",
    targetRole: "CONSULTANT",
    type: RatingType.MILESTONE,
    stars: 4,
    comment: "Muy buenas revisiones"
  });

  const summary = manager.getUserRatingSummary("usr_consultant_01");
  assert.equal(summary.totalReviews, 2);
  assert.equal(summary.averageStars, 4.5);
  assert.equal(summary.distribution[5], 1);
  assert.equal(summary.distribution[4], 1);
});

test("RatingManager: valida que las estrellas estén entre 1 y 5", () => {
  const manager = new RatingManager();

  assert.throws(() => {
    manager.addRating({
      sourceUserId: "usr_1",
      targetUserId: "usr_2",
      stars: 6
    });
  }, /entre 1 y 5 estrellas/);

  assert.throws(() => {
    manager.addRating({
      sourceUserId: "usr_1",
      targetUserId: "usr_2",
      stars: 0
    });
  }, /entre 1 y 5 estrellas/);
});
