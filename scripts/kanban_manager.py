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
import urllib.request
import urllib.error
from typing import Optional, Any

REPO = "pcloayza3/plataforma01"
DEFAULT_ASSIGNEE = "pcloayza3"
PROJECT_TITLE = "plataforma01"
API_BASE = f"https://api.github.com/repos/{REPO}"


def get_token() -> str:
    """Obtiene el token de autenticación desde el CLI de GitHub."""
    try:
        token = subprocess.check_output(["gh", "auth", "token"], text=True, stderr=subprocess.DEVNULL).strip()
        if token:
            return token
    except Exception:
        pass
    print("[ERROR] No se pudo obtener el token de gh CLI. Asegúrate de haber iniciado sesión con 'gh auth login'.", file=sys.stderr)
    sys.exit(1)


def api_request(endpoint: str, method: str = "GET", data: Optional[dict] = None) -> tuple[int, Any]:
    """Realiza una petición HTTPS a la API REST de GitHub con urllib."""
    token = get_token()
    url = f"{API_BASE}{endpoint}" if endpoint.startswith("/") else endpoint
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "SDLC-Antigravity-Agent",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_msg)
        except Exception:
            return e.code, {"message": err_msg}
    except Exception as e:
        return 500, {"message": str(e)}


def create_issue(title: str, body: str, status: str = "Todo") -> Optional[int]:
    """
    Crea un issue en pcloayza3/plataforma01 asignado a pcloayza3 con su estado Kanban.
    """
    label_map = {
        "Todo": "status:todo",
        "In Progress": "status:in-progress",
        "Done": "status:done"
    }
    label = label_map.get(status, "status:todo")

    payload = {
        "title": title,
        "body": body,
        "assignees": [DEFAULT_ASSIGNEE],
        "labels": [label]
    }

    status_code, resp = api_request("/issues", method="POST", data=payload)
    if status_code not in (200, 201):
        print(f"[ERROR] No se pudo crear el issue (Código {status_code}): {resp.get('message')}", file=sys.stderr)
        return None

    issue_number = resp.get("number")
    issue_url = resp.get("html_url")
    print(f"[OK] Issue #{issue_number} creado: {issue_url}")
    print(f"     Asignado a: {DEFAULT_ASSIGNEE} | Estado inicial: [{status}]")

    # Intentar vincular al tablero GitHub Projects v2
    sync_project_item(issue_url, status)
    return issue_number


def sync_project_item(issue_url: str, status: str):
    """Vincula el issue con el proyecto plataforma01 en GitHub Projects."""
    try:
        res = subprocess.run(["gh", "project", "item-add", "--owner", DEFAULT_ASSIGNEE, "--url", issue_url],
                             capture_output=True, text=True, check=False)
        if res.returncode == 0:
            print(f"[OK] Vinculado al tablero GitHub Projects: {PROJECT_TITLE}")
        else:
            if "read:project" in res.stderr or "missing required scopes" in res.stderr:
                print(f"[INFO] Nota: Para sincronizar directamente en la interfaz de GitHub Projects v2, ejecuta:")
                print(f"       gh auth refresh -s project")
    except Exception:
        pass


def set_status(issue_number: int, status: str):
    """
    Actualiza el estado de un issue en el tablero Kanban (Todo, In Progress, Done).
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
    target_label = label_map[status]

    # 1. Obtener labels actuales del issue
    code, issue = api_request(f"/issues/{issue_number}")
    if code != 200:
        print(f"[ERROR] Error al consultar issue #{issue_number}: {issue.get('message')}", file=sys.stderr)
        return

    current_labels = [l.get("name") for l in issue.get("labels", []) if l.get("name") not in label_map.values()]
    current_labels.append(target_label)

    # 2. Actualizar labels
    update_payload = {
        "labels": current_labels,
        "state": "closed" if status == "Done" else "open"
    }

    code, resp = api_request(f"/issues/{issue_number}", method="PATCH", data=update_payload)
    if code == 200:
        print(f"[OK] Issue #{issue_number} movido a [{status}].")
        if status == "Done":
            # Agregar comentario de cierre
            api_request(f"/issues/{issue_number}/comments", method="POST", data={
                "body": "✅ Tarea completada y aprobada bajo el protocolo de calidad SDLC."
            })
            print(f"[OK] Issue #{issue_number} cerrado con comentario de cierre.")
    else:
        print(f"[ERROR] Error al actualizar estado del issue #{issue_number}: {resp.get('message')}", file=sys.stderr)


def list_issues():
    """Lista los issues del repositorio con su estado Kanban actual."""
    code, issues = api_request("/issues?state=all")
    if code != 200:
        print(f"[ERROR] Error al obtener lista de issues: {issues.get('message')}", file=sys.stderr)
        return

    label_to_status = {
        "status:todo": "Todo",
        "status:in-progress": "In Progress",
        "status:done": "Done"
    }

    print(f"\n==================== TABLERO KANBAN ({REPO}) ====================")
    for iss in issues:
        # Excluir pull requests
        if "pull_request" in iss:
            continue

        labels = [l.get("name", "") for l in iss.get("labels", [])]
        status = "Todo"
        for lbl, st in label_to_status.items():
            if lbl in labels:
                status = st
                break

        if iss.get("state") == "closed":
            status = "Done"

        assignees = [a.get("login") for a in iss.get("assignees", [])]
        assignee_str = ", ".join(assignees) if assignees else "Sin asignar"
        print(f"[{status:<11}] #{iss.get('number')}: {iss.get('title')}")
        print(f"             URL: {iss.get('html_url')} | Asignado: {assignee_str}")
    print("=================================================================\n")


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
