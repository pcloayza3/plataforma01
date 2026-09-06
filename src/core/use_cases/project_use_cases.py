import uuid
from typing import Optional
from src.core.domain.entities import ProyectoAsesoria, TableroKanban, TarjetaKanban
from src.core.domain.value_objects import ModalidadProyecto, EstadoTarea
from src.core.domain.exceptions import DomainException


class CreateProjectUseCase:
    """Caso de uso: Crear un nuevo ProyectoAsesoria y su TableroKanban."""

    def __init__(self, project_repo):
        self.project_repo = project_repo

    def execute(
        self,
        estudiante_id: uuid.UUID,
        consultor_id: uuid.UUID,
        titulo: str,
        modalidad: ModalidadProyecto,
        organizacion_id: Optional[uuid.UUID] = None
    ) -> ProyectoAsesoria:
        proyecto_id = uuid.uuid4()
        tablero = TableroKanban(id=uuid.uuid4(), proyecto_id=proyecto_id)

        proyecto = ProyectoAsesoria(
            id=proyecto_id,
            estudiante_id=estudiante_id,
            consultor_id=consultor_id,
            titulo=titulo,
            modalidad=modalidad,
            organizacion_id=organizacion_id,
            tablero=tablero
        )

        self.project_repo.save(proyecto)
        return proyecto


class UpdateKanbanTaskStatusUseCase:
    """Caso de uso: Actualizar estado de una tarjeta y recalcular el avance del proyecto."""

    def __init__(self, project_repo):
        self.project_repo = project_repo

    def execute(self, project_id: uuid.UUID, task_id: uuid.UUID, nuevo_estado: EstadoTarea) -> ProyectoAsesoria:
        proyecto = self.project_repo.get_by_id(project_id)
        if not proyecto:
            raise DomainException(f"Proyecto {project_id} no encontrado.")

        encontrada = False
        for task in proyecto._tarjetas:
            if task.id == task_id:
                encontrada = True
                if nuevo_estado == EstadoTarea.COMPLETADA:
                    task.completar()
                else:
                    task.estado = nuevo_estado
                break

        if not encontrada:
            raise DomainException(f"Tarjeta {task_id} no encontrada en el proyecto.")

        proyecto.recalcular_avance()
        self.project_repo.save(proyecto)
        return proyecto
