-- Run this script in your Supabase SQL Editor to update the database
-- Use this instead of running the full schema.sql again

-- 1. Add new columns to 'projects' table (Safe if columns already exist)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS advisor TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS activity_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rationale TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS objectives TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS targets TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sdg_goals TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_breakdown JSONB;

-- 2. Create 'project_files' table (Safe if table already exists)
CREATE TABLE IF NOT EXISTS project_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT, 
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS for project_files
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for project_files
DROP POLICY IF EXISTS "Allow public read access files" ON project_files;
CREATE POLICY "Allow public read access files" ON project_files
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access files for authenticated users" ON project_files;
CREATE POLICY "Allow full access files for authenticated users" ON project_files
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage Policies (Optional: Run if you haven't set up the bucket in Dashboard)
-- Attempt to create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage
DROP POLICY IF EXISTS "Public Access project_files" ON storage.objects;
CREATE POLICY "Public Access project_files" ON storage.objects FOR SELECT USING ( bucket_id = 'project_files' );

DROP POLICY IF EXISTS "Auth Upload project_files" ON storage.objects;
CREATE POLICY "Auth Upload project_files" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'project_files' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Delete project_files" ON storage.objects;
CREATE POLICY "Auth Delete project_files" ON storage.objects FOR DELETE USING ( bucket_id = 'project_files' AND auth.role() = 'authenticated' );
