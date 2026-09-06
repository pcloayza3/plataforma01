"""
Excepciones de dominio del sistema plataforma01.
"""

class DomainException(Exception):
    """Excepción base para reglas del dominio."""
    pass


class DisintermediationViolationException(DomainException):
    """Se dispara cuando se detecta un intento de compartir datos de contacto externos."""
    pass


class EscrowNotFundedException(DomainException):
    """Se dispara cuando se intenta iniciar un hito sin fondos en custodia confirmados."""
    pass


class InvalidEscrowStateException(DomainException):
    """Se dispara ante transiciones de estado de custodia inválidas."""
    pass


class InvalidRatingStarsException(DomainException):
    """Se dispara cuando la calificación no está en el rango de 1 a 5 estrellas."""
    pass
