 // Servicio de productos
export async function fetchProducts(supabase) {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    return [];
  }
}

export async function fetchProductById(supabase, productId) {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error obteniendo producto:', err);
    return null;
  }
}

export async function createProduct(supabase, productData) {
  try {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Error creando producto:', err);
    return null;
  }
}

export async function updateProduct(supabase, productId, updates) {
  try {
    const { error } = await supabase.from('products').update(updates).eq('id', productId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error actualizando producto:', err);
    return false;
  }
}

export async function deleteProduct(supabase, productId) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error eliminando producto:', err);
    return false;
  }
}

export async function fetchProductsWithPagination(supabase, page = 1, pageSize = 10, category = null) {
  try {
    const offset = (page - 1) * pageSize;
    let query = supabase.from('products').select('*', { count: 'exact' });
    
    if (category) query = query.eq('category', category);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) throw error;
    return { data: data || [], total: count || 0, page, pageSize };
  } catch (err) {
    console.error('Error obteniendo productos paginados:', err);
    return { data: [], total: 0, page, pageSize };
  }
}

export async function searchProducts(supabase, query) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error buscando productos:', err);
    return [];
  }
}
