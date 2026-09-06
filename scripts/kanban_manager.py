#!/usr/bin/env python3
"""
kanban_manager.py
Automatiza la sincronización de tareas entre GitHub Issues y GitHub Projects (Kanban)
para el repositorio pcloayza3/plataforma01 y el usuario pcloayza3.

Soporta estados Kanban:
- Todo
- In Progress
- Done
"""

import argparse
import json
import subprocess
import sys
from typing import Dict, Optional, Any

REPO = "pcloayza3/plataforma01"
DEFAULT_ASSIGNEE = "pcloayza3"
PROJECT_TITLE = "plataforma01"


def run_command(cmd: list[str]) -> tuple[int, str, str]:
    """Ejecuta un comando en shell y retorna (returncode, stdout, stderr)."""
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return 1, "", str(e)


def check_gh_auth() -> bool:
    code, out, err = run_command(["gh", "auth", "status"])
    return code == 0


def get_or_create_project_id() -> Optional[str]:
    """Intenta obtener el ID del proyecto plataforma01 mediante GraphQL."""
    query = """
    query {
      user(login: "pcloayza3") {
        projectsV2(first: 20) {
          nodes {
            id
            title
            number
          }
        }
      }
    }
    """
    code, out, err = run_command(["gh", "api", "graphql", "-f", f"query={query}"])
    if code != 0:
        return None
    try:
        data = json.loads(out)
        projects = data.get("data", {}).get("user", {}).get("projectsV2", {}).get("nodes", [])
        for p in projects:
            if p.get("title", "").lower() == PROJECT_TITLE.lower():
                return p.get("id")
    except Exception:
        pass
    return None


def create_issue(title: str, body: str, status: str = "Todo") -> Optional[int]:
    """
    Crea un issue en pcloayza3/plataforma01 asignado a pcloayza3,
    aplica la etiqueta del estado Kanban y lo vincula al proyecto.
    """
    label_map = {
        "Todo": "status:todo",
        "In Progress": "status:in-progress",
        "Done": "status:done"
    }
    label = label_map.get(status, "status:todo")

    # 1. Crear el issue
    cmd = [
        "gh", "issue", "create",
        "--repo", REPO,
        "--title", title,
        "--body", body,
        "--assignee", DEFAULT_ASSIGNEE,
        "--label", label
    ]
    code, out, err = run_command(cmd)
    if code != 0:
        print(f"[ERROR] Error al crear issue: {err}", file=sys.stderr)
        return None

    issue_url = out.strip()
    print(f"[OK] Issue creado exitosamente: {issue_url} (Asignado a: {DEFAULT_ASSIGNEE})")

    try:
        issue_number = int(issue_url.split("/")[-1])
    except ValueError:
        issue_number = None

    # 2. Intentar agregar al Project v2
    sync_project_item(issue_url, status)

    return issue_number


def sync_project_item(issue_url: str, status: str):
    """Intenta asociar el issue con el proyecto plataforma01 en GitHub Projects."""
    cmd = ["gh", "project", "item-add", "--owner", DEFAULT_ASSIGNEE, "--url", issue_url]
    code, out, err = run_command(cmd)
    if code == 0:
        print(f"[OK] Vinculado al proyecto {PROJECT_TITLE}")
    else:
        if "missing required scopes" in err or "read:project" in err:
            print("[INFO] Nota: Para sincronizar directamente en GitHub Projects v2 UI, ejecuta una vez en terminal:")
            print("       gh auth refresh -s project")
        else:
            print(f"[INFO] Registro de estado en issue actualizado: {status}")


def set_status(issue_number: int, status: str):
    """
    Actualiza el estado de un issue a Todo, In Progress o Done.
    """
    valid_statuses = ["Todo", "In Progress", "Done"]
    if status not in valid_statuses:
        print(f"[ERROR] Estado inválido. Use uno de: {valid_statuses}", file=sys.stderr)
        sys.exit(1)

    label_map = {
        "Todo": "status:todo",
        "In Progress": "status:in-progress",
        "Done": "status:done"
    }
    new_label = label_map[status]

    # Eliminar etiquetas previas de estado y agregar la nueva
    for old_label in label_map.values():
        run_command(["gh", "issue", "edit", str(issue_number), "--repo", REPO, "--remove-label", old_label])

    code, out, err = run_command(["gh", "issue", "edit", str(issue_number), "--repo", REPO, "--add-label", new_label])
    if code == 0:
        print(f"[OK] Issue #{issue_number} movido a columna [{status}]")
    else:
        print(f"[ERROR] Error al actualizar issue #{issue_number}: {err}", file=sys.stderr)

    if status == "Done":
        run_command(["gh", "issue", "close", str(issue_number), "--repo", REPO, "--comment", "Tarea completada y aprobada."])
        print(f"[OK] Issue #{issue_number} cerrado tras aprobación.")


def list_issues():
    """Lista los issues del repositorio con su estado Kanban."""
    cmd = ["gh", "issue", "list", "--repo", REPO, "--state", "all", "--json", "number,title,state,labels,assignees"]
    code, out, err = run_command(cmd)
    if code != 0:
        print(f"[ERROR] Error al listar issues: {err}", file=sys.stderr)
        return

    try:
        issues = json.loads(out)
        print(f"\n=== Tablero Kanban: {REPO} ===")
        for iss in issues:
            labels = [l.get("name", "") for l in iss.get("labels", [])]
            status = "Todo"
            if "status:in-progress" in labels:
                status = "In Progress"
            elif "status:done" in labels or iss.get("state") == "CLOSED":
                status = "Done"

            assignees = [a.get("login", "") for a in iss.get("assignees", [])]
            assignee_str = ", ".join(assignees) if assignees else "Sin asignar"
            print(f"[{status:<11}] #{iss.get('number')}: {iss.get('title')} (Asignado: {assignee_str})")
        print("===============================\n")
    except Exception as e:
        print(f"[ERROR] Error interpretando issues: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Gestor Kanban para GitHub Projects y SDLC")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # create
    create_parser = subparsers.add_parser("create-issue", help="Crea una nueva tarea/issue en el tablero")
    create_parser.add_argument("--title", required=True, help="Título del issue")
    create_parser.add_argument("--body", required=True, help="Descripción detallada de la tarea")
    create_parser.add_argument("--status", default="Todo", choices=["Todo", "In Progress", "Done"], help="Estado inicial")

    # set-status
    status_parser = subparsers.add_parser("set-status", help="Actualiza el estado de un issue")
    status_parser.add_argument("--issue-number", type=int, required=True, help="Número del issue")
    status_parser.add_argument("--status", required=True, choices=["Todo", "In Progress", "Done"], help="Nuevo estado")

    # list
    subparsers.add_parser("list", help="Lista los issues y su estado Kanban")

    args = parser.parse_args()

    if args.command == "create-issue":
        create_issue(args.title, args.body, args.status)
    elif args.command == "set-status":
        set_status(args.issue_number, args.status)
    elif args.command == "list":
        list_issues()


if __name__ == "__main__":
    main()
