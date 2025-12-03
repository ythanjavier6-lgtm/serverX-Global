// archivo: config/client-config.js

import { SUPABASE_CONFIG_ENV, API_CONFIG_ENV, APP_CONFIG } from './env';
import { AUTH_POLICIES, STORAGE_POLICIES } from './policies';

// --- Configuración Final de Supabase (SOLO CLAVES PÚBLICAS) ---
export const SUPABASE_CONFIG = {
    URL: SUPABASE_CONFIG_ENV.URL,
    ANON_KEY: SUPABASE_CONFIG_ENV.ANON_KEY,
    // La clave del rol de servicio se excluye de este archivo
    // La clave SERVICE_ROLE_KEY solo debe ser accesible desde APIs del lado del servidor.
};

// --- Configuración Final de API ---
export const API_CONFIG = {
    BASE_URL: API_CONFIG_ENV.BASE_URL,
    TIMEOUT: API_CONFIG_ENV.TIMEOUT,
    RETRY_ATTEMPTS: API_CONFIG_ENV.RETRY_ATTEMPTS,
};

// --- Configuración Global de la Aplicación ---
export const GLOBAL_CONFIG = {
    ...APP_CONFIG,
    DEBUG_ENABLED: APP_CONFIG.DEBUG_MODE === 'true',
    IS_PROD: APP_CONFIG.ENVIRONMENT === 'production',
    IS_DEV: APP_CONFIG.ENVIRONMENT === 'development',
};

// --- Políticas Incluidas ---
export const CLIENT_POLICIES = {
    AUTH: AUTH_POLICIES,
    STORAGE: STORAGE_POLICIES,
};