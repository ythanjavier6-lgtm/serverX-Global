 // Servicio de pagos
export async function fetchPayments(supabase, userId = null) {
  try {
    let query = supabase.from('payments').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo pagos:', err);
    return [];
  }
}

export async function fetchPaymentById(supabase, paymentId) {
  try {
    const { data, error } = await supabase.from('payments').select('*').eq('id', paymentId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo pago:', err);
    return null;
  }
}

export async function createPayment(supabase, paymentData) {
  try {
    const { data, error } = await supabase.from('payments').insert([paymentData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error creando pago:', err);
    return null;
  }
}

export async function updatePaymentStatus(supabase, paymentId, status) {
  try {
    const { error } = await supabase.from('payments').update({ status, updated_at: new Date().toISOString() }).eq('id', paymentId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando pago:', err);
    return false;
  }
}

export async function fetchPaymentsWithPagination(supabase, page = 1, pageSize = 10, filters = {}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase.from('payments').select('*', { count: 'exact' });
    
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
    console.error('Error obteniendo pagos paginados:', err);
    return { data: [], total: 0, page, pageSize };
  }
}

export async function getPaymentStats(supabase) {
  try {
    const [totalPayments, revenue, pending] = await Promise.all([
      supabase.from('payments').select('count', { count: 'exact' }),
      supabase.from('payments').select('amount').eq('status', 'completed'),
      supabase.from('payments').select('count', { count: 'exact' }).eq('status', 'pending')
    ]);
    
    const totalRevenue = revenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    return {
      total: totalPayments.count || 0,
      revenue: totalRevenue,
      pending: pending.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas de pagos:', err);
    return { total: 0, revenue: 0, pending: 0 };
  }
}
