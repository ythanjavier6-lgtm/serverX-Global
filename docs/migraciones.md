# Migraciones SQL — ServerX

## Introducción

Las migraciones son cambios estructurales en la base de datos versionados y reproducibles. Se ubican en `supabase/migrations/`.

Cada archivo de migración:

- Tiene nombre: `NNN_descripcion.sql` (ej: `001_create_users_table.sql`)
- Contiene SQL UP (crear) y DOWN (revertir)
- Se ejecuta automáticamente en orden numérico

## Estructura de una Migración

```sql
-- supabase/migrations/001_create_example_table.sql

-- UP: Crear tabla
CREATE TABLE IF NOT EXISTS example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- DOWN: Revertir (comentado para referencia)
-- DROP TABLE IF EXISTS example;
```

## Migraciones Existentes

### 001 - Tabla de Usuarios

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
```

### 002 - Tabla de Productos

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cpu TEXT,
  ram TEXT,
  storage TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
```

### 003 - Tabla de Órdenes

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT DEFAULT 1,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 004 - Tabla de Pagos

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  stripe_transaction_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_transaction_id);
```

### 005 - Tabla de Servidores

```sql
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'provisioning',
  ip_address INET,
  cpu_usage DECIMAL(5, 2),
  memory_usage DECIMAL(5, 2),
  provider_id TEXT,
  provider_token TEXT ENCRYPTED,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_servers_status ON servers(status);
```

### 006 - Tabla de Tickets

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- Tabla de comentarios en tickets
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
```

### 007 - Tabla de Logs

```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_table ON logs(table_name);
CREATE INDEX idx_logs_created_at ON logs(created_at);
```

### 008 - Tabla de Sesiones

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address INET,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

### 009 - Tabla de Notificaciones

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### 010 - Tabla de Mensajes

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
```

## Crear Nueva Migración

### 1. Generar archivo

```bash
supabase migration new nombre_descriptivo
```

Crea: `supabase/migrations/NNN_nombre_descriptivo.sql`

### 2. Editar migración

Abrir el archivo y escribir SQL:

```sql
-- Create
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_new_feature_user_id ON new_feature(user_id);
```

### 3. Ejecutar localmente

```bash
supabase db pull
```

Ejecuta todas las migraciones pendientes.

### 4. Verificar

```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "\dt"
```

Muestra todas las tablas.

### 5. Hacer push a producción

```bash
supabase db push
```

## Buenas Prácticas

### 1. Una cosa por migración

```sql
-- ✅ BIEN: Un cambio por archivo
CREATE TABLE users (...)

-- ❌ MAL: Múltiples cambios en un archivo
CREATE TABLE users (...)
CREATE TABLE products (...)
ALTER TABLE orders ADD COLUMN...
```

### 2. Siempre incluir DOWN

Para poder revertir:

```sql
-- UP
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT
);

-- DOWN (comentado)
-- DROP TABLE IF EXISTS users;
```

### 3. Usar IF EXISTS / IF NOT EXISTS

```sql
-- ✅ BIEN
CREATE TABLE IF NOT EXISTS users (...)
DROP TABLE IF EXISTS old_table;

-- ❌ MAL
CREATE TABLE users (...)
DROP TABLE old_table;
```

### 4. Índices en columnas frequently filtered

```sql
-- Agregar índice si consultas frecuentemente por status
CREATE INDEX idx_orders_status ON orders(status);
```

### 5. Constraints explícitos

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  CHECK (status IN ('pending', 'completed', 'failed'))
);
```

## Tipos de Datos Comunes

| Tipo          | Ejemplo              | Uso                 |
| ------------- | -------------------- | ------------------- |
| UUID          | `gen_random_uuid()`  | IDs primarias       |
| TEXT          | `'ejemplo'`          | Strings ilimitados  |
| VARCHAR(n)    | `'ejemplo'`          | Strings limitados   |
| INT           | `42`                 | Números enteros     |
| DECIMAL(10,2) | `99.99`              | Dinero              |
| BOOLEAN       | `TRUE`               | Flags               |
| TIMESTAMP     | `now()`              | Fechas con hora     |
| DATE          | `CURRENT_DATE`       | Solo fecha          |
| JSONB         | `'{"key": "value"}'` | Datos estructurados |
| INET          | `'192.168.1.1'`      | Direcciones IP      |
| ARRAY         | `ARRAY['a', 'b']`    | Listas              |

## Encriptación de Datos Sensibles

```sql
-- Requiere extensión pgsodium
CREATE EXTENSION IF NOT EXISTS pgsodium;

CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key TEXT ENCRYPTED,
  secret TEXT ENCRYPTED
);
```

## Vistas Útiles

### Vista: Órdenes con detalles del usuario

```sql
CREATE VIEW orders_with_user AS
SELECT
  o.id,
  o.user_id,
  u.email,
  u.full_name,
  o.total,
  o.status,
  o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id;
```

Uso:

```sql
SELECT * FROM orders_with_user WHERE user_id = 'uuid';
```

## Triggers para Auditoría

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT,
  record_id UUID,
  action TEXT,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auditar tabla users
CREATE TRIGGER users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION audit_trigger();
```

## Troubleshooting

### Error: "Relation does not exist"

La tabla no existe o migración no se ejecutó:

```bash
supabase db push
```

### Error: "Foreign key violation"

No existe el registro referenciado:

```bash
SELECT * FROM users WHERE id = 'uuid';
```

### Revertir migración

```bash
supabase db reset
```

Vuelve a ejecutar todas las migraciones desde cero.
