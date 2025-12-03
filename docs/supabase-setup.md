# Setup de Supabase — ServerX

## Crear Proyecto en Supabase

### 1. Registrarse

1. Ir a https://supabase.com
2. Click "Start your project"
3. Usar GitHub para login rápido

### 2. Crear Proyecto

1. Click "New project"
2. Nombre: `serverx-prod` o `serverx-dev`
3. Contraseña BD: **guardar en lugar seguro**
4. Región: elegir la más cercana a usuarios
5. Pricing: `Pro` o `Enterprise` según volumen
6. Click "Create new project"

Esperar ~5 minutos a que se configure.

### 3. Obtener Credenciales

En Dashboard → Settings → API

```
Project URL: https://[PROJECT_ID].supabase.co
Anon Key: eyJ0eXAiOiJKV1QiLCJhbGc...
Service Role Key: eyJ0eXAiOiJKV1QiLCJhbGc... (SECRETO!)
```

Guardar en `.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAi...
```

## Configurar Base de Datos

### 1. Ejecutar Migraciones

```bash
supabase db push
```

Crea todas las tablas automáticamente.

Verificar en Dashboard → SQL Editor que existan:

- users
- products
- orders
- payments
- servers
- tickets
- notifications
- messages
- logs
- sessions

### 2. Configurar RLS

En Dashboard → Authentication → Policies

Para cada tabla, crear políticas según `docs/rls-policies.md`

O ejecutar script SQL:

```bash
supabase db execute < supabase/policies/users-rls.sql
supabase db execute < supabase/policies/orders-rls.sql
supabase db execute < supabase/policies/servers-rls.sql
# ... etc
```

### 3. Crear Índices

En Dashboard → SQL Editor ejecutar:

```sql
-- Índices para performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
```

## Configurar Autenticación

### 1. Habilitar Providers

En Dashboard → Authentication → Providers

Habilitar:

- Email (por defecto)
- Google
- GitHub
- (opcional) Microsoft, Discord, etc.

### 2. Email Configuration

En Dashboard → Authentication → Email

Para producción:

1. Usar dominio propio (ej: noreply@serverx.com)
2. Configurar SPF, DKIM, DMARC
3. O usar servicio externo (SendGrid, Postmark)

### 3. OAuth Setup

Para Google:

1. Ir a Google Cloud Console
2. Crear proyecto
3. OAuth 2.0 credentials
4. Copiar Client ID y Secret
5. En Supabase → Providers → Google → pegar

Similar para GitHub, Microsoft, etc.

## Crear Storage Buckets

En Dashboard → Storage

Crear buckets:

```
1. avatars (público)
2. invoices (privado)
3. backups (privado)
4. documents (privado)
```

Para cada uno:

- Configurar RLS según `docs/storage.md`
- Agregar políticas de acceso

## Configurar Edge Functions

### 1. Crear Secrets

En Dashboard → Edge Functions → Secrets

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
POSTMARK_API_KEY=pm_xxxxx
```

### 2. Deploy Functions

```bash
supabase functions deploy send-email
supabase functions deploy process-webhook
supabase functions deploy generate-invoice
supabase functions deploy sync-servers
```

### 3. Configurar Webhooks

En Stripe Dashboard → Webhooks:

```
URL: https://[PROJECT_ID].supabase.co/functions/v1/process-webhook
Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
```

Copiar "Signing secret" → guardar en STRIPE_WEBHOOK_SECRET

## Cargar Datos Iniciales

### 1. Ejecutar Seeds

```bash
# Crear roles
supabase db execute < supabase/seed/roles.sql

# Cargar productos
supabase db execute < supabase/seed/products.sql
```

O manual en SQL Editor:

```sql
-- Insertar categorías/roles
INSERT INTO roles (name, description) VALUES
  ('user', 'Usuario regular'),
  ('support', 'Agente de soporte'),
  ('admin', 'Administrador del sistema');

