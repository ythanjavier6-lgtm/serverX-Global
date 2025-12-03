-- ANALYTICS: Get Revenue
-- Función para obtener datos de ingresos

CREATE OR REPLACE FUNCTION get_revenue(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  date DATE,
  total_revenue DECIMAL,
  completed_orders INT,
  average_order_value DECIMAL,
  payment_methods JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(o.created_at)::DATE as date,
    COALESCE(SUM(o.total_amount), 0)::DECIMAL as total_revenue,
    COUNT(DISTINCT o.id)::INT as completed_orders,
    COALESCE(AVG(o.total_amount), 0)::DECIMAL as average_order_value,
    JSONB_OBJECT_AGG(p.payment_gateway, COUNT(*)) as payment_methods
  FROM orders o
  LEFT JOIN payments p ON o.id = p.order_id
  WHERE o.status = 'completed'
    AND DATE(o.created_at) BETWEEN p_start_date AND p_end_date
  GROUP BY DATE(o.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
