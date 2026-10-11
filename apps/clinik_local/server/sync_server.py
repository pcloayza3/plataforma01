#!/usr/bin/env python3
"""
ClinikLocal - Servidor REST API Seguro de Sincronización en la Nube con JWT
Provee:
- Autenticación con JWT (HMAC-SHA256).
- Sincronización continua bidireccional (Push / Pull) de pacientes, historias, recetas y citas.
- Bitácora de Auditoría (Audit Log / Changelog) para trazabilidad de cada cambio.
- Pasarela de Pago (PayPal / QR) para activación de multi-dispositivo y copia en la nube.
- Soporte CORS completo para clientes Web, Móviles y Desktop.
"""

import sys
import os
import json
import time
import base64
import hmac
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PORT", 4050))
JWT_SECRET = os.environ.get("JWT_SECRET", "clinik_super_secret_jwt_key_2026")
DATA_FILE = os.path.join(os.path.dirname(__file__), "cloud_database.json")

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4)) if len(data_str) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data_str + padding)

def generate_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}".encode('utf-8')
    sig = hmac.new(JWT_SECRET.encode('utf-8'), message, hashlib.sha256).digest()
    sig_b64 = base64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        message = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), message, hashlib.sha256).digest()
        if not hmac.compare_digest(base64url_encode(expected_sig), sig_b64):
            return None
        payload_bytes = base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

# ==================== BASE DE DATOS EN LA NUBE ====================
class CloudStorage:
    def __init__(self, filepath):
        self.filepath = filepath
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                    return
            except Exception:
                pass
        self.data = {
            "subscription": {
                "active": False,
                "plan": "free_local",
                "payment_method": None,
                "multi_device_enabled": False,
                "expires_at": None
            },
            "snapshots": {},
            "audit_logs": [
                {
                    "id": "log-001",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "entity": "Sistema",
                    "entity_id": "init",
                    "action": "INICIALIZACION",
                    "device": "Servidor Cloud",
                    "summary": "Servidor de sincronización ClinikLocal iniciado y listo."
                }
            ],
            "last_synced_at": None
        }
        self.save()

    def save(self):
        try:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error guardando cloud database: {e}", file=sys.stderr)

db = CloudStorage(DATA_FILE)

