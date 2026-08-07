"""Routing service using OSRM (Open Source Routing Machine)."""
import time
import logging
from typing import Any
import requests
from apps.trip.utils.constants import (
    ROUTING_API_URL,
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY,
)

logger = logging.getLogger(__name__)


class RouteResult:
    """Result from a routing request."""

    def __init__(
        self,
        distance_miles: float,
        duration_minutes: float,
        polyline: list[dict[str, float]],
        instructions: list[dict[str, Any]],
        bounds: dict[str, Any] | None = None,
    ) -> None:
        self.distance_miles = distance_miles
        self.duration_minutes = duration_minutes
        self.polyline = polyline
        self.instructions = instructions
        self.bounds = bounds or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "distance_miles": self.distance_miles,
            "duration_minutes": self.duration_minutes,
            "polyline": self.polyline,
            "instructions": self.instructions,
            "bounds": self.bounds,
        }


def get_route(
    origin: tuple[float, float],
    destination: tuple[float, float],
    waypoints: list[tuple[float, float]] | None = None,
) -> RouteResult:
    """Get a driving route from origin to destination.

    Args:
        origin: (lat, lon) of origin.
        destination: (lat, lon) of destination.
        waypoints: Optional list of (lat, lon) intermediate points.

    Returns:
        RouteResult with distance, duration, polyline, instructions.

    Raises:
        ValueError: If no route found.
        ConnectionError: If API unreachable.
    """
    coordinates = [f"{origin[1]},{origin[0]}"]
    if waypoints:
        for wp in waypoints:
            coordinates.append(f"{wp[1]},{wp[0]}")
    coordinates.append(f"{destination[1]},{destination[0]}")

    coords_str = ";".join(coordinates)
    url = f"{ROUTING_API_URL}/{coords_str}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true",
        "annotations": "true",
    }

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(
                "Requesting route from (%s, %s) to (%s, %s) (attempt %d)",
                origin[0], origin[1], destination[0], destination[1], attempt + 1,
            )
            response = requests.get(
                url, params=params, timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            data = response.json()

            if data.get("code") != "Ok" or not data.get("routes"):
                raise ValueError("No route found between the specified locations.")

            route = data["routes"][0]
            distance_meters = route["distance"]
            duration_seconds = route["duration"]
            distance_miles = distance_meters * 0.000621371
            duration_minutes = duration_seconds / 60.0

            geometry = route.get("geometry", {})
            polyline = _extract_polyline(geometry)

            instructions = _extract_instructions(route.get("legs", []))

            bounds = _calculate_bounds(polyline)

            return RouteResult(
                distance_miles=round(distance_miles, 2),
                duration_minutes=round(duration_minutes, 2),
                polyline=polyline,
                instructions=instructions,
                bounds=bounds,
            )

        except requests.exceptions.Timeout as e:
            last_error = e
            logger.warning("Routing timeout (attempt %d)", attempt + 1)
        except requests.exceptions.ConnectionError as e:
            last_error = e
            logger.warning("Routing connection error (attempt %d)", attempt + 1)
        except ValueError:
            raise
        except Exception as e:
            last_error = e
            logger.error("Unexpected routing error: %s", str(e))

        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY * (attempt + 1))

    if isinstance(last_error, (requests.exceptions.Timeout, requests.exceptions.ConnectionError)):
        raise ConnectionError("Routing service unavailable. Please try again later.")
    raise ValueError("Could not generate route.")


def _extract_polyline(geometry: dict[str, Any]) -> list[dict[str, float]]:
    """Extract polyline coordinates from GeoJSON geometry."""
    coords = geometry.get("coordinates", [])
    return [{"longitude": c[0], "latitude": c[1]} for c in coords]


def _extract_instructions(legs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Extract turn-by-turn instructions from route legs."""
    instructions: list[dict[str, Any]] = []
    step_num = 1

    for leg in legs:
        for step in leg.get("steps", []):
            maneuver = step.get("maneuver", {})
            location = maneuver.get("location", [0, 0])
            instructions.append({
                "step": step_num,
                "text": step.get("name", "Continue"),
                "distance": round(step.get("distance", 0) * 0.000621371, 2),
                "duration": round(step.get("duration", 0) / 60.0, 1),
                "type": maneuver.get("type", ""),
                "modifier": maneuver.get("modifier", ""),
                "location": {
                    "latitude": location[1],
                    "longitude": location[0],
                },
            })
            step_num += 1

    return instructions


def _calculate_bounds(polyline: list[dict[str, float]]) -> dict[str, Any]:
    """Calculate bounding box for the polyline."""
    if not polyline:
        return {}

    lats = [p["latitude"] for p in polyline]
    lons = [p["longitude"] for p in polyline]

    return {
        "north": max(lats),
        "south": min(lats),
        "east": max(lons),
        "west": min(lons),
    }
