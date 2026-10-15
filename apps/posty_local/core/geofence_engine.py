"""
GeofenceEngine: Motor de georreferenciación offline con cálculo de distancia Haversine
Opera sin internet, WiFi ni APIs de terceros. 100% en el hardware del móvil.
"""

import math
from typing import Optional


class GeoLocation:
    def __init__(self, name: str, latitude: float, longitude: float, radius_meters: float = 150.0):
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.radius_meters = radius_meters


class GeofenceEngine:
    EARTH_RADIUS_METERS = 6371000.0

    def calculate_haversine_distance(self, loc1: GeoLocation, loc2: GeoLocation) -> float:
        """
        Calcula la distancia ortodrómica en metros entre dos coordenadas geográficas
        utilizando la fórmula del semiverseno (Haversine).
        """
        phi1 = math.radians(loc1.latitude)
        phi2 = math.radians(loc2.latitude)
        delta_phi = math.radians(loc2.latitude - loc1.latitude)
        delta_lambda = math.radians(loc2.longitude - loc1.longitude)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return self.EARTH_RADIUS_METERS * c

    def is_inside_geofence(self, geofence: GeoLocation, position: GeoLocation) -> bool:
        distance = self.calculate_haversine_distance(geofence, position)
        return distance <= geofence.radius_meters

    def evaluate_transition(
        self,
        geofence: GeoLocation,
        previous_position: GeoLocation,
        new_position: GeoLocation
    ) -> Optional[str]:
        was_inside = self.is_inside_geofence(geofence, previous_position)
        is_now_inside = self.is_inside_geofence(geofence, new_position)

        if was_inside and not is_now_inside:
            return "EXIT"
        elif not was_inside and is_now_inside:
            return "ENTER"
        return None
