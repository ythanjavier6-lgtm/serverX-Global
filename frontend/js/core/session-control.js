 // Control de sesión de usuario
export async function initSession(supabase) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      localStorage.setItem('user_id', session.user.id);
      localStorage.setItem('user_email', session.user.email);
      localStorage.setItem('session_start', new Date().toISOString());
      return session;
    }
  } catch (err) {
    console.error('Error obteniendo sesión:', err);
  }
  return null;
}

export async function getCurrentUser(supabase) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
  }
  return null;
}

export function getStoredUser() {
  return {
    id: localStorage.getItem('user_id'),
    email: localStorage.getItem('user_email')
  };
}

export function clearSession() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('session_start');
}

export function getSessionDuration() {
  const start = localStorage.getItem('session_start');
  if (!start) return 0;
  const now = new Date().getTime();
  const startTime = new Date(start).getTime();
  return Math.floor((now - startTime) / 1000); // segundos
}

export async function refreshSession(supabase) {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.error('Error refrescando sesión:', err);
    return null;
  }
}

export async function getUserProfile(supabase) {
  try {
    const user = await getCurrentUser(supabase);
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo perfil:', err);
    return null;
  }
}
