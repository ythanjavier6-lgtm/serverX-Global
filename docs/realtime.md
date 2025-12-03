# Real-Time — ServerX

## Introducción

Supabase Real-time permite actualizar datos en vivo usando WebSockets. En ServerX se usa para:

- Notificaciones de nuevas órdenes
- Cambios de estado de servidores en vivo
- Chat/mensajes entre usuarios
- Actualizaciones de dashboard

## Setup

### 1. Habilitar Real-time en Supabase

Dashboard → Project → Replication

Asegurar que las tablas tengan "Realtime" habilitado:

- orders
- servers
- notifications
- messages
- ticket_comments

### 2. Crear Cliente Supabase

```javascript
// frontend/js/supabase-client.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://xxxxx.supabase.co", "anonKey");

export { supabase };
```

## Subscripción Básica

### Listen a Cambios en Tabla

```javascript
// Escuchar inserciones en orders
const subscription = supabase
  .from("orders")
  .on("INSERT", (payload) => {
    console.log("Nueva orden:", payload.new);
    updateOrderList();
  })
  .subscribe();

// Escuchar actualizaciones en servidores
supabase
  .from("servers")
  .on("UPDATE", (payload) => {
    console.log("Servidor actualizado:", payload.new);
    updateServerStatus(payload.new.id);
  })
  .subscribe();

// Escuchar eliminaciones
supabase
  .from("users")
  .on("DELETE", (payload) => {
    console.log("Usuario eliminado:", payload.old);
  })
  .subscribe();
```

## Filtrado de Real-time

### Escuchar Solo Cambios Relevantes

```javascript
// Escuchar órdenes del usuario actual
const userId = getCurrentUserId();

supabase
  .from(`orders:user_id=eq.${userId}`)
  .on("INSERT", (payload) => {
    toast.success(`Nueva orden: $${payload.new.total}`);
  })
  .subscribe();

// Escuchar servidores activos
supabase
  .from("servers:status=eq.active")
  .on("UPDATE", (payload) => {
    console.log("Servidor activo actualizado:", payload.new.id);
  })
  .subscribe();
```

## Implementación en Servicios

### Services de Real-time

Crear `frontend/js/services/realtime.js`:

