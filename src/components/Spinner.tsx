import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} size={18} />;
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-500">
      <Spinner className="text-brand-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card skeleton p-5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-ink-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded bg-ink-100" />
          <div className="h-3 w-1/2 rounded bg-ink-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-ink-100" />
        <div className="h-3 w-4/5 rounded bg-ink-100" />
      </div>
    </div>
  );
}
