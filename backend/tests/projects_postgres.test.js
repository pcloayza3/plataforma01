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

test("QA Projects: Creación de proyecto con hitos en PostgreSQL", async () => {
  const newProject = {
    title: "Diseño de Algoritmos Cuánticos para Criptoanálisis",
    category: "Tesis Doctoral / Física Teórica",
    studentId: "usr_student_01",
    consultantId: "usr_consultant_01",
    milestones: [
      { title: "Hito 1: Formalización Matemática del Espacio de Hilbert", amountBOB: 400, durationDays: 20 },
      { title: "Hito 2: Simulación Cuántica en Qiskit", amountBOB: 600, durationDays: 30 }
    ]
  };

  const res = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProject)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.id.startsWith("prj_"));
  assert.equal(data.milestones.length, 2);
  assert.equal(data.milestones[0].amount_bob, 400);
});

test("QA Projects: Tablero Kanban - Agregar, mover y registrar feedback del consultor", async () => {
  // 1. Crear tarea en el proyecto
  const taskRes = await fetch(`${baseUrl}/api/projects/prj_tesis_ia_01/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Análisis comparativo de curvas ROC en diagnóstico médico",
      milestoneId: "ms_2",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      estimatedHours: 12
    })
  });

  assert.equal(taskRes.status, 201);
  const task = await taskRes.json();
  assert.equal(task.status, "TODO");

  // 2. Mover a IN_PROGRESS
  const moveRes = await fetch(`${baseUrl}/api/projects/prj_tesis_ia_01/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "IN_PROGRESS",
      consultantFeedback: "Inicia con la biblioteca Scikit-learn."
    })
  });

  assert.equal(moveRes.status, 200);
  const updatedTask = await moveRes.json();
  assert.equal(updatedTask.status, "IN_PROGRESS");
  assert.ok(updatedTask.consultant_feedback?.comment.includes("Scikit-learn"));
});

test("QA Projects: Detección y activación del semáforo temporal de retrasos", async () => {
  // 1. Crear proyecto para prueba de semáforo
  const projRes = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Proyecto Prueba Semáforo",
      category: "Prueba QA",
      studentId: "usr_student_01",
      consultantId: "usr_consultant_01",
      milestones: [{ title: "Hito Único", amountBOB: 200 }]
    })
  });
  const proj = await projRes.json();

  // 2. Agregar una tarea con fecha de entrega vencida en el pasado
  await fetch(`${baseUrl}/api/projects/${proj.id}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Tarea Vencida de Prueba",
      dueDate: new Date(Date.now() - 3 * 86400000).toISOString() // Venció hace 3 días
    })
  });

  // 3. Consultar progreso y verificar semáforo RETRASADO
  const progRes = await fetch(`${baseUrl}/api/projects/${proj.id}/progress`);
  assert.equal(progRes.status, 200);
  const progress = await progRes.json();
  assert.equal(progress.delayedTasksCount, 1);
  assert.equal(progress.healthStatus, "RETRASADO");
  assert.equal(progress.isDelayed, true);
});

test("QA Projects: Conformidad cruzada obligatoria para aprobar hito", async () => {
  // Estudiante aprueba hito
  const stRes = await fetch(`${baseUrl}/api/projects/prj_tesis_ia_01/milestones/ms_2/conformity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actor: "STUDENT",
      approved: true,
      observations: "Excelente avance técnico."
    })
  });
  assert.equal(stRes.status, 200);
  const m = await stRes.json();
  assert.equal(m.student_conformity, true);
});
