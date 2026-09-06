import crypto from "crypto";

export const TaskStatus = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE"
};

export const MilestoneStatus = {
  PENDING_FUNDING: "PENDIENTE_PAGO",
  FUNDED: "FINANCIADO",
  IN_PROGRESS: "EN_PROGRESO",
  SUBMITTED: "ENTREGADO",
  APPROVED: "APROBADO"
};

export const ProgressAlertStatus = {
  ON_TIME: "A_TIEMPO",
  DELAYED: "RETRASADO",
  CRITICAL: "CRITICO"
};

export class ProjectKanbanManager {
  constructor() {
    this.projects = new Map();
  }

  createProject({ id, title, category, studentId, consultantId, milestones = [] }) {
    const projectId = id || `prj_${crypto.randomUUID()}`;
    const project = {
      id: projectId,
      title,
      category,
      studentId,
      consultantId,
      milestones: milestones.map((m, idx) => ({
        id: m.id || `ms_${idx + 1}`,
        title: m.title,
        amountBOB: m.amountBOB,
        durationDays: m.durationDays || 14,
        status: m.status || MilestoneStatus.PENDING_FUNDING,
        studentConformity: m.studentConformity || false,
        consultantConformity: m.consultantConformity || false,
        completedAt: null
      })),
      tasks: [],
      createdAt: new Date().toISOString()
    };

    this.projects.set(projectId, project);
    return project;
  }

  addTask(projectId, { title, milestoneId, assignedTo, dueDate, estimatedHours = 8 }) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const taskId = `tsk_${crypto.randomUUID()}`;
    const task = {
      id: taskId,
      projectId,
      milestoneId,
      title,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
      estimatedHours,
      status: TaskStatus.TODO,
      consultantFeedback: null,
      createdAt: new Date().toISOString()
    };

    project.tasks.push(task);
    return task;
  }

  moveTask(projectId, taskId, newStatus, consultantFeedback = null) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Tarea ${taskId} no encontrada.`);

    if (!Object.values(TaskStatus).includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }

    task.status = newStatus;
    if (consultantFeedback) {
      task.consultantFeedback = {
        comment: consultantFeedback,
        updatedAt: new Date().toISOString()
      };
    }
    return task;
  }

  calculateProjectProgress(projectId) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === MilestoneStatus.APPROVED).length;
    const milestoneProgressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === TaskStatus.DONE).length;
    const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Semáforo de tiempo (A_TIEMPO vs RETRASADO)
    const now = new Date();
    let delayedTasksCount = 0;

    project.tasks.forEach(task => {
      if (task.status !== TaskStatus.DONE && new Date(task.dueDate) < now) {
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

  recordMilestoneConformity(projectId, milestoneId, { actor, approved, observations = "" }) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Proyecto ${projectId} no encontrado.`);

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) throw new Error(`Hito ${milestoneId} no encontrado.`);

    if (actor === "STUDENT") {
      milestone.studentConformity = approved;
      milestone.studentObservations = observations;
    } else if (actor === "CONSULTANT") {
      milestone.consultantConformity = approved;
      milestone.consultantObservations = observations;
    } else {
      throw new Error(`Actor no reconocido: ${actor}`);
    }

    if (milestone.studentConformity && milestone.consultantConformity) {
      milestone.status = MilestoneStatus.APPROVED;
      milestone.completedAt = new Date().toISOString();
    }

    return milestone;
  }

  getProject(projectId) {
    return this.projects.get(projectId);
  }
}
