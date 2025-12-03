/**
 * site.js - Utilidades globales para ServerX
 * Maneja: navegación activa, formularios, autenticación, notificaciones
 */

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener cliente Supabase
 */
function getSupabase() {
  return window.supabaseClient || window.supabase;
}

/**
 * Sistema de notificaciones
 */
const notify = {
  show: (message, type = 'info', duration = 3000) => {
    const id = `notify-${Date.now()}`;
    const colors = {
      info: '#0084ff',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    };
    
    const html = `
      <div id="${id}" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
      ">
        ${message}
      </div>
    `;
    
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el.firstElementChild);
    
    setTimeout(() => {
      const n = document.getElementById(id);
      if(n) n.remove();
    }, duration);
  },
  success: (msg, dur = 3000) => notify.show(msg, 'success', dur),
  error: (msg, dur = 3000) => notify.show(msg, 'error', dur),
  info: (msg, dur = 3000) => notify.show(msg, 'info', dur),
  warning: (msg, dur = 3000) => notify.show(msg, 'warning', dur)
};

window.notify = notify;

/**
 * Validaciones
 */
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (pass) => pass.length >= 8,
  strongPassword: (pass) => /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,}$/.test(pass),
  phone: (phone) => /^\+?[\d\s\-()]{10,}$/.test(phone),
  url: (url) => /^https?:\/\/.+/.test(url)
};

window.validators = validators;

/**
 * Formateo de datos
 */
const formatters = {
  currency: (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount),
  date: (date) => new Date(date).toLocaleDateString('es-ES'),
  datetime: (date) => new Date(date).toLocaleString('es-ES'),
  bytes: (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if(bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  },
  phone: (phone) => phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
  truncate: (text, max = 50) => text.length > max ? text.substring(0, max) + '...' : text
};

window.formatters = formatters;

/**
 * LocalStorage con versionado
 */
const storage = {
  set: (key, value, ttl = null) => {
    const data = { value, time: Date.now(), ttl };
    localStorage.setItem(key, JSON.stringify(data));
  },
  get: (key) => {
    const item = localStorage.getItem(key);
    if(!item) return null;
    const { value, time, ttl } = JSON.parse(item);
    if(ttl && Date.now() - time > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
};

window.storage = storage;

// ============================================
// NAVEGACIÓN
// ============================================

/**
 * Marcar enlace activo en navegación
 */
(function markActive(){
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(a => {
      const href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')) {
        a.style.color = 'var(--neon-cyan)';
        a.style.textShadow = '0 0 10px currentColor';
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch(e) {
    console.warn('[site.js] markActive error:', e);
  }
})();

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Verificar estado de autenticación
 */
async function checkAuth() {
  const supabase = getSupabase();
  if(!supabase) {
    console.warn('Supabase no inicializado');
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if(error) throw error;
    
    if(user) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    
    localStorage.removeItem('user');
    return null;
  } catch(e) {
    console.error('[checkAuth]', e);
    return null;
  }
}

/**
 * Requerir autenticación en página (redirigir si no autenticado)
 */
async function requireAuth() {
  const user = await checkAuth();
  if(!user) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
  }
  return user;
}

/**
 * Requerir rol específico
 */
async function requireRole(role) {
  const user = await checkAuth();
  if(!user) {
    window.location.href = '/login.html';
    return false;
  }
  
  // Si el usuario tiene el rol, permite acceso
  if(user.role === role || user.role === 'admin') return true;
  
  // Si no, redirige a dashboard
  window.location.href = '/admin/dashboard.html';
  return false;
}

window.auth = { checkAuth, requireAuth, requireRole };

// ============================================
// FORMULARIOS
// ============================================

/**
 * Enviar formulario de contacto
 */
async function handleContactForm(form) {
  const supabase = getSupabase();
  if(!supabase) {
    notify.error('Supabase no configurado');
    return;
  }
  
  const name = form.querySelector('[name=name]')?.value;
  const email = form.querySelector('[name=email]')?.value;
  const message = form.querySelector('[name=message]')?.value;
  
  if(!name || !email || !message) {
    notify.warning('Completa todos los campos');
    return;
  }
  
  if(!validators.email(email)) {
    notify.warning('Email inválido');
    return;
  }
  
  try {
    const { error } = await supabase.from('contacts').insert([{
      name,
      email,
      message,
      created_at: new Date().toISOString()
    }]);
    
    if(error) throw error;
    notify.success('Mensaje enviado. ¡Gracias!');
    form.reset();
  } catch(e) {
    console.error('[handleContactForm]', e);
    notify.error('Error al enviar mensaje');
  }
}

/**
 * Enviar formulario de newsletter
 */
async function handleNewsletterForm(form) {
  const supabase = getSupabase();
  if(!supabase) {
    notify.error('Supabase no configurado');
    return;
  }
  
  const email = form.querySelector('[name=email]')?.value;
  if(!email || !validators.email(email)) {
    notify.warning('Email inválido');
    return;
  }
  
  try {
    const { error } = await supabase.from('newsletter_subscriptions').insert([{
      email,
      subscribed_at: new Date().toISOString()
    }]);
    
    if(error) throw error;
    notify.success('¡Suscrito! Revisa tu email.');
    form.reset();
  } catch(e) {
    console.error('[handleNewsletterForm]', e);
    notify.error('Error al suscribirse');
  }
}

/**
 * Auto-conectar formularios por data-handler
 */
document.addEventListener('submit', async (e) => {
  const form = e.target;
  const handler = form?.dataset?.handler;
  
  if(!handler) return;
  
  e.preventDefault();
  
  const handlers = {
    contact: handleContactForm,
    newsletter: handleNewsletterForm
  };
  
  if(handlers[handler]) {
    await handlers[handler](form);
  }
});

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[site.js] Inicializando...');
  
  // Verificar autenticación si existe usuario en storage
  const user = storage.get('user');
  if(user) {
    const currentUser = await checkAuth();
    if(!currentUser) {
      // Token expirado, limpiar
      storage.remove('user');
    }
  }
  
  console.log('[site.js] ✅ Listo');
});

// ============================================
// EXPORTAR PARA MÓDULOS
// ============================================

window.SiteUtils = {
  getSupabase,
  notify,
  validators,
  formatters,
  storage,
  auth,
  handleContactForm,
  handleNewsletterForm
};

export {
  getSupabase,
  notify,
  validators,
  formatters,
  storage,
  checkAuth,
  requireAuth,
  requireRole,
  handleContactForm,
  handleNewsletterForm
};
