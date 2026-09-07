import { query, isDbConnected } from "./index.js";

// Fallback in-memory para aislamiento en tests
export const projectMemoryDb = {
  projects: new Map(),
  milestones: new Map(),
  tasks: new Map()
};

export class ProjectRepository {
  static async createProject({ id, title, category, studentId, consultantId }) {
    const project = {
      id,
      title,
      category,
      student_id: studentId,
      consultant_id: consultantId,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO projects (id, title, category, student_id, consultant_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [project.id, project.title, project.category, project.student_id, project.consultant_id, project.status, project.created_at, project.updated_at]
        );
      } catch (err) {
        console.error("[ProjectRepository] Error insertando proyecto en PostgreSQL:", err);
      }
    }

    projectMemoryDb.projects.set(project.id, project);
    return project;
  }

  static async createMilestone({ id, projectId, title, amountBOB, durationDays = 14, status = "PENDIENTE_PAGO" }) {
    const milestone = {
      id,
      project_id: projectId,
      title,
      amount_bob: Number(amountBOB),
      duration_days: Number(durationDays),
      status,
      student_conformity: false,
      consultant_conformity: false,
      student_observations: "",
      consultant_observations: "",
      completed_at: null,
      created_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO milestones (id, project_id, title, amount_bob, duration_days, status, student_conformity, consultant_conformity, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [milestone.id, milestone.project_id, milestone.title, milestone.amount_bob, milestone.duration_days, milestone.status, milestone.student_conformity, milestone.consultant_conformity, milestone.created_at]
        );
      } catch (err) {
        console.error("[ProjectRepository] Error insertando hito en PostgreSQL:", err);
      }
    }

    projectMemoryDb.milestones.set(milestone.id, milestone);
    return milestone;
  }

  static async addTask({ id, projectId, milestoneId, title, assignedTo, dueDate, estimatedHours = 8 }) {
    const task = {
      id,
      project_id: projectId,
      milestone_id: milestoneId || null,
      title,
      assigned_to: assignedTo,
      status: "TODO",
      due_date: new Date(dueDate).toISOString(),
      estimated_hours: Number(estimatedHours),
      consultant_feedback: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO kanban_tasks (id, project_id, milestone_id, title, assigned_to, status, due_date, estimated_hours, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [task.id, task.project_id, task.milestone_id, task.title, task.assigned_to, task.status, task.due_date, task.estimated_hours, task.created_at, task.updated_at]
        );
      } catch (err) {
        console.error("[ProjectRepository] Error insertando tarea en PostgreSQL:", err);
      }
    }

    projectMemoryDb.tasks.set(task.id, task);
    return task;
  }

  static async moveTask(taskId, newStatus, consultantFeedback = null) {
    let task = null;
    const now = new Date().toISOString();

    if (isDbConnected()) {
      try {
        const feedbackJson = consultantFeedback ? JSON.stringify({ comment: consultantFeedback, updatedAt: now }) : null;
        const res = await query(
          `UPDATE kanban_tasks 
           SET status = $1, consultant_feedback = COALESCE($2, consultant_feedback), updated_at = $3 
           WHERE id = $4 
           RETURNING *`,
          [newStatus, feedbackJson, now, taskId]
        );
        if (res && res.rows.length > 0) task = res.rows[0];
      } catch (err) {
        console.error("[ProjectRepository] Error actualizando tarea en PostgreSQL:", err);
      }
    }

    if (!task) {
      task = projectMemoryDb.tasks.get(taskId);
      if (task) {
        task.status = newStatus;
        if (consultantFeedback) {
          task.consultant_feedback = { comment: consultantFeedback, updatedAt: now };
        }
        task.updated_at = now;
      }
    }

    return task;
  }

  static async getProjectWithDetails(projectId) {
    let project = null;
    let milestones = [];
    let tasks = [];

    if (isDbConnected()) {
      try {
        const pRes = await query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
        if (pRes && pRes.rows.length > 0) project = pRes.rows[0];

        const mRes = await query(`SELECT * FROM milestones WHERE project_id = $1 ORDER BY created_at ASC`, [projectId]);
        if (mRes) milestones = mRes.rows;

        const tRes = await query(`SELECT * FROM kanban_tasks WHERE project_id = $1 ORDER BY due_date ASC`, [projectId]);
        if (tRes) tasks = tRes.rows;
      } catch (err) {
        console.error("[ProjectRepository] Error cargando proyecto de PostgreSQL:", err);
      }
    }

    if (!project) project = projectMemoryDb.projects.get(projectId);
    if (milestones.length === 0) {
      milestones = Array.from(projectMemoryDb.milestones.values()).filter(m => m.project_id === projectId);
    }
    if (tasks.length === 0) {
      tasks = Array.from(projectMemoryDb.tasks.values()).filter(t => t.project_id === projectId);
    }

    if (!project) return null;

    return {
      ...project,
      milestones,
      tasks
    };
  }

  static async listAll() {
    if (isDbConnected()) {
      try {
        const res = await query(`SELECT * FROM projects ORDER BY created_at DESC`);
        if (res && res.rows.length > 0) {
          const list = [];
          for (const p of res.rows) {
            const details = await this.getProjectWithDetails(p.id);
            list.push(details);
          }
          return list;
        }
      } catch (err) {
        console.error("[ProjectRepository] Error listando proyectos de PostgreSQL:", err);
      }
    }

    const list = [];
    for (const p of projectMemoryDb.projects.values()) {
      list.push(await this.getProjectWithDetails(p.id));
    }
    return list;
  }

  static async updateMilestoneConformity(milestoneId, { studentConformity, consultantConformity, observations, actor }) {
    let milestone = null;
    const now = new Date().toISOString();

    if (isDbConnected()) {
      try {
        let sql = `UPDATE milestones SET `;
        const params = [];
        let pIdx = 1;

        if (actor === "STUDENT") {
          sql += `student_conformity = $${pIdx++}, student_observations = $${pIdx++} `;
          params.push(studentConformity, observations);
        } else if (actor === "CONSULTANT") {
          sql += `consultant_conformity = $${pIdx++}, consultant_observations = $${pIdx++} `;
          params.push(consultantConformity, observations);
        }

        sql += `WHERE id = $${pIdx} RETURNING *`;
        params.push(milestoneId);

        const res = await query(sql, params);
        if (res && res.rows.length > 0) {
          milestone = res.rows[0];
          if (milestone.student_conformity && milestone.consultant_conformity) {
            const appRes = await query(
              `UPDATE milestones SET status = 'APROBADO', completed_at = $1 WHERE id = $2 RETURNING *`,
              [now, milestoneId]
            );
            if (appRes && appRes.rows.length > 0) milestone = appRes.rows[0];
          }
        }
      } catch (err) {
        console.error("[ProjectRepository] Error actualizando conformidad:", err);
      }
    }

    if (!milestone) {
      milestone = projectMemoryDb.milestones.get(milestoneId);
      if (milestone) {
        if (actor === "STUDENT") {
          milestone.student_conformity = studentConformity;
          milestone.student_observations = observations;
        } else if (actor === "CONSULTANT") {
          milestone.consultant_conformity = consultantConformity;
          milestone.consultant_observations = observations;
        }

        if (milestone.student_conformity && milestone.consultant_conformity) {
          milestone.status = "APROBADO";
          milestone.completed_at = now;
        }
      }
    }

    return milestone;
  }
}
