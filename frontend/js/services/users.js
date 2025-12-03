 // Servicio de usuarios
export async function fetchUsers(supabase) {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    return [];
  }
}

export async function fetchUserById(supabase, userId) {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    return null;
  }
}

export async function updateUser(supabase, userId, updates) {
  try {
    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    return false;
  }
}

export async function deleteUser(supabase, userId) {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    return false;
  }
}

export async function fetchUsersWithPagination(supabase, page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize;
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data: data || [], total: count || 0, page, pageSize };
  } catch (err) {
    console.error('Error obteniendo usuarios paginados:', err);
    return { data: [], total: 0, page, pageSize };
  }
}

export async function searchUsers(supabase, query) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error buscando usuarios:', err);
    return [];
  }
}

export async function getUserStats(supabase) {
  try {
    const [totalUsers, activeUsers, newTodayUsers] = await Promise.all([
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('users').select('count', { count: 'exact' }).eq('is_active', true),
      supabase.from('users').select('count', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
    ]);

    return {
      total: totalUsers.count || 0,
      active: activeUsers.count || 0,
      newToday: newTodayUsers.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    return { total: 0, active: 0, newToday: 0 };
  }
}
