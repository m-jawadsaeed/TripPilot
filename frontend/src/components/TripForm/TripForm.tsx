import { MapPin, Package, Navigation, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { TripRequest } from '../../types/trip';

interface TripFormProps {
  onSubmit: (data: TripRequest) => void;
  isLoading: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripRequest>({
    defaultValues: {
      current_location: '',
      pickup_location: '',
      dropoff_location: '',
      current_cycle_used: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { id: 'current_location' as const, label: 'Current Location', icon: Navigation, placeholder: 'e.g., Dallas, TX', type: 'text' },
          { id: 'pickup_location' as const, label: 'Pickup Location', icon: MapPin, placeholder: 'e.g., Oklahoma City, OK', type: 'text' },
          { id: 'dropoff_location' as const, label: 'Dropoff Location', icon: Package, placeholder: 'e.g., Denver, CO', type: 'text' },
          { id: 'current_cycle_used' as const, label: 'Current Cycle Used (Hours)', icon: Clock, placeholder: 'e.g., 42', type: 'number' },
        ].map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <field.icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </div>
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type}
              step={field.type === 'number' ? '0.5' : undefined}
              disabled={isLoading}
              className="input-field"
              placeholder={field.placeholder}
              {...register(field.id, {
                required: 'Required',
                ...(field.type === 'number'
                  ? { min: { value: 0, message: 'Min 0' }, max: { value: 70, message: 'Max 70' }, valueAsNumber: true }
                  : { minLength: { value: 2, message: 'Min 2 chars' } }),
              })}
            />
            {errors[field.id] && (
              <p className="text-xs text-red-500">{errors[field.id]?.message}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full font-medium px-5 py-3 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'var(--body-bg)' }} />
            Generating Trip Plan...
          </>
        ) : (
          'Generate Trip Plan'
        )}
      </button>
    </form>
  );
}
