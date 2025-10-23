import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnon = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnon);
