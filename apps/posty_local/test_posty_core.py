#!/usr/bin/env python3
"""
Test Suite TDD para PostyLocal Core (MicroApp 2)
Metodología: Extreme Programming (XP) - TDD (Red-Green-Refactor)

Verifica:
1. Validación de Entidades Note y AudioAttachment.
2. VoiceIntentParser: Extracción sintáctica de tareas, tiempos relativos (+15m, +1h, +2h) y absolutos (18:00).
3. VoiceIntentParser: Extracción de disparadores por geocercas ("al salir de casa", "cerca del súper").
4. DailyUrgencyClassifier: Clasificación del semáforo (Rojo: Urgente/Hoy, Amarillo: Próximas/Geocerca, Verde: Normal).
5. GeofenceEngine: Cálculo de distancia Haversine offline y detección de eventos de entrada y salida sin internet.
6. PushNotificationDispatcher: Ejecución de acciones rápidas ("Completar" y "Posponer 15m").
7. NoteRepository: Persistencia transaccional local en SQLite y exportación/importación JSON.
"""

import unittest
import time
from datetime import datetime, timedelta
import sys
import os
import tempfile
import json

# Asegurar path local
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from core.models import Note, AudioAttachment, UrgencyLevel, NoteColor, ReminderTrigger, TriggerType
from core.voice_parser import VoiceIntentParser
from core.urgency_classifier import DailyUrgencyClassifier
from core.geofence_engine import GeofenceEngine, GeoLocation
from core.notification_dispatcher import PushNotificationDispatcher
from core.storage import NoteRepository


