-- PAYMENTS: Process Payment
-- Función para procesar pagos

CREATE OR REPLACE FUNCTION process_payment(
  p_order_id UUID,
  p_amount DECIMAL,
  p_gateway VARCHAR,
  p_gateway_transaction_id VARCHAR
)
RETURNS TABLE(success BOOLEAN, payment_id UUID, message VARCHAR) AS $$
DECLARE
  v_payment_id UUID;
  v_order_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Verificar que la orden existe
  SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id), user_id 
  INTO v_order_exists, v_user_id
  FROM orders WHERE id = p_order_id;

  IF NOT v_order_exists THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Orden no encontrada'::VARCHAR;
    RETURN;
  END IF;

  -- Crear registro de pago
  INSERT INTO payments (
    order_id, amount, status, payment_gateway, gateway_transaction_id
  )
  VALUES (p_order_id, p_amount, 'pending', p_gateway, p_gateway_transaction_id)
  RETURNING id INTO v_payment_id;

  -- Log de intento de pago
  INSERT INTO logs (user_id, action, resource_type, resource_id, status_code)
  VALUES (v_user_id, 'payment_initiated', 'payment', v_payment_id::VARCHAR, 201);

  RETURN QUERY SELECT TRUE, v_payment_id, 'Pago procesado'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
