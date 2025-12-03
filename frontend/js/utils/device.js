 // Detección de dispositivo
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTablet() {
  return /iPad|Android/i.test(navigator.userAgent);
}

export function isDesktop() {
  return !isMobile() && !isTablet();
}

export function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

export function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  return 'Unknown';
}

export function getScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// NUEVAS FUNCIONES PARA ADMIN
export function getDeviceInfo() {
  return {
    device: isMobile() ? 'mobile' : isTablet() ? 'tablet' : 'desktop',
    browser: getBrowser(),
    os: getOS(),
    screenSize: getScreenSize(),
    userAgent: navigator.userAgent
  };
}

export function isRetina() {
  return window.devicePixelRatio > 1;
}

export function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

export function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

export function supportsLocalStorage() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function supportsSessionStorage() {
  try {
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function supportsWebWorkers() {
  return typeof(Worker) !== 'undefined';
}

export function getNetworkType() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 'unknown';
  return connection.type || connection.effectiveType || 'unknown';
}

export function getMemoryInfo() {
  if (!navigator.deviceMemory) return null;
  return {
    deviceMemory: navigator.deviceMemory + ' GB',
    maxTouchPoints: navigator.maxTouchPoints
  };
}

export function registerOrientationChange(callback) {
  window.addEventListener('orientationchange', callback);
  return () => window.removeEventListener('orientationchange', callback);
}
