import express from "express";
import { ProjectService } from "../services/projectService.js";
import { ProjectRepository } from "../db/projectRepository.js";

import { ProjectKanbanManager } from "../domain/projectKanbanManager.js";

export const projectRouter = express.Router();
export const kanbanManager = new ProjectKanbanManager();

// Inicializar proyecto demo semilla
ProjectService.seedInitialProject().catch(err => console.error("Error sembrando proyecto inicial:", err));

// 1. Listar todos los proyectos
projectRouter.get("/", async (req, res) => {
  try {
    const projects = await ProjectRepository.listAll();
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Crear proyecto con hitos
projectRouter.post("/", async (req, res) => {
  try {
    const { title, category, studentId, consultantId, milestones } = req.body;
    const project = await ProjectService.createProject({
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

// 3. Obtener detalle de proyecto con hitos y tareas
projectRouter.get("/:id", async (req, res) => {
  try {
    const project = await ProjectRepository.getProjectWithDetails(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado." });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Obtener progreso y semáforo temporal
projectRouter.get("/:id/progress", async (req, res) => {
  try {
    const progress = await ProjectService.calculateProgress(req.params.id);
    return res.json(progress);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

// 5. Agregar tarea al tablero Kanban
projectRouter.post("/:id/tasks", async (req, res) => {
  try {
    const { title, milestoneId, assignedTo, dueDate, estimatedHours } = req.body;
    const task = await ProjectService.addTask(req.params.id, {
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

// 6. Mover tarea en el tablero Kanban y registrar feedback
projectRouter.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { status, consultantFeedback } = req.body;
    const task = await ProjectService.moveTask(req.params.id, req.params.taskId, status, consultantFeedback);
    return res.json(task);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 7. Registrar conformidad cruzada de un hito
projectRouter.post("/:id/milestones/:milestoneId/conformity", async (req, res) => {
  try {
    const { actor, approved, observations } = req.body;
    const milestone = await ProjectService.recordConformity(req.params.id, req.params.milestoneId, {
      actor,
      approved,
      observations
    });
    return res.json(milestone);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