-- Insertar productos
INSERT INTO products (name, description, price, cpu, ram, storage) VALUES
  ('Starter', 'Servidor básico', 9.99, '1 core', '2GB', '25GB'),
  ('Professional', 'Servidor medio', 29.99, '4 cores', '8GB', '100GB'),
  ('Enterprise', 'Servidor premium', 99.99, '16 cores', '32GB', '500GB');
```

### 2. Crear Usuario Admin

En Dashboard → SQL Editor:

```sql
-- Crear admin user (cambiar email)
INSERT INTO users (id, email, full_name, role)
VALUES (
  gen_random_uuid(),
  'admin@serverx.com',
  'Admin User',
  'admin'
);
```

O usar endpoint de signup + manual role change.

## Variables de Entorno

Crear `.env.local` en raíz:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAi...

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Email
POSTMARK_API_KEY=pm_xxxxx

# App
APP_URL=http://localhost:3000
NODE_ENV=development
```

## Cliente en Frontend

Crear `frontend/js/supabase/client-config.js`:

```javascript
// ⚠️ Solo usar ANON_KEY en frontend (público)
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
```

Usar en `frontend/js/supabase-client.js`:

```javascript
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./client-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Testing

### Test Conexión

```javascript
// En consola del navegador
const { data, error } = await supabase.auth.getSession();
console.log(data, error);
```

Debe retornar sesión actual.

### Test Lectura de Datos

```javascript
const { data, error } = await supabase.from("products").select("*").limit(1);

console.log(data, error);
```

Debe retornar un producto.

### Test Insert

```javascript
const { data, error } = await supabase.from("messages").insert({
  sender_id: "uuid",
  recipient_id: "uuid",
  content: "Test message",
});

console.log(data, error);
```

## Backups

### Automated Backups

En Dashboard → Backups

Configurar:

- Daily backups: enabled
- Retention: 30 days
- Backup window: 2 AM

### Manual Backup

```bash
# Usando pg_dump
pg_dump "postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres" > backup.sql
```

## Monitoreo

### Alertas

En Dashboard → Billing → Alerts

Configurar alertas para:

- Uso de storage
- Requests
- Billing approaching limit

### Logs

Dashboard → Logs:

- API Logs
- Function Logs
- Auth Logs
- Database Logs

## Escalado

### Aumentar Recursos

1. Dashboard → Billing → Plan
2. Upgrade a Enterprise si necesitas:
   - Más de 100K monthly requests
   - Storage > 100GB
   - Custom SLA
   - Dedicated support

### Optimizar BD

```sql
-- Analizar performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 'uuid';

-- Crear índices si falta
CREATE INDEX idx_example ON table_name(column);

-- Vacuum
VACUUM ANALYZE;
```

## Seguridad en Producción

### 1. HTTPS

Supabase usa HTTPS automáticamente.

### 2. JWT Secrets

Cambiar en Dashboard → Settings → API → JWT Secret

Generar nuevo:

```bash
openssl rand -base64 32
```

### 3. Rate Limiting

Configurar en Edge Functions:

```typescript
const rateLimiter = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId) || [];
  const recentRequests = userLimit.filter((t) => now - t < 60000);

  if (recentRequests.length >= 100) {
    // 100 requests/min
    throw new Error("Rate limit exceeded");
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
}
```

### 4. CORS

En Edge Function:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://serverx.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

### 5. Validación de Entrada

```javascript
// Siempre validar en backend
if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  throw new Error("Invalid email");
}

if (password.length < 8) {
  throw new Error("Password too short");
}
```

## Troubleshooting

### "Invalid API Key"

Verificar:

```bash
echo $SUPABASE_ANON_KEY
```

Cambiar key en `.env`.

### "No connection to database"

1. Verificar URL es correcta
2. BD no está pausada (Dashboard → Pause)
3. Red permite conexión (firewall)

### RLS no funciona

```sql
-- Verificar RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'orders';

-- Debe retornar rowsecurity = true
```

### Lento en producción

1. Agregar más índices
2. Optimizar queries
3. Upgrade a plan superior
4. Usar caching
