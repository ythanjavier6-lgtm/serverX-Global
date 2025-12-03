// archivo: src/config/environment.js o src/config/index.js

// --- Utilidades de Entorno ---
const getEnvVar = (key, defaultValue = null) => {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
};

const getNumericEnv = (key, defaultValue) => {
    const value = getEnvVar(key, String(defaultValue));
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Determina si estamos en el servidor (Node.js) o en el cliente (navegador)
export const isServerSide = () => typeof window === 'undefined';


// ====================================================================
// 🚀 SUPABASE CONFIGURATION (Mejorada)
// ====================================================================

// NOTA DE SEGURIDAD: Los valores sensibles (SERVICE_ROLE_KEY) se DEBEN cargar 
// directamente desde el entorno (process.env) y NUNCA se deben incluir 
// valores de fallback hardcodeados en el código de producción.

export const SUPABASE_CONFIG = {
    // URL y Clave ANÓNIMA son necesarias en el cliente.
    URL: getEnvVar('REACT_APP_SUPABASE_URL') || 'https://onaidgekhiouxvazwvsq.supabase.co',
    ANON_KEY: getEnvVar('REACT_APP_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYWlkZ2VraGlvdXh2YXp3dnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTQ5NTQsImV4cCI6MjA3OTY3MDk1NH0.HCFRl-VmLlU2Phog2pn-t-UWNrtEqXoSx-Ne8QTitFg',
    
    // El SERVICE_ROLE_KEY SÓLO debe ser accesible en el servidor (APIs backend, Next.js API Routes, etc.).
    // Si estás en un entorno de navegador, este valor debe ser null.
    get SERVICE_ROLE_KEY() {
        if (isServerSide()) {
            return getEnvVar('SUPABASE_SERVICE_ROLE_KEY', null); 
        }
        console.warn('Advertencia de Seguridad: Intentando acceder a SERVICE_ROLE_KEY desde el navegador.');
        return null;
    },

    // Configuraciones opcionales para inicialización (e.g., para SSR/Next.js)
    OPTIONS: {
        db: {
            schema: 'public',
        },
        auth: {
            persistSession: true,
            storageKey: 'sb',
        },
    }
};


// ====================================================================
// 🌍 OTRAS CONFIGURACIONES (Ajustadas a Utilidades)
// ====================================================================

export const API_CONFIG = {
    BASE_URL: getEnvVar('REACT_APP_API_URL') || 'http://localhost:3000/api',
    TIMEOUT: getNumericEnv('REACT_APP_API_TIMEOUT', 30000),
    RETRY_ATTEMPTS: getNumericEnv('REACT_APP_API_RETRIES', 3)
};

export const AUTH_CONFIG = {
    SESSION_DURATION: getNumericEnv('REACT_APP_SESSION_DURATION', 86400000),
    TOKEN_REFRESH_INTERVAL: getNumericEnv('REACT_APP_TOKEN_REFRESH', 60000),
    AUTO_REFRESH_ENABLED: getEnvVar('REACT_APP_AUTO_REFRESH') === 'true'
};

export const STORAGE_CONFIG = {
    BUCKET_NAME: getEnvVar('REACT_APP_STORAGE_BUCKET') || 'uploads',
    MAX_FILE_SIZE: getNumericEnv('REACT_APP_MAX_FILE_SIZE', 52428800),
    ALLOWED_EXTENSIONS: (getEnvVar('REACT_APP_ALLOWED_EXT') || 'pdf,doc,docx,xls,xlsx,jpg,png,gif').split(',')
};

export const APP_CONFIG = {
    ENVIRONMENT: getEnvVar('REACT_APP_ENV') || 'development',
    DEBUG_MODE: getEnvVar('REACT_APP_DEBUG') === 'true',
    LOG_LEVEL: getEnvVar('REACT_APP_LOG_LEVEL') || 'info'
};

export const FEATURES = {
    ENABLE_ANALYTICS: getEnvVar('REACT_APP_ENABLE_ANALYTICS') !== 'false',
    ENABLE_NOTIFICATIONS: getEnvVar('REACT_APP_ENABLE_NOTIFICATIONS') !== 'false',
    ENABLE_REAL_TIME: getEnvVar('REACT_APP_ENABLE_REALTIME') !== 'false',
    ENABLE_PAYMENTS: getEnvVar('REACT_APP_ENABLE_PAYMENTS') !== 'false'
};

// ====================================================================
// Funciones de Verificación de Entorno
// ====================================================================

export function isDevelopment() {
    return APP_CONFIG.ENVIRONMENT === 'development';
}

export function isProduction() {
    return APP_CONFIG.ENVIRONMENT === 'production';
}

export function isStaging() {
    return APP_CONFIG.ENVIRONMENT === 'staging';
}