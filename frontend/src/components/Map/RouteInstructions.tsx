import type { RouteInstruction } from '../../types/trip';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { Clock, Navigation } from 'lucide-react';

interface RouteInstructionsProps {
  instructions: RouteInstruction[];
}

export function RouteInstructions({ instructions }: RouteInstructionsProps) {
  if (instructions.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No directions available</p>;
  }

  return (
    <div className="space-y-0 max-h-[420px] overflow-y-auto pr-1">
      {instructions.map((inst) => (
        <div key={inst.step} className="flex items-start gap-3 py-3 last:border-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{inst.step}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{inst.text}</p>
            <div className="flex gap-4 mt-1.5">
              {inst.distance > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Navigation className="w-3.5 h-3.5" />
                  {formatDistance(inst.distance)}
                </span>
              )}
              {inst.duration > 0 && (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(inst.duration)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
