import { Briefcase, Mail, Github, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Briefcase size={14} />
            </span>
            <span>Job Auto Apply Assistant · demo build</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Official Google OAuth + Gmail API
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail size={14} /> Mock job data only — no scraping
            </span>
            <a
              href="https://developers.google.com/gmail/api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-ink-600"
            >
              <Github size={14} /> Gmail API docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
