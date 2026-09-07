import test from "node:test";
import assert from "node:assert";
import { RatingService } from "../src/services/ratingService.js";
import { R2StorageAdapter } from "../src/adapters/r2StorageAdapter.js";
import { DocumentRepository } from "../src/db/documentRepository.js";
import { UserRepository } from "../src/db/userRepository.js";

test("QA Calificaciones: Registro de estrellas (1..5) y promedios en PostgreSQL", async () => {
  await UserRepository.create({
    id: "usr_student_rat_01",
    email: "student.rat@test.bo",
    passwordHash: "hash123",
    role: "STUDENT"
  });
  await UserRepository.createProfile({
    userId: "usr_student_rat_01",
    fullName: "Estudiante Calificador"
  });

  await UserRepository.create({
    id: "usr_consultant_rat_01",
    email: "consultant.rat@test.bo",
    passwordHash: "hash123",
    role: "CONSULTANT"
  });
  await UserRepository.createProfile({
    userId: "usr_consultant_rat_01",
    fullName: "Dr. Consultor Evaluado"
  });

  // 1. Registrar calificación válida (5 estrellas)
  const rating1 = await RatingService.recordRating({
    sourceUserId: "usr_student_rat_01",
    sourceRole: "STUDENT",
    targetUserId: "usr_consultant_rat_01",
    targetRole: "CONSULTANT",
    stars: 5,
    comment: "Excelente consultoría y acompañamiento metodológico."
  });

  assert.strictEqual(rating1.stars, 5);
  assert.strictEqual(rating1.targetUserId, "usr_consultant_rat_01");

  // 2. Registrar calificación de 4 estrellas
  await RatingService.recordRating({
    sourceUserId: "usr_student_rat_01",
    sourceRole: "STUDENT",
    targetUserId: "usr_consultant_rat_01",
    targetRole: "CONSULTANT",
    stars: 4,
    comment: "Muy buena sesión técnica."
  });

  // 3. Validar rechazo de estrellas fuera de rango (<1 o >5)
  await assert.rejects(
    async () => {
      await RatingService.recordRating({
        sourceUserId: "usr_student_rat_01",
        targetUserId: "usr_consultant_rat_01",
        stars: 6
      });
    },
    /debe ser un número entero entre 1 y 5 estrellas/
  );

  // 4. Consultar resumen de reputación
  const summary = await RatingService.getSummary("usr_consultant_rat_01");
  assert.ok(summary.totalReviews >= 2);
  assert.ok(summary.average >= 4.0 && summary.average <= 5.0);
});

test("QA Almacenamiento R2: URLs prefirmadas, validación de formatos y límite 25 MB", async () => {
  const r2 = new R2StorageAdapter();

  // 1. Archivo válido PDF de 5 MB
  const validUpload = r2.generateUploadUrl({
    fileName: "Entregable_Hito1_Final.pdf",
    fileSizeBytes: 5 * 1024 * 1024,
    contentType: "application/pdf"
  });

  assert.ok(validUpload.uploadUrl.includes("X-Amz-Expires=3600"));
  assert.ok(validUpload.publicDownloadUrl.includes("Entregable_Hito1_Final.pdf"));
  assert.strictEqual(validUpload.expiresInSeconds, 3600);

  // 2. Rechazar archivo que supera los 25 MB
  assert.throws(
    () => {
      r2.generateUploadUrl({
        fileName: "VideoPesado.pdf",
        fileSizeBytes: 26 * 1024 * 1024,
        contentType: "application/pdf"
      });
    },
    /supera el límite de 25 MB/
  );

  // 3. Rechazar extensión no permitida (.exe)
  assert.throws(
    () => {
      r2.generateUploadUrl({
        fileName: "ScriptPeligroso.exe",
        fileSizeBytes: 1024 * 1024,
        contentType: "application/x-msdownload"
      });
    },
    /no permitida/
  );
});
