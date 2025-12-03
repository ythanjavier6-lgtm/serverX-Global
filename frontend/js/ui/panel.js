 // Componente Panel lateral
export class Panel {
  constructor(id, side = 'right') {
    this.id = id;
    this.element = document.getElementById(id);
    this.side = side;
    this.isOpen = false;
    this.callbacks = { onOpen: null, onClose: null };
  }

  open() {
    if (this.element) {
      this.element.style.display = 'block';
      this.isOpen = true;
      this.setupBackdrop();
      if (this.callbacks.onOpen) this.callbacks.onOpen();
    }
  }

  close() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isOpen = false;
      this.removeBackdrop();
      if (this.callbacks.onClose) this.callbacks.onClose();
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  setupBackdrop() {
    let backdrop = document.getElementById('panel-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'panel-backdrop';
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      `;
      backdrop.addEventListener('click', () => this.close());
      document.body.appendChild(backdrop);
    }
  }

  removeBackdrop() {
    const backdrop = document.getElementById('panel-backdrop');
    if (backdrop) backdrop.remove();
  }

  onOpen(callback) {
    this.callbacks.onOpen = callback;
  }

  onClose(callback) {
    this.callbacks.onClose = callback;
  }

  setContent(html) {
    const content = this.element?.querySelector('.panel-content');
    if (content) content.innerHTML = html;
  }

  addContent(html) {
    const content = this.element?.querySelector('.panel-content');
    if (content) content.insertAdjacentHTML('beforeend', html);
  }

  clearContent() {
    const content = this.element?.querySelector('.panel-content');
    if (content) content.innerHTML = '';
  }
}

export function createPanel(id, side = 'right') {
  return new Panel(id, side);
}
