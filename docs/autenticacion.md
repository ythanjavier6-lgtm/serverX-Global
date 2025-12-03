# Autenticación — ServerX

## Flujo de Autenticación

### 1. Registro de Usuario

El flujo de registro inicia cuando un usuario accede a `/register.html`.

**Pasos**:

1. Usuario completa formulario con email, contraseña, y confirmación
2. `validator.js` valida email y fortaleza de contraseña
3. Frontend llama a `users.js` → `createUser(email, password, userData)`
4. Supabase Auth crea cuenta con `signUp()`
5. Trigger de BD crea registro en tabla `users`
6. Email de confirmación enviado (configurable en Supabase)
7. Usuario redirigido a login o dashboard (según config)

```javascript
// Ejemplo en register.html
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const user = await users.createUser(email, password, {
        full_name: document.getElementById("name").value,
      });
      toast.success("Cuenta creada. Verifica tu email.");
      router.go("/login");
    } catch (err) {
      toast.error(err.message);
    }
  });
```

### 2. Login de Usuario

El flujo de login inicia en `/login.html`.

**Pasos**:

1. Usuario ingresa email y contraseña
2. Frontend valida email con `validator.js`
3. `session-control.js` → `login(email, password)` llama a Supabase Auth
4. Si email no está verificado, mostrar advertencia
5. Si éxito: Supabase retorna JWT token en localStorage
6. `session-control.js` guarda sesión y usuario en localStorage
7. EventBus emite `user:login`
8. Router redirige a dashboard

```javascript
// En session-control.js
async login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  this.storeSession(data.session, data.user);
  return data.user;
}
```

### 3. JWT Tokens

**Configuración en Supabase**:

- **Token expiration**: 3600 segundos (1 hora) por defecto
- **Refresh token**: Válido 604800 segundos (7 días)
- **Algorithm**: HS256

**Almacenamiento**:

```
localStorage:
├── sb-[PROJECT_ID]-auth-token       // JWT del usuario
├── sb-[PROJECT_ID]-auth-user        // Datos del usuario
└── supabase.auth.expires_at         // Timestamp de expiración
```

**Validación en Frontend**:

```javascript
// session-control.js
getSession() {
  const session = JSON.parse(
    localStorage.getItem(`sb-${PROJECT_ID}-auth-token`)
  );

  if (!session) return null;

  // Verificar expiración
  const expiresAt = localStorage.getItem('supabase.auth.expires_at');
  if (new Date(expiresAt * 1000) < new Date()) {
    clearSession();
    return null;
  }

  return session;
}
```

### 4. Validación de Sesión

**Guards de Ruta**:

```javascript
// auth-guard.js
function requireAuth() {
  const user = sessionControl.getCurrentUser();
  if (!user) {
    router.go("/login");
    throw new Error("No autenticado");
  }
  return user;
}

function requireRole(role) {
  const user = requireAuth();
  if (user.role !== role && !user.roles?.includes(role)) {
    throw new Error("Acceso denegado");
  }
  return user;
}
```

**Uso en Páginas**:

```html
<!-- dashboard.html -->
<script>
  const user = authGuard.requireAuth();
  // Cargar dashboard...
</script>
```

### 5. Cierre de Sesión

**Flujo**:

1. Usuario hace click en "Cerrar sesión"
2. Frontend llama a `sessionControl.logout()`
3. Supabase Auth limpia el JWT
4. localStorage se borra
5. EventBus emite `user:logout`
6. Router redirige a `/login`

```javascript
// En session-control.js
async logout() {
  await supabase.auth.signOut();
  this.clearSession();
  eventBus.emit('user:logout');
}
```

### 6. Recuperación de Contraseña

**Flujo**:

1. Usuario accede a `/reset-password.html`
2. Ingresa email y hace submit
3. Supabase envía email con link de reset
4. Usuario hace click en email (link con token)
5. Página de reset valida token
6. Usuario ingresa nueva contraseña
7. Supabase actualiza contraseña
8. Redirige a login

```javascript
// Reset de contraseña
async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  toast.success("Email de reset enviado");
}

async function updatePassword(token, newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  toast.success("Contraseña actualizada");
}
```

## OAuth (Social Login)

### Configuración en Supabase

1. Ir a Dashboard → Authentication → Providers
2. Habilitar: Google, GitHub, Discord, Microsoft, etc.
3. Configurar OAuth App en proveedor (client ID, secret)

### Implementación

```javascript
// Suprabase soporta:
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });
}
```

## Multi-Factor Authentication (MFA)

### Setup en Supabase

1. Dashboard → Authentication → MFA
2. Habilitar TOTP (Time-based One-Time Password)
3. SMS si está configurado

### Flujo:

```javascript
async function enrollMFA() {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });

  // Mostrar QR code
  // Usuario escanea con Google Authenticator, Authy, etc.
}

async function verifyMFA(code) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: factorId,
    code: code,
  });
}
```

## Políticas de Sesión

### Timeout

- **Inactividad**: 30 minutos (cierra sesión automáticamente)
- **Máximo**: 24 horas (fuerza logout)

```javascript
// Implementar en app.js
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 min

document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keypress", resetInactivityTimer);

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    sessionControl.logout();
  }, INACTIVITY_TIMEOUT);
}
```

### Dispositivos Concurrentes

- Máximo 3 sesiones activas por usuario
- Sesión más antigua se invalida al crear la 4ª

### Historial de Sesiones

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address INET,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);
```

## Seguridad

### Buenas Prácticas

1. **Nunca** almacenar contraseña en localStorage
2. **Siempre** usar HTTPS en producción
3. **Validar** email antes de dar acceso total
4. **Implementar** rate limiting en login (máx 5 intentos / 15 min)
5. **Usar** CSRF tokens en formularios
6. **Mantener** JWT en HttpOnly cookies (backend)

### Detección de Anomalías

```javascript
// Alertar si login desde IP diferente
const currentIP = getCurrentUserIP();
const lastLoginIP = await getLastLoginIP(userId);

if (currentIP !== lastLoginIP) {
  emailService.sendSecurityAlert(user.email, {
    message: `Login desde nueva ubicación: ${currentIP}`,
    timestamp: new Date(),
  });
}
```

## Debug y Troubleshooting

### El usuario no recibe email de confirmación

- Verificar dominio de email en Supabase (no sea tratado como spam)
- Revisar logs de Supabase Dashboard
- Probar con diferentes dominios de email

### JWT expirado

El cliente debe auto-renovar:

```javascript
if (isTokenExpired()) {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) sessionControl.logout();
}
```

### Sesión se pierde al recargar página

Verificar que localStorage esté habilitado:

```javascript
const canUseStorage = () => {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
```
