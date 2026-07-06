import { useEffect, useMemo, useState } from 'react';
import { Inbox, Mail, Building2, Calendar, CheckCircle2, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Spinner';
import { formatDateTime } from '../lib/format';
import type { Application } from '../types';

const STATUS_STYLES: Record<Application['status'], string> = {
  sent: 'bg-brand-50 text-brand-700 ring-brand-200',
  opened: 'bg-sky-50 text-sky-700 ring-sky-200',
  replied: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function Dashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Application['status']>('all');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        setApps((data ?? []) as Application[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(
    () => (filter === 'all' ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter]
  );

  const counts = useMemo(() => {
    return {
      total: apps.length,
      sent: apps.filter((a) => a.status === 'sent').length,
      opened: apps.filter((a) => a.status === 'opened').length,
      replied: apps.filter((a) => a.status === 'replied').length,
    };
  }, [apps]);

  async function handleDelete(id: string) {
    const prev = apps;
    setApps((a) => a.filter((x) => x.id !== id));
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      setApps(prev);
      push('error', `Could not delete: ${error.message}`);
    } else {
      push('info', 'Application removed.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-ink-500">Track every application you have sent.</p>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} accent="bg-brand-50 text-brand-700" />
        <StatCard label="Sent" value={counts.sent} accent="bg-brand-50 text-brand-700" />
        <StatCard label="Opened" value={counts.opened} accent="bg-sky-50 text-sky-700" />
        <StatCard label="Replied" value={counts.replied} accent="bg-amber-50 text-amber-700" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'sent', 'opened', 'replied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition ${
              filter === f
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load applications: {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          description={
            filter === 'all'
              ? 'Head to the search page, find a role you like, and send your first application.'
              : 'Try a different filter to see other applications.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li
              key={a.id}
              className="card flex flex-col gap-3 p-5 animate-fade-in sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ring-1 ring-inset ${STATUS_STYLES[a.status]}`}>
                    <span className="capitalize">{a.status}</span>
                  </span>
                  <span className="text-xs text-ink-400">{formatDateTime(a.created_at)}</span>
                </div>
                <h3 className="mt-1.5 truncate text-base font-bold text-ink-900">{a.job_title}</h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} className="text-ink-400" /> {a.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} className="text-ink-400" /> {a.recruiter_email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} className="text-ink-400" /> {formatDateTime(a.created_at)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">{a.subject}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`mailto:${a.recruiter_email}?subject=${encodeURIComponent(a.subject)}`}
                  className="btn-secondary px-3 py-2"
                  title="Open in mail client"
                >
                  <ExternalLink size={15} /> <span className="hidden sm:inline">Open</span>
                </a>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn-ghost px-2.5 py-2 text-ink-500 hover:text-red-600"
                  aria-label="Delete application"
                  title="Delete application"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-400">
        <CheckCircle2 size={14} /> Stored in your private Supabase database — only you can see these.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <div className={`mb-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${accent}`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-ink-900">{value}</div>
    </div>
  );
}
