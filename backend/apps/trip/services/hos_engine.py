"""Hours of Service (HOS) Engine - Core scheduling logic."""
from typing import Any
from apps.trip.utils.constants import (
    DutyStatus,
    EventType,
    MAX_DRIVING_HOURS,
    MAX_DRIVING_WINDOW_HOURS,
    BREAK_AFTER_DRIVING_HOURS,
    BREAK_DURATION_MINUTES,
    REST_DURATION_HOURS,
    MAX_CYCLE_HOURS,
    PICKUP_DURATION_MINUTES,
    DROPOFF_DURATION_MINUTES,
    FUEL_STOP_DURATION_MINUTES,
)


class DutyEvent:

    def __init__(
        self,
        event_type: str,
        duty_status: str,
        start_minutes: int,
        end_minutes: int,
        location: str = "",
        description: str = "",
        distance_miles: float = 0.0,
    ) -> None:
        self.event_type = event_type
        self.duty_status = duty_status
        self.start_minutes = start_minutes
        self.end_minutes = end_minutes
        self.duration_minutes = end_minutes - start_minutes
        self.location = location
        self.description = description
        self.distance_miles = distance_miles

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": self.event_type,
            "status": self.duty_status,
            "start_minutes": self.start_minutes,
            "end_minutes": self.end_minutes,
            "duration_minutes": self.duration_minutes,
            "location": self.location,
            "description": self.description,
            "distance_miles": self.distance_miles,
        }


class DrivingDay:

    def __init__(self, day_number: int) -> None:
        self.day_number = day_number
        self.events: list[DutyEvent] = []
        self.driving_minutes: int = 0
        self.on_duty_minutes: int = 0
        self.off_duty_minutes: int = 0
        self.distance_miles: float = 0.0

    def add_event(self, event: DutyEvent) -> None:
        self.events.append(event)
        if event.duty_status == DutyStatus.DRIVING:
            self.driving_minutes += event.duration_minutes
        if event.duty_status in (DutyStatus.DRIVING, DutyStatus.ON_DUTY_NOT_DRIVING):
            self.on_duty_minutes += event.duration_minutes
        if event.duty_status == DutyStatus.OFF_DUTY:
            self.off_duty_minutes += event.duration_minutes
        self.distance_miles += event.distance_miles

    def to_dict(self) -> dict[str, Any]:
        return {
            "day_number": self.day_number,
            "events": [e.to_dict() for e in self.events],
            "driving_minutes": self.driving_minutes,
            "on_duty_minutes": self.on_duty_minutes,
            "off_duty_minutes": self.off_duty_minutes,
            "distance_miles": round(self.distance_miles, 2),
        }


