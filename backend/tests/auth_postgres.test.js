import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { app } from "../src/app.js";
import { UserRepository } from "../src/db/userRepository.js";

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

test("QA Auth: Registro seguro con bcrypt, PostgreSQL y emisión de JWT", async () => {
  const payload = {
    email: "dr.valdez@postgrado.edu.bo",
    password: "PasswordSeguro2026!",
    role: "CONSULTANT",
    fullName: "Dr. Roberto Valdez",
    bio: "Doctor en Inteligencia Artificial y tutor de tesis doctorales.",
    degree: "Ph.D. en Ciencias de la Computación",
    hourlyRateBOB: 180,
    bankAccount: "BNB-BO-11223344",
    cvSummary: "Investigador principal del laboratorio de visión por computadora."
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.token, "Debe generar un token JWT.");
  assert.equal(data.user.email, payload.email);
  assert.equal(data.user.role, "CONSULTANT");
  assert.equal(data.user.hourlyRateBOB, 180);

  // Verificar que la contraseña no se expone y está hasheada
  const storedUser = await UserRepository.findByEmail(payload.email);
  assert.ok(storedUser.password_hash.startsWith("$2"), "La contraseña debe estar hasheada con bcrypt.");
  assert.notEqual(storedUser.password_hash, payload.password);
});

test("QA Auth: Login con bcrypt y verificación de credenciales", async () => {
  // 1. Login con contraseña correcta
  const successRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "dr.valdez@postgrado.edu.bo",
      password: "PasswordSeguro2026!"
    })
  });

  assert.equal(successRes.status, 200);
  const successData = await successRes.json();
  assert.ok(successData.token);
  assert.equal(successData.user.fullName, "Dr. Roberto Valdez");

  // 2. Login con contraseña errónea
  const failRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "dr.valdez@postgrado.edu.bo",
      password: "WrongPassword!"
    })
  });

  assert.equal(failRes.status, 401);
  const failData = await failRes.json();
  assert.ok(failData.error.includes("incorrecta") || failData.error.includes("inválidas"));
});

test("QA Auth: Bloqueo anti-desintermediación en CV y biografía", async () => {
  // Intento de registrar consultor con URL en el CV
  const badConsultant = {
    email: "spammer.consultor@externo.bo",
    password: "Password123!",
    role: "CONSULTANT",
    fullName: "Spammer Consultor",
    bio: "Visita mi web https://consultoriaprivada.com para contactarme",
    cvSummary: "Currículum excelente"
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(badConsultant)
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("enlaces externos"));
});

test("QA Auth: Acceso a ruta protegida /api/auth/me con JWT", async () => {
  // 1. Sin token -> 401
  const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(unauthRes.status, 401);

  // 2. Con token emitido en login previo
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "dr.valdez@postgrado.edu.bo",
      password: "PasswordSeguro2026!"
    })
  });
  const { token } = await loginRes.json();

  const authRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(authRes.status, 200);
  const me = await authRes.json();
  assert.equal(me.email, "dr.valdez@postgrado.edu.bo");
  assert.equal(me.profile.full_name, "Dr. Roberto Valdez");
  assert.equal(me.password_hash, undefined, "El hash de contraseña nunca debe exponerse.");
});
