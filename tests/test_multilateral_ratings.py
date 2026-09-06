import unittest
from decimal import Decimal
import uuid
from src.core.domain.entities import CalificacionEstrellas, CurriculumConsultor, PerfilEstudiante
from src.core.domain.exceptions import InvalidRatingStarsException


class TestMultilateralRatings(unittest.TestCase):
    """Pruebas para calificaciones multilaterales de 1 a 5 estrellas (XP / TDD)."""

    def test_valid_rating_between_1_and_5_stars(self):
        calificacion = CalificacionEstrellas.crear(
            emisor_id=uuid.uuid4(),
            receptor_id=uuid.uuid4(),
            sesion_id=uuid.uuid4(),
            estrellas=5,
            comentario="Excelente asesoría metodológica."
        )
        self.assertEqual(calificacion.estrellas, 5)

    def test_rating_below_1_or_above_5_raises_exception(self):
        with self.assertRaises(InvalidRatingStarsException):
            CalificacionEstrellas.crear(
                emisor_id=uuid.uuid4(),
                receptor_id=uuid.uuid4(),
                sesion_id=uuid.uuid4(),
                estrellas=0
            )

        with self.assertRaises(InvalidRatingStarsException):
            CalificacionEstrellas.crear(
                emisor_id=uuid.uuid4(),
                receptor_id=uuid.uuid4(),
                sesion_id=uuid.uuid4(),
                estrellas=6
            )

    def test_consultant_average_rating_calculation(self):
        consultor = CurriculumConsultor(
            id=uuid.uuid4(),
            usuario_id=uuid.uuid4(),
            biografia="Experto en investigación cuantitativa."
        )
        self.assertEqual(consultor.rating_promedio, Decimal("0.0"))
        self.assertEqual(consultor.total_calificaciones, 0)

        # Calificación 1: 5 estrellas
        consultor.agregar_calificacion(5)
        self.assertEqual(consultor.rating_promedio, Decimal("5.0"))

        # Calificación 2: 4 estrellas -> Promedio: 4.5
        consultor.agregar_calificacion(4)
        self.assertEqual(consultor.rating_promedio, Decimal("4.5"))


if __name__ == "__main__":
    unittest.main()
