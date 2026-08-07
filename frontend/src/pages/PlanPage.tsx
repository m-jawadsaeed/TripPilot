import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Map } from 'lucide-react';
import { TripForm } from '../components/TripForm/TripForm';
import { TripSummary } from '../components/Summary/TripSummary';
import { RouteMap } from '../components/Map/RouteMap';
import { RouteInstructions } from '../components/Map/RouteInstructions';
import { Timeline } from '../components/Timeline/Timeline';
import { DailyLogs } from '../components/DailyLogs/DailyLogs';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { ErrorAlert } from '../components/Common/ErrorAlert';
import { ErrorBoundary } from '../components/Common/ErrorBoundary';
import { useTrip } from '../hooks/useTrip';
import type { TripRequest, TripResponse } from '../types/trip';

const STORAGE_KEY = 'tripPilot';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.tripData || null;
    }
  } catch (e) {
    console.warn('Failed to load saved trip data:', e);
  }
  return null;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 shadow-sm ${className}`}
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

export function PlanPage() {
  const [tripData, setTripData] = useState<TripResponse | null>(() => loadSaved());
  const tripMutation = useTrip();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tripData }));
  }, [tripData]);

  const handleSubmit = useCallback((data: TripRequest) => {
    tripMutation.mutate(data, {
      onSuccess: (response) => {
        setTripData(response);
      },
    });
  }, [tripMutation]);

  return (
    <div className="space-y-5">
      {!tripData && !tripMutation.isPending && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Plan Your Trip</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Enter your trip details below to get started.</p>
            <TripForm onSubmit={handleSubmit} isLoading={tripMutation.isPending} />
          </Card>
        </div>
      )}

      {tripMutation.isPending && <LoadingSpinner />}

      {tripMutation.isError && (
        <div className="max-w-2xl mx-auto">
          <ErrorAlert message={tripMutation.error.message} onDismiss={() => tripMutation.reset()} />
        </div>
      )}

      {!tripMutation.isPending && tripData && (
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              Trip Summary
            </h2>
            <TripSummary summary={tripData.summary} />
          </Card>

          <ErrorBoundary>
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Map className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  Route Map
                </h2>
              </CardHeader>
              <div className="p-4">
                <RouteMap route={tripData.route} />
              </div>
            </div>
          </ErrorBoundary>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Timeline</h2>
              </CardHeader>
              <div className="p-4">
                <Timeline events={tripData.timeline} />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Directions</h2>
              </CardHeader>
              <div className="p-4">
                <RouteInstructions instructions={tripData.route.instructions} />
              </div>
            </div>
          </div>

          <ErrorBoundary>
            <DailyLogs logs={tripData.daily_logs} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
