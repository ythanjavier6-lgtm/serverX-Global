 // Servicio de estadísticas
export async function fetchServerStats(supabase, serverId) {
  try {
    const { data, error } = await supabase
      .from('server_metrics')
      .select('*')
      .eq('server_id', serverId)
      .order('timestamp', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo métricas:', err);
    return [];
  }
}

export async function fetchUserStats(supabase, userId) {
  try {
    const stats = await Promise.all([
      supabase.from('servers').select('count', { count: 'exact' }).eq('user_id', userId),
      supabase.from('orders').select('count', { count: 'exact' }).eq('user_id', userId),
      supabase.from('users').select('created_at').eq('id', userId).single()
    ]);
    return {
      servers: stats[0].count || 0,
      orders: stats[1].count || 0,
      joinDate: stats[2].data?.created_at
    };
  } catch (err) {
    console.error('Error obteniendo stats del usuario:', err);
    return { servers: 0, orders: 0, joinDate: null };
  }
}
 
// NUEVAS FUNCIONES PARA ADMIN
export async function getSystemMetrics(supabase) {
  try {
    const metrics = await Promise.all([
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('servers').select('count', { count: 'exact' }),
      supabase.from('orders').select('count', { count: 'exact' }),
      supabase.from('payments').select('count', { count: 'exact' })
    ]);
    
    return {
      totalUsers: metrics[0].count || 0,
      totalServers: metrics[1].count || 0,
      totalOrders: metrics[2].count || 0,
      totalPayments: metrics[3].count || 0
    };
  } catch (err) {
    console.error('Error obteniendo métricas del sistema:', err);
    return { totalUsers: 0, totalServers: 0, totalOrders: 0, totalPayments: 0 };
  }
}

export async function getRevenueMetrics(supabase, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('payments')
      .select('amount,status,created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed');
    
    if (error) throw error;
    
    const total = (data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const avg = data && data.length > 0 ? total / data.length : 0;
    
    return {
      totalRevenue: total,
      averagePayment: Math.round(avg * 100) / 100,
      paymentCount: data ? data.length : 0,
      period: days
    };
  } catch (err) {
    console.error('Error obteniendo métricas de ingresos:', err);
    return { totalRevenue: 0, averagePayment: 0, paymentCount: 0, period: days };
  }
}

export async function getGrowthMetrics(supabase) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newUsersToday = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .gte('created_at', today);
    
    const newUsersMonth = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .gte('created_at', lastMonth);
    
    return {
      newUsersToday: newUsersToday.count || 0,
      newUsersThisMonth: newUsersMonth.count || 0,
      growthRate: newUsersMonth.count ? ((newUsersToday.count || 0) / (newUsersMonth.count || 1) * 100) : 0
    };
  } catch (err) {
    console.error('Error obteniendo métricas de crecimiento:', err);
    return { newUsersToday: 0, newUsersThisMonth: 0, growthRate: 0 };
  }
}

export async function getTopServersBy(supabase, field = 'uptime', limit = 10) {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select('id,name,region,status,created_at')
      .order(field, { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error obteniendo top servidores por ${field}:`, err);
    return [];
  }
}

export async function getUsageByRegion(supabase) {
  try {
    const regions = ['US', 'EU', 'ASIA', 'SA'];
    const stats = await Promise.all(
      regions.map(region => 
        supabase.from('servers').select('count', { count: 'exact' }).eq('region', region)
      )
    );
    
    return regions.reduce((acc, region, idx) => {
      acc[region] = stats[idx].count || 0;
      return acc;
    }, {});
  } catch (err) {
    console.error('Error obteniendo uso por región:', err);
    return { US: 0, EU: 0, ASIA: 0, SA: 0 };
  }
}
