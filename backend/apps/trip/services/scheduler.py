"""Scheduler - Orchestrates the complete trip generation process."""
from typing import Any
from apps.trip.services.geocoding_service import geocode_multiple
from apps.trip.services.routing_service import get_route, RouteResult
from apps.trip.services.hos_engine import HOSEngine
from apps.trip.services.fuel_engine import calculate_fuel_stops
from apps.trip.services.timeline_generator import generate_timeline, format_timeline_event
from apps.trip.services.eld_generator import generate_eld_logs


class TripResult:

    def __init__(self) -> None:
        self.summary: dict[str, Any] = {}
        self.route: dict[str, Any] = {}
        self.timeline: list[dict[str, Any]] = []
        self.daily_logs: list[dict[str, Any]] = []
        self.trip_days: list[dict[str, Any]] = []

    def to_dict(self) -> dict[str, Any]:
        return {
            "summary": self.summary,
            "route": self.route,
            "timeline": self.timeline,
            "daily_logs": self.daily_logs,
            "trip_days": self.trip_days,
        }


def plan_trip(
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
    current_cycle_used: float,
) -> TripResult:
    result = TripResult()

    geocoded = geocode_multiple([current_location, pickup_location, dropoff_location])
    current_coords = geocoded[0]
    pickup_coords = geocoded[1]
    dropoff_coords = geocoded[2]

    route_to_pickup = get_route(
        origin=(current_coords.latitude, current_coords.longitude),
        destination=(pickup_coords.latitude, pickup_coords.longitude),
    )
    route_to_dropoff = get_route(
        origin=(pickup_coords.latitude, pickup_coords.longitude),
        destination=(dropoff_coords.latitude, dropoff_coords.longitude),
    )

    total_distance = route_to_pickup.distance_miles + route_to_dropoff.distance_miles
    total_duration = route_to_pickup.duration_minutes + route_to_dropoff.duration_minutes

    combined_polyline = route_to_pickup.polyline + route_to_dropoff.polyline
    combined_instructions = _combine_instructions(
        route_to_pickup.instructions, route_to_dropoff.instructions
    )

    bounds = _merge_bounds(route_to_pickup.bounds, route_to_dropoff.bounds)

    hos_engine = HOSEngine(current_cycle_used)
    days = hos_engine.generate_schedule(
        distance_miles=total_distance,
        duration_minutes=total_duration,
        pickup_location=pickup_location,
        dropoff_location=dropoff_location,
    )

    remaining_cycle = hos_engine.get_remaining_cycle()

    fuel_stops = calculate_fuel_stops(total_distance, combined_polyline)

    raw_timeline = generate_timeline(days)
    formatted_timeline = [format_timeline_event(e) for e in raw_timeline]

    daily_logs = generate_eld_logs(days, remaining_cycle)

    total_breaks = sum(
        1 for day in days
        for event in day.events
        if event.event_type == "break"
    )

    result.summary = {
        "distance_miles": round(total_distance, 2),
        "driving_hours": round(hos_engine.get_total_driving_minutes() / 60.0, 2),
        "trip_duration_hours": round(total_duration / 60.0, 2),
        "remaining_cycle_hours": round(remaining_cycle, 2),
        "fuel_stops": len(fuel_stops),
        "break_stops": total_breaks,
        "trip_days": len(days),
    }

    markers = [
        {
            "type": "current",
            "latitude": current_coords.latitude,
            "longitude": current_coords.longitude,
            "title": "Current Location",
            "description": current_location,
        },
        {
            "type": "pickup",
            "latitude": pickup_coords.latitude,
            "longitude": pickup_coords.longitude,
            "title": "Pickup Location",
            "description": pickup_location,
        },
        {
            "type": "dropoff",
            "latitude": dropoff_coords.latitude,
            "longitude": dropoff_coords.longitude,
            "title": "Dropoff Location",
            "description": dropoff_location,
        },
    ]

    for fs in fuel_stops:
        markers.append({
            "type": "fuel",
            "latitude": fs.latitude,
            "longitude": fs.longitude,
            "title": f"Fuel Stop #{fs.stop_number}",
            "description": f"Mile {fs.mile_marker:.0f}",
        })

    break_events = [
        e for day in days for e in day.events if e.event_type == "break"
    ]
    for i, break_event in enumerate(break_events):
        if break_event.location and combined_polyline:
            break_distance = break_event.distance_miles if hasattr(break_event, 'distance_miles') else 0
            cumulative_distance = sum(
                e.distance_miles for day in days for e in day.events
                if e.event_type == "driving" and e.end_minutes <= break_event.end_minutes
            )
            coords = _interpolate_on_polyline(combined_polyline, cumulative_distance, total_distance)
            markers.append({
                "type": "break",
                "latitude": coords[0],
                "longitude": coords[1],
                "title": f"Break Stop #{i + 1}",
                "description": break_event.description,
            })

    result.route = {
        "polyline": combined_polyline,
        "markers": markers,
        "instructions": combined_instructions,
        "bounds": bounds,
        "current_location": current_coords.to_dict(),
        "pickup_location": pickup_coords.to_dict(),
        "dropoff_location": dropoff_coords.to_dict(),
    }

    result.timeline = formatted_timeline
    result.daily_logs = daily_logs

    result.trip_days = [
        {
            "day": day.day_number,
            "driving_hours": round(day.driving_minutes / 60.0, 2),
            "distance_miles": round(day.distance_miles, 2),
            "events_count": len(day.events),
        }
        for day in days
    ]

    return result


