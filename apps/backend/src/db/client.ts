import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env['SUPABASE_URL'] || 'https://mock-supabase.local';
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'] || 'mock-service-key';

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/// Helper: throw if Supabase returns an error.
export function assertNoError<T>(
  result: { data: T; error: unknown },
  context: string
): T {
  if (result.error) {
    const msg =
      result.error instanceof Error
        ? result.error.message
        : JSON.stringify(result.error);
    throw new Error(`Supabase error in ${context}: ${msg}`);
  }
  return result.data;
}
