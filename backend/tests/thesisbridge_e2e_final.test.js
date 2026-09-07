import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { app } from "../src/app.js";
import { UserRepository } from "../src/db/userRepository.js";
import { ProjectRepository } from "../src/db/projectRepository.js";
import { PaymentService } from "../src/services/paymentService.js";
import { SessionService } from "../src/services/sessionService.js";
import { RatingService } from "../src/services/ratingService.js";
import { R2StorageAdapter } from "../src/adapters/r2StorageAdapter.js";

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test("ThesisBridge E2E Master: Ciclo Completo de Producción (Auth -> Kanban -> Pagos en Custodia -> Whereby 60m/Miro -> Entregable R2 -> Calificación 5⭐)", async () => {
  // 1. Healthcheck ThesisBridge
  const healthRes = await fetch(`${baseUrl}/health`);
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.service, "thesisbridge-backend");

  // 2. Registro seguro de Estudiante y Consultor con Bcrypt y Anti-Link
  const regConsultant = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Dra. Patricia Arnez",
      email: "patricia.arnez@thesisbridge.bo",
      password: "PasswordSeguro2026!",
      role: "CONSULTANT",
      bio: "Doctora en Ciencias Computacionales e Inteligencia Artificial",
      cvSummary: "Especialista en Visión por Computadora y Deep Learning",
      hourlyRateBOB: 180
    })
  });
  assert.equal(regConsultant.status, 201);
  const cData = await regConsultant.json();
  const consultantId = cData.user.id;

  const regStudent = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Rodrigo Morales",
      email: "rodrigo.m@estudiante.bo",
      password: "PasswordSeguro2026!",
      role: "STUDENT",
      bio: "Estudiante de Grado en Ingeniería de Sistemas"
    })
  });
  assert.equal(regStudent.status, 201);
  const sData = await regStudent.json();
  const studentId = sData.user.id;

  // 3. Creación de Proyecto de Grado con Hitos
  const projectId = `prj_tb_${Date.now()}`;
  const milestone1Id = `ms_tb_1_${Date.now()}`;
  const milestone2Id = `ms_tb_2_${Date.now()}`;

  const prj = await ProjectRepository.createProject({
    id: projectId,
    title: "Tesis: Diagnóstico Temprano de Retinopatía mediante Redes Neuronales",
    category: "Ingeniería Biomédica / IA",
    studentId,
    consultantId,
    milestones: [
      { id: milestone1Id, title: "Hito 1: Estado del Arte y Preprocesamiento", amountBOB: 400, durationDays: 14 },
      { id: milestone2Id, title: "Hito 2: Entrenamiento y Validación", amountBOB: 600, durationDays: 21 }
    ]
  });
  assert.equal(prj.id, projectId);

  // 4. Tablero Kanban: Crear Tareas y Mover a DONE
  const taskId = `tsk_tb_${Date.now()}`;
  const task = await ProjectRepository.addTask({
    id: taskId,
    projectId,
    milestoneId: milestone1Id,
    title: "Normalización de imágenes de fondo de ojo",
    assignedTo: studentId,
    dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
  });
  assert.equal(task.status, "TODO");

  const moved = await ProjectRepository.moveTask(taskId, "DONE", "Pipeline validado con éxito.");
  assert.equal(moved.status, "DONE");

  // 5. Motor Financiero de la Plataforma: Pago anticipado por Hito (400 BOB -> Comisión 10%)
  const payIn = await PaymentService.registerPaymentAndHold({
    projectId,
    milestoneId: milestone1Id,
    studentId,
    consultantId,
    amountBOB: 400,
    paymentMethod: "QR_SIMPLE"
  });
  assert.equal(payIn.grossAmount, 400);
  assert.equal(payIn.ratePercentage, "10%");
  assert.equal(payIn.commissionAmount, 40);
  assert.equal(payIn.netAmount, 360);
  assert.equal(payIn.status, "EN_CUSTODIA_PLATAFORMA");

  // 6. Colaboración en Vivo: Sala Whereby 60m + Miro + Registro en MongoDB
  const session = await SessionService.createSession({
    projectId,
    milestoneId: milestone1Id,
    studentId,
    consultantId,
    durationMinutes: 60
  });
  assert.equal(session.durationMinutes, 60);
  assert.ok(session.roomUrl.includes("whereby.com"));

  const sessionEnd = await SessionService.endSessionAndSaveAgreements(session.id, {
    summary: "Se acordó la entrega del informe del Hito 1 en formato PDF.",
    agreements: ["Revisar informe de resultados el viernes"]
  });
  assert.equal(sessionEnd.session.status, "COMPLETED");

  // 7. Repositorio Documental R2: Generación de URL y Registro de Metadatos
  const r2 = new R2StorageAdapter();
  const presigned = r2.generateUploadUrl({
    fileName: "Informe_Hito1_Retinopatia.pdf",
    fileSizeBytes: 6 * 1024 * 1024,
    contentType: "application/pdf"
  });
  assert.ok(presigned.uploadUrl.includes("X-Amz-Expires=3600"));

  // 8. Aprobación Mutua del Hito y Liquidación Directa al Consultor
  const payout = await PaymentService.releaseHeldFunds(
    payIn.id,
    "BNB-BO-1122334455",
    projectId,
    milestone1Id
  );
  assert.equal(payout.status, "LIQUIDADO_AL_CONSULTOR");
  assert.equal(payout.netAmount, 360);

  // 9. Calificación Multilateral Obligatoria con Estrellas (5⭐)
  const rating = await RatingService.recordRating({
    sourceUserId: studentId,
    sourceRole: "STUDENT",
    targetUserId: consultantId,
    targetRole: "CONSULTANT",
    projectId,
    milestoneId: milestone1Id,
    stars: 5,
    comment: "Excelente dirección en la selección del modelo convolucional."
  });
  assert.equal(rating.stars, 5);

  const reputation = await RatingService.getSummary(consultantId);
  assert.ok(reputation.averageStars >= 4.5);
  assert.ok(reputation.totalReviews >= 1);
});
