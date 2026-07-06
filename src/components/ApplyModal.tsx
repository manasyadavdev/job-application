import { useEffect, useRef, useState } from 'react';
import { X, Send, Paperclip, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import type { Job, ResumeFile } from '../types';
import { EDGE, authHeaders } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from './Spinner';

interface ApplyModalProps {
  job: Job;
  resume: ResumeFile | null;
  onClose: () => void;
  onSent: () => void;
}

function defaultBody(job: Job, candidate: string): string {
  const firstName = candidate.split('@')[0].split('.')[0] || 'there';
  return `Dear ${job.company} Hiring Team,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background and enthusiasm for the work your team is doing, I believe I would be a strong addition to the role.

Please find my résumé attached for your review. I would welcome the opportunity to discuss how my experience aligns with your needs.

Thank you for your time and consideration.

Best regards,
${firstName}
`;
}

export function ApplyModal({ job, resume, onClose, onSent }: ApplyModalProps) {
  const { user, session } = useAuth();
  const { push } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [to, setTo] = useState(job.recruiterEmail);
  const [subject, setSubject] = useState(`Application for ${job.title}`);
  const [body, setBody] = useState(() => defaultBody(job, user?.email || ''));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSend() {
    setError(null);
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Recipient, subject, and email body are all required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setError('Please enter a valid recipient email address.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(EDGE.sendEmail, {
        method: 'POST',
        headers: authHeaders(session?.access_token ?? null),
        body: JSON.stringify({
          to: to.trim(),
          subject,
          body,
          resumePath: resume?.path ?? null,
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          recruiterEmail: to.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      if (data.demoMode) {
        push('info', data.message);
      } else {
        push('success', data.message || 'Application sent successfully.');
      }
      onSent();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      push('error', `Failed to send application: ${msg}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Apply for job"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl animate-scale-in sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Apply for
            </p>
            <h2 className="mt-0.5 truncate text-lg font-bold text-ink-900">{job.title}</h2>
            <p className="truncate text-sm text-ink-500">
              {job.company} · {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost shrink-0 p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="apply-to">
                <Mail size={12} className="mr-1 inline" /> Recruiter email
              </label>
              <input
                id="apply-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input"
                placeholder="recruiter@company.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="apply-from">
                <User size={12} className="mr-1 inline" /> From
              </label>
              <input
                id="apply-from"
                type="email"
                value={user?.email || ''}
                disabled
                className="input cursor-not-allowed bg-ink-50 text-ink-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="apply-subject">
              Subject
            </label>
            <input
              id="apply-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
            />
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="apply-body">
              Email body
            </label>
            <textarea
              id="apply-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="input resize-y leading-relaxed"
            />
          </div>

          {/* Attachment */}
          <div className="mt-4">
            <label className="label">Attachment</label>
            {resume ? (
              <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3">
                <FileText size={18} className="shrink-0 text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800">{resume.name}</p>
                  <p className="text-xs text-ink-500">PDF · attached to this application</p>
                </div>
                <span className="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
                  <Paperclip size={12} /> Attached
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-3 text-sm text-ink-500">
                <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                No resume uploaded. Upload one from the search page to attach it here.
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-400">
            Sent via Gmail API after Google authorization.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary" disabled={sending}>
              Cancel
            </button>
            <button onClick={handleSend} className="btn-primary" disabled={sending}>
              {sending ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : (
                <>
                  <Send size={15} /> Send application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
