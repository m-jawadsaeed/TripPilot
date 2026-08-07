import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight, MapPin, Clock, Zap, ShieldCheck, Route, Plus } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-100px)]">
      <div className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
          >
            <Truck className="w-3.5 h-3.5" />
            FMCSA Compliant Trip Planning
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
            Plan truck routes.<br />
            <span style={{ color: 'var(--text-muted)' }}>Generate ELD logs.</span>
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Enter your current location, pickup, and dropoff. Get a complete trip plan with route, hours of service schedule, fuel stops, and daily driver logs.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="font-medium px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2.5 shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
          >
            Start Planning
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="py-14" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-10" style={{ color: 'var(--text-primary)' }}>How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { num: 1, title: 'Enter trip details', desc: 'Provide your current location, pickup address, dropoff address, and current cycle hours used.' },
              { num: 2, title: 'Get your route', desc: 'The system calculates driving route, fuel stops, required breaks, and overnight rest periods.' },
              { num: 3, title: 'Review ELD logs', desc: 'View daily duty status graphs, timeline, and turn-by-turn directions for your trip.' },
            ].map((item) => (
              <div key={item.num} className="text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
                >
                  <span className="text-sm font-bold">{item.num}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-14" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Built for compliance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Route, title: 'Real Route Mapping', desc: 'Routes calculated using real road data with accurate distance, duration, and turn-by-turn navigation.' },
              { icon: Clock, title: 'Hours of Service', desc: 'Automatic 11-hour driving limit, 14-hour window, 30-minute break, and 10-hour rest period tracking.' },
              { icon: Zap, title: 'Fuel Stop Planning', desc: 'Fuel stops automatically inserted every 1,000 miles along your route.' },
              { icon: ShieldCheck, title: 'Daily ELD Logs', desc: 'Complete daily driver logs with duty status graphs generated from your trip schedule.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg p-5" style={{ border: '1px solid var(--border-secondary)' }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                  <item.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-14" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to plan your trip?</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Enter your trip details and get a complete plan in seconds.</p>
          <button
            onClick={() => navigate('/plan')}
            className="font-medium px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center gap-2.5 shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </button>
        </div>
      </div>
    </div>
  );
}
