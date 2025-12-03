 // Componente Dropdown
export class Dropdown {
  constructor(triggerId, menuId) {
    this.trigger = document.getElementById(triggerId);
    this.menu = document.getElementById(menuId);
    this.isOpen = false;
    this.callbacks = { onOpen: null, onClose: null };
    this.init();
  }

  init() {
    if (this.trigger) {
      this.trigger.addEventListener('click', () => this.toggle());
      document.addEventListener('click', (e) => {
        if (!this.trigger.contains(e.target) && !this.menu?.contains(e.target)) {
          this.close();
        }
      });
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.menu) {
      this.menu.style.display = 'block';
      this.isOpen = true;
      if (this.callbacks.onOpen) this.callbacks.onOpen();
    }
  }

  close() {
    if (this.menu) {
      this.menu.style.display = 'none';
      this.isOpen = false;
      if (this.callbacks.onClose) this.callbacks.onClose();
    }
  }

  onOpen(callback) {
    this.callbacks.onOpen = callback;
  }

  onClose(callback) {
    this.callbacks.onClose = callback;
  }

  addItem(text, value, onClick) {
    if (!this.menu) return;
    const item = document.createElement('a');
    item.href = '#';
    item.textContent = text;
    item.className = 'dropdown-item';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      onClick ? onClick(value) : null;
      this.close();
    });
    this.menu.appendChild(item);
  }

  clear() {
    if (this.menu) {
      this.menu.innerHTML = '';
    }
  }
}

export function createDropdown(triggerId, menuId) {
  return new Dropdown(triggerId, menuId);
}
