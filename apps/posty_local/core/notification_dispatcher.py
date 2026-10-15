"""
PushNotificationDispatcher: Despachador de notificaciones locales y manejador de acciones rápidas
Permite interactuar con la alerta push directamente desde la pantalla de bloqueo.
"""

from typing import Any


class PushNotificationDispatcher:

    def handle_action(self, note_id: str, action: str, repo: Any):
        note = repo.get_by_id(note_id)
        if not note:
            return

        action_upper = action.upper()
        if action_upper == "COMPLETE":
            note.mark_completed()
            repo.save(note)
        elif action_upper == "SNOOZE_15M":
            note.snooze(minutes=15)
            repo.save(note)
