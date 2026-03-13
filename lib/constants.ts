// Centralized configuration constants
// Values that should ideally come from environment variables

/** Gemini AI model identifier */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

/** Supabase Storage bucket for temporary document uploads */
export const SUPABASE_TEMP_BUCKET = process.env.SUPABASE_TEMP_BUCKET || 'temp-documents';

/** Next.js ISR revalidation periods (in seconds) */
export const REVALIDATE_HOME = 300; // 5 minutes
export const REVALIDATE_ORGANIZATIONS = 300; // 5 minutes
export const REVALIDATE_PROJECT_DETAIL = 600; // 10 minutes
