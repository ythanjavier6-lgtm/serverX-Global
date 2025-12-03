/**
 * M�dulo Real-time - Supabase
 * Suscripciones a cambios en tiempo real
 */

const RealtimeModule = (() => {
  const subscriptions = {};

  const subscribe = (table, callback, events = ['INSERT', 'UPDATE', 'DELETE']) => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          console.log(` Cambio en ${table}:`, payload.eventType);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(` Suscrito a ${table}`);
        }
      });

    subscriptions[table] = subscription;
    return subscription;
  };

  const unsubscribe = (table) => {
    if (subscriptions[table]) {
      subscriptions[table].unsubscribe();
      delete subscriptions[table];
      console.log(`Desuscrito de ${table}`);
    }
  };

  const unsubscribeAll = () => {
    Object.keys(subscriptions).forEach(table => unsubscribe(table));
  };

  const getStatus = (table) => {
    return subscriptions[table]?.state || 'NOT_SUBSCRIBED';
  };

  return { subscribe, unsubscribe, unsubscribeAll, getStatus };
})();
