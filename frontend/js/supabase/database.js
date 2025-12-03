/**
 * Módulo de Base de Datos - Supabase
 * Operaciones CRUD completas
 */

const DatabaseModule = (() => {
  
  const create = async (table, data) => {
    try {
      const { data: result, error } = await supabase.from(table).insert([data]);
      if (error) throw error;
      console.log(` Registro creado en ${table}`);
      return { success: true, data: result };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const read = async (table, options = {}) => {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending !== false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      console.log(` ${data.length} registros obtenidos`);
      return { success: true, data };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const readSingle = async (table, id) => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const update = async (table, id, data) => {
    try {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw error;
      console.log(` Registro actualizado`);
      return { success: true, data: result };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const delete_ = async (table, id) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      console.log(` Registro eliminado`);
      return { success: true };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const search = async (table, column, term) => {
    try {
      const { data, error } = await supabase.from(table).select('*').ilike(column, `%$`{term}%`);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const count = async (table) => {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, count };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { create, read, readSingle, update, delete: delete_, search, count };
})();
