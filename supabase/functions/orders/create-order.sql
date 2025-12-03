-- ORDERS: Create Order
-- Función para crear nuevas órdenes

CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INT,
  p_shipping_address JSONB,
  p_billing_address JSONB
)
RETURNS TABLE(success BOOLEAN, order_id UUID, order_number VARCHAR, message VARCHAR) AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR;
  v_product_price DECIMAL;
  v_total_amount DECIMAL;
BEGIN
  -- Obtener precio del producto
  SELECT price INTO v_product_price
  FROM products WHERE id = p_product_id AND status = 'active';

  IF v_product_price IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, 'Producto no encontrado o inactivo'::VARCHAR;
    RETURN;
  END IF;

  -- Calcular total
  v_total_amount := v_product_price * p_quantity;

  -- Generar número de orden
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                   LPAD(NEXTVAL('order_number_seq')::VARCHAR, 6, '0');

  -- Crear orden
  INSERT INTO orders (
    user_id, product_id, quantity, order_number, status,
    total_amount, shipping_address, billing_address
  )
  VALUES (p_user_id, p_product_id, p_quantity, v_order_number, 'pending',
          v_total_amount, p_shipping_address, p_billing_address)
  RETURNING id INTO v_order_id;

  -- Log de creación
  INSERT INTO logs (user_id, action, resource_type, resource_id, status_code)
  VALUES (p_user_id, 'order_created', 'order', v_order_id::VARCHAR, 201);

  RETURN QUERY SELECT TRUE, v_order_id, v_order_number, 'Orden creada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
