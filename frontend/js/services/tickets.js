 // Servicio de tickets de soporte
export async function fetchTickets(supabase, userId = null) {
  try {
    let query = supabase.from('tickets').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo tickets:', err);
    return [];
  }
}

export async function fetchTicketById(supabase, ticketId) {
  try {
    const { data, error } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo ticket:', err);
    return null;
  }
}

export async function createTicket(supabase, ticketData) {
  try {
    const { data, error } = await supabase.from('tickets').insert([ticketData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error creando ticket:', err);
    return null;
  }
}

export async function updateTicketStatus(supabase, ticketId, status) {
  try {
    const { error } = await supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando ticket:', err);
    return false;
  }
}

export async function addTicketComment(supabase, ticketId, comment) {
  try {
    const { data, error } = await supabase.from('ticket_comments').insert([{ ticket_id: ticketId, comment, created_at: new Date().toISOString() }]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error añadiendo comentario:', err);
    return null;
  }
}

export async function fetchTicketsWithPagination(supabase, page = 1, pageSize = 10, filters = {}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase.from('tickets').select('*', { count: 'exact' });
    
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) throw error;
    return { data: data || [], total: count || 0, page, pageSize };
  } catch (err) {
    console.error('Error obteniendo tickets paginados:', err);
    return { data: [], total: 0, page, pageSize };
  }
}

export async function getTicketStats(supabase) {
  try {
    const [open, inProgress, closed] = await Promise.all([
      supabase.from('tickets').select('count', { count: 'exact' }).eq('status', 'open'),
      supabase.from('tickets').select('count', { count: 'exact' }).eq('status', 'in_progress'),
      supabase.from('tickets').select('count', { count: 'exact' }).eq('status', 'closed')
    ]);
    
    return {
      open: open.count || 0,
      inProgress: inProgress.count || 0,
      closed: closed.count || 0
    };
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    return { open: 0, inProgress: 0, closed: 0 };
  }
}
