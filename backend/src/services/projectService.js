import crypto from "crypto";
import { ProjectRepository } from "../db/projectRepository.js";

export const TaskStatus = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE"
};

export const ProgressAlertStatus = {
  ON_TIME: "A_TIEMPO",
  DELAYED: "RETRASADO",
  CRITICAL: "CRITICO"
};

export class ProjectService {
  static async createProject({ id, title, category, studentId, consultantId, milestones = [] }) {
    if (!title || !studentId || !consultantId) {
      throw new Error("Título, estudiante y consultor son requeridos.");
    }

    const projectId = id || `prj_${crypto.randomUUID()}`;
    const project = await ProjectRepository.createProject({
      id: projectId,
      title,
      category: category || "Tesis de Grado",
      studentId,
      consultantId
    });

    const createdMilestones = [];
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const mId = m.id || `ms_${crypto.randomUUID()}`;
      const createdM = await ProjectRepository.createMilestone({
        id: mId,
        projectId,
        title: m.title,
        amountBOB: m.amountBOB || m.amount_bob || 250,
        durationDays: m.durationDays || m.duration_days || 14,
        status: m.status || "PENDIENTE_PAGO"
      });
      createdMilestones.push(createdM);
    }

    return {
      ...project,
      milestones: createdMilestones,
      tasks: []
    };
  }

  static async addTask(projectId, { title, milestoneId, assignedTo, dueDate, estimatedHours = 8 }) {
    if (!title) throw new Error("Título de la tarea requerido.");

    const project = await ProjectRepository.getProjectWithDetails(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const taskId = `tsk_${crypto.randomUUID()}`;
    const validDueDate = dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString();

    return ProjectRepository.addTask({
      id: taskId,
      projectId,
      milestoneId,
      title,
      assignedTo: assignedTo || project.student_id || project.studentId,
      dueDate: validDueDate,
      estimatedHours
    });
  }

  static async moveTask(projectId, taskId, newStatus, consultantFeedback = null) {
    if (!Object.values(TaskStatus).includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }

    const task = await ProjectRepository.moveTask(taskId, newStatus, consultantFeedback);
    if (!task) throw new Error(`Tarea ${taskId} no encontrada.`);
    return task;
  }

  static async calculateProgress(projectId) {
    const project = await ProjectRepository.getProjectWithDetails(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === "APROBADO").length;
    const milestoneProgressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === "DONE").length;
    const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Semáforo temporal comparando con el reloj del sistema
    const now = new Date();
    let delayedTasksCount = 0;

    project.tasks.forEach(t => {
      if (t.status !== "DONE" && new Date(t.due_date || t.dueDate) < now) {
        delayedTasksCount++;
      }
    });

    let healthStatus = ProgressAlertStatus.ON_TIME;
    if (delayedTasksCount > 0 && delayedTasksCount <= 2) {
      healthStatus = ProgressAlertStatus.DELAYED;
    } else if (delayedTasksCount > 2) {
      healthStatus = ProgressAlertStatus.CRITICAL;
    }

    return {
      projectId,
      title: project.title,
      totalMilestones,
      completedMilestones,
      milestoneProgressPercent,
      totalTasks,
      completedTasks,
      taskProgressPercent,
      delayedTasksCount,
      healthStatus,
      isDelayed: delayedTasksCount > 0
    };
  }

  static async recordConformity(projectId, milestoneId, { actor, approved, observations = "" }) {
    if (!["STUDENT", "CONSULTANT"].includes(actor)) {
      throw new Error(`Actor no válido: ${actor}`);
    }

    const updatedMilestone = await ProjectRepository.updateMilestoneConformity(milestoneId, {
      studentConformity: approved,
      consultantConformity: approved,
      observations,
      actor
    });

    return updatedMilestone;
  }

  static async seedInitialProject() {
    const existing = await ProjectRepository.getProjectWithDetails("prj_tesis_ia_01");
    if (existing) return;

    const project = await this.createProject({
      id: "prj_tesis_ia_01",
      title: "Sistema Predictivo de Diagnóstico Médico Asistido por IA",
      category: "Tesis de Pregrado / Informática",
      studentId: "usr_student_01",
      consultantId: "usr_consultant_01",
      milestones: [
        { id: "ms_1", title: "Hito 1: Marco Teórico y Estado del Arte", amountBOB: 250, durationDays: 14, status: "APROBADO" },
        { id: "ms_2", title: "Hito 2: Arquitectura del Modelo y Preprocesamiento de Datos", amountBOB: 350, durationDays: 14, status: "EN_PROGRESO" },
        { id: "ms_3", title: "Hito 3: Entrenamiento, Métricas y Validación Experimental", amountBOB: 400, durationDays: 21, status: "PENDIENTE_PAGO" },
        { id: "ms_4", title: "Hito 4: Redacción del Documento Final y Defensa Simulada", amountBOB: 300, durationDays: 14, status: "PENDIENTE_PAGO" }
      ]
    });

    // Agregar tareas iniciales
    const t1 = await this.addTask("prj_tesis_ia_01", {
      title: "Revisión bibliográfica IEEE / PubMed sobre CNNs",
      milestoneId: "ms_1",
      dueDate: new Date(Date.now() - 5 * 86400000).toISOString()
    });
    await this.moveTask("prj_tesis_ia_01", t1.id, "DONE", "Excelente síntesis de artículos.");

    await this.addTask("prj_tesis_ia_01", {
      title: "Pipeline de limpieza y normalización de imágenes DICOM",
      milestoneId: "ms_2",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString()
    });

    await this.addTask("prj_tesis_ia_01", {
      title: "Ajuste de hiperparámetros ResNet-50",
      milestoneId: "ms_2",
      dueDate: new Date(Date.now() + 8 * 86400000).toISOString()
    });
  }
}
