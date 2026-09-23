import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

// Strict 2-second timeout to prevent blocking when remote database is slow/offline
const fetchWithTimeout: typeof fetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

// Graceful fallback mock client when Supabase is not yet configured for this specific client
// This prevents cross-client data contamination and app crashes
const mockQueryBuilder = {
  select: () => Promise.resolve({ data: [], error: null }),
  insert: () => Promise.resolve({ data: null, error: null }),
  update: () => Promise.resolve({ data: null, error: null }),
  delete: () => Promise.resolve({ data: null, error: null }),
  upsert: () => Promise.resolve({ data: null, error: null }),
  limit: () => Promise.resolve({ data: [], error: null }),
  order: () => mockQueryBuilder,
  eq: () => mockQueryBuilder,
  neq: () => mockQueryBuilder,
  in: () => mockQueryBuilder,
  single: () => Promise.resolve({ data: null, error: null }),
};

const mockClient = {
  from: () => mockQueryBuilder,
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as any;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: fetchWithTimeout,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : mockClient;
