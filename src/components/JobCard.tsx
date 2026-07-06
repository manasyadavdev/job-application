import { MapPin, Mail, Calendar, Send, DollarSign, Clock } from 'lucide-react';
import type { Job } from '../types';
import { formatDate } from '../lib/format';

const TYPE_STYLES: Record<Job['jobType'], string> = {
  'Full Time': 'bg-brand-50 text-brand-700 ring-brand-200',
  Contract: 'bg-amber-50 text-amber-700 ring-amber-200',
  Internship: 'bg-sky-50 text-sky-700 ring-sky-200',
};

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  hasResume: boolean;
}

export function JobCard({ job, onApply, hasResume }: JobCardProps) {
  return (
    <article className="card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white shadow-soft"
          style={{ backgroundColor: job.logoColor }}
          aria-hidden
        >
          {job.company.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ring-1 ring-inset ${TYPE_STYLES[job.jobType]}`}>
              {job.jobType}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <Clock size={13} /> {formatDate(job.postedDate)}
            </span>
          </div>
          <h3 className="mt-1.5 truncate text-base font-bold text-ink-900">{job.title}</h3>
          <p className="truncate text-sm font-medium text-ink-600">{job.company}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-600">{job.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.tags.map((t) => (
          <span key={t} className="badge bg-ink-100 text-ink-600">
            {t}
          </span>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-ink-600">
          <MapPin size={15} className="shrink-0 text-ink-400" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <DollarSign size={15} className="shrink-0 text-ink-400" />
          <span className="truncate">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <Mail size={15} className="shrink-0 text-ink-400" />
          <span className="truncate" title={job.recruiterEmail}>
            {job.recruiterEmail}
          </span>
        </div>
        <div className="flex items-center gap-2 text-ink-600">
          <Calendar size={15} className="shrink-0 text-ink-400" />
          <span>{formatDate(job.postedDate)}</span>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <span className="text-xs text-ink-400">
          {hasResume ? 'Resume ready' : 'No resume uploaded yet'}
        </span>
        <button onClick={() => onApply(job)} className="btn-primary">
          <Send size={15} /> Apply
        </button>
      </div>
    </article>
  );
}
