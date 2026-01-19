-- Migration: Add campus field to projects table
-- Run this in Supabase SQL Editor

-- Step 1: Add the campus column with default value
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS campus TEXT NOT NULL DEFAULT 'central';

-- Step 2: Add check constraint for valid campus values
ALTER TABLE projects 
ADD CONSTRAINT campus_valid_values 
CHECK (campus IN ('central', 'rangsit', 'thaprachan', 'lampang'));

-- Step 3: Create an index for better query performance when filtering by campus
CREATE INDEX IF NOT EXISTS idx_projects_campus ON projects(campus);

-- Step 4: (Optional) Update existing records based on known patterns
-- Uncomment and modify if you have existing data to categorize
-- UPDATE projects SET campus = 'rangsit' WHERE organization ILIKE '%รังสิต%';
-- UPDATE projects SET campus = 'thaprachan' WHERE organization ILIKE '%ท่าพระจันทร์%';
-- UPDATE projects SET campus = 'lampang' WHERE organization ILIKE '%ลำปาง%';

-- Verification query
-- SELECT campus, COUNT(*) FROM projects GROUP BY campus;
