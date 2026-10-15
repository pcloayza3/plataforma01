"""
Modelos de Dominio y Entidades para PostyLocal Core
Soporte de lista/checklist (máximo 5 líneas), audio por línea,
bloqueo de edición para tareas completadas y trazabilidad temporal.
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime, timedelta


class UrgencyLevel(str, Enum):
    URGENT_TODAY = "urgent"    # Rojo (Vence hoy)
    UPCOMING = "context"       # Amarillo (Mañana, Próximas, Siguiente Semana, Geocercas)
    NORMAL = "normal"          # Verde (Libre)


class NoteColor(str, Enum):
    YELLOW = "yellow"
    GREEN = "green"
    BLUE = "blue"
    PINK = "pink"
    PURPLE = "purple"


class TriggerType(str, Enum):
    NONE = "none"
    TIME = "time"
    GEOFENCE = "geo"


class AudioAttachment:
    MAX_FILE_SIZE_BYTES = 100 * 1024  # 100 KB
    ALLOWED_FORMATS = ["aac", "m4a"]

    def __init__(self, file_path: str, duration_ms: int, file_size_bytes: int, format: str = "aac"):
        self.file_path = file_path
        self.duration_ms = duration_ms
        self.file_size_bytes = file_size_bytes
        self.format = format.lower()

    def is_valid_format(self) -> bool:
        return self.format in self.ALLOWED_FORMATS

    def is_within_size_limit(self) -> bool:
        return self.file_size_bytes <= self.MAX_FILE_SIZE_BYTES

    def formatted_duration(self) -> str:
        seconds = int(self.duration_ms / 1000)
        mins = seconds // 60
        secs = seconds % 60
        return f"{mins}:{secs:02d}"

    def to_dict(self) -> dict:
        return {
            "file_path": self.file_path,
            "duration_ms": self.duration_ms,
            "file_size_bytes": self.file_size_bytes,
            "format": self.format,
            "duration_label": self.formatted_duration()
        }

    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None
        return cls(
            file_path=data["file_path"],
            duration_ms=data["duration_ms"],
            file_size_bytes=data["file_size_bytes"],
            format=data.get("format", "aac")
        )


class NoteLine:
    """Representa una línea o ítem de la lista/checklist de una nota."""
    def __init__(self, id: str, text: str, completed: bool = False, audio_attachment: Optional[AudioAttachment] = None):
        self.id = id
        self.text = text
        self.completed = completed
        self.audio_attachment = audio_attachment

    @property
    def has_audio(self) -> bool:
        return self.audio_attachment is not None

    def mark_completed(self, val: bool = True):
        self.completed = val

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "text": self.text,
            "completed": self.completed,
            "audio_attachment": self.audio_attachment.to_dict() if self.audio_attachment else None
        }

    @classmethod
    def from_dict(cls, data: dict):
        audio = AudioAttachment.from_dict(data.get("audio_attachment")) if data.get("audio_attachment") else None
        return cls(
            id=data["id"],
            text=data["text"],
            completed=data.get("completed", False),
            audio_attachment=audio
        )


class ReminderTrigger:
    def __init__(self, trigger_type: TriggerType, label: str, value: Optional[str] = None):
        self.trigger_type = trigger_type
        self.label = label
        self.value = value

    def to_dict(self) -> dict:
        return {
            "trigger_type": self.trigger_type.value,
            "label": self.label,
            "value": self.value
        }

    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None
        return cls(
            trigger_type=TriggerType(data["trigger_type"]),
            label=data["label"],
            value=data.get("value")
        )


class Note:
    MAX_LINES = 5

    def __init__(
        self,
        id: str,
        text: str = "",
        color: NoteColor = NoteColor.YELLOW,
        urgency: UrgencyLevel = UrgencyLevel.NORMAL,
        due_datetime: Optional[datetime] = None,
        audio_attachment: Optional[AudioAttachment] = None,
        trigger: Optional[ReminderTrigger] = None,
        completed: bool = False,
        completed_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        lines: Optional[List[NoteLine]] = None
    ):
        if isinstance(color, str):
            try:
                color = NoteColor(color)
            except ValueError:
                raise ValueError(f"Color no válido: {color}. Opciones válidas: {[c.value for c in NoteColor]}")

        if isinstance(urgency, str):
            urgency = UrgencyLevel(urgency)

        self.id = id
        self.color = color
        self.urgency = urgency
        self.due_datetime = due_datetime
        self.audio_attachment = audio_attachment
        self.trigger = trigger
        self.completed = completed
        self.completed_at = completed_at
        self.created_at = created_at or datetime.now()

        # Gestión de lista de líneas (máximo 5)
        self.lines: List[NoteLine] = []
        if lines:
            if len(lines) > self.MAX_LINES:
                raise ValueError(f"Una nota puede contener un máximo de {self.MAX_LINES} líneas.")
            self.lines = list(lines)
        elif text:
            # Si solo se pasa texto base, inicializar como primera línea
            self.lines = [NoteLine(id=f"{id}-l1", text=text, completed=completed, audio_attachment=audio_attachment)]

    @property
    def text(self) -> str:
        """Devuelve el texto consolidado de las líneas."""
        if not self.lines:
            return ""
        return "\n".join(l.text for l in self.lines)

    @text.setter
    def text(self, val: str):
        if self.completed:
            raise ValueError("No se puede editar una nota cumplida. Es de solo lectura.")
        if not self.lines:
            self.lines = [NoteLine(id=f"{self.id}-l1", text=val)]
        else:
            self.lines[0].text = val

    @property
    def has_audio(self) -> bool:
        return any(l.has_audio for l in self.lines) or (self.audio_attachment is not None)

    def add_line(self, text: str, audio_attachment: Optional[AudioAttachment] = None) -> NoteLine:
        if self.completed:
            raise ValueError("No se puede modificar una nota cumplida (Solo lectura).")
        if len(self.lines) >= self.MAX_LINES:
            raise ValueError(f"Límite alcanzado: máximo {self.MAX_LINES} líneas por nota.")

        new_line = NoteLine(
            id=f"{self.id}-l{len(self.lines) + 1}",
            text=text,
            completed=False,
            audio_attachment=audio_attachment
        )
        self.lines.append(new_line)
        return new_line

    def edit_line(self, line_id: str, new_text: str):
        if self.completed:
            raise ValueError("No se puede editar una nota cumplida. Es de solo lectura y escucha.")
        for l in self.lines:
            if l.id == line_id:
                l.text = new_text
                return
        raise ValueError(f"Línea {line_id} no encontrada en la nota.")

    def toggle_line_check(self, line_id: str):
        if self.completed:
            raise ValueError("No se puede modificar una nota cumplida.")
        for l in self.lines:
            if l.id == line_id:
                l.completed = not l.completed
                break

        # Si todas las líneas están completas, la nota pasa a cumplida
        if self.lines and all(l.completed for l in self.lines):
            self.mark_completed()

    def mark_completed(self):
        self.completed = True
        self.completed_at = datetime.now()
        for l in self.lines:
            l.completed = True

    def snooze(self, minutes: int = 15):
        base = self.due_datetime or datetime.now()
        self.due_datetime = base + timedelta(minutes=minutes)
        if self.trigger:
            self.trigger.label = f"⏰ Pospuesto +{minutes}m"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "text": self.text,
            "color": self.color.value,
            "urgency": self.urgency.value,
            "due_datetime": self.due_datetime.isoformat() if self.due_datetime else None,
            "audio_attachment": self.audio_attachment.to_dict() if self.audio_attachment else None,
            "trigger": self.trigger.to_dict() if self.trigger else None,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "lines": [l.to_dict() for l in self.lines]
        }

    @classmethod
    def from_dict(cls, data: dict):
        due = datetime.fromisoformat(data["due_datetime"]) if data.get("due_datetime") else None
        created = datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        comp_at = datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None
        audio = AudioAttachment.from_dict(data.get("audio_attachment")) if data.get("audio_attachment") else None
        trigger = ReminderTrigger.from_dict(data.get("trigger")) if data.get("trigger") else None

        lines = None
        if "lines" in data and data["lines"]:
            lines = [NoteLine.from_dict(ld) for ld in data["lines"]]

        return cls(
            id=data["id"],
            text=data.get("text", ""),
            color=NoteColor(data["color"]),
            urgency=UrgencyLevel(data["urgency"]),
            due_datetime=due,
            audio_attachment=audio,
            trigger=trigger,
            completed=data.get("completed", False),
            completed_at=comp_at,
            created_at=created,
            lines=lines
        )
