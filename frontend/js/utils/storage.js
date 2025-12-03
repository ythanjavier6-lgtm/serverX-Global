 // Utilidades de almacenamiento
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
    return false;
  }
}

export function getItem(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Error leyendo de localStorage:', err);
    return null;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error('Error eliminando de localStorage:', err);
    return false;
  }
}

export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error('Error limpiando localStorage:', err);
    return false;
  }
}

export function hasItem(key) {
  return localStorage.getItem(key) !== null;
}

// NUEVAS FUNCIONES PARA ADMIN
export function getAllKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  return keys;
}

export function getAllItems() {
  const items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    items[key] = getItem(key);
  }
  return items;
}

export function setItemWithExpiry(key, value, expiryMs) {
  const item = {
    value,
    expiry: Date.now() + expiryMs
  };
  setItem(key, item);
}

export function getItemWithExpiry(key) {
  const item = getItem(key);
  if (!item) return null;
  
  if (item.expiry && Date.now() > item.expiry) {
    removeItem(key);
    return null;
  }
  
  return item.value;
}

export function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total; // en bytes
}

export function exportStorage(keys = null) {
  const items = {};
  const keysToExport = keys || getAllKeys();
  keysToExport.forEach(key => {
    items[key] = getItem(key);
  });
  return JSON.stringify(items, null, 2);
}

export function importStorage(jsonString, merge = false) {
  try {
    const items = JSON.parse(jsonString);
    if (!merge) clearStorage();
    Object.keys(items).forEach(key => {
      setItem(key, items[key]);
    });
    return true;
  } catch (err) {
    console.error('Error importando almacenamiento:', err);
    return false;
  }
}
