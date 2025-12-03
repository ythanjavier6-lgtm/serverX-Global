-- Seed de productos
INSERT INTO products (name, slug, description, category, type, price, billing_cycle, is_active) VALUES
  ('Virtual Private Server Starter', 'vps-starter', 'Entry-level VPS with 2 CPU cores and 2GB RAM', 'servers', 'server', 9.99, 'monthly', TRUE),
  ('Virtual Private Server Professional', 'vps-professional', 'Professional VPS with 4 CPU cores and 8GB RAM', 'servers', 'server', 29.99, 'monthly', TRUE),
  ('Virtual Private Server Enterprise', 'vps-enterprise', 'Enterprise VPS with 8 CPU cores and 32GB RAM', 'servers', 'server', 99.99, 'monthly', TRUE),
  ('Dedicated Server Premium', 'dedicated-premium', 'High-performance dedicated server', 'servers', 'server', 199.99, 'monthly', TRUE),
  ('Email Add-on', 'email-addon', 'Professional email support add-on', 'addons', 'addon', 4.99, 'monthly', TRUE),
  ('24/7 Premium Support', 'premium-support', 'Round-the-clock technical support', 'support', 'support', 19.99, 'monthly', TRUE),
  ('SSL Certificate', 'ssl-certificate', 'Secure SSL certificate for one domain', 'addons', 'addon', 29.99, 'yearly', TRUE);
