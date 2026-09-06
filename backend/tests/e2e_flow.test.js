import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { app } from "../src/app.js";

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

test("QA E2E: Ciclo Completo del Estudiante y Consultor con Custodia Escrow y Whereby", async () => {
  // 1. Registro de Consultor
  const regConsultant = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dra. Elena Vargas",
      email: "elena.vargas@academico.bo",
      role: "CONSULTANT",
      bio: "Doctora en Biotecnología y asesora de tesis de maestría",
      degree: "Ph.D. en Biología Molecular",
      hourlyRateBOB: 150,
      bankAccount: "BISA-BO-55443322"
    })
  });
  assert.equal(regConsultant.status, 201);
  const consultantData = await regConsultant.json();
  const consultantId = consultantData.user.id;

  // 2. Registro de Estudiante
  const regStudent = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Marcos Quispe",
      email: "marcos.q@estudiante.bo",
      role: "STUDENT",
      bio: "Tesista en Bioquímica y Farmacia"
    })
  });
  assert.equal(regStudent.status, 201);
  const studentData = await regStudent.json();
  const studentId = studentData.user.id;

  // 3. Creación de Proyecto por Hitos
  const projRes = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Extracción de Biopolímeros de Flora Altoandina",
      category: "Tesis de Maestría",
      studentId,
      consultantId,
      milestones: [
        { id: "ms_bio_1", title: "Protocolo de Laboratorio", amountBOB: 280, durationDays: 14 },
        { id: "ms_bio_2", title: "Cromatografía y Análisis Estadístico", amountBOB: 500, durationDays: 21 }
      ]
    })
  });
  assert.equal(projRes.status, 201);
  const proj = await projRes.json();
  const projectId = proj.id;

  // 4. Pago por Adelantado en Custodia Escrow (Hito 1: 280 BOB -> Micropago 15%)
  const escrowRes = await fetch(`${baseUrl}/api/escrow/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId,
      milestoneId: "ms_bio_1",
      studentId,
      consultantId,
      amountBOB: 280,
      paymentOption: "MILESTONE",
      paymentMethod: "QR_SIMPLE"
    })
  });
  assert.equal(escrowRes.status, 201);
  const escrowData = await escrowRes.json();
  assert.equal(escrowData.escrow.status, "EN_CUSTODIA");
  assert.equal(escrowData.escrow.ratePercentage, "15%"); // Micropago < 300 BOB
  assert.equal(escrowData.escrow.commissionAmount, 42.0);
  assert.equal(escrowData.escrow.netAmount, 238.0);
  const escrowId = escrowData.escrow.id;

  // 5. Creación de Videollamada Whereby de 60m con Miro Live Embed
  const sessionRes = await fetch(`${baseUrl}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId,
      milestoneId: "ms_bio_1",
      studentId,
      consultantId,
      miroBoardId: "miro_bio_lab_01",
      durationMinutes: 60
    })
  });
  assert.equal(sessionRes.status, 201);
  const session = await sessionRes.json();
  assert.ok(session.roomUrl.includes("whereby.com"));
  assert.ok(session.miroEmbedUrl.includes("miro.com"));
  assert.equal(session.durationMinutes, 60);

  // 6. Finalizar Videollamada y procesar resumen de IA
  const endSessionRes = await fetch(`${baseUrl}/api/sessions/${session.id}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: "Se definió la curva de calibración espectrofotométrica y la fecha del Hito 1."
    })
  });
  assert.equal(endSessionRes.status, 200);
  const endedSession = await endSessionRes.json();
  assert.equal(endedSession.session.status, "COMPLETED");
  assert.ok(endedSession.session.transcript.summary.includes("calibración"));

  // 7. Registro de Calificación Multilateral (5 estrellas)
  const ratingRes = await fetch(`${baseUrl}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceUserId: studentId,
      sourceRole: "STUDENT",
      targetUserId: consultantId,
      targetRole: "CONSULTANT",
      stars: 5,
      comment: "Excelente apoyo en el diseño experimental del laboratorio."
    })
  });
  assert.equal(ratingRes.status, 201);

  // 8. Tareas Kanban y avance
  const taskRes = await fetch(`${baseUrl}/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Redacción del informe de laboratorio Hito 1",
      milestoneId: "ms_bio_1",
      assignedTo: studentId
    })
  });
  assert.equal(taskRes.status, 201);
  const task = await taskRes.json();

  // Mover a DONE
  await fetch(`${baseUrl}/api/projects/${projectId}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "DONE",
      consultantFeedback: "Informe aprobado con felicitaciones."
    })
  });

  // 9. Aprobación del Hito y Dispersión (Payout dLocal)
  const releaseRes = await fetch(`${baseUrl}/api/escrow/${escrowId}/approve-payout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultantBankAccount: "BISA-BO-55443322",
      projectId,
      milestoneId: "ms_bio_1"
    })
  });
  assert.equal(releaseRes.status, 200);
  const release = await releaseRes.json();
  assert.equal(release.escrow.status, "LIQUIDADO_AL_CONSULTOR");
  assert.equal(release.escrow.payoutDetails.amount, 238.0);
  assert.equal(release.escrow.payoutDetails.status, "COMPLETED");

  // 10. Verificación del semáforo y progreso del proyecto
  const progressRes = await fetch(`${baseUrl}/api/projects/${projectId}/progress`);
  assert.equal(progressRes.status, 200);
  const progress = await progressRes.json();
  assert.equal(progress.completedTasks, 1);
  assert.equal(progress.taskProgressPercent, 100);
  assert.equal(progress.healthStatus, "A_TIEMPO");
  assert.equal(progress.isDelayed, false);
});
