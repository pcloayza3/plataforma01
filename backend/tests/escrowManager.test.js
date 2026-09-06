import test from "node:test";
import assert from "node:assert/strict";
import { EscrowManager, EscrowStatus } from "../src/domain/escrowManager.js";
import { DLocalAdapter } from "../src/adapters/dLocalAdapter.js";

test("EscrowManager: flujo completo de custodia y dispersión", () => {
  const dlocal = new DLocalAdapter();
  const manager = new EscrowManager(dlocal);

  // 1. Crear custodia para un hito de 350 BOB
  const escrow = manager.createEscrow({
    milestoneId: "ms_2",
    studentId: "usr_student_01",
    consultantId: "usr_consultant_01",
    amountBOB: 350
  });

  assert.equal(escrow.status, EscrowStatus.PENDING_PAYMENT);
  assert.equal(escrow.grossAmount, 350);
  assert.equal(escrow.commissionAmount, 35); // 10%
  assert.equal(escrow.netAmount, 315);

  // 2. Confirmar pago (fondos entran a custodia resguardada)
  const funded = manager.confirmPayment(escrow.id);
  assert.equal(funded.status, EscrowStatus.IN_ESCROW);
  assert.ok(funded.fundedAt);

  // 3. Aprobar y liberar fondos al consultor
  const released = manager.approveAndRelease(escrow.id, "BISA-BO-12345678");
  assert.equal(released.status, EscrowStatus.DISPERSED);
  assert.ok(released.dispersedAt);
  assert.equal(released.payoutDetails.status, "COMPLETED");
  assert.equal(released.payoutDetails.amount, 315);
});

test("EscrowManager: no permite liberar fondos si no están en custodia", () => {
  const dlocal = new DLocalAdapter();
  const manager = new EscrowManager(dlocal);

  const escrow = manager.createEscrow({
    milestoneId: "ms_1",
    studentId: "usr_student_01",
    consultantId: "usr_consultant_01",
    amountBOB: 200
  });

  assert.throws(() => {
    manager.approveAndRelease(escrow.id, "BNB-BO-00000000");
  }, /No se pueden liberar fondos que no estén resguardados/);
});
