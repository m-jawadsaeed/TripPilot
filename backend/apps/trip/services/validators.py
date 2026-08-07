"""Input validation service for TripPilot."""
from typing import Any
from apps.trip.utils.constants import MAX_CYCLE_HOURS


def validate_trip_input(data: dict[str, Any]) -> list[dict[str, str]]:
    """Validate trip input data. Returns list of errors (empty if valid)."""
    errors: list[dict[str, str]] = []

    required_fields = [
        "current_location",
        "pickup_location",
        "dropoff_location",
        "current_cycle_used",
    ]

    for field in required_fields:
        if field not in data or data[field] is None:
            errors.append({"field": field, "message": f"{field} is required."})

    if errors:
        return errors

    location_fields = ["current_location", "pickup_location", "dropoff_location"]
    for field in location_fields:
        value = str(data[field]).strip()
        if not value:
            errors.append({"field": field, "message": f"{field} cannot be empty."})
        elif len(value) < 2:
            errors.append({"field": field, "message": f"{field} must be at least 2 characters."})

    cycle_used = data.get("current_cycle_used")
    if cycle_used is not None:
        try:
            cycle_val = float(cycle_used)
            if cycle_val < 0:
                errors.append({"field": "current_cycle_used", "message": "Cycle hours cannot be negative."})
            elif cycle_val > MAX_CYCLE_HOURS:
                errors.append({
                    "field": "current_cycle_used",
                    "message": f"Cycle hours cannot exceed {MAX_CYCLE_HOURS}."
                })
        except (TypeError, ValueError):
            errors.append({"field": "current_cycle_used", "message": "Invalid cycle hours value."})

    pickup = str(data.get("pickup_location", "")).strip()
    dropoff = str(data.get("dropoff_location", "")).strip()
    if pickup and dropoff and pickup.lower() == dropoff.lower():
        errors.append({
            "field": "dropoff_location",
            "message": "Pickup and dropoff locations cannot be the same."
        })

    return errors
