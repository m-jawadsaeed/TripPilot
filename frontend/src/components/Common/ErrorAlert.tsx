import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      className="rounded-lg p-4 flex items-start gap-3"
      style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
        <AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: '#991b1b' }}>Error</p>
        <p className="text-sm mt-0.5" style={{ color: '#dc2626' }}>{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 transition-colors" style={{ color: '#f87171' }}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