# ==================== HANDLER HTTP ====================
class SyncApiHandler(BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def _read_body_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def _authenticate(self):
        auth_header = self.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ")[1]
        return verify_jwt(token)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Health check
        if path == "/api/health":
            self._send_json(200, {
                "status": "healthy",
                "service": "ClinikLocal Cloud Sync REST API",
                "timestamp": time.time(),
                "time_iso": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            return

        # 2. Estado de suscripción y sincronización
        if path == "/api/sync/status":
            self._send_json(200, {
                "subscription": db.data["subscription"],
                "last_synced_at": db.data["last_synced_at"],
                "audit_logs_count": len(db.data["audit_logs"]),
                "server_time": time.strftime("%Y-%m-%d %H:%M:%S")
            })
            return

        # 3. Pull de cambios (Requiere autenticación JWT y suscripción activa)
        if path == "/api/sync/pull":
            user = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Token JWT ausente o inválido"})
                return
            if not db.data["subscription"]["active"]:
                self._send_json(403, {"error": "Suscripción a copia en la nube no activa"})
                return

            self._send_json(200, {
                "success": True,
                "snapshot": db.data["snapshots"].get("current", None),
                "last_synced_at": db.data["last_synced_at"],
                "server_timestamp": time.time()
            })
            return

        # 4. Historial de Auditoría (Requiere autenticación JWT y suscripción activa)
        if path == "/api/audit/logs":
            user = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Token JWT ausente o inválido"})
                return
            if not db.data["subscription"]["active"]:
                self._send_json(403, {"error": "La bitácora de cambios requiere copia de seguridad activada y pagada."})
                return

            self._send_json(200, {
                "success": True,
                "total": len(db.data["audit_logs"]),
                "logs": list(reversed(db.data["audit_logs"][-100:]))  # últimos 100 eventos
            })
            return

        self._send_json(404, {"error": "Ruta no encontrada"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_body_json()

        # 1. Login / Emisión de JWT
        if path == "/api/auth/login":
            email = body.get("email", "doctor@cliniklocal.com")
            doctor_name = body.get("doctor", "Dr(a). Profesional Clínico")
            clinic_id = body.get("clinic_id", "clinic-default")
            
            # Generar token con validez de 30 días
            payload = {
                "sub": clinic_id,
                "email": email,
                "doctor": doctor_name,
                "iat": int(time.time()),
                "exp": int(time.time()) + (30 * 86400)
            }
            token = generate_jwt(payload)
            self._send_json(200, {
                "success": True,
                "token": token,
                "doctor": doctor_name,
                "clinic_id": clinic_id,
                "expires_in": 30 * 86400
            })
            return

        # 2. Sync Push (Enviar cambios locales a la nube)
        if path == "/api/sync/push":
            user = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Token JWT ausente o inválido"})
                return
            if not db.data["subscription"]["active"]:
                self._send_json(403, {"error": "Sincronización en la nube inactiva. Requiere pago previo."})
                return

            snapshot = body.get("snapshot")
            changes_log = body.get("changes", [])
            device = body.get("device", "Cliente Local")

            if snapshot:
                db.data["snapshots"]["current"] = snapshot
                now_str = time.strftime("%Y-%m-%d %H:%M:%S")
                db.data["last_synced_at"] = now_str

                # Registrar entradas de auditoría
                for ch in changes_log:
                    db.data["audit_logs"].append({
                        "id": f"log-{int(time.time()*1000)}-{len(db.data['audit_logs'])}",
                        "timestamp": now_str,
                        "entity": ch.get("entity", "General"),
                        "entity_id": ch.get("entity_id", "-"),
                        "action": ch.get("action", "ACTUALIZAR"),
                        "device": device,
                        "summary": ch.get("summary", "Cambio sincronizado en la nube")
                    })

                db.save()

                self._send_json(200, {
                    "success": True,
                    "synced_at": now_str,
                    "changes_recorded": len(changes_log),
                    "message": "Cambios sincronizados bidireccionalmente con la nube."
                })
                return
            else:
                self._send_json(400, {"error": "Snapshot de datos faltante"})
                return

        # 3. Procesar / Confirmar Pago (PayPal o QR)
        if path == "/api/payments/checkout":
            method = body.get("method", "qr")  # "paypal" o "qr"
            plan = body.get("plan", "mensual")
            ref_code = body.get("ref_code", f"PAY-{int(time.time())}")
            doctor = body.get("doctor", "Profesional")

            # Activar suscripción
            db.data["subscription"] = {
                "active": True,
                "plan": plan,
                "payment_method": method.upper(),
                "reference": ref_code,
                "multi_device_enabled": True,
                "activated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "expires_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() + 30 * 86400))
            }

            # Bitácora de pago
            db.data["audit_logs"].append({
                "id": f"log-{int(time.time()*1000)}",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "entity": "Finanzas",
                "entity_id": ref_code,
                "action": "PAGO_CONFIRMADO",
                "device": "Pasarela " + method.upper(),
                "summary": f"Pago confirmado vía {method.upper()} para {doctor}. Respaldo Cloud y Multi-Dispositivo ACTIVADO."
            })
            db.save()

            self._send_json(200, {
                "success": True,
                "subscription": db.data["subscription"],
                "message": f"Suscripción activada con éxito mediante {method.upper()}."
            })
            return

        # 4. Desactivar / Cancelar Suscripción
        if path == "/api/payments/cancel":
            user = self._authenticate()
            if not user:
                self._send_json(401, {"error": "Token JWT ausente o inválido"})
                return

            db.data["subscription"]["active"] = False
            db.data["subscription"]["multi_device_enabled"] = False
            now_str = time.strftime("%Y-%m-%d %H:%M:%S")

            db.data["audit_logs"].append({
                "id": f"log-{int(time.time()*1000)}",
                "timestamp": now_str,
                "entity": "Finanzas",
                "entity_id": "sub-cancel",
                "action": "DESACTIVACION",
                "device": "Panel de Control",
                "summary": "Copia de seguridad en la nube desactivada por el usuario."
            })
            db.save()

            self._send_json(200, {
                "success": True,
                "subscription": db.data["subscription"],
                "message": "Sincronización en la nube desactivada."
            })
            return

        self._send_json(404, {"error": "Endpoint no encontrado"})

def run_server(port=PORT):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SyncApiHandler)
    print(f"[*] ClinikLocal Sync API corriendo en http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Servidor detenido.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
