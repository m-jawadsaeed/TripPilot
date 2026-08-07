import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function StepNavigation({ currentStep, totalSteps, onPrev, onNext, isLoading }: StepNavigationProps) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={isFirst || isLoading}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              backgroundColor: i + 1 === currentStep ? 'var(--accent)' : i + 1 < currentStep ? 'var(--text-muted)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      {!isLast ? (
        <button
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-[100px]" />
      )}
    </div>
  );
}
