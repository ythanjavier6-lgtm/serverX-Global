 // Bus de eventos simple para comunicación entre módulos
export class EventBus {
  constructor() {
    this.listeners = {};
    this.history = [];
    this.maxHistory = 100;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    // Registrar en historial
    this.history.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error en listener de ${event}:`, err);
        }
      });
    }
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  getHistory(event = null) {
    if (event) {
      return this.history.filter(h => h.event === event);
    }
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

export function setupEventBus() {
  return new EventBus();
}

// Singleton global event bus
let globalBus = null;

export function getGlobalEventBus() {
  if (!globalBus) {
    globalBus = setupEventBus();
  }
  return globalBus;
}
