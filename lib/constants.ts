// Centralized configuration constants
// Values that should ideally come from environment variables

/** Gemini AI model identifier */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

/** Supabase Storage bucket for temporary document uploads */
export const SUPABASE_TEMP_BUCKET = process.env.SUPABASE_TEMP_BUCKET || 'temp-documents';
