import test from "node:test";
import assert from "node:assert";
import { SessionService } from "../src/services/sessionService.js";
import { MongoSessionRepository, mongoMemoryStore } from "../src/db/mongo.js";

test("QA Sesiones: Generación de sala Whereby 60m efímera, Miro y auditoría en MongoDB", async () => {
  // 1. Crear sesión de videollamada colaborativa de 60 min
  const session = await SessionService.createSession({
    projectId: "prj_ses_test_01",
    milestoneId: "ms_ses_1",
    studentId: "usr_student_ses_01",
    consultantId: "usr_consultant_ses_01",
    durationMinutes: 60
  });

  assert.ok(session.id.startsWith("ses_"));
  assert.strictEqual(session.durationMinutes, 60);
  assert.ok(session.roomUrl.includes("whereby.com"));
  assert.ok(session.hostRoomUrl.includes("roomKey=host_"));
  assert.ok(session.miroEmbedUrl.includes("miro.com/app/live-embed/"));
  assert.strictEqual(session.status, "ACTIVE");

  // 2. Verificar que se almacenó en MongoDB
  const savedInMongo = await MongoSessionRepository.getSessionById(session.id);
  assert.ok(savedInMongo);
  assert.strictEqual(savedInMongo.projectId, "prj_ses_test_01");

  // 3. Finalizar sesión y persistir transcripción y acuerdos en MongoDB
  const endResult = await SessionService.endSessionAndSaveAgreements(session.id, {
    summary: "Se acordó la arquitectura CNN y métricas de F1-score.",
    agreements: [
      "Entrega del marco metodológico el lunes",
      "Ajuste de datasets y balanceo de clases"
    ],
    actionItems: ["Validar GPU disponible", "Definir split 80/20"]
  });

  assert.strictEqual(endResult.session.status, "COMPLETED");
  assert.strictEqual(endResult.transcript.agreements.length, 2);
  assert.strictEqual(endResult.transcript.agreements[0], "Entrega del marco metodológico el lunes");

  // 4. Consultar transcripción desde MongoDB
  const transcript = await MongoSessionRepository.getTranscript(session.id);
  assert.ok(transcript);
  assert.strictEqual(transcript.summary, "Se acordó la arquitectura CNN y métricas de F1-score.");
});
