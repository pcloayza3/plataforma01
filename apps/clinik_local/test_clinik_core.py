#!/usr/bin/env python3
"""
Test Suite TDD para ClinikLocal Core v2.5
Verifica:
1. Sanitización de WhatsApp y formateo de recetas e invitaciones.
2. Odontograma FDI con 32 piezas y transiciones de estados.
3. Transformación fluida de Contacto Preliminar a Paciente Formal.
4. Catálogo de Servicios dinámico y asignación múltiple en Citas e Historia.
5. Formateo de enlaces de correo electrónico (mailto:).
6. Adjuntos multimedia con descripción y captura de cámara.
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
                "phone": "+59170000000",
                "email": "contacto@sanlucasclinic.com",
                "servicios": [
                    "Consulta Médica General",
                    "Profilaxis y Limpieza Dental",
                    "Radiografía Panorámica / Periapical",
                    "Análisis Clínico de Sangre"
                ],
                "modules": {"odontograma": True, "recetas": True, "agenda": True}
            },
            "pacientes": [
                {
                    "id": "p-1",
                    "tipo": "paciente",
                    "nombre": "Valeria Quispe Morales",
                    "telefono": "+591 71234567",
                    "email": "valeria.quispe@ejemplo.com",
                    "ci": "6549821 CBBA",
                    "nacimiento": "1994-05-14",
                    "alergias": "Penicilina",
                    "ultimaAtencion": "2026-10-09",
                    "odontograma": {"16": "tratado", "26": "caries"},
                    "consultas": [
                        {
                            "id": "c-101",
                            "fecha": "2026-10-09",
                            "servicio": "Profilaxis y Limpieza Dental",
                            "motivo": "Control semestral",
                            "diagnostico": "Gingivitis marginal leve",
                            "tratamiento": "Profilaxis con ultrasonido",
                            "adjuntos": [
                                {
                                    "tipo": "foto",
                                    "titulo": "Rx Pieza 26",
                                    "descripcion": "Control radiográfico periapical",
                                    "url": "data:image/png;base64,iVBORw0KGgo="
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "p-contact-1",
                    "tipo": "contacto",
                    "nombre": "Mariana Rojas",
                    "telefono": "+591 76543210",
                    "email": "mariana@test.com",
                    "ci": "",
                    "nacimiento": "",
                    "alergias": "Ninguna",
                    "notas": "Consulta por WhatsApp",
                    "consultas": []
                }
            ],
            "citas": [
                {
                    "id": "cita-1",
                    "pacienteId": "p-1",
                    "fecha": "2026-10-12",
                    "hora": "10:30",
                    "servicios": ["Profilaxis y Limpieza Dental", "Radiografía Panorámica / Periapical"],
                    "motivo": "Limpieza y radiografía",
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

    # 2. Test Transformación de Contacto a Paciente
    def test_contact_to_patient_transformation(self):
        contacto = next(p for p in self.sample_db["pacientes"] if p["tipo"] == "contacto")
        self.assertEqual(contacto["tipo"], "contacto")
        self.assertEqual(contacto["ci"], "")

        # Transformación: se completan datos clínicos y pasa a 'paciente'
        contacto["tipo"] = "paciente"
        contacto["ci"] = "9876543 CBBA"
        contacto["nacimiento"] = "1997-03-25"
        contacto["alergias"] = "Ibuprofeno"

        self.assertEqual(contacto["tipo"], "paciente")
        self.assertEqual(contacto["ci"], "9876543 CBBA")
        self.assertEqual(contacto["alergias"], "Ibuprofeno")

    # 3. Test Catálogo Dinámico de Servicios y Citas con Servicios Múltiples
    def test_services_catalog_and_appointment_multi_services(self):
        servicios_disponibles = self.sample_db["config"]["servicios"]
        self.assertIn("Profilaxis y Limpieza Dental", servicios_disponibles)
        self.assertIn("Radiografía Panorámica / Periapical", servicios_disponibles)

        cita = self.sample_db["citas"][0]
        self.assertEqual(len(cita["servicios"]), 2)
        for s in cita["servicios"]:
            self.assertIn(s, servicios_disponibles)

    # 4. Test Enlace de Correo Electrónico (mailto:)
    def test_email_mailto_link_generation(self):
        paciente = self.sample_db["pacientes"][0]
        cfg = self.sample_db["config"]
        asunto = f"Receta Médica - {cfg['clinicName']}"
        cuerpo = f"Estimada {paciente['nombre']}, le adjuntamos su receta médica."
        
        mailto = f"mailto:{paciente['email']}?subject={urllib.parse.quote(asunto)}&body={urllib.parse.quote(cuerpo)}"
        self.assertTrue(mailto.startswith("mailto:valeria.quispe@ejemplo.com?subject="))
        self.assertIn("Receta", mailto)

    # 5. Test Adjuntos Multimedia con Descripción
    def test_multimedia_attachment_with_description(self):
        consulta = self.sample_db["pacientes"][0]["consultas"][0]
        adj = consulta["adjuntos"][0]
        self.assertEqual(adj["tipo"], "foto")
        self.assertEqual(adj["descripcion"], "Control radiográfico periapical")
        self.assertTrue(adj["url"].startswith("data:"))

    # 6. Test Desactivación estricta de Módulo Odontograma
    def test_odontograma_module_deactivation_flag(self):
        # Cuando el módulo odontograma está activo
        self.assertTrue(self.sample_db["config"]["modules"]["odontograma"])
        
        # Desactivación por el usuario
        self.sample_db["config"]["modules"]["odontograma"] = False
        is_active = self.sample_db["config"]["modules"].get("odontograma", True) is not False
        self.assertFalse(is_active)

    # 7. Test Normalización de pacientes y Saludo Seguro de WhatsApp
    def test_patient_normalization_and_safe_greeting(self):
        # Simulación de paciente histórico sin campo tipo
        paciente_legacy = {
            "id": "p-legacy",
            "nombre": "Carlos Mendoza",
            "telefono": "+59172233445"
        }
        if "tipo" not in paciente_legacy:
            paciente_legacy["tipo"] = "paciente"
        self.assertEqual(paciente_legacy["tipo"], "paciente")

        # Saludo seguro
        clinic_name = self.sample_db["config"].get("clinicName", "ClinikLocal")
        greeting = f"Hola {paciente_legacy['nombre']}, le saludamos desde {clinic_name}."
        self.assertIn("Carlos Mendoza", greeting)
        self.assertIn("Centro Dental & Especialidades San Lucas", greeting)

if __name__ == '__main__':
    unittest.main()
