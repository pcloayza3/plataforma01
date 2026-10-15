"""
VoiceIntentParser: Analizador sintáctico en lenguaje natural local para intenciones de voz
Extrae la tarea limpia, los parámetros temporales (+15m, +1h, hora fija) y de geolocalización.
"""

import re
from typing import Dict, Any, Optional
from core.models import TriggerType


class VoiceIntentParser:

    def parse(self, voice_text: str) -> Dict[str, Any]:
        text = voice_text.strip()
        result = {
            "original_text": text,
            "clean_task": text,
            "trigger_type": TriggerType.NONE,
            "delta_minutes": None,
            "fixed_time": None,
            "geofence_place": None,
            "geofence_transition": None,
            "label": "🟢 Sin alarma"
        }

        # 1. Patrones de Tiempo Relativo
        # "en 15 minutos", "en 30 minutos", etc.
        m_rel_min = re.search(r'\ben\s+(\d+)\s+minutos?\b', text, re.IGNORECASE)
        if m_rel_min:
            mins = int(m_rel_min.group(1))
            clean = re.sub(r'\ben\s+\d+\s+minutos?\b', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.TIME,
                "delta_minutes": mins,
                "label": f"⏰ En {mins} min"
            })
            return result

        # "en 1 hora", "en 2 horas"
        m_rel_hr = re.search(r'\ben\s+(\d+|un|una|dos)\s+horas?\b', text, re.IGNORECASE)
        if m_rel_hr:
            word = m_rel_hr.group(1).lower()
            hrs = 1 if word in ['1', 'un', 'una'] else 2 if word in ['2', 'dos'] else int(word)
            clean = re.sub(r'\ben\s+(\d+|un|una|dos)\s+horas?\b', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.TIME,
                "delta_minutes": hrs * 60,
                "label": f"⏰ En {hrs}h"
            })
            return result

        # 2. Patrones de Hora Fija
        # "a las 18:00", "hoy a las 18:00", "a las 5pm"
        m_fixed = re.search(r'(?:hoy\s+)?a\s+las\s+(\d{1,2}(?::\d{2})?(?:\s*[ap]m)?)', text, re.IGNORECASE)
        if m_fixed:
            raw_time = m_fixed.group(1).strip()
            clean = re.sub(r'(?:hoy\s+)?a\s+las\s+\d{1,2}(?::\d{2})?(?:\s*[ap]m)?', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.TIME,
                "fixed_time": raw_time,
                "label": f"⏰ Hoy {raw_time}"
            })
            return result

        # 3. Patrones de Geocerca (Ubicación)
        # Salida de base ("al salir de casa")
        if re.search(r'\bal\s+salir\s+de\s+casa\b', text, re.IGNORECASE):
            clean = re.sub(r'\bal\s+salir\s+de\s+casa\b', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.GEOFENCE,
                "geofence_place": "Casa",
                "geofence_transition": "EXIT",
                "label": "🏠 Al salir de casa (150m)"
            })
            return result

        # Proximidad ("cerca del supermercado", "cerca del súper")
        m_super = re.search(r'(?:cuando\s+est[eé]\s+)?cerca\s+del?\s+(?:supermercado|s[uú]per)\b', text, re.IGNORECASE)
        if m_super:
            clean = re.sub(r'(?:cuando\s+est[eé]\s+)?cerca\s+del?\s+(?:supermercado|s[uú]per)\b', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.GEOFENCE,
                "geofence_place": "Supermercado",
                "geofence_transition": "ENTER",
                "label": "🛒 Cerca del supermercado"
            })
            return result

        # Trabajo / Oficina
        m_work = re.search(r'(?:cuando\s+llegue\s+al?|en\s+el?)\s+(?:trabajo|oficina)\b', text, re.IGNORECASE)
        if m_work:
            clean = re.sub(r'(?:cuando\s+llegue\s+al?|en\s+el?)\s+(?:trabajo|oficina)\b', '', text, flags=re.IGNORECASE).strip()
            result.update({
                "clean_task": clean,
                "trigger_type": TriggerType.GEOFENCE,
                "geofence_place": "Trabajo",
                "geofence_transition": "ENTER",
                "label": "🏢 En el trabajo"
            })
            return result

        return result