class PostyLocalCoreTests(unittest.TestCase):

    def setUp(self):
        self.parser = VoiceIntentParser()
        self.classifier = DailyUrgencyClassifier()
        self.geo_engine = GeofenceEngine()
        self.dispatcher = PushNotificationDispatcher()
        
        self.temp_db_file = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
        self.temp_db_path = self.temp_db_file.name
        self.temp_db_file.close()
        self.repo = NoteRepository(db_path=self.temp_db_path)

    def tearDown(self):
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    # 1. Validación de Entidades
    def test_note_creation_and_color_validation(self):
        note = Note(
            id="n1",
            text="Comprar pan dulce",
            color=NoteColor.YELLOW,
            urgency=UrgencyLevel.NORMAL
        )
        self.assertEqual(note.id, "n1")
        self.assertEqual(note.text, "Comprar pan dulce")
        self.assertEqual(note.color, NoteColor.YELLOW)
        self.assertFalse(note.completed)

        with self.assertRaises(ValueError):
            Note(id="n2", text="Invalida", color="invalid_color")

    # 2. Restricciones de Audio
    def test_audio_attachment_constraints(self):
        audio = AudioAttachment(
            file_path="/data/user/0/postylocal/audio/n1.m4a",
            duration_ms=8500,
            file_size_bytes=65400,
            format="aac"
        )
        self.assertTrue(audio.is_valid_format())
        self.assertTrue(audio.is_within_size_limit())
        self.assertEqual(audio.formatted_duration(), "0:08")

        bad_audio = AudioAttachment(
            file_path="/tmp/huge.wav",
            duration_ms=60000,
            file_size_bytes=1500000,
            format="wav"
        )
        self.assertFalse(bad_audio.is_valid_format())
        self.assertFalse(bad_audio.is_within_size_limit())

    # 3. Parser de Voz: Tiempos Relativos
    def test_voice_intent_parser_relative_times(self):
        # Caso +15 minutos
        res15 = self.parser.parse("Comprar pan y leche en 15 minutos")
        self.assertEqual(res15["clean_task"], "Comprar pan y leche")
        self.assertEqual(res15["trigger_type"], TriggerType.TIME)
        self.assertEqual(res15["delta_minutes"], 15)

        # Caso +1 hora
        res60 = self.parser.parse("Llamar al médico en 1 hora")
        self.assertEqual(res60["clean_task"], "Llamar al médico")
        self.assertEqual(res60["trigger_type"], TriggerType.TIME)
        self.assertEqual(res60["delta_minutes"], 60)

        # Caso +2 horas
        res120 = self.parser.parse("Revisar el horno en 2 horas")
        self.assertEqual(res120["clean_task"], "Revisar el horno")
        self.assertEqual(res120["trigger_type"], TriggerType.TIME)
        self.assertEqual(res120["delta_minutes"], 120)

    # 4. Parser de Voz: Horas fijas
    def test_voice_intent_parser_fixed_time(self):
        res_fixed = self.parser.parse("Pagar la factura de luz hoy a las 18:00")
        self.assertEqual(res_fixed["clean_task"], "Pagar la factura de luz")
        self.assertEqual(res_fixed["trigger_type"], TriggerType.TIME)
        self.assertEqual(res_fixed["fixed_time"], "18:00")

    # 5. Parser de Voz: Geocercas (Ubicación)
    def test_voice_intent_parser_geofencing(self):
        # Salir de casa
        res_exit = self.parser.parse("Cerrar llave de gas al salir de casa")
        self.assertEqual(res_exit["clean_task"], "Cerrar llave de gas")
        self.assertEqual(res_exit["trigger_type"], TriggerType.GEOFENCE)
        self.assertEqual(res_exit["geofence_place"], "Casa")
        self.assertEqual(res_exit["geofence_transition"], "EXIT")

        # Cerca del súper
        res_enter = self.parser.parse("Comprar manzanas y avena cuando esté cerca del supermercado")
        self.assertEqual(res_enter["clean_task"], "Comprar manzanas y avena")
        self.assertEqual(res_enter["trigger_type"], TriggerType.GEOFENCE)
        self.assertEqual(res_enter["geofence_place"], "Supermercado")
        self.assertEqual(res_enter["geofence_transition"], "ENTER")

    # 6. Clasificador del Semáforo Diario (Mañana y Siguiente Semana son Próximas)
    def test_daily_urgency_classifier(self):
        now = datetime.now()

        # Vence hoy dentro del día -> ROJO (Urgente / Vence Hoy)
        urg_red = self.classifier.classify(due_datetime=now, has_geofence=False)
        self.assertEqual(urg_red, UrgencyLevel.URGENT_TODAY)

        # Vence MAÑANA -> AMARILLO (Próxima) - NUNCA ROJO
        tomorrow = now + timedelta(days=1)
        urg_tomorrow = self.classifier.classify(due_datetime=tomorrow, has_geofence=False)
        self.assertEqual(urg_tomorrow, UrgencyLevel.UPCOMING)

        # Vence LA SIGUIENTE SEMANA -> AMARILLO (Próxima) - NUNCA ROJO
        next_week = now + timedelta(days=7)
        urg_next_week = self.classifier.classify(due_datetime=next_week, has_geofence=False)
        self.assertEqual(urg_next_week, UrgencyLevel.UPCOMING)

        # Tiene Geocerca activa -> AMARILLO (Contexto)
        urg_yellow_geo = self.classifier.classify(due_datetime=None, has_geofence=True)
        self.assertEqual(urg_yellow_geo, UrgencyLevel.UPCOMING)

        # Sin fecha ni geocerca -> VERDE (Libre)
        urg_green = self.classifier.classify(due_datetime=None, has_geofence=False)
        self.assertEqual(urg_green, UrgencyLevel.NORMAL)

    # 6.1. Validación de Lista/Checklist con Máximo 5 Líneas y Audio por Línea
    def test_multiline_checklist_and_max_5_lines(self):
        note = Note(id="n-multi", color=NoteColor.YELLOW)
        self.assertEqual(len(note.lines), 0)

        # Agregar hasta 5 líneas con audio opcional
        l1 = note.add_line("Comprar pan", audio_attachment=AudioAttachment("/a/1.m4a", 4000, 30000))
        l2 = note.add_line("Comprar leche")
        l3 = note.add_line("Comprar queso", audio_attachment=AudioAttachment("/a/3.m4a", 5000, 35000))
        l4 = note.add_line("Pagar factura")
        l5 = note.add_line("Llamar al médico")

        self.assertEqual(len(note.lines), 5)
        self.assertTrue(l1.has_audio)
        self.assertFalse(l2.has_audio)
        self.assertTrue(l3.has_audio)
        self.assertEqual(l1.audio_attachment.formatted_duration(), "0:04")

        # Intentar agregar la 6ta línea debe fallar con ValueError
        with self.assertRaises(ValueError):
            note.add_line("Sexta línea no permitida")

        # Tachar y hacer check de líneas
        note.toggle_line_check(l1.id)
        self.assertTrue(l1.completed)
        self.assertFalse(note.completed)  # Las demás no están completas aún

    # 6.2. Protección de Solo Lectura para Notas Realizadas/Cumplidas
    def test_completed_note_read_only_protection(self):
        note = Note(id="n-done", text="Tarea terminada", color=NoteColor.GREEN)
        note.mark_completed()
        self.assertTrue(note.completed)
        self.assertIsNotNone(note.completed_at)

        # Intentar editar el texto de una nota cumplida debe estar bloqueado
        with self.assertRaises(ValueError):
            note.text = "Modificación ilegal"

        # Intentar añadir una línea a una nota cumplida debe estar bloqueado
        with self.assertRaises(ValueError):
            note.add_line("Nueva línea")

    # 7. Motor de Geocercas Haversine Offline
    def test_geofence_haversine_engine(self):
        # Coordenadas de Casa: -16.5024, -68.1311
        casa = GeoLocation(name="Casa", latitude=-16.5024, longitude=-68.1311, radius_meters=150.0)

        # Usuario en la misma coordenada -> Distancia 0m -> Dentro del perímetro
        curr_pos = GeoLocation(name="Current", latitude=-16.5024, longitude=-68.1311)
        dist = self.geo_engine.calculate_haversine_distance(casa, curr_pos)
        self.assertAlmostEqual(dist, 0.0, places=1)
        self.assertTrue(self.geo_engine.is_inside_geofence(casa, curr_pos))

        # Usuario camina a 300 metros de distancia (-16.5050, -68.1311)
        fuera_pos = GeoLocation(name="Away", latitude=-16.5052, longitude=-68.1311)
        dist_away = self.geo_engine.calculate_haversine_distance(casa, fuera_pos)
        self.assertGreater(dist_away, 150.0)
        self.assertFalse(self.geo_engine.is_inside_geofence(casa, fuera_pos))

        # Detección de transición de SALIDA
        transition = self.geo_engine.evaluate_transition(
            geofence=casa,
            previous_position=curr_pos,
            new_position=fuera_pos
        )
        self.assertEqual(transition, "EXIT")

    # 8. Despachador de Alertas Push y Acciones Rápidas
    def test_notification_dispatcher_actions(self):
        note = Note(
            id="n-alert-1",
            text="Pagar internet",
            color=NoteColor.YELLOW,
            urgency=UrgencyLevel.URGENT_TODAY,
            due_datetime=datetime.now()
        )
        self.repo.save(note)

        # Acción 1: Completar nota directamente desde la notificación
        self.dispatcher.handle_action(note_id="n-alert-1", action="COMPLETE", repo=self.repo)
        saved = self.repo.get_by_id("n-alert-1")
        self.assertTrue(saved.completed)

        # Acción 2: Posponer por 15 minutos
        note2 = Note(
            id="n-alert-2",
            text="Revisar correo",
            color=NoteColor.BLUE,
            urgency=UrgencyLevel.URGENT_TODAY,
            due_datetime=datetime.now()
        )
        self.repo.save(note2)
        old_time = note2.due_datetime
        self.dispatcher.handle_action(note_id="n-alert-2", action="SNOOZE_15M", repo=self.repo)
        snoozed = self.repo.get_by_id("n-alert-2")
        self.assertGreater(snoozed.due_datetime, old_time)

    # 9. Persistencia SQLite y Respaldo JSON
    def test_sqlite_local_repository_and_backup(self):
        note_audio = Note(
            id="n-store-1",
            text="Comprar aspirinas",
            color=NoteColor.GREEN,
            urgency=UrgencyLevel.NORMAL,
            audio_attachment=AudioAttachment(file_path="/audio/n1.m4a", duration_ms=5000, file_size_bytes=32000, format="aac")
        )
        self.repo.save(note_audio)
        all_notes = self.repo.list_all()
        self.assertEqual(len(all_notes), 1)
        self.assertEqual(all_notes[0].text, "Comprar aspirinas")
        self.assertIsNotNone(all_notes[0].audio_attachment)
        self.assertEqual(all_notes[0].audio_attachment.formatted_duration(), "0:05")

        # Exportar Respaldo JSON
        json_backup = self.repo.export_json()
        backup_dict = json.loads(json_backup)
        self.assertEqual(len(backup_dict["notes"]), 1)
        self.assertEqual(backup_dict["notes"][0]["id"], "n-store-1")

        # Limpiar y Restaurar
        self.repo.clear()
        self.assertEqual(len(self.repo.list_all()), 0)
        self.repo.import_json(json_backup)
        restored = self.repo.list_all()
        self.assertEqual(len(restored), 1)
        self.assertEqual(restored[0].id, "n-store-1")
        self.assertEqual(restored[0].text, "Comprar aspirinas")

    # 10. Validación de Edición de Líneas y Serialización de Checklist
    def test_line_editing_and_serialization(self):
        note = Note(id="n-edit", color=NoteColor.BLUE)
        l1 = note.add_line("Original línea 1")
        l2 = note.add_line("Original línea 2")

        # Editar línea 1
        note.edit_line(l1.id, "Modificada línea 1")
        self.assertEqual(note.lines[0].text, "Modificada línea 1")

        # Error al editar ID inexistente
        with self.assertRaises(ValueError):
            note.edit_line("id-fantasma", "Texto")

        # Serialización y deserialización fidedigna
        d = note.to_dict()
        self.assertEqual(len(d["lines"]), 2)
        self.assertEqual(d["lines"][0]["text"], "Modificada línea 1")

        restored = Note.from_dict(d)
        self.assertEqual(len(restored.lines), 2)
        self.assertEqual(restored.lines[0].text, "Modificada línea 1")
        self.assertEqual(restored.lines[1].text, "Original línea 2")

    # 11. Ordenamiento Dinámico de Presets por Frecuencia de Uso
    def test_dynamic_presets_frequency_ordering(self):
        # Simula la lógica de uso de presets de app.js
        time_presets = [
            {"id": "t1", "label": "⏰ +15 min", "count": 12},
            {"id": "t2", "label": "⏰ +1 hora", "count": 25},
            {"id": "t3", "label": "⏰ +2 horas", "count": 5},
            {"id": "t4", "label": "🌅 Mañana 9:00", "count": 30},
            {"id": "t5", "label": "📅 Sig. Semana", "count": 2},
        ]
        # Orden descendente por uso
        sorted_presets = sorted(time_presets, key=lambda x: x["count"], reverse=True)
        primary_row = sorted_presets[:4]
        secondary_overflow = sorted_presets[4:]

        self.assertEqual(primary_row[0]["label"], "🌅 Mañana 9:00")
        self.assertEqual(primary_row[1]["label"], "⏰ +1 hora")
        self.assertEqual(primary_row[2]["label"], "⏰ +15 min")
        self.assertEqual(primary_row[3]["label"], "⏰ +2 horas")
        self.assertEqual(len(secondary_overflow), 1)
        self.assertEqual(secondary_overflow[0]["label"], "📅 Sig. Semana")

    # 12. Verificación Estática del Contrato UI / HTML (Zero-Hallucination)
    def test_html_ui_contract_and_critical_elements(self):
        html_path = os.path.join(CURRENT_DIR, "index.html")
        self.assertTrue(os.path.exists(html_path), "index.html debe existir en apps/posty_local")

        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # 0 scripts JS externos o servidores de terceros (código de ejecución 100% local)
        self.assertIn('<script src="app.js"></script>', html_content)
        self.assertNotIn('<script src="http', html_content)

        # Verificación de elementos críticos de interfaz
        critical_ids = [
            "pushNotificationBanner",
            "currentDateDisplay",
            "urgentSummaryText",
            "boardContainer",
            "gridUrgent",
            "gridContext",
            "gridNormal",
            "sectionCompleted",
            "gridCompleted",
            "btnCreateNote",
            "newNoteModal",
            "notePhotoInput",
            "photoPreviewBox",
            "postitCardPreview",
            "modalLinesList",
            "btnAddLine",
            "primaryTimePresets",
            "secondaryTimePresets",
            "btnToggleMoreTime",
            "primaryGeoPresets",
            "secondaryGeoPresets",
            "btnToggleMoreGeo",
            "voicePromptModal",
            "screensaverOverlay",
            "aodClock",
            "aodDate",
            "settingsModal",
        ]
        for element_id in critical_ids:
            self.assertIn(f'id="{element_id}"', html_content, f"Falta el elemento con id '{element_id}' en index.html")


if __name__ == '__main__':
    unittest.main()
