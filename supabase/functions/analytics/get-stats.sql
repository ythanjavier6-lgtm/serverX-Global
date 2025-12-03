-- ANALYTICS: Get Stats
-- Función para obtener estadísticas del sistema

CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_users BIGINT,
  total_revenue DECIMAL,
  completed_orders BIGINT,
  active_products BIGINT,
  open_tickets BIGINT,
  average_ticket_resolution_time INTERVAL,
  user_growth_rate DECIMAL,
  revenue_growth_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'active')::BIGINT as active_users,
    (SELECT COALESCE(SUM(total_amount), 0)::DECIMAL FROM orders WHERE status = 'completed')::DECIMAL as total_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'completed')::BIGINT as completed_orders,
    (SELECT COUNT(*) FROM products WHERE status = 'active')::BIGINT as active_products,
    (SELECT COUNT(*) FROM tickets WHERE status IN ('open', 'in_progress'))::BIGINT as open_tickets,
    (SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)))::INTERVAL 
     FROM tickets WHERE resolved_at IS NOT NULL)::INTERVAL as average_ticket_resolution_time,
    (SELECT COUNT(*) FILTER(WHERE created_at > NOW() - INTERVAL '7 days') * 100.0 / 
            NULLIF(COUNT(*), 0) FROM users)::DECIMAL as user_growth_rate,
    (SELECT SUM(total_amount) FILTER(WHERE created_at > NOW() - INTERVAL '7 days') * 100.0 / 
            NULLIF(SUM(total_amount), 0) FROM orders WHERE status = 'completed')::DECIMAL as revenue_growth_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
