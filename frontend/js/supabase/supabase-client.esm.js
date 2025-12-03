// Cliente ESM para entornos con bundler (Vite/CRA/Next) o uso como módulo
// Uso: import { supabase } from './supabase-client.esm.js'

import { createClient } from '@supabase/supabase-js';

// Prioridad de lectura de variables:
// 1) Vite -> import.meta.env.VITE_SUPABASE_URL
// 2) CRA  -> process.env.REACT_APP_SUPABASE_URL (reemplazado en build)
// 3) Next -> process.env.NEXT_PUBLIC_SUPABASE_URL
// 4) Fallback a window.__SUPABASE_URL__ (útil para incluir desde HTML)

const getEnv = () => {
  const viteUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

  const reactUrl = typeof process !== 'undefined' && process.env ? (process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) : undefined;
  const reactKey = typeof process !== 'undefined' && process.env ? (process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : undefined;

  const windowUrl = typeof window !== 'undefined' ? window.__SUPABASE_URL__ : undefined;
  const windowKey = typeof window !== 'undefined' ? window.__SUPABASE_ANON_KEY__ : undefined;

  return {
    url: viteUrl || reactUrl || windowUrl || '',
    key: viteKey || reactKey || windowKey || ''
  };
};

const { url: SUPABASE_URL, key: SUPABASE_KEY } = getEnv();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Aviso amigable: en desarrollo puede estar bien, pero en producción asegúrate de definir variables.
  console.warn('[supabase-client] No se encontraron credenciales en env (import.meta.env/process.env/window).');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Exponer globalmente por compatibilidad con scripts existentes
if (typeof window !== 'undefined') {
  window.supabase = supabase;
  window.supabaseClient = supabase;
}

export default supabase;
