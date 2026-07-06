import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FullPageLoader } from './components/Spinner';
import { AuthLanding } from './pages/AuthLanding';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';

function Shell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'home' | 'dashboard'>('home');

  if (loading) {
    return <FullPageLoader label="Loading your workspace…" />;
  }

  if (!user) {
    return <AuthLanding />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar view={view} onNavigate={setView} />
      <main className="flex-1">
        {view === 'home' ? <Home /> : <Dashboard />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AuthProvider>
  );
}
