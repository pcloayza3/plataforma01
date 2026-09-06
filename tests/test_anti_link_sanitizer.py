import unittest
from src.core.services.anti_link_sanitizer import AntiLinkSanitizerService
from src.core.domain.exceptions import DisintermediationViolationException


class TestAntiLinkSanitizer(unittest.TestCase):
    """Pruebas unitarias para el filtro anti-desintermediación (XP / TDD)."""

    def setUp(self):
        self.sanitizer = AntiLinkSanitizerService()

    def test_clean_text_passes_validation(self):
        clean_bio = "Licenciado en Ingeniería Informática con 10 años de experiencia en desarrollo web y tesis."
        self.assertTrue(self.sanitizer.validate(clean_bio))

    def test_text_with_http_url_raises_exception(self):
        text = "Visita mi portafolio en http://miportafolio.com para ver mis trabajos."
        with self.assertRaises(DisintermediationViolationException):
            self.sanitizer.validate(text)

    def test_text_with_https_url_raises_exception(self):
        text = "Pueden contactarme en https://linkedin.com/in/usuario"
        with self.assertRaises(DisintermediationViolationException):
            self.sanitizer.validate(text)

    def test_text_with_www_raises_exception(self):
        text = "Revisa www.asesorias.bo para más detalles."
        with self.assertRaises(DisintermediationViolationException):
            self.sanitizer.validate(text)

    def test_text_with_email_raises_exception(self):
        text = "Escríbeme a consultor@gmail.com para coordinar."
        with self.assertRaises(DisintermediationViolationException):
            self.sanitizer.validate(text)

    def test_text_with_phone_number_raises_exception(self):
        text = "Mi WhatsApp es +591 70012345, hablemos por ahí."
        with self.assertRaises(DisintermediationViolationException):
            self.sanitizer.validate(text)

    def test_clean_method_censors_detected_contact_info(self):
        text = "Mi contacto es info@test.com y mi web https://test.com"
        sanitized = self.sanitizer.sanitize(text)
        self.assertNotIn("info@test.com", sanitized)
        self.assertNotIn("https://test.com", sanitized)
        self.assertIn("[DATO DE CONTACTO BLOQUEADO]", sanitized)


if __name__ == "__main__":
    unittest.main()
