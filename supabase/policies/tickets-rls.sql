-- RLS Policies para tabla tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tickets" ON tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Assigned staff can read tickets" ON tickets
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
