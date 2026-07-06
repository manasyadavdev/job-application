import { useCallback, useEffect, useState } from 'react';
import { Search, Briefcase, FileText, Sparkles } from 'lucide-react';
import { EDGE, authHeaders, supabase, RESUME_BUCKET } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SearchForm, type SearchValues } from '../components/SearchForm';
import { JobCard } from '../components/JobCard';
import { ResumeUpload } from '../components/ResumeUpload';
import { ApplyModal } from '../components/ApplyModal';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Spinner';
import type { Job, ResumeFile } from '../types';

export function Home() {
  const { user, session } = useAuth();
  const { push } = useToast();

  const [values, setValues] = useState<SearchValues>({ keyword: '', jobType: 'All' });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (values.keyword) params.set('keyword', values.keyword);
      if (values.jobType !== 'All') params.set('jobType', values.jobType);
      const url = `${EDGE.jobs}?${params.toString()}`;
      const res = await fetch(url, { headers: authHeaders(session?.access_token ?? null) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      if (!Array.isArray(data?.jobs)) throw new Error('Unexpected response shape from jobs API.');
      setJobs(data.jobs as Job[]);
    } catch (e) {
      setError((e as Error).message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [values, session]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Restore the most recent resume for this user from storage (lists objects).
  useEffect(() => {
    let active = true;
    async function restoreResume() {
      if (!user) return;
      setLoadingResume(true);
      try {
        const { data, error } = await supabase.storage
          .from(RESUME_BUCKET)
          .list(user.id, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });
        if (error) throw error;
        if (active && data && data.length > 0) {
          const latest = data[0];
          setResume({
            name: latest.name,
            path: `${user.id}/${latest.name}`,
            size: latest.metadata?.size ?? 0,
            uploadedAt: latest.created_at || new Date().toISOString(),
          });
        }
      } catch {
        // ignore — no resume yet is a valid state
      } finally {
        if (active) setLoadingResume(false);
      }
    }
    restoreResume();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-7 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
          <Sparkles size={13} /> Mock job listings · demo data only
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Find your next role
        </h1>
        <p className="mt-2 max-w-2xl text-base text-ink-600">
          Search curated openings, upload your résumé, and apply with a
          pre-filled email straight to the recruiter.
        </p>
      </section>

      {/* Search */}
      <div className="mb-6">
        <SearchForm values={values} onChange={setValues} onSubmit={fetchJobs} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Results */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-700">
              {loading ? 'Searching…' : `${jobs.length} ${jobs.length === 1 ? 'opening' : 'openings'}`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Could not load jobs: {error}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs match your search"
              description="Try a different keyword or job type."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={(j) => setActiveJob(j)}
                  hasResume={!!resume}
                />
              ))}
            </div>
          )}
        </section>

        {/* Resume sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileText size={16} />
              </span>
              <h2 className="text-sm font-bold text-ink-900">Your résumé</h2>
            </div>
            <p className="mb-3 text-xs text-ink-500">
              Upload a PDF once. It will be attached to every application you send.
            </p>
            {loadingResume ? (
              <div className="skeleton h-24 rounded-xl bg-ink-100" />
            ) : (
              <ResumeUpload
                resume={resume}
                onUploaded={(f) => {
                  setResume(f);
                }}
                onCleared={() => setResume(null)}
              />
            )}
          </div>

          <div className="card mt-4 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Briefcase size={16} />
              </span>
              <h2 className="text-sm font-bold text-ink-900">How it works</h2>
            </div>
            <ol className="space-y-2.5 text-sm text-ink-600">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-600">
                  1
                </span>
                Search the mock job board above.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-600">
                  2
                </span>
                Upload your PDF résumé here.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-600">
                  3
                </span>
                Click <span className="font-semibold text-ink-800">Apply</span> — we prefill the email.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-600">
                  4
                </span>
                Send via Gmail after Google authorization.
              </li>
            </ol>
          </div>
        </aside>
      </div>

      {activeJob && (
        <ApplyModal
          job={activeJob}
          resume={resume}
          onClose={() => setActiveJob(null)}
          onSent={() => {
            setActiveJob(null);
            push('info', 'You can view this application on your Dashboard.');
          }}
        />
      )}
    </div>
  );
}
