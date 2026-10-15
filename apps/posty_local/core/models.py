"""
Modelos de Dominio y Entidades para PostyLocal Core
"""

from enum import Enum
from typing import Optional
from datetime import datetime, timedelta


class UrgencyLevel(str, Enum):
    URGENT_TODAY = "urgent"    # Rojo
    UPCOMING = "context"       # Amarillo (24-48h o Geocerca activa)
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
    MAX_FILE_SIZE_BYTES = 100 * 1024  # 100 KB para nota típica
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
    def __init__(
        self,
        id: str,
        text: str,
        color: NoteColor = NoteColor.YELLOW,
        urgency: UrgencyLevel = UrgencyLevel.NORMAL,
        due_datetime: Optional[datetime] = None,
        audio_attachment: Optional[AudioAttachment] = None,
        trigger: Optional[ReminderTrigger] = None,
        completed: bool = False,
        created_at: Optional[datetime] = None
    ):
        if isinstance(color, str):
            try:
                color = NoteColor(color)
            except ValueError:
                raise ValueError(f"Color no válido: {color}. Opciones válidas: {[c.value for c in NoteColor]}")

        if isinstance(urgency, str):
            urgency = UrgencyLevel(urgency)

        self.id = id
        self.text = text
        self.color = color
        self.urgency = urgency
        self.due_datetime = due_datetime
        self.audio_attachment = audio_attachment
        self.trigger = trigger
        self.completed = completed
        self.created_at = created_at or datetime.now()

    @property
    def has_audio(self) -> bool:
        return self.audio_attachment is not None

    def mark_completed(self):
        self.completed = True

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
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def from_dict(cls, data: dict):
        due = datetime.fromisoformat(data["due_datetime"]) if data.get("due_datetime") else None
        created = datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        audio = AudioAttachment.from_dict(data.get("audio_attachment")) if data.get("audio_attachment") else None
        trigger = ReminderTrigger.from_dict(data.get("trigger")) if data.get("trigger") else None

        return cls(
            id=data["id"],
            text=data["text"],
            color=NoteColor(data["color"]),
            urgency=UrgencyLevel(data["urgency"]),
            due_datetime=due,
            audio_attachment=audio,
            trigger=trigger,
            completed=data.get("completed", False),
            created_at=created
        )
