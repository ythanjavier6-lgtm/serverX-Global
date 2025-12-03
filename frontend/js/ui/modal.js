 // Componente Modal
export class Modal {
  constructor(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.callbacks = { onOpen: null, onClose: null };
  }

  open() {
    if (this.element) {
      this.element.style.display = 'block';
      document.body.style.overflow = 'hidden';
      if (this.callbacks.onOpen) this.callbacks.onOpen();
    }
  }

  close() {
    if (this.element) {
      this.element.style.display = 'none';
      document.body.style.overflow = 'auto';
      if (this.callbacks.onClose) this.callbacks.onClose();
    }
  }

  toggle() {
    if (this.element?.style.display === 'block') {
      this.close();
    } else {
      this.open();
    }
  }

  setupCloseButton(buttonSelector = '.modal-close') {
    const button = this.element?.querySelector(buttonSelector);
    if (button) {
      button.addEventListener('click', () => this.close());
    }
  }

  setTitle(title) {
    const titleEl = this.element?.querySelector('.modal-title');
    if (titleEl) titleEl.textContent = title;
  }

  setContent(html) {
    const content = this.element?.querySelector('.modal-content');
    if (content) content.innerHTML = html;
  }

  onOpen(callback) {
    this.callbacks.onOpen = callback;
  }

  onClose(callback) {
    this.callbacks.onClose = callback;
  }

  isOpen() {
    return this.element?.style.display === 'block';
  }

  addAction(buttonText, callback, buttonClass = 'btn-primary') {
    const footer = this.element?.querySelector('.modal-footer');
    if (footer) {
      const btn = document.createElement('button');
      btn.textContent = buttonText;
      btn.className = `btn ${buttonClass}`;
      btn.addEventListener('click', () => {
        callback();
        this.close();
      });
      footer.appendChild(btn);
    }
  }
}

export function createModal(id) {
  return new Modal(id);
}

export function createSimpleModal(title, message, onConfirm) {
  const modalId = `modal-${Date.now()}`;
  const modalHTML = `
    <div id="${modalId}" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h3 class="modal-title">${title}</h3>
        <p>${message}</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('${modalId}').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="document.getElementById('${modalId}').style.display='none'">Confirmar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = createModal(modalId);
  modal.setupCloseButton();
  modal.open();
  return modal;
}
