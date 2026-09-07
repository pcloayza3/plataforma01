import test from "node:test";
import assert from "node:assert";
import { PaymentService } from "../src/services/paymentService.js";
import { ProjectRepository } from "../src/db/projectRepository.js";
import { UserRepository } from "../src/db/userRepository.js";

test("QA Finanzas: Registro de pago en custodia interna de la plataforma y comisiones", async () => {
  // 1. Asegurar usuarios y proyecto en PostgreSQL
  await UserRepository.create({
    id: "usr_student_fin_01",
    email: "student.fin@test.bo",
    passwordHash: "hash123",
    role: "STUDENT"
  });
  await UserRepository.createProfile({
    userId: "usr_student_fin_01",
    fullName: "Estudiante Finanzas"
  });

  await UserRepository.create({
    id: "usr_consultant_fin_01",
    email: "consultant.fin@test.bo",
    passwordHash: "hash123",
    role: "CONSULTANT"
  });
  await UserRepository.createProfile({
    userId: "usr_consultant_fin_01",
    fullName: "Consultor Finanzas"
  });

  await ProjectRepository.createProject({
    id: "prj_fin_01",
    title: "Proyecto Prueba Finanzas",
    category: "Ingeniería",
    studentId: "usr_student_fin_01",
    consultantId: "usr_consultant_fin_01",
    milestones: [
      { id: "ms_fin_1", title: "Hito 1", amountBOB: 200, durationDays: 7 },
      { id: "ms_fin_2", title: "Hito 2", amountBOB: 500, durationDays: 14 }
    ]
  });

  // 2. Micropago (< 300 BOB) -> aplica 15% de comisión
  const payment1 = await PaymentService.registerPaymentAndHold({
    projectId: "prj_fin_01",
    milestoneId: "ms_fin_1",
    studentId: "usr_student_fin_01",
    consultantId: "usr_consultant_fin_01",
    amountBOB: 200,
    paymentMethod: "QR_SIMPLE"
  });

  assert.strictEqual(payment1.grossAmount, 200);
  assert.strictEqual(payment1.ratePercentage, "15%");
  assert.strictEqual(payment1.commissionAmount, 30);
  assert.strictEqual(payment1.netAmount, 170);
  assert.strictEqual(payment1.status, "EN_CUSTODIA_PLATAFORMA");

  // 3. Pago estándar (>= 300 BOB) -> aplica 10% de comisión
  const payment2 = await PaymentService.registerPaymentAndHold({
    projectId: "prj_fin_01",
    milestoneId: "ms_fin_2",
    studentId: "usr_student_fin_01",
    consultantId: "usr_consultant_fin_01",
    amountBOB: 500,
    paymentMethod: "TARJETA"
  });

  assert.strictEqual(payment2.grossAmount, 500);
  assert.strictEqual(payment2.ratePercentage, "10%");
  assert.strictEqual(payment2.commissionAmount, 50);
  assert.strictEqual(payment2.netAmount, 450);
  assert.strictEqual(payment2.status, "EN_CUSTODIA_PLATAFORMA");

  // 4. Liquidación al Consultor tras aprobación
  const release = await PaymentService.releaseHeldFunds(
    payment2.id,
    "BNB-BO-987654321",
    "prj_fin_01",
    "ms_fin_2"
  );

  assert.strictEqual(release.status, "LIQUIDADO_AL_CONSULTOR");
  assert.strictEqual(release.netAmount, 450);
  assert.strictEqual(release.consultantAccount, "BNB-BO-987654321");
});
