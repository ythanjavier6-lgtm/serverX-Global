 // Componente Paginador
export class Paginator {
  constructor(items = [], itemsPerPage = 10) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.callbacks = { onChange: null };
  }

  getTotalPages() {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  getPageItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.notifyChange();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.notifyChange();
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.notifyChange();
    }
  }

  notifyChange() {
    if (this.callbacks.onChange) {
      this.callbacks.onChange({
        page: this.currentPage,
        items: this.getPageItems(),
        totalPages: this.getTotalPages()
      });
    }
  }

  onChange(callback) {
    this.callbacks.onChange = callback;
  }

  setItems(items) {
    this.items = items;
    this.currentPage = 1;
    this.notifyChange();
  }

  render(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const items = this.getPageItems();
    container.innerHTML = items.map(item => `<div class="item">${JSON.stringify(item)}</div>`).join('');
  }

  renderWithTemplate(containerSelector, template) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const items = this.getPageItems();
    container.innerHTML = items.map(item => template(item)).join('');
  }

  getPaginationInfo() {
    return {
      currentPage: this.currentPage,
      totalPages: this.getTotalPages(),
      totalItems: this.items.length,
      itemsPerPage: this.itemsPerPage,
      startIndex: (this.currentPage - 1) * this.itemsPerPage,
      endIndex: Math.min(this.currentPage * this.itemsPerPage, this.items.length)
    };
  }

  renderPaginationControls(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const info = this.getPaginationInfo();
    let html = '<div class="pagination-controls">';
    
    if (this.currentPage > 1) {
      html += `<button class="btn-prev" onclick="this.paginator.prevPage()">← Anterior</button>`;
    }
    
    for (let i = 1; i <= info.totalPages; i++) {
      if (i === this.currentPage) {
        html += `<span class="page-current">${i}</span>`;
      } else {
        html += `<button class="page-btn" onclick="this.paginator.goToPage(${i})">${i}</button>`;
      }
    }
    
    if (this.currentPage < info.totalPages) {
      html += `<button class="btn-next" onclick="this.paginator.nextPage()">Siguiente →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
  }
}

export function createPaginator(items = [], itemsPerPage = 10) {
  return new Paginator(items, itemsPerPage);
}
