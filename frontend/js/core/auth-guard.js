 // Guard para rutas que requieren autenticación
import { getCurrentUser } from '/frontend/js/core/session-control.js';

export async function requireAuth(supabase) {
  const user = await getCurrentUser(supabase);
  if (!user) {
    alert('Debes iniciar sesión para acceder a esta página');
    location.href = '/login.html';
    return null;
  }
  return user;
}

export async function requireRole(supabase, requiredRole) {
  const user = await getCurrentUser(supabase);
  if (!user) {
    location.href = '/login.html';
    return null;
  }

  // Obtén el rol del usuario desde Supabase (tabla user_roles)
  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !roleData || roleData.role !== requiredRole) {
    alert('No tienes permisos para acceder a esto');
    location.href = '/index.html';
    return null;
  }

  return user;
}

export async function requireAdmin(supabase) {
  return requireRole(supabase, 'admin');
}

export async function hasPermission(supabase, userId, resource, action) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('resource', resource)
      .eq('action', action)
      .single();
    
    if (error) return false;
    return !!data;
  } catch (err) {
    console.error('Error verificando permisos:', err);
    return false;
  }
}

export async function logAdminAction(supabase, userId, action, details = {}) {
  try {
    await supabase.from('admin_logs').insert({
      admin_id: userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip_address: await fetchClientIP()
    });
  } catch (err) {
    console.error('Error registrando acción admin:', err);
  }
}

async function fetchClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}
