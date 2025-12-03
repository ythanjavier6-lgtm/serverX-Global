 // Utilidades de texto
export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function toTitleCase(text) {
  return text.split(' ').map(word => capitalize(word)).join(' ');
}

export function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function truncate(text, length = 50) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function removeHtmlTags(text) {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
}

export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// NUEVAS FUNCIONES PARA ADMIN
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatCurrency(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount);
}

export function formatPercentage(value, decimals = 2) {
  return (value * 100).toFixed(decimals) + '%';
}

export function pluralize(singular, plural, count) {
  return count === 1 ? singular : plural;
}

export function generateId(prefix = '') {
  return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
}

export function reverseString(text) {
  return text.split('').reverse().join('');
}

export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

export function countCharacters(text, excludeSpaces = false) {
  if (excludeSpaces) {
    return text.replace(/\s/g, '').length;
  }
  return text.length;
}

export function stripWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}
