/*
# Create applications table (multi-user, owner-scoped)

## Summary
Adds the `applications` table that stores a record of every job application
a user sends through the Job Auto Apply Assistant. Each row belongs to the
authenticated user who created it, and users can only see / modify their own
rows. This is the backing store for the Dashboard ("List all sent
applications").

## New tables
- `applications`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to `auth.uid()`, references
    `auth.users` with `ON DELETE CASCADE` so deleting a user removes their
    applications)
  - `job_id` (text, not null) — id of the mock job the user applied to
  - `company` (text, not null)
  - `job_title` (text, not null)
  - `recruiter_email` (text, not null)
  - `subject` (text, not null)
  - `body` (text, not null)
  - `resume_path` (text, nullable) — storage object path of the uploaded
    resume, if any
  - `status` (text, not null, default `'sent'`) — one of
    `sent` | `opened` | `replied`
  - `created_at` (timestamptz, default `now()`)

## Security (RLS)
- Row Level Security ENABLED on `applications`.
- Four owner-scoped policies (select / insert / update / delete), scoped to
  `TO authenticated`, using `auth.uid() = user_id`.
- The `user_id` column defaults to `auth.uid()` so frontend inserts that
  omit `user_id` still satisfy the INSERT `WITH CHECK`.

## Important notes
1. No data migration is performed — this only creates schema.
2. The `resumes` storage bucket is created separately via the Storage API.
3. Storage object policies are defined separately so authenticated users can
   only read/write objects under a `user_id`-prefixed path.
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  company text NOT NULL,
  job_title text NOT NULL,
  recruiter_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  resume_path text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications"
  ON applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS applications_user_id_created_at_idx
  ON applications (user_id, created_at DESC);
