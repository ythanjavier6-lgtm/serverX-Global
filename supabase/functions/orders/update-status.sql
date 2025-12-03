-- ORDERS: Update Status
-- Función para actualizar estado de órdenes

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status VARCHAR
)
RETURNS TABLE(success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_valid_status BOOLEAN;
  v_user_id UUID;
  v_old_status VARCHAR;
BEGIN
  -- Validar que el estado es válido
  SELECT EXISTS(
    SELECT 1 FROM (VALUES ('pending'), ('processing'), ('completed'), ('failed'), ('cancelled')) 
    AS valid_statuses(status) WHERE status = p_new_status
  ) INTO v_valid_status;

  IF NOT v_valid_status THEN
    RETURN QUERY SELECT FALSE, 'Estado inválido: ' || p_new_status;
    RETURN;
  END IF;

  -- Obtener usuario y estado anterior
  SELECT user_id, status INTO v_user_id, v_old_status
  FROM orders WHERE id = p_order_id;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Orden no encontrada'::VARCHAR;
    RETURN;
  END IF;

  -- Actualizar orden
  UPDATE orders 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_order_id;

  -- Log del cambio
  INSERT INTO logs (user_id, action, resource_type, resource_id, status_code, changes)
  VALUES (v_user_id, 'order_status_updated', 'order', p_order_id::VARCHAR, 200,
          JSONB_BUILD_OBJECT('old_status', v_old_status, 'new_status', p_new_status));

  -- Crear notificación para el usuario
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (v_user_id, 'info', 'Orden actualizada', 
          'Tu orden ' || p_order_id::VARCHAR || ' cambió a estado: ' || p_new_status);

  RETURN QUERY SELECT TRUE, 'Estado actualizado a: ' || p_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
