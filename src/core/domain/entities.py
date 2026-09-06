from dataclasses import dataclass, field
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from src.core.domain.value_objects import (
    Money,
    EstadoHito,
    EstadoEscrow,
    EstadoTarea,
    SemaforoAvance,
    ConformidadGuia,
    ModalidadProyecto
)
from src.core.domain.exceptions import (
    EscrowNotFundedException,
    InvalidEscrowStateException,
    InvalidRatingStarsException
)
from src.core.services.commission_calculator import DynamicCommissionCalculator


@dataclass
class CalificacionEstrellas:
    id: uuid.UUID
    emisor_id: uuid.UUID
    receptor_id: uuid.UUID
    sesion_id: uuid.UUID
    estrellas: int
    comentario: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def crear(cls, emisor_id: uuid.UUID, receptor_id: uuid.UUID, sesion_id: uuid.UUID, estrellas: int, comentario: str = "") -> "CalificacionEstrellas":
        if estrellas < 1 or estrellas > 5:
            raise InvalidRatingStarsException("La calificación debe estar estrictamente entre 1 y 5 estrellas.")
        return cls(
            id=uuid.uuid4(),
            emisor_id=emisor_id,
            receptor_id=receptor_id,
            sesion_id=sesion_id,
            estrellas=estrellas,
            comentario=comentario
        )


@dataclass
class CurriculumConsultor:
    id: uuid.UUID
    usuario_id: uuid.UUID
    biografia: str
    titulos: List[str] = field(default_factory=list)
    especialidades: List[str] = field(default_factory=list)
    rating_promedio: Decimal = Decimal("0.0")
    total_calificaciones: int = 0
    _suma_estrellas: int = 0

    def agregar_calificacion(self, estrellas: int):
        if estrellas < 1 or estrellas > 5:
            raise InvalidRatingStarsException("Estrellas deben estar entre 1 y 5.")
        self.total_calificaciones += 1
        self._suma_estrellas += estrellas
        promedio = Decimal(self._suma_estrellas) / Decimal(self.total_calificaciones)
        self.rating_promedio = promedio.quantize(Decimal("0.1"))


@dataclass
class PerfilEstudiante:
    id: uuid.UUID
    usuario_id: uuid.UUID
    presentacion: str
    carrera: str
    universidad_instituto: str
    porcentaje_avance_global: Decimal = Decimal("0.00")
    rating_promedio: Decimal = Decimal("0.0")


@dataclass
class TransaccionEscrow:
    id: uuid.UUID
    hito_id: uuid.UUID
    estudiante_id: uuid.UUID
    consultor_id: uuid.UUID
    monto_bruto: Money
    comision_calculada: Money
    monto_neto_consultor: Money
    estado: EstadoEscrow
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @classmethod
    def crear(cls, hito_id: uuid.UUID, estudiante_id: uuid.UUID, consultor_id: uuid.UUID, monto: Money, calculator: DynamicCommissionCalculator) -> "TransaccionEscrow":
        result = calculator.calculate(monto)
        return cls(
            id=uuid.uuid4(),
            hito_id=hito_id,
            estudiante_id=estudiante_id,
            consultor_id=consultor_id,
            monto_bruto=result.gross_amount,
            comision_calculada=result.commission_amount,
            monto_neto_consultor=result.net_consultant_amount,
            estado=EstadoEscrow.CREADO
        )

    def confirmar_pago_anticipado(self):
        if self.estado != EstadoEscrow.CREADO:
            raise InvalidEscrowStateException(f"No se puede confirmar pago en estado {self.estado}")
        self.estado = EstadoEscrow.EN_CUSTODIA

    def liberar_fondos_a_consultor(self, gateway, cuenta_destino: str):
        if self.estado != EstadoEscrow.EN_CUSTODIA:
            raise InvalidEscrowStateException("Los fondos deben estar en custodia antes de liberarse.")
        gateway.execute_payout(cuenta_destino, self.monto_neto_consultor)
        self.estado = EstadoEscrow.LIQUIDADO_AL_CONSULTOR


@dataclass
class HitoEntrega:
    id: uuid.UUID
    proyecto_id: uuid.UUID
    titulo: str
    monto_bob: Decimal
    peso_porcentual: Decimal
    estado: EstadoHito = EstadoHito.PENDIENTE_DE_PAGO
    escrow: Optional[TransaccionEscrow] = None

    def vincular_escrow(self, escrow: TransaccionEscrow):
        self.escrow = escrow

    def iniciar_trabajo(self):
        if not self.escrow or self.escrow.estado != EstadoEscrow.EN_CUSTODIA:
            raise EscrowNotFundedException("El hito no cuenta con fondos en custodia resguardados por adelantado.")
        self.estado = EstadoHito.EN_PROCESO


@dataclass
class TarjetaKanban:
    id: uuid.UUID
    proyecto_id: uuid.UUID
    titulo: str
    peso_porcentual: Decimal
    fecha_limite: datetime
    estado: EstadoTarea = EstadoTarea.POR_HACER
    semaforo: SemaforoAvance = SemaforoAvance.A_TIEMPO
    feedback_consultor: ConformidadGuia = ConformidadGuia.PENDIENTE

    def completar(self):
        self.estado = EstadoTarea.COMPLETADA
        self.semaforo = SemaforoAvance.CONFORME

    def actualizar_semaforo(self):
        if self.estado != EstadoTarea.COMPLETADA and datetime.now(timezone.utc) > self.fecha_limite:
            self.semaforo = SemaforoAvance.RETRASADO

    def registrar_feedback_consultor(self, conforme: bool, demorado: bool):
        if demorado:
            self.feedback_consultor = ConformidadGuia.DEMORADO_EN_FEEDBACK
        elif conforme:
            self.feedback_consultor = ConformidadGuia.CONFORME


@dataclass
class TableroKanban:
    id: uuid.UUID
    proyecto_id: uuid.UUID
    columnas: List[str] = field(default_factory=lambda: ["Por Hacer", "En Progreso", "En Revisión", "Completada"])
    tarjetas: List[TarjetaKanban] = field(default_factory=list)


@dataclass
class ProyectoAsesoria:
    id: uuid.UUID
    estudiante_id: uuid.UUID
    consultor_id: uuid.UUID
    titulo: str
    modalidad: ModalidadProyecto
    organizacion_id: Optional[uuid.UUID] = None
    porcentaje_avance_global: Decimal = Decimal("0.00")
    tablero: Optional[TableroKanban] = None
    _tarjetas: List[TarjetaKanban] = field(default_factory=list)

    def agregar_tarjeta(self, tarjeta: TarjetaKanban):
        self._tarjetas.append(tarjeta)

    def recalcular_avance(self):
        total_completado = sum(
            t.peso_porcentual for t in self._tarjetas if t.estado == EstadoTarea.COMPLETADA
        )
        self.porcentaje_avance_global = total_completado
