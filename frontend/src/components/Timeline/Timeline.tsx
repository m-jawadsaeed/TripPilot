import { useMemo } from 'react';
import { Package, Truck, Fuel, Pause, Moon, MapPin } from 'lucide-react';
import type { TimelineEvent } from '../../types/trip';
import { formatDuration } from '../../utils/formatters';

interface TimelineProps {
  events: TimelineEvent[];
}

const statusConfig: Record<string, { icon: typeof Package; label: string }> = {
  pickup: { icon: Package, label: 'Pickup' },
  dropoff: { icon: Package, label: 'Dropoff' },
  driving: { icon: Truck, label: 'Driving' },
  fuel_stop: { icon: Fuel, label: 'Fuel Stop' },
  break: { icon: Pause, label: 'Break' },
  rest: { icon: Moon, label: 'Rest' },
};

interface TimelineGroup {
  day: number;
  events: { event: TimelineEvent; config: { icon: typeof Package; label: string } }[];
}

export function Timeline({ events }: TimelineProps) {
  const groupedEvents = useMemo(() => {
    const groups: TimelineGroup[] = [];
    let currentDay = 0;

    for (const event of events) {
      const config = statusConfig[event.type] || statusConfig.driving;
      if (event.day !== currentDay) {
        currentDay = event.day;
        groups.push({ day: event.day, events: [] });
      }
      groups[groups.length - 1].events.push({ event, config });
    }

    return groups;
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="max-h-[450px] overflow-y-auto">
      {groupedEvents.map((group) => (
        <div key={group.day}>
          <div
            className="sticky top-0 z-10 py-2.5 mb-1"
            style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Day {group.day}</span>
          </div>
          {group.events.map(({ event, config }, index) => {
            const Icon = config.icon;
            return (
              <div key={`${group.day}-${event.type}-${event.start_minutes}-${index}`} className="flex items-start gap-3 py-3 px-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: '2px solid var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{config.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(event.duration_minutes)}</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                  {event.location && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
