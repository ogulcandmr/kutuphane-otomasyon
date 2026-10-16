import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!clientInstance) {
    if (!isSupabaseConfigured()) {
      clientInstance = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
      );
    } else {
      // Sunucu tarafında service_role key varsa RLS bypass için öncelikli kullan
      const keyToUse = (typeof window === 'undefined' && supabaseServiceRoleKey)
        ? supabaseServiceRoleKey
        : supabaseAnonKey;
      clientInstance = createClient(supabaseUrl, keyToUse);
    }
  }
  return clientInstance;
};
