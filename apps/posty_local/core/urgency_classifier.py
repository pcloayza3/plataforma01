"""
DailyUrgencyClassifier: Clasificador dinámico para el semáforo diario de relevancia
Gobierna la distribución en las 3 secciones: Rojo (Urgente/Hoy), Amarillo (Próximas/Geocercas), Verde (Libre).
"""

from datetime import datetime, timedelta
from typing import Optional
from core.models import UrgencyLevel


class DailyUrgencyClassifier:

    def classify(self, due_datetime: Optional[datetime] = None, has_geofence: bool = False) -> UrgencyLevel:
        now = datetime.now()

        # 1. Alerta por tiempo
        if due_datetime is not None:
            diff = due_datetime - now

            # Si ya venció o vence en las próximas 2 horas o dentro de hoy
            if diff.total_seconds() <= 7200 or due_datetime.date() <= now.date():
                return UrgencyLevel.URGENT_TODAY

            # Si vence en las próximas 24 a 48 horas
            if diff.total_seconds() <= 172800:
                return UrgencyLevel.UPCOMING

        # 2. Si tiene geocerca activa pero no fecha estricta, es contexto próximo
        if has_geofence:
            return UrgencyLevel.UPCOMING

        # 3. Sin fecha urgente ni geocerca activa
        return UrgencyLevel.NORMAL
