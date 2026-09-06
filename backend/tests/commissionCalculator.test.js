import test from "node:test";
import assert from "node:assert/strict";
import { CommissionCalculator } from "../src/domain/commissionCalculator.js";

test("CommissionCalculator: aplica 15% para micropagos menores a 300 BOB", () => {
  const result = CommissionCalculator.calculate(200);
  assert.equal(result.rate, 0.15);
  assert.equal(result.ratePercentage, "15%");
  assert.equal(result.commissionAmount, 30.0);
  assert.equal(result.netAmount, 170.0);
});

test("CommissionCalculator: aplica 10% para pagos estándar de 300 BOB o más", () => {
  const result = CommissionCalculator.calculate(300);
  assert.equal(result.rate, 0.10);
  assert.equal(result.ratePercentage, "10%");
  assert.equal(result.commissionAmount, 30.0);
  assert.equal(result.netAmount, 270.0);
});

test("CommissionCalculator: aplica 10% para pagos mayores como 1200 BOB", () => {
  const result = CommissionCalculator.calculate(1200);
  assert.equal(result.rate, 0.10);
  assert.equal(result.commissionAmount, 120.0);
  assert.equal(result.netAmount, 1080.0);
});

test("CommissionCalculator: arroja error ante montos negativos o no numéricos", () => {
  assert.throws(() => CommissionCalculator.calculate(-50), /estrictamente mayor a 0/);
  assert.throws(() => CommissionCalculator.calculate(0), /estrictamente mayor a 0/);
  assert.throws(() => CommissionCalculator.calculate("invalido"), /estrictamente mayor a 0/);
});
