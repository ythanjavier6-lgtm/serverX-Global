-- Crear tabla de servidores
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  name VARCHAR(255) NOT NULL,
  hostname VARCHAR(255) UNIQUE,
  ip_address INET NOT NULL,
  ipv6_address INET,
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance', 'down')),
  region VARCHAR(50),
  datacenter VARCHAR(255),
  cpu_cores INTEGER,
  ram_gb INTEGER,
  storage_gb INTEGER,
  os VARCHAR(100),
  control_panel VARCHAR(100),
  root_password VARCHAR(255) ENCRYPTED,
  port INTEGER DEFAULT 22,
  custom_specs JSONB,
  billing_cycle VARCHAR(20),
  renewal_date DATE,
  uptime_percentage DECIMAL(5, 2),
  metrics JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_servers_region ON servers(region);
CREATE INDEX idx_servers_ip_address ON servers(ip_address);
