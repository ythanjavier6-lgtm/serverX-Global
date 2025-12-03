 // Utilidades de red
export async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Error fetching:', err);
    throw err;
  }
}

export async function postJson(url, data, options = {}) {
  return fetchJson(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
}

export async function putJson(url, data, options = {}) {
  return fetchJson(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
}

export async function deleteRequest(url, options = {}) {
  return fetchJson(url, {
    method: 'DELETE',
    ...options
  });
}

export function isOnline() {
  return navigator.onLine;
}

// NUEVAS FUNCIONES PARA ADMIN
export async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url, options);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    return await fetchJson(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function uploadFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      });
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Upload error')));
    
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

export async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (err) {
    console.error('Error downloading file:', err);
  }
}

export function setupOfflineQueue() {
  const queue = [];
  
  window.addEventListener('offline', () => {
    console.log('Aplicación sin conexión');
  });
  
  window.addEventListener('online', () => {
    console.log('Aplicación en línea');
    processQueue();
  });
  
  return {
    add: (request) => queue.push(request),
    processQueue: () => {
      while (queue.length > 0) {
        const request = queue.shift();
        fetchJson(request.url, request.options).catch(err => {
          queue.unshift(request);
          throw err;
        });
      }
    }
  };
}