```javascript
import { supabase } from "../supabase-client.js";
import { eventBus } from "../core/events.js";

class RealtimeService {
  constructor() {
    this.subscriptions = [];
  }

  // Escuchar cambios de órdenes
  watchOrders(userId, callback) {
    const subscription = supabase
      .from(`orders:user_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        eventBus.emit("order:created", payload.new);
        if (callback) callback(payload.new);
      })
      .on("UPDATE", (payload) => {
        eventBus.emit("order:updated", payload.new);
        if (callback) callback(payload.new);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  // Escuchar cambios de servidores
  watchServers(userId, callback) {
    const subscription = supabase
      .from(`servers:user_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        eventBus.emit("server:created", payload.new);
        if (callback) callback(payload.new);
      })
      .on("UPDATE", (payload) => {
        eventBus.emit("server:updated", payload.new);
        // Mostrar notificación si cambió el estado
        if (payload.old.status !== payload.new.status) {
          eventBus.emit("server:status-changed", {
            id: payload.new.id,
            old_status: payload.old.status,
            new_status: payload.new.status,
          });
        }
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  // Escuchar notificaciones
  watchNotifications(userId, callback) {
    const subscription = supabase
      .from(`notifications:user_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        eventBus.emit("notification:new", payload.new);
        if (callback) callback(payload.new);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  // Escuchar mensajes
  watchMessages(userId, callback) {
    const subscription = supabase
      .from(`messages:recipient_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        eventBus.emit("message:new", payload.new);
        if (callback) callback(payload.new);
      })
      .subscribe();

    this.subscriptions.push(subscription);
    return subscription;
  }

  // Limpiar todas las subscripciones
  unsubscribeAll() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}

export const realtimeService = new RealtimeService();
```

## Uso en Páginas

### Dashboard con Real-time

```javascript
// admin/dashboard.html (en script)
const userId = getCurrentUserId();

// Watchear órdenes
realtimeService.watchOrders(userId, (order) => {
  toast.info(`Nueva orden: $${order.total}`);
  updateOrderStats();
});

// Watchear servidores
realtimeService.watchServers(userId, (server) => {
  console.log("Servidor:", server);
  updateServerList();
});

// Escuchar cambios de estado
eventBus.on("server:status-changed", ({ id, new_status }) => {
  toast.success(`Servidor ${id}: ${new_status}`);
});

// Limpiar al salir
window.addEventListener("beforeunload", () => {
  realtimeService.unsubscribeAll();
});
```

## Broadcast (Canal de Comunicación)

Enviar mensajes en tiempo real entre clientes:

```javascript
// Cliente 1: Enviar mensaje
supabase.channel("public:chat:room-123").send({
  type: "broadcast",
  event: "user-message",
  payload: { user_id: "xxx", message: "Hola!" },
});

// Cliente 2: Recibir mensaje
supabase
  .channel("public:chat:room-123")
  .on("broadcast", { event: "user-message" }, (payload) => {
    console.log(payload.payload.message);
  })
  .subscribe();
```

### Implementación de Chat

```javascript
// Crear sala de chat
class ChatService {
  constructor(roomId) {
    this.roomId = roomId;
    this.channel = supabase.channel(`chat:${roomId}`);
  }

  // Conectar a sala
  connect() {
    this.channel
      .on("broadcast", { event: "message" }, (payload) => {
        eventBus.emit("chat:message", payload.payload);
      })
      .subscribe();
  }

  // Enviar mensaje
  sendMessage(userId, message) {
    this.channel.send({
      type: "broadcast",
      event: "message",
      payload: {
        user_id: userId,
        message: message,
        timestamp: new Date(),
      },
    });
  }

  // Desconectar
  disconnect() {
    this.channel.unsubscribe();
  }
}
```

## Presencia (Usuarios Activos)

Ver quién está conectado:

```javascript
const presenceChannel = supabase.channel("public:presence");

presenceChannel
  .on("presence", { event: "sync" }, () => {
    const state = presenceChannel.presenceState();
    console.log("Usuarios activos:", state);
  })
  .on("presence", { event: "join" }, ({ newPresences }) => {
    console.log("Usuario conectado:", newPresences);
  })
  .on("presence", { event: "leave" }, ({ leftPresences }) => {
    console.log("Usuario desconectado:", leftPresences);
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      // Informar que estoy en línea
      await presenceChannel.track({
        user_id: userId,
        user_name: userName,
        online_at: new Date(),
      });
    }
  });
```

## Manejo de Desconexiones

```javascript
class RobustRealtimeService {
  constructor() {
    this.subscriptions = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  async watchWithReconnect(table, userId, callback) {
    try {
      const subscription = supabase
        .from(`${table}:user_id=eq.${userId}`)
        .on("*", (payload) => callback(payload))
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`Connected to ${table}`);
            this.reconnectAttempts = 0;
          } else if (status === "CHANNEL_ERROR") {
            this.handleReconnect();
          }
        });

      this.subscriptions.push(subscription);
    } catch (error) {
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Reconnecting in ${delay}ms...`);

      setTimeout(() => {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        // Re-subscribirse
      }, delay);
    } else {
      eventBus.emit("realtime:error", "Conexión perdida");
    }
  }
}
```

## RLS y Real-time

Solo se sincronizan datos que el usuario puede ver según RLS:

```sql
-- Si la RLS dice: user_id = auth.uid(), solo se sincronizan órdenes del usuario
CREATE POLICY "Users can only see their own orders"
ON orders FOR SELECT
USING (user_id = auth.uid());
```

El cliente automáticamente filtrará según RLS.

## Performance

### 1. Limitar Subscripciones

```javascript
// ✅ BIEN: Unsuscribirse cuando no se necesita
const subscription = realtimeService.watchOrders(userId);
// ... usar ...
subscription.unsubscribe();

// ❌ MAL: Crear múltiples subscripciones sin control
for (let i = 0; i < 100; i++) {
  realtimeService.watchOrders(userId); // Memory leak!
}
```

### 2. Batch Updates

```javascript
// ✅ BIEN: Agrupar múltiples cambios
let pendingUpdates = [];

eventBus.on("server:updated", (server) => {
  pendingUpdates.push(server);

  if (pendingUpdates.length >= 10) {
    updateUI(pendingUpdates);
    pendingUpdates = [];
  }
});

// Actualizar cada 5 segundos si hay cambios
setInterval(() => {
  if (pendingUpdates.length > 0) {
    updateUI(pendingUpdates);
    pendingUpdates = [];
  }
}, 5000);
```

### 3. Debounce Updates

```javascript
import { debounce } from "/frontend/js/utils/text.js";

const debouncedUpdate = debounce((data) => {
  updateServerList(data);
}, 500);

realtimeService.watchServers(userId, (server) => {
  debouncedUpdate(server);
});
```

## Debugging

### Ver conexiones activas

```javascript
// En consola del navegador
supabase.getChannels(); // Muestra todos los canales activos
```

### Logs de Real-time

```javascript
// Habilitar logs en Supabase
const supabase = createClient(url, key, {
  realtime: {
    log_level: "debug",
  },
});
```

## Límites

| Recurso           | Límite          |
| ----------------- | --------------- |
| Canales activos   | 100 por cliente |
| Mensajes/segundo  | 1000            |
| Payload máximo    | 250KB           |
| Duración conexión | Indefinida      |

## Troubleshooting

### "Connection lost"

Verificar:

1. Conexión a internet
2. Firewall no bloquea WebSockets
3. Real-time habilitado en Supabase

### No recibe eventos

1. Verificar RLS permite acceso a tabla
2. Verificar tabla tiene Real-time habilitado
3. Usar `realtimeService.watchOrders()` con logs

### Performance lento

Reducir:

1. Número de subscripciones
2. Tamaño de payloads
3. Frecuencia de actualizaciones
