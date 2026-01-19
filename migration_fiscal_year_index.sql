-- Create index for fiscal_year queries
CREATE INDEX IF NOT EXISTS idx_projects_fiscal_year ON projects(fiscal_year DESC);

-- Ensure older data has fiscal year (if any nulls exist, though schema says NOT NULL, good to be safe for dev/test data)
UPDATE projects SET fiscal_year = 2567 WHERE fiscal_year IS NULL;
