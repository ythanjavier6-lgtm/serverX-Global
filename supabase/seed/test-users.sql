-- Seed de usuarios de prueba
INSERT INTO users (email, username, full_name, role, status, email_verified) VALUES
  ('admin@serverx.com', 'admin', 'Administrator', 'admin', 'active', TRUE),
  ('manager@serverx.com', 'manager', 'Project Manager', 'manager', 'active', TRUE),
  ('user1@serverx.com', 'user1', 'John Doe', 'user', 'active', TRUE),
  ('user2@serverx.com', 'user2', 'Jane Smith', 'user', 'active', TRUE),
  ('support@serverx.com', 'support', 'Support Team', 'manager', 'active', TRUE);
