"""
DailyUrgencyClassifier: Clasificador dinámico para el semáforo diario de relevancia
Gobierna la distribución en las 3 secciones: Rojo (Urgente/Hoy), Amarillo (Próximas/Geocercas), Verde (Libre).
"""

from datetime import datetime
from typing import Optional
from core.models import UrgencyLevel


class DailyUrgencyClassifier:

    def classify(self, due_datetime: Optional[datetime] = None, has_geofence: bool = False) -> UrgencyLevel:
        now = datetime.now()

        # 1. Alerta por tiempo
        if due_datetime is not None:
            # Si ya venció o vence el día de hoy -> ROJO (Urgente / Hoy)
            if due_datetime.date() <= now.date():
                return UrgencyLevel.URGENT_TODAY

            # Si es mañana, la siguiente semana o cualquier fecha futura -> AMARILLO (Próxima)
            return UrgencyLevel.UPCOMING

        # 2. Si tiene geocerca activa pero no fecha estricta, es contexto próximo (Amarillo)
        if has_geofence:
            return UrgencyLevel.UPCOMING

        # 3. Sin fecha urgente ni geocerca activa -> VERDE (Libre)
        return UrgencyLevel.NORMAL
