"""Fuel stop engine for TripPilot."""
from typing import Any
from apps.trip.utils.constants import FUEL_INTERVAL_MILES, FUEL_STOP_DURATION_MINUTES


class FuelStop:
    """Represents a fuel stop along the route."""

    def __init__(
        self,
        mile_marker: float,
        latitude: float,
        longitude: float,
        stop_number: int,
    ) -> None:
        self.mile_marker = mile_marker
        self.latitude = latitude
        self.longitude = longitude
        self.stop_number = stop_number

    def to_dict(self) -> dict[str, Any]:
        return {
            "mile_marker": self.mile_marker,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "stop_number": self.stop_number,
            "duration_minutes": FUEL_STOP_DURATION_MINUTES,
        }


def calculate_fuel_stops(
    total_distance: float,
    polyline: list[dict[str, float]],
) -> list[FuelStop]:
    """Calculate fuel stop positions along the route.

    Args:
        total_distance: Total route distance in miles.
        polyline: Route polyline coordinates.

    Returns:
        List of FuelStop objects positioned along the route.
    """
    if total_distance <= 0 or not polyline:
        return []

    num_stops = int(total_distance // FUEL_INTERVAL_MILES)
    if num_stops == 0:
        return []

    stops: list[FuelStop] = []
    total_points = len(polyline)

    for i in range(1, num_stops + 1):
        target_mile = i * FUEL_INTERVAL_MILES
        fraction = target_mile / total_distance

        point_index = min(int(fraction * (total_points - 1)), total_points - 1)
        point = polyline[point_index]

        stops.append(FuelStop(
            mile_marker=target_mile,
            latitude=point["latitude"],
            longitude=point["longitude"],
            stop_number=i,
        ))

    return stops



