-- PAYMENTS: Verify Transaction
-- Función para verificar y confirmar transacciones de pago

CREATE OR REPLACE FUNCTION verify_transaction(
  p_payment_id UUID,
  p_gateway_status VARCHAR
)
RETURNS TABLE(success BOOLEAN, order_updated BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_order_id UUID;
  v_payment_status VARCHAR;
BEGIN
  -- Obtener ID de orden y validar pago
  SELECT order_id INTO v_order_id
  FROM payments WHERE id = p_payment_id;

  IF v_order_id IS NULL THEN
    RETURN QUERY SELECT FALSE, FALSE, 'Pago no encontrado'::VARCHAR;
    RETURN;
  END IF;

  -- Determinar estado del pago basado en gateway_status
  v_payment_status := CASE 
    WHEN p_gateway_status IN ('success', 'completed', 'approved') THEN 'completed'
    WHEN p_gateway_status IN ('failed', 'declined', 'error') THEN 'failed'
    WHEN p_gateway_status = 'pending' THEN 'pending'
    ELSE 'failed'
  END;

  -- Actualizar pago
  UPDATE payments 
  SET status = v_payment_status, updated_at = NOW()
  WHERE id = p_payment_id;

  -- Si pago completado, actualizar orden
  IF v_payment_status = 'completed' THEN
    UPDATE orders 
    SET status = 'processing', updated_at = NOW()
    WHERE id = v_order_id;

    RETURN QUERY SELECT TRUE, TRUE, 'Transacción verificada y orden procesada'::VARCHAR;
  ELSE
    RETURN QUERY SELECT FALSE, FALSE, 'Transacción fallida o pendiente'::VARCHAR;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
