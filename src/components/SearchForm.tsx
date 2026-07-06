import { Search, X } from 'lucide-react';
import type { JobType } from '../types';
import { JOB_TYPES } from '../lib/mockJobs';

export interface SearchValues {
  keyword: string;
  jobType: JobType | 'All';
}

interface SearchFormProps {
  values: SearchValues;
  onChange: (v: SearchValues) => void;
  onSubmit: () => void;
  loading?: boolean;
  compact?: boolean;
}

export function SearchForm({ values, onChange, onSubmit, loading, compact }: SearchFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={`card ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            value={values.keyword}
            onChange={(e) => onChange({ ...values, keyword: e.target.value })}
            placeholder="Search by job title, company, skill, or location"
            className="input pl-10"
            aria-label="Keyword"
          />
          {values.keyword && (
            <button
              type="button"
              onClick={() => onChange({ ...values, keyword: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              aria-label="Clear keyword"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          value={values.jobType}
          onChange={(e) => onChange({ ...values, jobType: e.target.value as JobType | 'All' })}
          className="input sm:w-44"
          aria-label="Job type"
        >
          <option value="All">All job types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading} className="btn-primary sm:w-32">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </form>
  );
}
