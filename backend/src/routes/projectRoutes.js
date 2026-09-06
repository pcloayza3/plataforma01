import express from "express";
import { ProjectKanbanManager, MilestoneStatus } from "../domain/projectKanbanManager.js";

export const projectRouter = express.Router();
export const kanbanManager = new ProjectKanbanManager();

// Seed de un proyecto inicial para pruebas y demostración
kanbanManager.createProject({
  id: "prj_tesis_ia_01",
  title: "Sistema Predictivo de Diagnóstico Médico Asistido por IA",
  category: "Tesis de Pregrado / Informática",
  studentId: "usr_student_01",
  consultantId: "usr_consultant_01",
  milestones: [
    { id: "ms_1", title: "Hito 1: Marco Teórico y Estado del Arte", amountBOB: 250, durationDays: 14, status: MilestoneStatus.APPROVED, studentConformity: true, consultantConformity: true },
    { id: "ms_2", title: "Hito 2: Arquitectura del Modelo y Preprocesamiento de Datos", amountBOB: 350, durationDays: 14, status: MilestoneStatus.IN_PROGRESS, studentConformity: false, consultantConformity: false },
    { id: "ms_3", title: "Hito 3: Entrenamiento, Métricas y Validación Experimental", amountBOB: 400, durationDays: 21, status: MilestoneStatus.PENDING_FUNDING, studentConformity: false, consultantConformity: false },
    { id: "ms_4", title: "Hito 4: Redacción del Documento Final y Defensa Simulada", amountBOB: 300, durationDays: 14, status: MilestoneStatus.PENDING_FUNDING, studentConformity: false, consultantConformity: false }
  ]
});

// Sembrar tareas iniciales
kanbanManager.addTask("prj_tesis_ia_01", {
  title: "Revisión bibliográfica IEEE / PubMed sobre CNNs",
  milestoneId: "ms_1",
  assignedTo: "usr_student_01",
  dueDate: new Date(Date.now() - 5 * 86400000).toISOString()
});
// Marcar primera tarea como DONE
const t1 = kanbanManager.getProject("prj_tesis_ia_01").tasks[0];
if (t1) kanbanManager.moveTask("prj_tesis_ia_01", t1.id, "DONE", "Excelente síntesis de artículos.");

kanbanManager.addTask("prj_tesis_ia_01", {
  title: "Pipeline de limpieza y normalización de imágenes DICOM",
  milestoneId: "ms_2",
  assignedTo: "usr_student_01",
  dueDate: new Date(Date.now() + 3 * 86400000).toISOString()
});

kanbanManager.addTask("prj_tesis_ia_01", {
  title: "Ajuste de hiperparámetros ResNet-50",
  milestoneId: "ms_2",
  assignedTo: "usr_student_01",
  dueDate: new Date(Date.now() + 8 * 86400000).toISOString()
});

// Endpoints
projectRouter.get("/", (req, res) => {
  const projects = Array.from(kanbanManager.projects.values());
  res.json(projects);
});

projectRouter.post("/", (req, res) => {
  try {
    const { title, category, studentId, consultantId, milestones } = req.body;
    if (!title || !studentId || !consultantId) {
      return res.status(400).json({ error: "Título, estudiante y consultor son requeridos." });
    }

    const project = kanbanManager.createProject({
      title,
      category,
      studentId,
      consultantId,
      milestones
    });
    return res.status(201).json(project);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

projectRouter.get("/:id", (req, res) => {
  const project = kanbanManager.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: "Proyecto no encontrado." });
  return res.json(project);
});

projectRouter.get("/:id/progress", (req, res) => {
  try {
    const progress = kanbanManager.calculateProjectProgress(req.params.id);
    return res.json(progress);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

projectRouter.post("/:id/tasks", (req, res) => {
  try {
    const { title, milestoneId, assignedTo, dueDate, estimatedHours } = req.body;
    if (!title) return res.status(400).json({ error: "Título de la tarea requerido." });

    const task = kanbanManager.addTask(req.params.id, {
      title,
      milestoneId,
      assignedTo,
      dueDate,
      estimatedHours
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

projectRouter.put("/:id/tasks/:taskId", (req, res) => {
  try {
    const { status, consultantFeedback } = req.body;
    const task = kanbanManager.moveTask(req.params.id, req.params.taskId, status, consultantFeedback);
    return res.json(task);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

projectRouter.post("/:id/milestones/:milestoneId/conformity", (req, res) => {
  try {
    const { actor, approved, observations } = req.body;
    const milestone = kanbanManager.recordMilestoneConformity(req.params.id, req.params.milestoneId, {
      actor,
      approved,
      observations
    });
    return res.json(milestone);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
