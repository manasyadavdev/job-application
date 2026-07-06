import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const RESUME_BUCKET = 'resumes';

export const EDGE = {
  jobs: `${supabaseUrl}/functions/v1/jobs`,
  sendEmail: `${supabaseUrl}/functions/v1/send-email`,
} as const;

export function authHeaders(sessionToken?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
  };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  return headers;
}
