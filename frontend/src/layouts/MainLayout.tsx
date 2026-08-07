import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
  onNewTrip?: () => void;
}

export function MainLayout({ children, onNewTrip }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isPlanPage = location.pathname === '/plan';

  const handleNewTrip = () => {
    localStorage.removeItem('tripPilot');
    onNewTrip?.();
    navigate('/plan');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--body-bg)', color: 'var(--body-text)' }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <Truck className="w-4 h-4" style={{ color: 'var(--body-bg)' }} />
            </div>
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>TripPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            {isPlanPage && (
              <button
                onClick={handleNewTrip}
                className="text-xs flex items-center gap-1.5 transition-colors hover:opacity-70 px-3 py-1.5 rounded-md"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                New Trip
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
              style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <div className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Truck Trip Planner</div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
