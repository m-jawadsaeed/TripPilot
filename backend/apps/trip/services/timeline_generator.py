"""Timeline generator for TripPilot."""
from typing import Any
from apps.trip.services.hos_engine import DrivingDay, DutyEvent


def generate_timeline(days: list[DrivingDay]) -> list[dict[str, Any]]:
    """Convert the trip schedule into chronological timeline events.

    Args:
        days: List of DrivingDay objects from the HOS engine.

    Returns:
        List of timeline event dictionaries.
    """
    timeline: list[dict[str, Any]] = []
    global_minutes = 0

    for day in days:
        day_start_global = global_minutes

        for event in day.events:
            event_start_global = day_start_global + event.start_minutes
            event_end_global = day_start_global + event.end_minutes

            timeline.append({
                "type": event.event_type,
                "status": event.duty_status,
                "start_minutes": event_start_global,
                "end_minutes": event_end_global,
                "duration_minutes": event.duration_minutes,
                "day": day.day_number,
                "location": event.location,
                "description": event.description,
                "distance_miles": event.distance_miles,
            })

        if day.events:
            last_event = day.events[-1]
            global_minutes = day_start_global + last_event.end_minutes

    return timeline


def format_timeline_event(event: dict[str, Any]) -> dict[str, Any]:
    """Format a timeline event for display."""
    start_hours = event["start_minutes"] // 60
    start_mins = event["start_minutes"] % 60
    end_hours = event["end_minutes"] // 60
    end_mins = event["end_minutes"] % 60

    return {
        "type": event["type"],
        "status": event["status"],
        "start_time": f"{start_hours:02d}:{start_mins:02d}",
        "end_time": f"{end_hours:02d}:{end_mins:02d}",
        "duration_minutes": event["duration_minutes"],
        "day": event["day"],
        "location": event["location"],
        "description": event["description"],
        "distance_miles": event.get("distance_miles", 0),
    }
