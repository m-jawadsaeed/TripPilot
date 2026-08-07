"""Constants for TripPilot application."""
from enum import Enum


class DutyStatus(str, Enum):
    OFF_DUTY = "off_duty"
    SLEEPER_BERTH = "sleeper_berth"
    DRIVING = "driving"
    ON_DUTY_NOT_DRIVING = "on_duty_not_driving"


class EventType(str, Enum):
    PICKUP = "pickup"
    DROPOFF = "dropoff"
    DRIVING = "driving"
    FUEL_STOP = "fuel_stop"
    BREAK = "break"
    REST = "rest"


MAX_DRIVING_HOURS: int = 11
MAX_DRIVING_WINDOW_HOURS: int = 14
BREAK_AFTER_DRIVING_HOURS: int = 8
BREAK_DURATION_MINUTES: int = 30
REST_DURATION_HOURS: int = 10
MAX_CYCLE_HOURS: int = 70
CYCLE_DAYS: int = 8

PICKUP_DURATION_MINUTES: int = 60
DROPOFF_DURATION_MINUTES: int = 60
FUEL_STOP_DURATION_MINUTES: int = 30

FUEL_INTERVAL_MILES: int = 1000

GEOCODING_API_URL: str = "https://nominatim.openstreetmap.org/search"
ROUTING_API_URL: str = "https://router.project-osrm.org/route/v1/driving"
REQUEST_TIMEOUT: int = 30
MAX_RETRIES: int = 3
RETRY_DELAY: float = 1.0

TIMEZONE = "UTC"
