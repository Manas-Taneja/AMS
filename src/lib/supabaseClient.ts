import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase URL or anon key missing; supabase client will be disabled.');
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
      },
    })
  : null;

export function getTableNameFromEndpoint(endpoint: string): string {
  // Expect endpoints like "/api/components" or "/api/components/123"
  const parts = endpoint.split('/').filter(Boolean);
  // parts[1] should be the collection name when prefixed with api
  if (parts[0] === 'api' && parts[1]) return parts[1];
  // fallback to last segment
  return parts[parts.length - 1] || endpoint;
}

export const supabaseEnabled = Boolean(supabase);

