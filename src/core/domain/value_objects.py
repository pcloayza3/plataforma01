from dataclasses import dataclass
from decimal import Decimal
from enum import Enum


class RolUsuario(str, Enum):
    ESTUDIANTE_PREGRADO = "estudiante_pregrado"
    INVESTIGADOR_POSGRADO = "investigador_posgrado"
    CONSULTOR_EXPERTO = "consultor_experto"
    EMPRESA = "empresa"
    INSTITUCION_ACADEMICA = "institucion_academica"
    ADMINISTRADOR = "administrador"


class ModalidadProyecto(str, Enum):
    TESIS_PREGRADO = "tesis_pregrado"
    TESIS_POSGRADO = "tesis_posgrado"
    PRACTICA_PROFESIONAL = "practica_profesional"


class EstadoHito(str, Enum):
    PENDIENTE_DE_PAGO = "pendiente_de_pago"
    EN_PROCESO = "en_proceso"
    EN_REVISION = "en_revision"
    APROBADO = "aprobado"


class EstadoEscrow(str, Enum):
    CREADO = "creado"
    EN_CUSTODIA = "en_custodia"
    LIQUIDADO_AL_CONSULTOR = "liquidado_al_consultor"
    EN_DISPUTA = "en_disputa"
    REEMBOLSADO = "reembolsado"


class EstadoTarea(str, Enum):
    POR_HACER = "por_hacer"
    EN_PROGRESO = "en_progreso"
    EN_REVISION = "en_revision"
    COMPLETADA = "completada"


class SemaforoAvance(str, Enum):
    A_TIEMPO = "a_tiempo"
    TRABAJANDO = "trabajando"
    RETRASADO = "retrasado"
    CONFORME = "conforme"


class ConformidadGuia(str, Enum):
    PENDIENTE = "pendiente"
    CONFORME = "conforme"
    DEMORADO_EN_FEEDBACK = "demorado_en_feedback"


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "BOB"

    def __post_init__(self):
        if self.amount < Decimal("0.00"):
            raise ValueError("El monto monetario no puede ser negativo.")

    def __add__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("No se pueden sumar montos de diferentes monedas.")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("No se pueden restar montos de diferentes monedas.")
        return Money(self.amount - other.amount, self.currency)


@dataclass(frozen=True)
class CommissionCalculationResult:
    gross_amount: Money
    commission_rate: Decimal
    commission_amount: Money
    net_consultant_amount: Money
