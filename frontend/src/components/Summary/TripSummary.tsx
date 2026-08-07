import { MapPin, Truck, Clock, FileText, Fuel, Coffee, Calendar } from 'lucide-react';
import type { TripSummary as TripSummaryType } from '../../types/trip';
import { formatDistance, formatHours } from '../../utils/formatters';

interface TripSummaryProps {
  summary: TripSummaryType;
}

const cardConfigs = [
  { label: 'Distance', getValue: (s: TripSummaryType) => formatDistance(s.distance_miles), icon: MapPin },
  { label: 'Driving', getValue: (s: TripSummaryType) => formatHours(s.driving_hours), icon: Truck },
  { label: 'Duration', getValue: (s: TripSummaryType) => formatHours(s.trip_duration_hours), icon: Clock },
  { label: 'Cycle Left', getValue: (s: TripSummaryType) => formatHours(s.remaining_cycle_hours), icon: FileText },
  { label: 'Fuel Stops', getValue: (s: TripSummaryType) => s.fuel_stops.toString(), icon: Fuel },
  { label: 'Breaks', getValue: (s: TripSummaryType) => s.break_stops.toString(), icon: Coffee },
  { label: 'Days', getValue: (s: TripSummaryType) => s.trip_days.toString(), icon: Calendar },
];

export function TripSummary({ summary }: TripSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cardConfigs.map((card) => (
        <div
          key={card.label}
          className="flex flex-col items-center p-3 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <card.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{card.getValue(summary)}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
        </div>
      ))}
    </div>
  );
}
