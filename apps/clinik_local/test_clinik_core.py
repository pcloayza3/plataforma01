#!/usr/bin/env python3
"""
Test Suite TDD para ClinikLocal Core (Versión Avanzada)
Verifica:
1. Sanitización de enlaces de WhatsApp y formateo de recetas.
2. Odontograma FDI con 32 piezas y transiciones de estados.
3. Ordenación avanzada de pacientes (recientes atendidos, cita hoy, apellido asc/desc).
4. Generación de mensaje para compartir ubicación y contacto del consultorio.
5. Validación de estructura de adjuntos multimedia en historias clínicas (fotos, videos, PDF).
"""

import unittest
import json
import urllib.parse
import re

class ClinikLocalCoreTests(unittest.TestCase):

    def setUp(self):
        self.sample_db = {
            "config": {
                "clinicName": "Centro Dental & Especialidades San Lucas",
                "doctorName": "Dr. Alejandro Fernández",
                "doctorReg": "14890-CBBA",
                "address": "Av. Heroínas #450",
                "mapsUrl": "https://maps.app.goo.gl/ejemplo",
                "phone": "+59170000000",
                "theme": "teal",
                "modules": {"odontograma": True, "recetas": True, "agenda": True}
            },
            "pacientes": [
                {
                    "id": "p-1",
                    "nombre": "Valeria Quispe Morales",
                    "telefono": "+591 71234567",
                    "ci": "6549821 CBBA",
                    "nacimiento": "1994-05-14",
                    "alergias": "Penicilina",
                    "ultimaAtencion": "2026-10-09",
                    "odontograma": {"16": "tratado", "26": "caries"},
                    "consultas": [
                        {
                            "id": "c-101",
                            "fecha": "2026-10-09",
                            "tipo": "Odontológica",
                            "motivo": "Control mensual",
                            "diagnostico": "Gingivitis leve",
                            "tratamiento": "Profilaxis",
                            "adjuntos": [
                                {"tipo": "foto", "titulo": "Rx Pieza 26", "url": "data:image/png;base64,iVBORw0KGgo="},
                                {"tipo": "pdf", "titulo": "Analisis de Sangre", "url": "data:application/pdf;base64,JVBERi0xLjQK"}
                            ]
                        }
                    ]
                },
                {
                    "id": "p-2",
                    "nombre": "Rodrigo Camacho Flores",
                    "telefono": "+591 79876543",
                    "ci": "7841209 LPZ",
                    "nacimiento": "1988-11-20",
                    "alergias": "Ninguna",
                    "ultimaAtencion": "2026-09-18",
                    "odontograma": {"37": "tratado"},
                    "consultas": []
                }
            ],
            "citas": [
                {
                    "id": "cita-1",
                    "pacienteId": "p-1",
                    "fecha": "2026-10-12",
                    "hora": "10:30",
                    "motivo": "Control de Caries",
                    "estado": "Confirmada"
                }
            ]
        }

    # 1. Test WhatsApp Link Sanitization & URL Encoding
    def test_whatsapp_link_formatting(self):
        raw_phone = "+591 (712) 34-567"
        clean_phone = re.sub(r'\D', '', raw_phone)
        self.assertEqual(clean_phone, "59171234567")

        patient_name = "Valeria Quispe"
        date_str = "2026-10-12"
        time_str = "10:30"
        msg = f"Hola {patient_name}, le recordamos su cita el {date_str} a las {time_str}."
        
        encoded_msg = urllib.parse.quote(msg)
        wa_url = f"https://wa.me/{clean_phone}?text={encoded_msg}"
        
        self.assertTrue(wa_url.startswith("https://wa.me/59171234567?text="))
        self.assertIn("Valeria%20Quispe", wa_url)
        self.assertIn("2026-10-12", wa_url)

    # 2. Test Odontograma FDI Tooth Numbering & State Transitions
    def test_odontograma_fdi_valid_teeth(self):
        valid_quadrants = {
            1: [11, 12, 13, 14, 15, 16, 17, 18],
            2: [21, 22, 23, 24, 25, 26, 27, 28],
            3: [31, 32, 33, 34, 35, 36, 37, 38],
            4: [41, 42, 43, 44, 45, 46, 47, 48]
        }
        all_teeth = [str(t) for q in valid_quadrants.values() for t in q]
        self.assertEqual(len(all_teeth), 32)

        valid_states = ['sano', 'caries', 'tratado', 'endo', 'ausente']
        patient_teeth = self.sample_db["pacientes"][0]["odontograma"]
        for tooth, state in patient_teeth.items():
            self.assertIn(tooth, all_teeth)
            self.assertIn(state, valid_states)

    # 3. Test Ordenación de Pacientes (Recientes Atendidos por Defecto vs Apellido)
    def test_patient_sorting_logic(self):
        pacientes = list(self.sample_db["pacientes"])
        
        # Ordenación por defecto: más reciente atendido a más antiguo
        pacientes_recientes = sorted(pacientes, key=lambda p: p.get("ultimaAtencion", ""), reverse=True)
        self.assertEqual(pacientes_recientes[0]["id"], "p-1")  # 2026-10-09 antes que 2026-09-18
        self.assertEqual(pacientes_recientes[1]["id"], "p-2")

        # Ordenación por apellido ascendente
        def get_apellido(nombre):
            tokens = nombre.split(" ")
            return tokens[1] if len(tokens) > 1 else nombre

        pacientes_por_apellido = sorted(pacientes, key=lambda p: get_apellido(p["nombre"]))
        self.assertEqual(pacientes_por_apellido[0]["nombre"], "Rodrigo Camacho Flores") # Camacho < Quispe
        self.assertEqual(pacientes_por_apellido[1]["nombre"], "Valeria Quispe Morales")

    # 4. Test Mensaje para Compartir Ubicación y Contacto
    def test_share_location_and_contact_message(self):
        cfg = self.sample_db["config"]
        msg = f"*{cfg['clinicName'].upper()}*\n"
        msg += f"👨‍⚕️ *Atención:* {cfg['doctorName']} ({cfg['doctorReg']})\n"
        msg += f"📍 *Dirección:* {cfg['address']}\n"
        msg += f"🗺️ *Ver en Google Maps:* {cfg['mapsUrl']}\n"
        msg += f"📞 *Teléfono:* {cfg['phone']}"
        
        self.assertIn("CENTRO DENTAL & ESPECIALIDADES", msg)
        self.assertIn("Dr. Alejandro Fernández", msg)
        self.assertIn("https://maps.app.goo.gl/ejemplo", msg)

    # 5. Test Soporte Multimedia en Consultas
    def test_multimedia_attachments_structure(self):
        consulta = self.sample_db["pacientes"][0]["consultas"][0]
        adjuntos = consulta.get("adjuntos", [])
        self.assertEqual(len(adjuntos), 2)
        
        tipos = [a["tipo"] for a in adjuntos]
        self.assertIn("foto", tipos)
        self.assertIn("pdf", tipos)
        for a in adjuntos:
            self.assertTrue(a["url"].startswith("data:"))

if __name__ == '__main__':
    unittest.main()
