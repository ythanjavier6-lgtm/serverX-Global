/**
 * Módulo RPC (Funciones) - Supabase
 * Ejecuta funciones personalizadas en PostgreSQL
 */

const RPCModule = (() => {
  
  const call = async (functionName, params = {}) => {
    try {
      const { data, error } = await supabase.rpc(functionName, params);
      if (error) throw error;
      console.log(` Función $`{functionName}` ejecutada`);
      return { success: true, data };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, fullName) => {
    return call('handle_new_user', { email, password, full_name: fullName });
  };

  const createOrder = async (userId, productId, quantity, shippingAddress, billingAddress) => {
    return call('create_order', {
      p_user_id: userId,
      p_product_id: productId,
      p_quantity: quantity,
      p_shipping_address: shippingAddress,
      p_billing_address: billingAddress
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    return call('update_order_status', { p_order_id: orderId, p_new_status: newStatus });
  };

  const processPayment = async (orderId, amount, gateway, transactionId) => {
    return call('process_payment', {
      p_order_id: orderId,
      p_amount: amount,
      p_gateway: gateway,
      p_gateway_transaction_id: transactionId
    });
  };

  const verifyTransaction = async (paymentId, gatewayStatus) => {
    return call('verify_transaction', { p_payment_id: paymentId, p_gateway_status: gatewayStatus });
  };

  const getRevenue = async (startDate, endDate) => {
    return call('get_revenue', { p_start_date: startDate, p_end_date: endDate });
  };

  const getStats = async () => {
    return call('get_stats');
  };

  return { call, signup, createOrder, updateOrderStatus, processPayment, verifyTransaction, getRevenue, getStats };
})();
