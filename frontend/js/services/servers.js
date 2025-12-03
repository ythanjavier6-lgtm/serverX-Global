 // Servicio de servidores
export async function fetchServers(supabase, userId = null) {
  try {
    let query = supabase.from('servers').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo servidores:', err);
    return [];
  }
}

export async function fetchServerById(supabase, serverId) {
  try {
    const { data, error } = await supabase.from('servers').select('*').eq('id', serverId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo servidor:', err);
    return null;
  }
}

export async function createServer(supabase, serverData) {
  try {
    const { data, error } = await supabase.from('servers').insert([serverData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error creando servidor:', err);
    return null;
  }
}

export async function updateServer(supabase, serverId, updates) {
  try {
    const { error } = await supabase.from('servers').update(updates).eq('id', serverId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando servidor:', err);
    return false;
  }
}

export async function deleteServer(supabase, serverId) {
  try {
    const { error } = await supabase.from('servers').delete().eq('id', serverId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando servidor:', err);
    return false;
  }
}

// NUEVAS FUNCIONES PARA ADMIN
export async function fetchServersWithPagination(supabase, page = 1, pageSize = 10, filters = {}) {
  try {
    let query = supabase.from('servers').select('*', { count: 'exact' });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.region) query = query.eq('region', filters.region);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query.order('created_at', { ascending: false }).range(from, to);
    
    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (err) {
    console.error('Error obteniendo servidores con paginación:', err);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }
}

export async function searchServers(supabase, query) {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .or(`name.ilike.%${query}%,ip_address.ilike.%${query}%,location.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error buscando servidores:', err);
    return [];
  }
}

export async function getServerStats(supabase) {
  try {
    const stats = await Promise.all([
      supabase.from('servers').select('status', { count: 'exact' }).eq('status', 'active'),
      supabase.from('servers').select('status', { count: 'exact' }).eq('status', 'inactive'),
      supabase.from('servers').select('id', { count: 'exact' }),
      supabase.from('servers').select('region', { count: 'exact' }).eq('region', 'US'),
      supabase.from('servers').select('region', { count: 'exact' }).eq('region', 'EU')
    ]);
    
    return {
      active: stats[0].count || 0,
      inactive: stats[1].count || 0,
      total: stats[2].count || 0,
      us_region: stats[3].count || 0,
      eu_region: stats[4].count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas de servidores:', err);
    return { active: 0, inactive: 0, total: 0, us_region: 0, eu_region: 0 };
  }
}

export async function getServerUptime(supabase, serverId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('server_metrics')
      .select('timestamp,status')
      .eq('server_id', serverId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return 100;
    
    const upCount = data.filter(m => m.status === 'up').length;
    const uptime = (upCount / data.length) * 100;
    
    return Math.round(uptime * 100) / 100; // 99.99 format
  } catch (err) {
    console.error('Error obteniendo uptime del servidor:', err);
    return 0;
  }
}