def _combine_instructions(
    instructions1: list[dict[str, Any]],
    instructions2: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    combined = []
    step_num = 1

    for inst in instructions1:
        combined.append({
            "step": step_num,
            "text": inst["text"],
            "distance": inst["distance"],
            "duration": inst["duration"],
            "location": inst["location"],
        })
        step_num += 1

    combined.append({
        "step": step_num,
        "text": "Arrive at Pickup Location",
        "distance": 0,
        "duration": 0,
        "location": instructions2[0]["location"] if instructions2 else {},
    })
    step_num += 1

    for inst in instructions2:
        combined.append({
            "step": step_num,
            "text": inst["text"],
            "distance": inst["distance"],
            "duration": inst["duration"],
            "location": inst["location"],
        })
        step_num += 1

    return combined


def _merge_bounds(
    bounds1: dict[str, Any],
    bounds2: dict[str, Any],
) -> dict[str, Any]:
    if not bounds1:
        return bounds2
    if not bounds2:
        return bounds1

    return {
        "north": max(bounds1.get("north", -90), bounds2.get("north", -90)),
        "south": min(bounds1.get("south", 90), bounds2.get("south", 90)),
        "east": max(bounds1.get("east", -180), bounds2.get("east", -180)),
        "west": min(bounds1.get("west", 180), bounds2.get("west", 180)),
    }


def _interpolate_on_polyline(
    polyline: list[dict[str, Any]],
    target_distance: float,
    total_distance: float,
) -> tuple[float, float]:
    if not polyline:
        return (0.0, 0.0)
    if total_distance <= 0 or target_distance <= 0:
        return (polyline[0]["latitude"], polyline[0]["longitude"])
    if target_distance >= total_distance:
        return (polyline[-1]["latitude"], polyline[-1]["longitude"])

    target_fraction = target_distance / total_distance
    cumulative_fraction = 0.0

    for i in range(1, len(polyline)):
        prev = polyline[i - 1]
        curr = polyline[i]
        segment_fraction = 1.0 / len(polyline)
        if cumulative_fraction + segment_fraction >= target_fraction:
            local_fraction = (target_fraction - cumulative_fraction) / segment_fraction
            lat = prev["latitude"] + local_fraction * (curr["latitude"] - prev["latitude"])
            lon = prev["longitude"] + local_fraction * (curr["longitude"] - prev["longitude"])
            return (lat, lon)
        cumulative_fraction += segment_fraction

    return (polyline[-1]["latitude"], polyline[-1]["longitude"])
