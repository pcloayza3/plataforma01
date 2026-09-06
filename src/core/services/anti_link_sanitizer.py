import re
from src.core.domain.exceptions import DisintermediationViolationException


class AntiLinkSanitizerService:
    """
    Filtro de seguridad contra la desintermediación.
    Detecta, valida y censura URLs, correos electrónicos y números telefónicos.
    """

    URL_PATTERN = re.compile(r"(https?://\S+|www\.\S+|\b[a-zA-Z0-9.-]+\.(?:com|bo|org|net|edu|io|co|me|dev)\b)", re.IGNORECASE)
    EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    PHONE_PATTERN = re.compile(r"(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{3,5}|\b\d{7,10}\b")

    def validate(self, text: str) -> bool:
        """
        Valida que el texto no contenga enlaces externos ni datos de contacto.
        Lanza DisintermediationViolationException si se detecta infracción.
        """
        if not text:
            return True

        if self.URL_PATTERN.search(text):
            raise DisintermediationViolationException("Se ha detectado un enlace web externo. No está permitido incluir URLs.")

        if self.EMAIL_PATTERN.search(text):
            raise DisintermediationViolationException("Se ha detectado un correo electrónico. La comunicación debe ser interna.")

        if self.PHONE_PATTERN.search(text):
            raise DisintermediationViolationException("Se ha detectado un número telefónico. La comunicación debe ser interna.")

        return True

    def sanitize(self, text: str) -> str:
        """Reemplaza cualquier dato de contacto detectado por una advertencia de bloqueo."""
        if not text:
            return ""

        result = self.URL_PATTERN.sub("[DATO DE CONTACTO BLOQUEADO]", text)
        result = self.EMAIL_PATTERN.sub("[DATO DE CONTACTO BLOQUEADO]", result)
        result = self.PHONE_PATTERN.sub("[DATO DE CONTACTO BLOQUEADO]", result)
        return result
