export interface TripRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  display_name?: string;
}

export interface MapMarker {
  type: 'current' | 'pickup' | 'dropoff' | 'fuel' | 'break';
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

export interface RouteInstruction {
  step: number;
  text: string;
  distance: number;
  duration: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface RouteBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TripSummary {
  distance_miles: number;
  driving_hours: number;
  trip_duration_hours: number;
  remaining_cycle_hours: number;
  fuel_stops: number;
  break_stops: number;
  trip_days: number;
}

export interface TripRoute {
  polyline: { latitude: number; longitude: number }[];
  markers: MapMarker[];
  instructions: RouteInstruction[];
  bounds: RouteBounds;
  current_location: Coordinates;
  pickup_location: Coordinates;
  dropoff_location: Coordinates;
}

export interface TimelineEvent {
  type: string;
  status: string;
  start_minutes: number;
  end_minutes: number;
  duration_minutes: number;
  day: number;
  location: string;
  description: string;
  distance_miles: number;
}

export interface DutySegment {
  status: string;
  start_time: string;
  end_time: string;
  start_minutes: number;
  end_minutes: number;
  duration_minutes: number;
  description: string;
  location: string;
}

export interface DailyLogSummary {
  driving_hours: number;
  on_duty_hours: number;
  off_duty_hours: number;
  trip_miles: number;
  remaining_cycle_hours: number;
}

export interface DailyLog {
  day: number;
  date: string;
  summary: DailyLogSummary;
  duty_segments: DutySegment[];
  remarks: string[];
  svg: string;
}

export interface TripDay {
  day: number;
  driving_hours: number;
  distance_miles: number;
  events_count: number;
}

export interface TripResponse {
  summary: TripSummary;
  route: TripRoute;
  timeline: TimelineEvent[];
  daily_logs: DailyLog[];
  trip_days: TripDay[];
}

export interface ApiError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors: ApiError[];
}
