import { useState } from 'react';
import { Briefcase, Mail, Lock, ArrowRight, ShieldCheck, FileText, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Spinner';

export function AuthLanding() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { push } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<null | 'google' | 'email'>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setBusy('google');
    setError(null);
    try {
      await signInWithGoogle();
      // signInWithOAuth redirects the browser; no toast needed here.
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy('email');
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        push('success', 'Welcome back!');
      } else {
        await signUpWithEmail(email.trim(), password);
        push('success', 'Account created. You are signed in.');
      }
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2">
        {/* Left: marketing */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-white/15">
            <ShieldCheck size={13} /> Official Google OAuth · Gmail API
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Apply to jobs
            <span className="block bg-gradient-to-r from-brand-300 to-sky-300 bg-clip-text text-transparent">
              in one click.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-300">
            Search curated job listings, upload your résumé, and send polished
            applications straight to recruiters — powered by Gmail, no manual
            email drafting.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-ink-200">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                <FileText size={16} />
              </span>
              Upload a PDF résumé once, reuse on every application
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sky-300">
                <Send size={16} />
              </span>
              Auto-prefilled subject &amp; body, editable before send
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                <ShieldCheck size={16} />
              </span>
              Track every sent application in a dashboard
            </li>
          </ul>

          <p className="mt-8 text-xs text-ink-400">
            Demo project — uses mock job data only. Does not scrape or automate
            any third-party job site.
          </p>
        </div>

        {/* Right: auth card */}
        <div className="animate-scale-in">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 text-ink-800 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Briefcase size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink-900">Job Auto Apply</h2>
                <p className="text-xs text-ink-500">Sign in to start applying</p>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              disabled={busy !== null}
              className="btn-secondary w-full justify-center py-3"
            >
              {busy === 'google' ? (
                <Spinner />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
              <span className="h-px flex-1 bg-ink-200" />
              or with email
              <span className="h-px flex-1 bg-ink-200" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy !== null}
                className="btn-primary w-full justify-center py-3"
              >
                {busy === 'email' ? <Spinner /> : <ArrowRight size={16} />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="font-semibold text-brand-600 underline-offset-2 hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.58 2.69-3.91 2.69-6.61z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
