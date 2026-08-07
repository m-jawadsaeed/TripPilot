import { FileText, Clock, Truck, MapPin, Moon } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { DailyLog } from '../../types/trip';
import { formatHours } from '../../utils/formatters';
import { sanitizeSvgWithVars } from '../../utils/sanitize';

interface DailyLogsProps {
  logs: DailyLog[];
}

export function DailyLogs({ logs }: DailyLogsProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  const currentLog = useMemo(
    () => logs.find((log) => log.day === selectedDay) || logs[0],
    [logs, selectedDay]
  );

  const sanitizedSvg = useMemo(
    () => (currentLog?.svg ? sanitizeSvgWithVars(currentLog.svg) : ''),
    [currentLog?.svg]
  );

  if (logs.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <FileText className="w-5 h-5" style={{ color: 'var(--body-bg)' }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Daily ELD Logs</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{logs.length} day{logs.length > 1 ? 's' : ''} of driving</p>
            </div>
          </div>
          <div className="flex gap-2">
            {logs.map((log) => (
              <button
                key={log.day}
                onClick={() => setSelectedDay(log.day)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: selectedDay === log.day ? 'var(--accent)' : 'var(--surface-secondary)',
                  color: selectedDay === log.day ? 'var(--body-bg)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                Day {log.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
            style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{currentLog.day}</span>
            </div>
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Day {currentLog.day}</span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{currentLog.date}</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-2 sm:flex sm:gap-3 gap-2">
            {[
              { icon: Truck, value: formatHours(currentLog.summary.driving_hours), label: 'Driving' },
              { icon: Clock, value: formatHours(currentLog.summary.on_duty_hours), label: 'On Duty' },
              { icon: Moon, value: formatHours(currentLog.summary.off_duty_hours), label: 'Off Duty' },
              { icon: MapPin, value: currentLog.summary.trip_miles.toFixed(0), label: 'Miles' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
              >
                <stat.icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <h5 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            Duty Status Graph
          </h5>
          <div className="rounded-lg overflow-x-auto" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface-secondary)' }}>
            <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} className="min-w-[600px]" />
          </div>
        </div>

        <div className="mb-5">
          <h5 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            Duty Segments
          </h5>
          <div className="rounded-lg overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full min-w-[480px]">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left text-xs font-medium uppercase tracking-wide px-3 sm:px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>Time</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wide px-3 sm:px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wide px-3 sm:px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {currentLog.duty_segments.map((seg, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-secondary)' }}>{seg.start_time}</span>
                      <span className="mx-1.5" style={{ color: 'var(--border)' }}>-</span>
                      <span className="text-sm font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-secondary)' }}>{seg.end_time}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: seg.status === 'driving' ? 'var(--accent)' : seg.status === 'on_duty_not_driving' ? 'var(--border-secondary)' : 'var(--surface-secondary)',
                          color: seg.status === 'off_duty' ? 'var(--text-muted)' : seg.status === 'driving' ? 'var(--body-bg)' : 'var(--text-primary)',
                        }}
                      >
                        {seg.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{seg.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {currentLog.remarks.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Remarks
            </h5>
            <div className="space-y-2">
              {currentLog.remarks.map((remark, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm rounded-lg px-3 sm:px-4 py-3"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--text-muted)' }} />
                  {remark}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
