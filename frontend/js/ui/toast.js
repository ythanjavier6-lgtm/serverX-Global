 // Notificaciones tipo toast
export class Toast {
  constructor(message, type = 'info', duration = 3000) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.id = Date.now();
  }

  show() {
    const container = this.getOrCreateContainer();
    const toast = document.createElement('div');
    toast.id = `toast-${this.id}`;
    toast.className = `toast toast-${this.type}`;
    toast.textContent = this.message;
    toast.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      background: ${this.getBackgroundColor()};
      color: white;
      animation: slideIn 0.3s ease-in-out;
      cursor: pointer;
    `;
    
    toast.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    
    if (this.duration) {
      setTimeout(() => {
        toast.remove();
      }, this.duration);
    }
  }

  getBackgroundColor() {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[this.type] || colors.info;
  }

  getOrCreateContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      `;
      document.body.appendChild(container);
    }
    return container;
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  new Toast(message, type, duration).show();
}

// NUEVAS FUNCIONES PARA ADMIN
export class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 50;
  }

  add(message, type = 'info', persistent = false) {
    const notification = {
      id: Date.now(),
      message,
      type,
      persistent,
      timestamp: new Date().toISOString()
    };
    
    this.notifications.unshift(notification);
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }
    
    if (!persistent) {
      showToast(message, type);
    }
    
    return notification.id;
  }

  getPersistent() {
    return this.notifications.filter(n => n.persistent);
  }

  clear(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAll() {
    this.notifications = [];
  }

  getHistory(limit = 20) {
    return this.notifications.slice(0, limit);
  }
}

export const notificationCenter = new NotificationCenter();

export function showPersistentNotification(message, type = 'info') {
  return notificationCenter.add(message, type, true);
}

export function showBulkToasts(messages) {
  messages.forEach((msg, idx) => {
    setTimeout(() => {
      showToast(msg.message, msg.type || 'info', msg.duration || 3000);
    }, idx * 500);
  });
}