class HOSEngine:

    def __init__(self, current_cycle_used: float) -> None:
        self.current_cycle_used = min(current_cycle_used, MAX_CYCLE_HOURS)
        self.remaining_cycle = MAX_CYCLE_HOURS - self.current_cycle_used
        self.days: list[DrivingDay] = []
        self.all_events: list[DutyEvent] = []

        self._driving_in_window: int = 0
        self._window_start: int = 0
        self._cumulative_driving: int = 0
        self._day_start: int = 0

    def generate_schedule(
        self,
        distance_miles: float,
        duration_minutes: float,
        pickup_location: str,
        dropoff_location: str,
    ) -> list[DrivingDay]:
        current_day = DrivingDay(day_number=1)
        self.days.append(current_day)

        current_minutes = 0
        distance_covered = 0.0
        miles_per_minute = distance_miles / duration_minutes if duration_minutes > 0 else 0

        pickup_event = DutyEvent(
            event_type=EventType.PICKUP,
            duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
            start_minutes=current_minutes,
            end_minutes=current_minutes + PICKUP_DURATION_MINUTES,
            location=pickup_location,
            description="Pickup - Loading cargo",
        )
        current_day.add_event(pickup_event)
        current_minutes += PICKUP_DURATION_MINUTES
        self._window_start = current_minutes
        self._driving_in_window = 0

        remaining_distance = distance_miles
        remaining_duration = duration_minutes

        while remaining_distance > 0.1 or remaining_duration > 0.1:
            available_window = MAX_DRIVING_WINDOW_HOURS * 60 - (current_minutes - self._day_start)
            available_driving = MAX_DRIVING_HOURS * 60 - self._driving_in_window

            if available_window <= 0 or available_driving <= 0:
                current_day, current_minutes = self._add_overnight_rest(
                    current_day, current_minutes
                )
                self._driving_in_window = 0
                self._day_start = current_minutes
                self._window_start = current_minutes
                continue

            drive_budget = min(
                available_driving,
                available_window,
                remaining_duration,
            )

            time_until_break = BREAK_AFTER_DRIVING_HOURS * 60 - self._cumulative_driving
            if time_until_break <= 0:
                break_event = DutyEvent(
                    event_type=EventType.BREAK,
                    duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
                    start_minutes=current_minutes,
                    end_minutes=current_minutes + BREAK_DURATION_MINUTES,
                    location=self._get_approximate_location(
                        distance_covered, distance_miles, pickup_location, dropoff_location
                    ),
                    description="30-minute mandatory break",
                )
                current_day.add_event(break_event)
                current_minutes += BREAK_DURATION_MINUTES
                self._cumulative_driving = 0
                self._window_start = current_minutes - self._driving_in_window
                continue

            drive_minutes = min(drive_budget, time_until_break)
            drive_distance = drive_minutes * miles_per_minute

            fuel_check_distance = distance_covered + drive_distance
            fuel_stops_needed = int(fuel_check_distance / 1000) - int(distance_covered / 1000)

            if fuel_stops_needed > 0 and drive_distance > 0:
                miles_to_fuel = 1000 - (distance_covered % 1000)
                if miles_to_fuel > 0 and miles_to_fuel <= drive_distance:
                    fuel_drive_minutes = miles_to_fuel / miles_per_minute
                    fuel_location = self._get_approximate_location(
                        distance_covered + miles_to_fuel, distance_miles,
                        pickup_location, dropoff_location
                    )

                    if fuel_drive_minutes > 0:
                        drive_event = DutyEvent(
                            event_type=EventType.DRIVING,
                            duty_status=DutyStatus.DRIVING,
                            start_minutes=current_minutes,
                            end_minutes=current_minutes + int(fuel_drive_minutes),
                            location=fuel_location,
                            description="Driving to fuel stop",
                            distance_miles=miles_to_fuel,
                        )
                        current_day.add_event(drive_event)
                        current_minutes += int(fuel_drive_minutes)
                        remaining_duration -= fuel_drive_minutes
                        remaining_distance -= miles_to_fuel
                        distance_covered += miles_to_fuel
                        self._driving_in_window += int(fuel_drive_minutes)
                        self._cumulative_driving += int(fuel_drive_minutes)

                    fuel_event = DutyEvent(
                        event_type=EventType.FUEL_STOP,
                        duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
                        start_minutes=current_minutes,
                        end_minutes=current_minutes + FUEL_STOP_DURATION_MINUTES,
                        location=fuel_location,
                        description="Fuel stop",
                    )
                    current_day.add_event(fuel_event)
                    current_minutes += FUEL_STOP_DURATION_MINUTES
                    self._window_start = current_minutes - self._driving_in_window
                    continue

            if drive_minutes > 0 and drive_distance > 0:
                end_location = self._get_approximate_location(
                    distance_covered + drive_distance, distance_miles,
                    pickup_location, dropoff_location
                )
                drive_event = DutyEvent(
                    event_type=EventType.DRIVING,
                    duty_status=DutyStatus.DRIVING,
                    start_minutes=current_minutes,
                    end_minutes=current_minutes + int(drive_minutes),
                    location=end_location,
                    description="Driving",
                    distance_miles=drive_distance,
                )
                current_day.add_event(drive_event)
                current_minutes += int(drive_minutes)
                remaining_duration -= drive_minutes
                remaining_distance -= drive_distance
                distance_covered += drive_distance
                self._driving_in_window += int(drive_minutes)
                self._cumulative_driving += int(drive_minutes)

        dropoff_event = DutyEvent(
            event_type=EventType.DROPOFF,
            duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
            start_minutes=current_minutes,
            end_minutes=current_minutes + DROPOFF_DURATION_MINUTES,
            location=dropoff_location,
            description="Dropoff - Unloading cargo",
        )
        current_day.add_event(dropoff_event)

        return self.days

    def _add_overnight_rest(
        self, current_day: DrivingDay, current_minutes: int
    ) -> tuple[DrivingDay, int]:
        rest_minutes = REST_DURATION_HOURS * 60

        rest_event = DutyEvent(
            event_type=EventType.REST,
            duty_status=DutyStatus.OFF_DUTY,
            start_minutes=current_minutes,
            end_minutes=current_minutes + rest_minutes,
            location=current_day.events[-1].location if current_day.events else "",
            description="10-hour off-duty rest period",
        )
        current_day.add_event(rest_event)

        new_day = DrivingDay(day_number=len(self.days) + 1)
        self.days.append(new_day)

        return new_day, current_minutes + rest_minutes

    def _get_approximate_location(
        self,
        distance_covered: float,
        total_distance: float,
        pickup: str,
        dropoff: str,
    ) -> str:
        if total_distance == 0:
            return pickup
        progress = distance_covered / total_distance
        if progress < 0.5:
            return f"Near {pickup} ({distance_covered:.0f} mi from pickup)"
        else:
            return f"Near {dropoff} ({total_distance - distance_covered:.0f} mi to dropoff)"

    def get_total_driving_minutes(self) -> int:
        return sum(day.driving_minutes for day in self.days)

    def get_total_distance(self) -> float:
        return sum(day.distance_miles for day in self.days)

    def get_remaining_cycle(self) -> float:
        total_driving = self.get_total_driving_minutes() / 60.0
        return max(0, self.remaining_cycle - total_driving)
