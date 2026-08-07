import { Check, Map, Navigation, FileText, ClipboardList } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; icon: string }[];
  onStepClick?: (step: number) => void;
  canNavigate?: (step: number) => boolean;
}

const stepIcons = [ClipboardList, Map, Navigation, FileText];

export function StepIndicator({ currentStep, steps, onStepClick, canNavigate }: StepIndicatorProps) {
  return (
    <div
      className="inline-flex items-center rounded-xl p-1.5 shadow-sm"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {steps.map((step, index) => {
        const num = index + 1;
        const isActive = num === currentStep;
        const isCompleted = num < currentStep;
        const Icon = stepIcons[index];
        const clickable = onStepClick && canNavigate?.(num);

        return (
          <div key={step.label} className="flex items-center">
            <button
              onClick={() => clickable && onStepClick(num)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                backgroundColor: isCompleted ? 'var(--accent)' : isActive ? 'var(--surface-secondary)' : 'transparent',
                color: isCompleted ? 'var(--body-bg)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : isActive ? 'var(--accent)' : 'var(--surface-secondary)',
                  color: isCompleted ? 'var(--body-bg)' : isActive ? 'var(--body-bg)' : 'var(--text-muted)',
                }}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className="w-8 h-px mx-1"
                style={{ backgroundColor: num < currentStep ? 'var(--accent)' : 'var(--border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
