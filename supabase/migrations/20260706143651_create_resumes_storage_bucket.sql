/*
# Create resumes storage bucket + object policies

## Summary
Creates a private Storage bucket named `resumes` to hold user-uploaded PDF
resumes, and defines Storage Object (SOP) policies so each authenticated
user can only read / write / delete objects under their own prefix
(`user_id/...`). Bucket is private so anonymous access is denied; the
frontend uploads via the standard Supabase client, which respects RLS.

## Storage changes
- Bucket `resumes` (private, 10 MB file size limit).
- SOP policies for SELECT / INSERT / UPDATE / DELETE scoped to
  `TO authenticated`. `storage.foldername(name)` returns text, so we cast
  `auth.uid()` to text for the comparison.

## Important notes
1. The frontend uploads objects as `<user_id>/<filename>` so the policy can
   enforce ownership purely from the path.
2. Casting `auth.uid()::text` is required because there is no
   uuid = text operator.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "select_own_resumes" ON storage.objects;
CREATE POLICY "select_own_resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "insert_own_resumes" ON storage.objects;
CREATE POLICY "insert_own_resumes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "update_own_resumes" ON storage.objects;
CREATE POLICY "update_own_resumes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "delete_own_resumes" ON storage.objects;
CREATE POLICY "delete_own_resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
