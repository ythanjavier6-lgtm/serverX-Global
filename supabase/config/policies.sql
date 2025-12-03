// archivo: config/policies.js

import { getNumericEnv, getEnvVar } from './env';

// Políticas de Autenticación y Sesión
export const AUTH_POLICIES = {
    // Duración de la sesión en milisegundos (24 horas por defecto)
    SESSION_DURATION_MS: getNumericEnv('SESSION_DURATION', 86400000), 
    // Intervalo para refrescar el token (1 minuto por defecto)
    TOKEN_REFRESH_INTERVAL_MS: getNumericEnv('TOKEN_REFRESH', 60000), 
    AUTO_REFRESH_ENABLED: getEnvVar('AUTO_REFRESH') === 'true',
    MIN_PASSWORD_LENGTH: 8,
    RATE_LIMIT_LOGIN: 5 // Intentos de login antes del bloqueo temporal
};

// Políticas de Almacenamiento (Storage)
export const STORAGE_POLICIES = {
    BUCKET_NAME: getEnvVar('STORAGE_BUCKET') || 'uploads',
    // Tamaño máximo del archivo en bytes (50MB por defecto)
    MAX_FILE_SIZE_BYTES: getNumericEnv('MAX_FILE_SIZE', 52428800), 
    // Extensiones permitidas para la carga
    ALLOWED_EXTENSIONS: (getEnvVar('ALLOWED_EXT') || 'pdf,doc,docx,xls,xlsx,jpg,png,gif').split(','),
    MAX_FILES_PER_USER: getNumericEnv('MAX_FILES_PER_USER', 100)
};

// Políticas de Acceso (Roles y Permisos Mínimos)
export const ACCESS_POLICIES = {
    // Roles definidos en la aplicación
    ROLES: {
        ADMIN: 'admin',
        EDITOR: 'editor',
        USER: 'user',
        GUEST: 'guest'
    },
    // Rol por defecto asignado a nuevos usuarios
    DEFAULT_ROLE: 'user' 
};