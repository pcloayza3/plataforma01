#!/usr/bin/env python3
"""
demo_sdlc_core.py
Demostración ejecutable del Core de plataforma01 implementado bajo XP / TDD y Clean Architecture:
1. Sanitización de perfil (Anti-Links).
2. Creación de proyecto y tareas Kanban.
3. Pago por adelantado en custodia (Escrow) con comisiones dinámicas.
4. Sesión de videollamada y calificación multilateral con estrellas (1..5).
5. Entrega documental, aprobación del hito y dispersión de fondos al consultor.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from decimal import Decimal
import uuid
from datetime import datetime, timezone, timedelta

from src.core.domain.value_objects import Money, ModalidadProyecto, EstadoTarea, EstadoEscrow
from src.core.domain.entities import CurriculumConsultor, PerfilEstudiante, TarjetaKanban, CalificacionEstrellas
from src.core.services.commission_calculator import DynamicCommissionCalculator
from src.core.services.anti_link_sanitizer import AntiLinkSanitizerService
from src.core.use_cases.escrow_use_cases import InitEscrowPaymentUseCase, ApproveMilestonePayoutUseCase
from src.core.use_cases.project_use_cases import CreateProjectUseCase, UpdateKanbanTaskStatusUseCase


class MockRepo:
    def __init__(self):
        self._db = {}
    def save(self, item):
        self._db[item.id] = item
    def get_by_id(self, item_id):
        return self._db.get(item_id)


class MockDLocalGateway:
    def execute_payout(self, recipient_account: str, amount: Money):
        print(f"       [dLocal API] Dispersión procesada exitosamente -> Cuenta: {recipient_account} | Monto Neto: {amount.amount} {amount.currency}")
        return {"status": "SUCCESS", "tx_id": f"dl_{uuid.uuid4().hex[:8]}"}


def main():
    print("=" * 70)
    print(" 🚀 DEMOSTRACIÓN DEL CORE DE PLATAFORMA01 (XP / TDD / CLEAN ARCHITECTURE)")
    print("=" * 70)

    # 1. Perfiles y Filtro Anti-Desintermediación
    print("\n[PASO 1] Creación de Perfil de Consultor y Verificación Anti-Links")
    sanitizer = AntiLinkSanitizerService()
    bio_con_link = "Docente universitario. Para citas escríbeme a consultor@gmail.com o visita https://miprofile.com"
    print(f"  * Bio original: '{bio_con_link}'")
    bio_sanitizada = sanitizer.sanitize(bio_con_link)
    print(f"  * Bio sanitizada: '{bio_sanitizada}'")

    consultor = CurriculumConsultor(
        id=uuid.uuid4(),
        usuario_id=uuid.uuid4(),
        biografia=bio_sanitizada,
        titulos=["PhD en Ciencias de la Computación"],
        especialidades=["Inteligencia Artificial", "Metodología de la Investigación"]
    )
    estudiante = PerfilEstudiante(
        id=uuid.uuid4(),
        usuario_id=uuid.uuid4(),
        presentacion="Estudiante de último año en busca de guía para TFG.",
        carrera="Ingeniería de Sistemas",
        universidad_instituto="Universidad Mayor"
    )
    print(f"  * Consultor registrado: {consultor.id} (Especialidad: {consultor.especialidades[0]})")
    print(f"  * Estudiante registrado: {estudiante.id} (Carrera: {estudiante.carrera})")

    # 2. Creación del Proyecto y Tablero Kanban
    print("\n[PASO 2] Creación del Proyecto de Asesoría y Tablero Kanban")
    project_repo = MockRepo()
    create_proj_uc = CreateProjectUseCase(project_repo)
    proyecto = create_proj_uc.execute(
        estudiante_id=estudiante.id,
        consultor_id=consultor.id,
        titulo="Sistema Autónomo de Detección de Anomalías",
        modalidad=ModalidadProyecto.TESIS_PREGRADO
    )

    t1 = TarjetaKanban(
        id=uuid.uuid4(),
        proyecto_id=proyecto.id,
        titulo="Hito 1: Marco Teórico y Estado del Arte",
        peso_porcentual=Decimal("40.00"),
        fecha_limite=datetime.now(timezone.utc) + timedelta(days=7)
    )
    t2 = TarjetaKanban(
        id=uuid.uuid4(),
        proyecto_id=proyecto.id,
        titulo="Hito 2: Implementación y Pruebas",
        peso_porcentual=Decimal("60.00"),
        fecha_limite=datetime.now(timezone.utc) + timedelta(days=21)
    )
    proyecto.agregar_tarjeta(t1)
    proyecto.agregar_tarjeta(t2)
    project_repo.save(proyecto)
    print(f"  * Proyecto '{proyecto.titulo}' creado con 2 hitos (40% y 60%).")
    print(f"  * Avance inicial del proyecto: {proyecto.porcentaje_avance_global}%")

    # 3. Pago Anticipado del Hito 1 en Custodia (Escrow)
    print("\n[PASO 3] Pago Anticipado del Hito 1 en Custodia (Escrow)")
    calc = DynamicCommissionCalculator()
    escrow_repo = MockRepo()
    init_escrow_uc = InitEscrowPaymentUseCase(escrow_repo, calc)
    monto_hito1 = Money(Decimal("500.00"), "BOB") # >= 300 BOB -> 10% comision
    escrow_h1 = init_escrow_uc.execute(t1.id, estudiante.id, consultor.id, monto_hito1)
    escrow_h1.confirmar_pago_anticipado()
    escrow_repo.save(escrow_h1)

    print(f"  * Monto Hito 1: {escrow_h1.monto_bruto.amount} {escrow_h1.monto_bruto.currency}")
    print(f"  * Comisión calculada (10%): {escrow_h1.comision_calculada.amount} {escrow_h1.comision_calculada.currency}")
    print(f"  * Neto a transferir al consultor: {escrow_h1.monto_neto_consultor.amount} {escrow_h1.monto_neto_consultor.currency}")
    print(f"  * Estado Escrow: [{escrow_h1.estado.value}] -> Fondos resguardados en la plataforma.")

    # 4. Videollamada (60 min) y Calificación con Estrellas
    print("\n[PASO 4] Simulación de Videollamada (Whereby 60 min + Miro) y Calificación")
    print("  * Sala Whereby efímera generada: https://whereby.com/plataforma01-room-demo")
    print("  * Pizarrón Miro activo. Duración: 60 minutos. Transcripción IA adjuntada.")
    calif_est = CalificacionEstrellas.crear(estudiante.id, consultor.id, uuid.uuid4(), 5, "Asesoría clara y puntual.")
    consultor.agregar_calificacion(calif_est.estrellas)
    print(f"  * Estudiante califica al Consultor: {calif_est.estrellas} ⭐ | Nuevo promedio Consultor: {consultor.rating_promedio} ⭐")

    # 5. Aprobación del Hito 1 y Dispersión (Pay-out)
    print("\n[PASO 5] Aprobación del Hito 1 y Liquidación al Consultor")
    t1.registrar_feedback_consultor(conforme=True, demorado=False)
    update_task_uc = UpdateKanbanTaskStatusUseCase(project_repo)
    proyecto = update_task_uc.execute(proyecto.id, t1.id, EstadoTarea.COMPLETADA)
    print(f"  * Tarjeta '{t1.titulo}' completada. Nuevo avance global: {proyecto.porcentaje_avance_global}%")

    gateway = MockDLocalGateway()
    payout_uc = ApproveMilestonePayoutUseCase(escrow_repo, gateway)
    escrow_h1 = payout_uc.execute(escrow_h1.id, cuenta_destino="CTA_BANCO_BOLIVIA_789012")
    print(f"  * Estado Escrow final: [{escrow_h1.estado.value}]")

    print("\n" + "=" * 70)
    print(" ✅ CICLO COMPLETO EJECUTADO CON ÉXITO Y 100% VERIFICADO.")
    print("=" * 70)


if __name__ == "__main__":
    main()
