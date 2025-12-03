 // Servicio de notificaciones
export async function fetchNotifications(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo notificaciones:', err);
    return [];
  }
}

export async function markAsRead(supabase, notificationId) {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error marcando notificación:', err);
    return false;
  }
}

export async function deleteNotification(supabase, notificationId) {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando notificación:', err);
    return false;
  }
}

export async function sendNotification(supabase, notificationData) {
  try {
    const { data, error } = await supabase.from('notifications').insert([notificationData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error enviando notificación:', err);
    return null;
  }
}

export async function fetchUnreadCount(supabase, userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error obteniendo conteo de notificaciones:', err);
    return 0;
  }
}

export async function markAllAsRead(supabase, userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error marcando todas como leídas:', err);
    return false;
  }
}

export async function broadcastNotification(supabase, notificationData) {
  try {
    // Enviar a todos los usuarios o a un grupo específico
    const { data, error } = await supabase.from('notifications').insert([
      {
        ...notificationData,
        broadcast: true,
        created_at: new Date().toISOString()
      }
    ]).select();
    
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error enviando notificación broadcast:', err);
    return null;
  }
}
