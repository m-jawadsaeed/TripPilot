import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { PlanPage } from './pages/PlanPage';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.warn(`404: Page not found - ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold mb-4" style={{ color: 'var(--border)' }}>404</div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Page not found</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--body-bg)' }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

function App() {
  const [tripKey, setTripKey] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <MainLayout onNewTrip={() => setTripKey((k) => k + 1)}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/plan" element={<PlanPage key={tripKey} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
