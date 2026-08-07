"""ELD Log Generator for TripPilot."""
from typing import Any
from datetime import datetime, timedelta
from apps.trip.services.hos_engine import DrivingDay, DutyEvent
from apps.trip.utils.constants import DutyStatus


class DailyLog:

    def __init__(self, day_number: int, date: str) -> None:
        self.day_number = day_number
        self.date = date
        self.duty_segments: list[dict[str, Any]] = []
        self.remarks: list[str] = []
        self.driving_hours: float = 0.0
        self.on_duty_hours: float = 0.0
        self.off_duty_hours: float = 0.0
        self.trip_miles: float = 0.0
        self.remaining_cycle_hours: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "day": self.day_number,
            "date": self.date,
            "summary": {
                "driving_hours": round(self.driving_hours, 2),
                "on_duty_hours": round(self.on_duty_hours, 2),
                "off_duty_hours": round(self.off_duty_hours, 2),
                "trip_miles": round(self.trip_miles, 2),
                "remaining_cycle_hours": round(self.remaining_cycle_hours, 2),
            },
            "duty_segments": self.duty_segments,
            "remarks": self.remarks,
        }


def generate_eld_logs(
    days: list[DrivingDay],
    remaining_cycle: float,
    start_date: str | None = None,
) -> list[dict[str, Any]]:
    if not days:
        return []

    if start_date:
        base_date = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        base_date = datetime.now()

    logs: list[dict[str, Any]] = []
    cumulative_driving = 0.0

    for day in days:
        day_date = base_date + timedelta(days=day.day_number - 1)
        log = DailyLog(
            day_number=day.day_number,
            date=day_date.strftime("%Y-%m-%d"),
        )

        for event in day.events:
            segment = _event_to_segment(event)
            log.duty_segments.append(segment)
            remark = _generate_remark(event)
            if remark:
                log.remarks.append(remark)

        cumulative_driving += day.driving_minutes / 60.0
        log.driving_hours = day.driving_minutes / 60.0
        log.on_duty_hours = day.on_duty_minutes / 60.0
        log.off_duty_hours = day.off_duty_minutes / 60.0
        log.trip_miles = day.distance_miles
        log.remaining_cycle_hours = max(0, remaining_cycle - cumulative_driving)

        svg = generate_svg_graph(log.duty_segments, day_date.strftime("%Y-%m-%d"))

        log_dict = log.to_dict()
        log_dict["svg"] = svg
        logs.append(log_dict)

    return logs


def _event_to_segment(event: DutyEvent) -> dict[str, Any]:
    start_hour = event.start_minutes // 60
    start_min = event.start_minutes % 60
    end_hour = event.end_minutes // 60
    end_min = event.end_minutes % 60

    return {
        "status": event.duty_status,
        "start_time": f"{start_hour:02d}:{start_min:02d}",
        "end_time": f"{end_hour:02d}:{end_min:02d}",
        "start_minutes": event.start_minutes,
        "end_minutes": event.end_minutes,
        "duration_minutes": event.duration_minutes,
        "description": event.description,
        "location": event.location,
    }


def _generate_remark(event: DutyEvent) -> str | None:
    remark_map = {
        "pickup": "Pickup completed",
        "dropoff": "Dropoff completed",
        "fuel_stop": "Fuel stop",
        "break": "Mandatory 30-minute break",
        "rest": "10-hour off-duty rest period",
        "driving": None,
    }
    return remark_map.get(event.event_type)


