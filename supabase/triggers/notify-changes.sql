-- Trigger para notificar cambios en tiempo real
CREATE OR REPLACE FUNCTION notify_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    payload = jsonb_build_object(
      'op', TG_OP,
      'table', TG_TABLE_NAME,
      'data', to_jsonb(OLD)
    );
  ELSE
    payload = jsonb_build_object(
      'op', TG_OP,
      'table', TG_TABLE_NAME,
      'data', to_jsonb(NEW)
    );
  END IF;

  PERFORM pg_notify(
    'db_changes',
    payload::TEXT
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_changes();

CREATE TRIGGER notify_tickets_changes
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_changes();

CREATE TRIGGER notify_payments_changes
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_changes();
