import { Briefcase, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';

interface NavbarProps {
  view: 'home' | 'dashboard';
  onNavigate: (v: 'home' | 'dashboard') => void;
}

export function Navbar({ view, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => onNavigate('home')}
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft transition group-hover:bg-brand-700">
            <Briefcase size={18} />
          </span>
          <span className="font-display text-[15px] font-extrabold tracking-tight text-ink-900">
            Job Auto Apply
          </span>
        </button>

        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('home')}
            className={`btn-ghost px-3 py-2 ${view === 'home' ? 'bg-ink-100 text-ink-900' : ''}`}
          >
            <Briefcase size={16} /> <span className="hidden sm:inline">Find Jobs</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`btn-ghost px-3 py-2 ${view === 'dashboard' ? 'bg-ink-100 text-ink-900' : ''}`}
          >
            <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="mx-1 hidden h-6 w-px bg-ink-200 sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {initials(user?.email || 'U')}
            </div>
            <span className="max-w-[160px] truncate text-sm text-ink-600">{user?.email}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="btn-ghost px-3 py-2"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
