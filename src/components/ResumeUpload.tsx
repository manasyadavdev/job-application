import { useRef, useState } from 'react';
import { FileText, UploadCloud, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase, RESUME_BUCKET } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bytesToSize } from '../lib/format';
import type { ResumeFile } from '../types';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface ResumeUploadProps {
  resume: ResumeFile | null;
  onUploaded: (file: ResumeFile) => void;
  onCleared: () => void;
}

export function ResumeUpload({ resume, onUploaded, onCleared }: ResumeUploadProps) {
  const { user } = useAuth();
  const { push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  function validate(file: File): string | null {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed.';
    }
    if (file.size > MAX_SIZE) return 'File is too large (10 MB max).';
    return null;
  }

  async function upload(file: File) {
    if (!user) {
      push('error', 'Please sign in to upload a resume.');
      return;
    }
    const err = validate(file);
    if (err) {
      push('error', err);
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (error) throw error;
      onUploaded({
        name: file.name,
        path,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
      push('success', 'Resume uploaded successfully.');
    } catch (e) {
      push('error', `Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function removeResume() {
    if (!resume) return;
    try {
      const { error } = await supabase.storage.from(RESUME_BUCKET).remove([resume.path]);
      if (error) throw error;
      onCleared();
      push('info', 'Resume removed.');
    } catch (e) {
      push('error', `Could not remove resume: ${(e as Error).message}`);
    }
  }

  if (resume) {
    return (
      <div className="card flex items-center gap-3 p-4 animate-fade-in">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{resume.name}</p>
          <p className="text-xs text-ink-500">
            {bytesToSize(resume.size)} · PDF · ready to attach
          </p>
        </div>
        <span className="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
          <CheckCircle2 size={13} /> Ready
        </span>
        <button
          onClick={removeResume}
          className="btn-ghost px-2 py-2 text-ink-500 hover:text-red-600"
          aria-label="Remove resume"
          title="Remove resume"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) upload(f);
      }}
      className={`card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 text-center transition-colors ${
        dragging ? 'border-brand-400 bg-brand-50/50' : 'border-ink-200 hover:border-brand-300 hover:bg-ink-50'
      }`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <UploadCloud size={22} />
      </div>
      <p className="text-sm font-semibold text-ink-700">
        {uploading ? 'Uploading…' : 'Drop your PDF resume here'}
      </p>
      <p className="mt-1 text-xs text-ink-500">
        or click to browse · PDF only · 10 MB max
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
