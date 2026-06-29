import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY fehlen (Vercel-Projekteinstellungen pruefen)');
}

// Secret Key umgeht RLS - wird ausschliesslich serverseitig genutzt, niemals an den Client gesendet.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
