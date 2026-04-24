import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://upmsbzfuhmmsmwsezziv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_idna96YWoa4TFbjFADEaCw_dKLW-o5X';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'rr_supabase_session',
  },
});
