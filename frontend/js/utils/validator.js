 // Validaciones
export function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPhone(phone) {
  return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
}

export function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

export function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value) {
  return !value || (typeof value === 'string' && value.trim() === '');
}

export function isNumber(value) {
  return !isNaN(value) && isFinite(value);
}

export function validateForm(formElement) {
  const inputs = formElement.querySelectorAll('[required]');
  const errors = [];
  inputs.forEach(input => {
    if (!input.value || input.value.trim() === '') {
      errors.push(`${input.name || input.id} es requerido`);
    }
  });
  return errors;
}

// NUEVAS VALIDACIONES PARA ADMIN
export function isIP(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  if (!ipv4) return false;
  return ip.split('.').every(part => parseInt(part) <= 255);
}

export function isIPv6(ip) {
  return /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip);
}

export function isUsername(username) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

export function validateCreditCard(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) return false;
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = parseInt(digits[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

export function validateServerName(name) {
  return /^[a-zA-Z0-9\-_\.]{3,50}$/.test(name);
}

export function validateFormWithRules(formElement, rules) {
  const errors = {};
  Object.keys(rules).forEach(fieldName => {
    const input = formElement.querySelector(`[name="${fieldName}"]`);
    if (!input) return;
    
    const value = input.value;
    const rule = rules[fieldName];
    
    if (rule.required && isEmpty(value)) {
      errors[fieldName] = rule.requiredMessage || `${fieldName} es requerido`;
    }
    
    if (rule.validator && value && !rule.validator(value)) {
      errors[fieldName] = rule.message || `${fieldName} no es válido`;
    }
    
    if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = `${fieldName} debe tener al menos ${rule.minLength} caracteres`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[fieldName] = `${fieldName} no puede exceder ${rule.maxLength} caracteres`;
    }
  });
  
  return errors;
}
