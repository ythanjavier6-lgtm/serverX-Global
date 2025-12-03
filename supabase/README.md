# Guía de Configuración de Supabase

##  Estructura de Carpetas

### /config
- **constants.js** - Constantes de aplicación (estados, roles, límites)
- **env.js** - Variables de entorno y configuración
- **client-config.js** - Configuración del cliente Supabase
- **policies.sql** - Políticas de seguridad RLS maestras

### /migrations
10 migraciones SQL que crean todas las tablas:
1. **001_create_users_table.sql** - Tabla de usuarios con roles y permisos
2. **002_create_products_table.sql** - Tabla de productos y servicios
3. **003_create_orders_table.sql** - Tabla de órdenes
4. **004_create_payments_table.sql** - Tabla de pagos con gateway integración
5. **005_create_servers_table.sql** - Tabla de servidores/VPS
6. **006_create_tickets_table.sql** - Tabla de tickets de soporte
7. **007_create_logs_table.sql** - Tabla de auditoría y logs
8. **008_create_sessions_table.sql** - Tabla de sesiones de usuario
9. **009_create_notifications_table.sql** - Tabla de notificaciones
10. **010_create_messages_table.sql** - Tabla de mensajes y comentarios

### /policies
Políticas de seguridad por tabla:
- **users-rls.sql** - Control de acceso para perfil de usuario
- **products-rls.sql** - Productos activos públicos, admin full access
- **orders-rls.sql** - Usuarios ven sus órdenes, admins ven todas
- **servers-rls.sql** - Usuarios ven sus servidores, admins ven todos
- **tickets-rls.sql** - Usuarios ven sus tickets, staff asignado ve sus tickets

### /triggers
Triggers para automatización:
- **update-timestamp.sql** - Actualiza campo updated_at automáticamente
- **notify-changes.sql** - Notificaciones en tiempo real de cambios
- **log-changes.sql** - Auditoría automática de todas las modificaciones

### /seed
Datos iniciales:
- **test-users.sql** - 5 usuarios de prueba (admin, manager, users)
- **products.sql** - 7 productos de prueba
- **roles.sql** - Definición de roles y permisos

### /functions
Funciones Supabase serverless:
- **auth/** - Funciones de autenticación
- **payments/** - Procesamiento de pagos
- **orders/** - Lógica de órdenes
- **analytics/** - Análisis y reportes

##  Seguridad RLS (Row Level Security)

Todas las tablas tienen políticas RLS habilitadas:
- **Usuarios**: Solo acceso a su propio perfil, admins ven todos
- **Productos**: Públicos para lectura si están activos
- **Órdenes**: Usuarios ven sus órdenes, managers/admins ven todas
- **Servidores**: Usuarios ven sus servidores
- **Tickets**: Usuarios ven sus tickets, staff asignado accede

##  Triggers Automáticos

1. **update_timestamp** - Mantiene updated_at sincronizado
2. **notify_changes** - Emite eventos en tiempo real vía pg_notify
3. **log_changes** - Registra cambios en tabla logs para auditoría

##  Tablas Principales

### users
Gestión de usuarios y autenticación

### products
Catálogo de servidores y servicios

### orders
Órdenes de compra

### payments
Transacciones y pagos

### servers
Servidores virtuales/dedicados asignados

### tickets
Soporte técnico

### notifications
Alertas y notificaciones

### messages
Comunicación interna y comentarios

### logs
Auditoría completa del sistema

### sessions
Control de sesiones activas

##  Setup Inicial

1. Crear proyecto en Supabase
2. Ejecutar migraciones (001-010) en orden
3. Aplicar políticas RLS
4. Crear triggers
5. Ejecutar seeds (roles, usuarios, productos)
6. Configurar variables de entorno

##  Variables de Entorno Requeridas

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REACT_APP_ENV=production
```

##  Roles y Permisos

### Admin
- Acceso completo a todos los recursos
- Gestión de usuarios
- Reportes y análisis

### Manager
- Gestión de órdenes y tickets
- Lectura de usuarios y productos
- Análisis básicos

### User
- Gestión de propias órdenes
- Ver propios servidores
- Crear y ver tickets
- Recibir notificaciones

### Guest
- Solo lectura de productos activos
