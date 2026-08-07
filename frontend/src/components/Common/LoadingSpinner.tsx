import { RefreshCw } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div
      className="rounded-xl p-12 shadow-sm"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col items-center justify-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--surface-secondary)' }}
        >
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Generating trip plan...</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Calculating route, schedule, and ELD logs</p>
      </div>
    </div>
  );
}
