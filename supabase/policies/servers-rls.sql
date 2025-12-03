-- RLS Policies para tabla servers
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own servers" ON servers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own servers" ON servers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can read all servers" ON servers
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
