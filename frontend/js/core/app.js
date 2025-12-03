 // App core: Inicializa la aplicación, carga configuración y bootstrapea servicios
import { getSupabase } from '/frontend/js/supabase-client.js';
import { initSession } from '/frontend/js/core/session-control.js';
import { setupEventBus } from '/frontend/js/core/events.js';
import { initTheme } from '/frontend/js/core/theme.js';

export class App {
  constructor() {
    this.supabase = null;
    this.user = null;
    this.session = null;
    this.eventBus = null;
  }

  async init() {
    try {
      // Inicializa tema
      initTheme();
      
      // Inicializa bus de eventos
      this.eventBus = setupEventBus();
      
      // Inicializa Supabase
      this.supabase = await getSupabase();
      if (!this.supabase) {
        console.warn('Supabase no configurado. Funcionalidad limitada.');
        return;
      }

      // Inicializa sesión
      const session = await initSession(this.supabase);
      if (session) {
        this.user = session.user;
        this.session = session;
        this.eventBus?.emit('auth:ready', { user: this.user });
      }

      console.log('App inicializada correctamente');
    } catch (err) {
      console.error('Error inicializando app:', err);
    }
  }

  async logout() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
      this.user = null;
      this.session = null;
      this.eventBus?.emit('auth:logout');
      location.href = '/index.html';
    }
  }
}

// Instancia global
export const app = new App();

// Auto inicializa cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
