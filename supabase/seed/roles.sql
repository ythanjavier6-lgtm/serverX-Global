-- Seed de roles y permisos
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description, permissions) VALUES
  ('admin', 'Full system access', ARRAY[
    'users:read', 'users:write', 'users:delete',
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'servers:read', 'servers:write',
    'tickets:read', 'tickets:write',
    'payments:read', 'payments:write',
    'analytics:read', 'logs:read'
  ]),
  ('manager', 'Management access', ARRAY[
    'users:read',
    'products:read',
    'orders:read', 'orders:write',
    'servers:read',
    'tickets:read', 'tickets:write',
    'payments:read',
    'analytics:read'
  ]),
  ('user', 'User access', ARRAY[
    'products:read',
    'orders:read', 'orders:write',
    'servers:read',
    'tickets:read', 'tickets:write',
    'notifications:read'
  ]),
  ('guest', 'Guest access', ARRAY[
    'products:read'
  ]);
