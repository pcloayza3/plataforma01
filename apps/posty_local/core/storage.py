"""
NoteRepository: Repositorio de persistencia local SQLite y respaldo JSON
Garantiza transaccionalidad ACID y soberanía de datos sin conexión externa.
Soporta persistencia de listas de líneas estructuradas y fecha de cumplimiento.
"""

import sqlite3
import json
from typing import List, Optional
from datetime import datetime
from contextlib import contextmanager
from core.models import Note, AudioAttachment, ReminderTrigger, NoteColor, UrgencyLevel, NoteLine


class NoteRepository:

    def __init__(self, db_path: str = "posty_local.db"):
        self.db_path = db_path
        self._init_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    text TEXT NOT NULL,
                    color TEXT NOT NULL,
                    urgency TEXT NOT NULL,
                    due_datetime TEXT,
                    audio_attachment TEXT,
                    trigger_data TEXT,
                    completed INTEGER NOT NULL DEFAULT 0,
                    completed_at TEXT,
                    lines_data TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def save(self, note: Note):
        audio_json = json.dumps(note.audio_attachment.to_dict()) if note.audio_attachment else None
        trigger_json = json.dumps(note.trigger.to_dict()) if note.trigger else None
        lines_json = json.dumps([l.to_dict() for l in note.lines]) if note.lines else None
        due_iso = note.due_datetime.isoformat() if note.due_datetime else None
        comp_iso = note.completed_at.isoformat() if note.completed_at else None
        created_iso = note.created_at.isoformat() if note.created_at else datetime.now().isoformat()

        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO notes (
                    id, text, color, urgency, due_datetime, audio_attachment, trigger_data,
                    completed, completed_at, lines_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                note.id,
                note.text,
                note.color.value,
                note.urgency.value,
                due_iso,
                audio_json,
                trigger_json,
                1 if note.completed else 0,
                comp_iso,
                lines_json,
                created_iso
            ))
            conn.commit()

    def get_by_id(self, note_id: str) -> Optional[Note]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_note(row)

    def list_all(self) -> List[Note]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM notes ORDER BY completed ASC, created_at DESC")
            rows = cursor.fetchall()
            return [self._row_to_note(r) for r in rows]

    def delete(self, note_id: str):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
            conn.commit()

    def clear(self):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM notes")
            conn.commit()

    def export_json(self) -> str:
        all_notes = self.list_all()
        data = {
            "version": "1.1.0",
            "exported_at": datetime.now().isoformat(),
            "notes": [n.to_dict() for n in all_notes]
        }
        return json.dumps(data, indent=2, ensure_ascii=False)

    def import_json(self, json_str: str):
        data = json.loads(json_str)
        notes_list = data.get("notes", [])
        for note_data in notes_list:
            note = Note.from_dict(note_data)
            self.save(note)

    def _row_to_note(self, row: sqlite3.Row) -> Note:
        audio = None
        if row["audio_attachment"]:
            audio = AudioAttachment.from_dict(json.loads(row["audio_attachment"]))

        trigger = None
        if row["trigger_data"]:
            trigger = ReminderTrigger.from_dict(json.loads(row["trigger_data"]))

        lines = None
        # Validar si existe lines_data
        try:
            if "lines_data" in row.keys() and row["lines_data"]:
                lines = [NoteLine.from_dict(ld) for ld in json.loads(row["lines_data"])]
        except Exception:
            lines = None

        due = datetime.fromisoformat(row["due_datetime"]) if row["due_datetime"] else None
        created = datetime.fromisoformat(row["created_at"]) if row["created_at"] else None
        comp_at = datetime.fromisoformat(row["completed_at"]) if ("completed_at" in row.keys() and row["completed_at"]) else None

        return Note(
            id=row["id"],
            text=row["text"],
            color=NoteColor(row["color"]),
            urgency=UrgencyLevel(row["urgency"]),
            due_datetime=due,
            audio_attachment=audio,
            trigger=trigger,
            completed=bool(row["completed"]),
            completed_at=comp_at,
            created_at=created,
            lines=lines
        )
