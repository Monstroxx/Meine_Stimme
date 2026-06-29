import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY fehlen (.env prüfen)');
}

// Nutzt den öffentlichen Publishable Key (RLS-eingeschränkt) - niemals den Secret Key im Frontend.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
