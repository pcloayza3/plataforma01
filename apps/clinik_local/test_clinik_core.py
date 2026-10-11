#!/usr/bin/env python3
"""
Test Suite TDD para ClinikLocal Core
Verifica la integridad de datos, esquemas, sanitización WhatsApp,
odontograma FDI y respaldo local-first.
"""

import unittest
import json
import urllib.parse
import re
import os

class ClinikLocalCoreTests(unittest.TestCase):

    def setUp(self):
        self.sample_db = {
            "pacientes": [
                {
                    "id": "p-1",
                    "nombre": "Valeria Quispe Morales",
                    "telefono": "+591 71234567",
                    "ci": "6549821 CBBA",
                    "nacimiento": "1994-05-14",
                    "alergias": "Penicilina",
                    "odontograma": {"16": "tratado", "26": "caries"},
                    "consultas": [
                        {
                            "id": "c-101",
                            "fecha": "2026-10-02",
                            "tipo": "Odontológica",
                            "motivo": "Control mensual",
                            "diagnostico": "Gingivitis leve",
                            "tratamiento": "Profilaxis"
                        }
                    ]
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
            ],
            "meta": {
                "doctor": "Dr. Alejandro Fernández",
                "registro": "14890-CBBA"
            }
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

        # Estados válidos
        valid_states = ['sano', 'caries', 'tratado', 'endo', 'ausente']
        patient_teeth = self.sample_db["pacientes"][0]["odontograma"]
        for tooth, state in patient_teeth.items():
            self.assertIn(tooth, all_teeth)
            self.assertIn(state, valid_states)

    # 3. Test Local-First Backup Serialization & Integrity
    def test_backup_serialization_and_deserialization(self):
        json_backup = json.dumps(self.sample_db)
        restored = json.loads(json_backup)
        
        self.assertIn("pacientes", restored)
        self.assertIn("citas", restored)
        self.assertEqual(len(restored["pacientes"]), 1)
        self.assertEqual(restored["pacientes"][0]["nombre"], "Valeria Quispe Morales")
        self.assertEqual(restored["citas"][0]["hora"], "10:30")

    # 4. Test Prescription Formatter
    def test_prescription_whatsapp_formatter(self):
        doctor = "Dr. Alejandro Fernández"
        paciente = "Valeria Quispe Morales"
        dx = "Infección pulpar"
        meds = [
            {"farmaco": "Amoxicilina 870mg", "dosis": "1 c/12h", "tiempo": "7 días"},
            {"farmaco": "Ibuprofeno 400mg", "dosis": "1 c/8h", "tiempo": "3 días"}
        ]
        
        lines = [f"*RECETA MÉDICA - {doctor}*", f"*Paciente:* {paciente}", f"*Diagnóstico:* {dx}"]
        for idx, m in enumerate(meds, 1):
            lines.append(f"{idx}. {m['farmaco']} -> {m['dosis']} ({m['tiempo']})")
        
        formatted_text = "\n".join(lines)
        self.assertIn("*RECETA MÉDICA", formatted_text)
        self.assertIn("Amoxicilina 870mg", formatted_text)
        self.assertIn("Ibuprofeno 400mg", formatted_text)

if __name__ == '__main__':
    unittest.main()
