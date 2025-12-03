/**
 * Módulo de Utilidades - Supabase
 * Funciones auxiliares y formateo de datos
 */

const UtilsModule = (() => {
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const truncate = (text, length = 50) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    return error?.message || 'Error desconocido';
  };

  const isEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$`/.test(email);
  };

  const isStrongPassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  return {
    formatDate, formatCurrency, getInitials, getAvatarColor, truncate,
    debounce, throttle, getErrorMessage, isEmail, isStrongPassword
  };
})();
