/**
 * Supabase Client - Inicialización y funciones principales
 * Descarga la librería: npm install @supabase/supabase-js
 * O usa CDN: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
 */

// ============================================
// CONFIGURACIÓN - REEMPLAZA CON TUS VALORES
// ============================================

const SUPABASE_URL = 'https://onaidgekhiouxvazwvsq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYWlkZ2VraGlvdXh2YXp3dnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTQ5NTQsImV4cCI6MjA3OTY3MDk1NH0.HCFRl-VmLlU2Phog2pn-t-UWNrtEqXoSx-Ne8QTitFg'; // Tu API Key (anon)

// ============================================
// INICIALIZAR CLIENTE
// ============================================

// Soporte robusto para inicializar el cliente (CDN o módulo)
// Usamos `window.supabaseClient` y sobrescribimos `window.supabase` con el cliente
var supabase = null;

function ensureClient() {
  if (supabase) return supabase;

  try {
    // Caso CDN: ventana tiene objeto con createClient
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      // Sobrescribimos la referencia global para que otros scripts usen el cliente
      window.supabase = client;
      window.supabaseClient = client;
      supabase = client;
      console.log('✅ Cliente Supabase inicializado (CDN)');
      return supabase;
    }

    // Caso módulo bundler: si existe createClient global independiente
    if (typeof window.createClient === 'function') {
      const client = window.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabase = client;
      window.supabaseClient = client;
      supabase = client;
      console.log('✅ Cliente Supabase inicializado (createClient global)');
      return supabase;
    }

    // Intentar buscar un import expuesto (por ejemplo en entornos bundler que pongan createClient)
    if (typeof createClient === 'function') {
      const client = createClient(SUPABASE_URL, SUPABASE_KEY);
      window.supabase = client;
      window.supabaseClient = client;
      supabase = client;
      console.log('✅ Cliente Supabase inicializado (import)');
      return supabase;
    }

    console.error('❌ Librería Supabase no encontrada. Asegúrate de incluir el CDN o importar @supabase/supabase-js');
    return null;
  } catch (err) {
    console.error('❌ Error inicializando Supabase:', err);
    return null;
  }
}

// Inicializar de forma segura al cargar el DOM (pero allow lazy init desde funciones)
document.addEventListener('DOMContentLoaded', () => { ensureClient(); });

// ============================================
// AUTENTICACIÓN
// ============================================

async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    console.log('✅ Registro exitoso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    return { success: false, error: error.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    console.log('✅ Sesión iniciada:', data);
    localStorage.setItem('supabase_token', data.session.access_token);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    console.log('✅ Sesión cerrada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.message);
    return { success: false, error: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error.message);
    return null;
  }
}

// ============================================
// OPERACIONES CRUD
// ============================================

// CREATE - Insertar registro
async function createRecord(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data]);
    
    if (error) throw error;
    console.log(`✅ Registro creado en ${table}:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Error creando registro:`, error.message);
    return { success: false, error: error.message };
  }
}

// READ - Obtener registros
async function getRecords(table, options = {}) {
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
    console.log(`✅ Registros obtenidos de ${table}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error obteniendo registros:`, error.message);
    return { success: false, error: error.message };
  }
}

// READ SINGLE - Obtener un registro
async function getRecord(table, id) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error obteniendo registro:`, error.message);
    return { success: false, error: error.message };
  }
}

// UPDATE - Actualizar registro
async function updateRecord(table, id, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    console.log(`✅ Registro actualizado en ${table}:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Error actualizando registro:`, error.message);
    return { success: false, error: error.message };
  }
}

// DELETE - Eliminar registro
async function deleteRecord(table, id) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    console.log(`✅ Registro eliminado de ${table}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error eliminando registro:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// BÚSQUEDA Y FILTROS
// ============================================

async function searchRecords(table, searchColumn, searchTerm) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .ilike(searchColumn, `%${searchTerm}%`);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error en búsqueda:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// SUSCRIPCIÓN A CAMBIOS EN TIEMPO REAL
// ============================================

function subscribeToChanges(table, callback) {
  const subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: table },
      (payload) => {
        console.log(`📡 Cambio en ${table}:`, payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Suscrito a cambios en ${table}`);
      }
    });
  
  return subscription;
}

// ============================================
// FUNCIONES PERSONALIZADAS (RPC)
// ============================================

async function callFunction(functionName, params = {}) {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) throw error;
    console.log(`✅ Función ${functionName} ejecutada:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error ejecutando función:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// UPLOAD/DOWNLOAD DE ARCHIVOS
// ============================================

async function uploadFile(bucket, path, file) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    console.log(`✅ Archivo subido:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error subiendo archivo:`, error.message);
    return { success: false, error: error.message };
  }
}

async function downloadFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error descargando archivo:`, error.message);
    return { success: false, error: error.message };
  }
}

async function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

window.SupabaseClient = {
  // Auth
  signUp, signIn, signOut, getCurrentUser,
  // CRUD
  createRecord, getRecords, getRecord, updateRecord, deleteRecord,
  // Search
  searchRecords,
  // Real-time
  subscribeToChanges,
  // Functions
  callFunction,
  // Storage
  uploadFile, downloadFile, getPublicUrl
};
