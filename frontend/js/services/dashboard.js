 // Servicio dashboard: agregación de datos
export async function fetchDashboardStats(supabase, userId) {
  try {
    // Obtén estadísticas de múltiples fuentes
    const [servers, orders, payments, tickets] = await Promise.all([
      supabase.from('servers').select('count', { count: 'exact' }).eq('user_id', userId),
      supabase.from('orders').select('count', { count: 'exact' }).eq('user_id', userId),
      supabase.from('payments').select('*').eq('user_id', userId),
      supabase.from('tickets').select('count', { count: 'exact' }).eq('user_id', userId)
    ]);

    const totalRevenue = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      servers: servers.count || 0,
      orders: orders.count || 0,
      revenue: totalRevenue,
      tickets: tickets.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    return { servers: 0, orders: 0, revenue: 0, tickets: 0 };
  }
}

export async function fetchActivityLog(supabase, userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo log:', err);
    return [];
  }
}

export async function fetchAdminDashboardStats(supabase) {
  try {
    const [totalUsers, totalOrders, totalRevenue, totalServers, activeNow] = await Promise.all([
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('orders').select('count', { count: 'exact' }),
      supabase.from('payments').select('amount'),
      supabase.from('servers').select('count', { count: 'exact' }),
      supabase.from('sessions').select('count', { count: 'exact' }).gte('last_seen', new Date(Date.now() - 5*60*1000).toISOString())
    ]);

    const revenue = totalRevenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      users: totalUsers.count || 0,
      orders: totalOrders.count || 0,
      revenue: revenue,
      servers: totalServers.count || 0,
      activeNow: activeNow.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas admin:', err);
    return { users: 0, orders: 0, revenue: 0, servers: 0, activeNow: 0 };
  }
}

export async function fetchRecentOrders(supabase, limit = 5) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo órdenes recientes:', err);
    return [];
  }
}

export async function fetchRevenueChart(supabase, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Agrupar por día
    const grouped = {};
    data?.forEach(p => {
      const date = new Date(p.created_at).toLocaleDateString('es-ES');
      grouped[date] = (grouped[date] || 0) + p.amount;
    });
    
    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  } catch (err) {
    console.error('Error obteniendo gráfico:', err);
    return [];
  }
}
