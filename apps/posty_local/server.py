#!/usr/bin/env python3
"""
Servidor Local de PostyLocal (MicroApp 2)
Provee API REST Local-First y sirve la interfaz web móvil.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys
from urllib.parse import parse_qs, urlparse

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from core.models import Note, AudioAttachment, UrgencyLevel, NoteColor, ReminderTrigger, TriggerType
from core.voice_parser import VoiceIntentParser
from core.urgency_classifier import DailyUrgencyClassifier
from core.geofence_engine import GeofenceEngine, GeoLocation
from core.notification_dispatcher import PushNotificationDispatcher
from core.storage import NoteRepository

DB_FILE = os.path.join(CURRENT_DIR, "posty_local.db")
repo = NoteRepository(db_path=DB_FILE)
parser = VoiceIntentParser()
classifier = DailyUrgencyClassifier()
geo_engine = GeofenceEngine()
dispatcher = PushNotificationDispatcher()

# Inicializar con notas demo si la BD está vacía
if len(repo.list_all()) == 0:
    repo.save(Note(
        id="n1",
        text="Pagar factura de luz antes de las 18:00",
        color=NoteColor.YELLOW,
        urgency=UrgencyLevel.URGENT_TODAY,
        trigger=ReminderTrigger(TriggerType.TIME, "⏰ Vence Hoy 18:00"),
        audio_attachment=AudioAttachment(file_path="audio/n1.m4a", duration_ms=12000, file_size_bytes=84000)
    ))
    repo.save(Note(
        id="n2",
        text="Cerrar la llave de gas de la cocina",
        color=NoteColor.PINK,
        urgency=UrgencyLevel.UPCOMING,
        trigger=ReminderTrigger(TriggerType.GEOFENCE, "🏠 Al salir de casa (150m)"),
        audio_attachment=AudioAttachment(file_path="audio/n2.m4a", duration_ms=7000, file_size_bytes=52000)
    ))
    repo.save(Note(
        id="n3",
        text="Comprar leche descremada y fruta fresca",
        color=NoteColor.GREEN,
        urgency=UrgencyLevel.UPCOMING,
        trigger=ReminderTrigger(TriggerType.GEOFENCE, "🛒 Cerca del supermercado"),
        audio_attachment=AudioAttachment(file_path="audio/n3.m4a", duration_ms=9000, file_size_bytes=68000)
    ))


class PostyLocalHandler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CURRENT_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/notes":
            notes = [n.to_dict() for n in repo.list_all()]
            self._send_json(200, {"success": True, "notes": notes})
            return
        elif parsed.path == "/api/backup":
            json_backup = repo.export_json()
            self._send_json(200, json.loads(json_backup))
            return
        elif parsed.path == "/api/health":
            self._send_json(200, {"status": "ok", "app": "PostyLocal", "mode": "Local-First"})
            return

        # Servir archivos estáticos por defecto
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if parsed.path == "/api/notes/parse-voice":
            text = data.get("text", "")
            parsed_res = parser.parse(text)
            self._send_json(200, {"success": True, "parsed": parsed_res})
            return

        elif parsed.path == "/api/notes":
            note_id = data.get("id", f"n{int(datetime.now().timestamp())}")
            note = Note.from_dict(data)
            repo.save(note)
            self._send_json(201, {"success": True, "note": note.to_dict()})
            return

        elif parsed.path.startswith("/api/notes/") and parsed.path.endswith("/action"):
            parts = parsed.path.split("/")
            note_id = parts[3]
            action = data.get("action", "COMPLETE")
            dispatcher.handle_action(note_id, action, repo)
            updated = repo.get_by_id(note_id)
            self._send_json(200, {"success": True, "note": updated.to_dict() if updated else None})
            return

        elif parsed.path == "/api/geofence/check":
            user_lat = float(data.get("latitude", 0.0))
            user_lng = float(data.get("longitude", 0.0))
            prev_lat = float(data.get("prev_latitude", user_lat))
            prev_lng = float(data.get("prev_longitude", user_lng))

            curr_pos = GeoLocation("UserCurrent", user_lat, user_lng)
            prev_pos = GeoLocation("UserPrev", prev_lat, prev_lng)

            # Geocercas de referencia
            casa = GeoLocation("Casa", -16.5024, -68.1311, 150.0)
            superm = GeoLocation("Supermercado", -16.5089, -68.1275, 150.0)

            trans_casa = geo_engine.evaluate_transition(casa, prev_pos, curr_pos)
            trans_super = geo_engine.evaluate_transition(superm, prev_pos, curr_pos)

            self._send_json(200, {
                "success": True,
                "transitions": {
                    "casa": trans_casa,
                    "supermercado": trans_super
                }
            })
            return

        self._send_json(404, {"error": "Ruta no encontrada"})

    def _send_json(self, status: int, data: dict):
        resp = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(resp)))
        self.end_headers()
        self.wfile.write(resp)


def run_server(port: int = 8092):
    server = HTTPServer(("0.0.0.0", port), PostyLocalHandler)
    print(f"[PostyLocal] Servidor activo en http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[PostyLocal] Servidor detenido.")
        server.server_close()


if __name__ == "__main__":
    from datetime import datetime
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8092
    run_server(port)
