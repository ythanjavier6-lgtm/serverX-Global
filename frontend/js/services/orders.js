 // Servicio de órdenes
export async function fetchOrders(supabase, userId = null) {
  try {
    let query = supabase.from('orders').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo órdenes:', err);
    return [];
  }
}

export async function fetchOrderById(supabase, orderId) {
  try {
    const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo orden:', err);
    return null;
  }
}

export async function createOrder(supabase, orderData) {
  try {
    const { data, error } = await supabase.from('orders').insert([orderData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error creando orden:', err);
    return null;
  }
}

export async function updateOrderStatus(supabase, orderId, status) {
  try {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando orden:', err);
    return false;
  }
}

export async function fetchOrdersWithPagination(supabase, page = 1, pageSize = 10, filters = {}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase.from('orders').select('*', { count: 'exact' });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.minAmount) query = query.gte('amount', filters.minAmount);
    if (filters.maxAmount) query = query.lte('amount', filters.maxAmount);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) throw error;
    return { data: data || [], total: count || 0, page, pageSize };
  } catch (err) {
    console.error('Error obteniendo órdenes paginadas:', err);
    return { data: [], total: 0, page, pageSize };
  }
}

export async function getOrderStats(supabase) {
  try {
    const [pending, completed, failed] = await Promise.all([
      supabase.from('orders').select('count', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('orders').select('count', { count: 'exact' }).eq('status', 'completed'),
      supabase.from('orders').select('count', { count: 'exact' }).eq('status', 'failed')
    ]);
    
    return {
      pending: pending.count || 0,
      completed: completed.count || 0,
      failed: failed.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    return { pending: 0, completed: 0, failed: 0 };
  }
}