def generate_svg_graph(duty_segments: list[dict[str, Any]], log_date: str = "") -> str:
    VIEW_WIDTH = 960
    GRID_LEFT = 132
    GRID_RIGHT = 940
    GRID_TOP = 62
    ROW_HEIGHT = 42
    ROW_ORDER = [DutyStatus.OFF_DUTY, DutyStatus.SLEEPER_BERTH, DutyStatus.DRIVING, DutyStatus.ON_DUTY_NOT_DRIVING]
    ROW_LABELS = {
        DutyStatus.OFF_DUTY: "1  Off Duty",
        DutyStatus.SLEEPER_BERTH: "2  Sleeper Berth",
        DutyStatus.DRIVING: "3  Driving",
        DutyStatus.ON_DUTY_NOT_DRIVING: "4  On Duty (ND)",
    }
    GRID_WIDTH = GRID_RIGHT - GRID_LEFT
    GRID_HEIGHT = ROW_HEIGHT * len(ROW_ORDER)
    VIEW_HEIGHT = GRID_TOP + GRID_HEIGHT + 42
    HOURS_PER_DAY = 24
    MINUTES_PER_HOUR = 60
    MINUTES_PER_DAY = 1440

    def x_for_minute(minute: int | float) -> float:
        return round(GRID_LEFT + (min(minute, MINUTES_PER_DAY) / MINUTES_PER_DAY) * GRID_WIDTH, 2)

    def y_for_status(status: str) -> float:
        return round(GRID_TOP + ROW_ORDER.index(status) * ROW_HEIGHT + ROW_HEIGHT / 2, 2)

    def hour_label(hour: int) -> str:
        if hour == 0:
            return "Mid"
        if hour == 12:
            return "Noon"
        return str(hour)

    c_grid = "var(--eld-grid)"
    c_axis_text = "var(--eld-axis-text)"
    c_label_text = "var(--eld-label-text)"
    c_row_a = "var(--eld-row-a)"
    c_row_b = "var(--eld-row-b)"
    c_trace = "var(--eld-trace)"

    grid_lines: list[str] = []

    for hour in range(HOURS_PER_DAY + 1):
        x = x_for_minute(hour * MINUTES_PER_HOUR)
        sw = 1.4 if hour % 6 == 0 else 0.6
        grid_lines.append(
            f'<line x1="{x}" y1="{GRID_TOP}" x2="{x}" y2="{GRID_TOP + GRID_HEIGHT}" '
            f'stroke="{c_grid}" stroke-width="{sw}" />'
        )
        if hour < HOURS_PER_DAY:
            centre = round(x + GRID_WIDTH / HOURS_PER_DAY / 2, 2)
            grid_lines.append(
                f'<text x="{centre}" y="{GRID_TOP - 14}" text-anchor="middle" font-size="10" '
                f'fill="{c_axis_text}" font-family="system-ui">{hour_label(hour)}</text>'
            )
            for quarter in range(1, 4):
                qx = round(x + (GRID_WIDTH / HOURS_PER_DAY) * (quarter / 4), 2)
                grid_lines.append(
                    f'<line x1="{qx}" y1="{GRID_TOP}" x2="{qx}" y2="{GRID_TOP + GRID_HEIGHT}" '
                    f'stroke="{c_grid}" stroke-width="0.3" />'
                )

    for i, status in enumerate(ROW_ORDER):
        top = GRID_TOP + i * ROW_HEIGHT
        fill = c_row_a if i % 2 == 0 else c_row_b
        grid_lines.append(
            f'<rect x="{GRID_LEFT}" y="{top}" width="{GRID_WIDTH}" height="{ROW_HEIGHT}" fill="{fill}" />'
        )
        grid_lines.append(
            f'<line x1="{GRID_LEFT}" y1="{top}" x2="{GRID_RIGHT}" y2="{top}" '
            f'stroke="{c_grid}" stroke-width="0.8" />'
        )
        grid_lines.append(
            f'<text x="{GRID_LEFT - 12}" y="{top + ROW_HEIGHT / 2 + 4}" text-anchor="end" '
            f'font-size="11" fill="{c_label_text}" font-family="system-ui">{ROW_LABELS[status]}</text>'
        )

    grid_lines.append(
        f'<line x1="{GRID_LEFT}" y1="{GRID_TOP + GRID_HEIGHT}" x2="{GRID_RIGHT}" y2="{GRID_TOP + GRID_HEIGHT}" '
        f'stroke="{c_grid}" stroke-width="0.8" />'
    )

    ordered = sorted(duty_segments, key=lambda s: s["start_minutes"])
    path_parts: list[str] = []
    previous_y: float | None = None

    for seg in ordered:
        y = y_for_status(seg["status"])
        x1 = x_for_minute(seg["start_minutes"])
        x2 = x_for_minute(seg["end_minutes"])
        if previous_y is None:
            path_parts.append(f"M {x1} {y}")
        elif previous_y != y:
            path_parts.append(f"L {x1} {y}")
        path_parts.append(f"L {x2} {y}")
        previous_y = y

    path_d = " ".join(path_parts)

    driving_mins = sum(s["duration_minutes"] for s in duty_segments if s["status"] == DutyStatus.DRIVING)
    on_duty_mins = sum(s["duration_minutes"] for s in duty_segments if s["status"] == DutyStatus.ON_DUTY_NOT_DRIVING)
    off_duty_mins = sum(s["duration_minutes"] for s in duty_segments if s["status"] in (DutyStatus.OFF_DUTY, DutyStatus.SLEEPER_BERTH))
    driving_seg_count = 0
    in_driving = False
    for seg in ordered:
        if seg["status"] == DutyStatus.DRIVING and not in_driving:
            driving_seg_count += 1
            in_driving = True
        elif seg["status"] != DutyStatus.DRIVING:
            in_driving = False

    totals = (
        f"Driving {driving_mins / MINUTES_PER_HOUR:.2f} h"
        f"   \u00b7   On duty (ND) {on_duty_mins / MINUTES_PER_HOUR:.2f} h"
        f"   \u00b7   Off duty {off_duty_mins / MINUTES_PER_HOUR:.2f} h"
        f"   \u00b7   {driving_seg_count} driving segments"
    )

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW_WIDTH} {VIEW_HEIGHT}" '
        f'role="img" aria-label="Driver duty status graph for {log_date}" width="100%">'
        f'\n  <text x="{GRID_LEFT}" y="20" font-size="11" letter-spacing="0.08em" '
        f'fill="{c_axis_text}" font-family="system-ui">'
        f'MIDNIGHT TO MIDNIGHT \u2014 24 HOUR DUTY STATUS RECORD</text>'
        f'\n  <text x="{GRID_RIGHT}" y="20" text-anchor="end" font-size="11" '
        f'fill="{c_axis_text}" font-family="system-ui">{log_date}</text>'
        f'\n\n  {chr(10).join(grid_lines)}'
        f'\n  <path d="{path_d}" fill="none" stroke="{c_trace}" stroke-width="2.4" '
        f'stroke-linejoin="round" stroke-linecap="square" />'
        f'\n  <text x="{GRID_LEFT}" y="{GRID_TOP + GRID_HEIGHT + 26}" font-size="11" '
        f'fill="{c_axis_text}" font-family="system-ui">{totals}</text>'
        f'\n</svg>'
    )
