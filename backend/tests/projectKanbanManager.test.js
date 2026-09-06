import test from "node:test";
import assert from "node:assert/strict";
import { ProjectKanbanManager, TaskStatus, MilestoneStatus, ProgressAlertStatus } from "../src/domain/projectKanbanManager.js";

test("ProjectKanbanManager: crea proyecto con hitos y calcula avance correctamente", () => {
  const manager = new ProjectKanbanManager();
  const project = manager.createProject({
    id: "prj_001",
    title: "Tesis de Bioinformática",
    category: "Tesis Pregrado",
    studentId: "usr_student",
    consultantId: "usr_consultant",
    milestones: [
      { id: "m1", title: "Hito 1", amountBOB: 200 },
      { id: "m2", title: "Hito 2", amountBOB: 300 }
    ]
  });

  assert.equal(project.milestones.length, 2);

  // Inicialmente avance es 0
  const initProgress = manager.calculateProjectProgress("prj_001");
  assert.equal(initProgress.milestoneProgressPercent, 0);
  assert.equal(initProgress.taskProgressPercent, 0);
  assert.equal(initProgress.healthStatus, ProgressAlertStatus.ON_TIME);

  // Agregamos dos tareas
  const t1 = manager.addTask("prj_001", { title: "Tarea 1", milestoneId: "m1" });
  const t2 = manager.addTask("prj_001", { title: "Tarea 2", milestoneId: "m1" });

  // Completamos una tarea
  manager.moveTask("prj_001", t1.id, TaskStatus.DONE, "Trabajo impecable");

  const midProgress = manager.calculateProjectProgress("prj_001");
  assert.equal(midProgress.completedTasks, 1);
  assert.equal(midProgress.totalTasks, 2);
  assert.equal(midProgress.taskProgressPercent, 50);

  // Conformidad cruzada del Hito 1
  manager.recordMilestoneConformity("prj_001", "m1", { actor: "STUDENT", approved: true });
  assert.equal(manager.getProject("prj_001").milestones[0].status, MilestoneStatus.PENDING_FUNDING);

  // Cuando ambos aprueban
  manager.recordMilestoneConformity("prj_001", "m1", { actor: "CONSULTANT", approved: true });
  assert.equal(manager.getProject("prj_001").milestones[0].status, MilestoneStatus.APPROVED);

  const finalProgress = manager.calculateProjectProgress("prj_001");
  assert.equal(finalProgress.completedMilestones, 1);
  assert.equal(finalProgress.milestoneProgressPercent, 50);
});

test("ProjectKanbanManager: detecta semáforo de tareas atrasadas", () => {
  const manager = new ProjectKanbanManager();
  manager.createProject({
    id: "prj_delayed",
    title: "Proyecto con atraso",
    studentId: "usr_s",
    consultantId: "usr_c",
    milestones: [{ id: "m1", title: "Hito 1", amountBOB: 100 }]
  });

  // Tarea vencida en el pasado
  manager.addTask("prj_delayed", {
    title: "Tarea vencida",
    milestoneId: "m1",
    dueDate: new Date(Date.now() - 3 * 86400000).toISOString()
  });

  const progress = manager.calculateProjectProgress("prj_delayed");
  assert.equal(progress.delayedTasksCount, 1);
  assert.equal(progress.healthStatus, ProgressAlertStatus.DELAYED);
  assert.equal(progress.isDelayed, true);
});
