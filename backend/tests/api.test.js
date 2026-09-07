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

test("API: GET /health retorna status ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");
  assert.equal(data.service, "thesisbridge-backend");
});

test("API: POST /api/auth/register valida política anti-desintermediación", async () => {
  const badUser = {
    name: "Hacker Spammer",
    email: "spammer@gmail.com",
    role: "CONSULTANT",
    bio: "Contáctame por fuera en https://sitioexterno.com o al 71234567"
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(badUser)
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("enlaces externos") || data.error.includes("correos"));
});

test("API: POST /api/escrow/deposit y liberación con dLocal", async () => {
  // 1. Depósito en custodia
  const depositRes = await fetch(`${baseUrl}/api/escrow/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: "prj_tesis_ia_01",
      milestoneId: "ms_3",
      studentId: "usr_student_01",
      consultantId: "usr_consultant_01",
      amountBOB: 400,
      paymentOption: "MILESTONE"
    })
  });

  assert.equal(depositRes.status, 201);
  const depositData = await depositRes.json();
  const escrowId = depositData.escrow.id;
  assert.equal(depositData.escrow.status, "EN_CUSTODIA");
  assert.equal(depositData.escrow.grossAmount, 400);
  assert.equal(depositData.escrow.commissionAmount, 40); // 10%
  assert.equal(depositData.escrow.netAmount, 360);

  // 2. Liberación tras aprobación
  const releaseRes = await fetch(`${baseUrl}/api/escrow/${escrowId}/approve-payout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultantBankAccount: "BNB-BO-99887766",
      projectId: "prj_tesis_ia_01",
      milestoneId: "ms_3"
    })
  });

  assert.equal(releaseRes.status, 200);
  const releaseData = await releaseRes.json();
  assert.equal(releaseData.escrow.status, "LIQUIDADO_AL_CONSULTOR");
});

test("API: GET /api/projects/:id/progress retorna semáforo y porcentajes", async () => {
  const res = await fetch(`${baseUrl}/api/projects/prj_tesis_ia_01/progress`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.milestoneProgressPercent >= 0);
  assert.ok(data.taskProgressPercent >= 0);
  assert.ok(["A_TIEMPO", "RETRASADO", "CRITICO"].includes(data.healthStatus));
});

test("API: POST /api/ratings registra calificación y actualiza promedio", async () => {
  const res = await fetch(`${baseUrl}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceUserId: "usr_student_01",
      sourceRole: "STUDENT",
      targetUserId: "usr_consultant_01",
      targetRole: "CONSULTANT",
      stars: 5,
      comment: "Asesor muy puntual y claro."
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.rating.stars, 5);

  const summaryRes = await fetch(`${baseUrl}/api/ratings/user/usr_consultant_01`);
  const summary = await summaryRes.json();
  assert.ok(summary.totalReviews >= 1);
  assert.ok(summary.averageStars >= 4);
});
