// Supabase client helper: devuelve la instancia cuando esté lista.
export async function getSupabase() {
  if (window.supabase) return window.supabase;
  if (!window.SUPABASE_CONF || !window.SUPABASE_CONF.url || !window.SUPABASE_CONF.anonKey) {
    console.warn('Supabase config missing. Fill supabase/config/client-config.js');
    return null;
  }
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  window.supabase = createClient(window.SUPABASE_CONF.url, window.SUPABASE_CONF.anonKey);
  return window.supabase;
}
