-- RLS Policies para tabla products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
