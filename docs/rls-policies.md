# Políticas RLS — ServerX

## Introducción

Row-Level Security (RLS) asegura que usuarios solo accedan a sus propios datos. Se define en SQL y se aplica automáticamente en todos los accesos (REST API, Real-time, etc.).

## Habilitación

En Supabase Dashboard:

```
Authentication → Policies → Habilitar RLS en cada tabla
```

O via SQL:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
```

## Conceptos Básicos

### 1. Política de SELECT (Lectura)

```sql
-- Usuario solo ve sus propios datos
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

### 2. Política de INSERT (Creación)

```sql
-- Usuario solo puede crear órdenes para sí mismo
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Política de UPDATE (Actualización)

```sql
-- Usuario solo puede actualizar sus propios datos
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 4. Política de DELETE (Eliminación)

```sql
-- Admin puede eliminar cualquier usuario
CREATE POLICY "Only admin can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Políticas de ServerX

### Users Table

```sql
-- Todos pueden ver perfil público
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (TRUE);

-- Usuario solo edita su propio perfil
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Solo admin puede cambiar roles
CREATE POLICY "Only admin can change user roles"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Solo admin puede eliminar usuarios
CREATE POLICY "Only admin can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Orders Table

```sql
-- Usuarios ven solo sus órdenes
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios crean órdenes para sí mismos
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuarios actualizan solo sus órdenes (estado limitado)
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- Admin puede actualizar cualquier orden
CREATE POLICY "Admin can update any order"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Solo admin ve todas las órdenes
CREATE POLICY "Admin can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Servers Table

```sql
-- Usuario solo ve sus servidores
CREATE POLICY "Users can view own servers"
ON servers FOR SELECT
USING (auth.uid() = user_id);

-- Usuario crea servidores para sí mismo
CREATE POLICY "Users can create own servers"
ON servers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuario solo actualiza sus servidores
CREATE POLICY "Users can update own servers"
ON servers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuario puede eliminar su servidor
CREATE POLICY "Users can delete own servers"
ON servers FOR DELETE
USING (auth.uid() = user_id);

-- Solo admin ve todos los servidores
CREATE POLICY "Admin can view all servers"
ON servers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Tickets Table

```sql
-- Usuario ve solo sus tickets
CREATE POLICY "Users can view own tickets"
ON tickets FOR SELECT
USING (auth.uid() = user_id);

-- Usuario solo ve tickets asignados a soporte
CREATE POLICY "Support can view assigned tickets"
ON tickets FOR SELECT
USING (
  assigned_to = auth.jwt() ->> 'email'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'support')
  )
);

-- Usuario crea tickets
CREATE POLICY "Users can create tickets"
ON tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuario actualiza estado de sus tickets
CREATE POLICY "Users can update own tickets"
ON tickets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Payments Table

```sql
-- Usuario ve solo sus pagos
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Usuario no puede crear pagos directamente (solo via webhook)
CREATE POLICY "Payments created only by system"
ON payments FOR INSERT
USING (FALSE);

-- Sistema actualiza estado de pago
CREATE POLICY "System can update payment status"
ON payments FOR UPDATE
USING (
  current_setting('app.is_system')::boolean = true
)
WITH CHECK (
  current_setting('app.is_system')::boolean = true
);
```

### Notifications Table

```sql
-- Usuario ve solo sus notificaciones
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Sistema crea notificaciones
CREATE POLICY "System creates notifications"
ON notifications FOR INSERT
USING (TRUE)
WITH CHECK (TRUE);

-- Usuario marca como leído
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuario elimina sus notificaciones
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);
```

### Messages Table

```sql
-- Usuario ve mensajes donde es remitente o destinatario
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (
  auth.uid() = sender_id
  OR auth.uid() = recipient_id
);

-- Usuario envía mensajes
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Usuario marca como leído
CREATE POLICY "Users can mark messages read"
ON messages FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);
```

## Roles Personalizados

### Crear Roles

```sql
-- Admin (acceso total)
CREATE POLICY "Admin policy"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Support (ver tickets y usuarios)
CREATE POLICY "Support can view tickets"
ON tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'support'
  )
);

-- User (acceso limitado)
CREATE POLICY "User default access"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

## Verificar Roles en Frontend

```javascript
// services/users.js
async function getCurrentUserRole() {
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", auth.user().id)
    .single();

  return data.role;
}

async function checkPermission(requiredRole) {
  const role = await getCurrentUserRole();
  const roles = {
    user: 0,
    support: 1,
    admin: 2,
  };

  return roles[role] >= roles[requiredRole];
}
```

## Testing de RLS

### Verificar que RLS está activo

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'orders', 'servers');
```

Debe mostrar `rowsecurity = true`

### Listar políticas

```sql
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'orders';
```

### Test de acceso

```sql
-- Como usuario 1, intentar leer orden de usuario 2
SET session "request.jwt.claims.sub" = 'user-1-uuid';

SELECT * FROM orders WHERE user_id = 'user-2-uuid';
-- Resultado: 0 filas (bloqueado por RLS)
```

## Bypass de RLS (Admin)

En Edge Functions usar Service Role:

```typescript
import { createClient } from "@supabase/supabase-js";

// Con anonKey: respeta RLS
const userClient = createClient(URL, ANONKEY);

// Con SERVICE_ROLE_KEY: ignora RLS
const adminClient = createClient(URL, SERVICE_ROLE_KEY);

const allOrders = await adminClient.from("orders").select("*"); // Ve TODAS las órdenes, no solo las suyas
```

## Performance

### Índices para RLS

```sql
-- Agregar índices en columnas usadas en RLS
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
```

### Evitar N+1 Queries

```sql
-- ❌ MAL: Suele ser lento
CREATE POLICY "Users can view servers"
ON servers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ✅ BIEN: Más rápido (cache jwt)
CREATE POLICY "Users can view servers"
ON servers FOR SELECT
USING (
  (auth.jwt() ->> 'user_role') = 'admin'
  OR user_id = auth.uid()
);
```

## Errores Comunes

### "Insufficient privilege or some other SQL error occurred"

La RLS está bloqueando. Verificar:

1. Usuario tiene permiso en la política
2. Usuario_id coincide
3. RLS está habilitado

### "42P01 Relation does not exist"

Tabla no existe. Verificar nombres exactos.

### Cambios de RLS no se aplican

Cache. Solución:

```javascript
// Refrescar sesión
await supabase.auth.refreshSession();
```

## Migración de RLS

```sql
-- Guardar políticas existentes
\dp+ users

-- Eliminar todas las políticas de una tabla
DROP POLICY IF EXISTS "Users can view profiles" ON users;

-- Re-crear con cambios
CREATE POLICY "New policy" ON users FOR SELECT USING (...);
```
