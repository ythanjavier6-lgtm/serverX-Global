# Estructura de Carpetas — ServerX

## Raíz del proyecto

```
serverx/
├── .env.example              # Variables de entorno (template)
├── index.html                # Landing page
├── about.html                # Acerca de
├── features.html             # Características
├── pricing.html              # Planes
├── contact.html              # Contacto
├── login.html                # Acceso
├── register.html             # Registro
├── blog.html                 # Blog
├── faq.html                  # Preguntas frecuentes
├── gdpr.html                 # Privacidad
├── cookies.html              # Cookies
├── newsletter.html           # Newsletter
├── reset-password.html       # Recuperar contraseña
├── security.html             # Seguridad
├── status.html               # Estado del servicio
├── partners.html             # Socios
├── roadmap.html              # Hoja de ruta
├── updates.html              # Actualizaciones
├── robots.txt                # SEO
├── sitemap.xml               # Sitemap
└── README.md                 # Documentación principal
```

## Frontend

```
frontend/
├── assets/                   # Recursos estáticos
│   ├── avatars/             # Fotos de perfil
│   ├── backgrounds/         # Fondos
│   ├── banners/             # Banners
│   ├── diagrams/            # Diagramas
│   ├── icons/               # Iconos
│   ├── img/                 # Imágenes generales
│   ├── mockups/             # Mockups de UI
│   ├── stock/               # Fotos de stock
│   └── svg/                 # Iconos SVG
├── css/
│   ├── base/                # Reset, tipografía base
│   ├── components/          # Estilos de componentes
│   ├── layout/              # Grid, flexbox
│   ├── pages/               # Estilos por página
│   ├── themes/              # Temas (dark/light)
│   └── site.css             # CSS compartido principal
├── fonts/
│   ├── inter/               # Fuente Inter
│   ├── montserrat/          # Fuente Montserrat
│   ├── orbitron/            # Fuente Orbitron
│   └── roboto/              # Fuente Roboto
└── js/
    ├── core/                # Lógica central
    │   ├── app.js
    │   ├── auth-guard.js
    │   ├── events.js
    │   ├── router.js
    │   ├── session-control.js
    │   └── theme.js
    ├── services/            # Servicios de datos
    │   ├── cart.js
    │   ├── dashboard.js
    │   ├── notifications.js
    │   ├── orders.js
    │   ├── payments.js
    │   ├── products.js
    │   ├── servers.js
    │   ├── stats.js
    │   ├── tickets.js
    │   └── users.js
    ├── ui/                  # Componentes UI
    │   ├── chart-engine.js
    │   ├── dropdown.js
    │   ├── filters.js
    │   ├── modal.js
    │   ├── paginator.js
    │   ├── panel.js
    │   ├── slider.js
    │   └── toast.js
    ├── utils/               # Utilidades
    │   ├── date.js
    │   ├── device.js
    │   ├── network.js
    │   ├── parser.js
    │   ├── storage.js
    │   ├── text.js
    │   └── validator.js
    ├── supabase/            # Integración Supabase
    │   └── (future)
    ├── site.js              # JS compartido
    └── supabase-client.js   # Cliente Supabase
```

## Admin

```
admin/
├── dashboard.html           # Panel principal
├── usuarios.html            # Gestión de usuarios
├── productos.html           # Gestión de productos
├── ordenes.html             # Órdenes
├── pagos.html               # Pagos
├── tickets.html             # Soporte
├── mensajes.html            # Mensajes
├── reportes.html            # Reportes
├── logs.html                # Logs
├── analitica.html           # Analítica
├── configuracion.html       # Configuración
├── perfil.html              # Perfil admin
├── roles.html               # Gestión de roles
├── seguridad.html           # Controles de seguridad
├── sistema.html             # Información del sistema
└── soporte.html             # Soporte a usuarios
```

## Components

```
components/
├── alert.html               # Alertas
├── badge.html               # Badges
├── bread.html               # Breadcrumb
├── card.html                # Cards
├── chart-box.html           # Cajas de gráficos
├── footer.html              # Footer reutilizable
├── hero.html                # Sección hero
├── loader.html              # Spinner/loader
├── menu.html                # Menú
├── modal.html               # Modal genérico
├── navbar.html              # Navbar reutilizable
├── notifications.html       # Centro de notificaciones
├── search.html              # Barra de búsqueda
├── sidebar.html             # Sidebar
├── table.html               # Tabla genérica
└── tag.html                 # Tags
```

## Supabase

```
supabase/
├── config/
│   ├── constants.js         # Constantes de app
│   ├── client-config.js     # Config de cliente (rellena con tus credenciales)
│   └── policies.sql         # Políticas RLS
├── functions/               # Funciones Edge
│   ├── analytics/
│   ├── auth/
│   ├── orders/
│   └── payments/
├── migrations/              # Migraciones SQL
│   ├── 001_create_users_table.sql
│   ├── 002_create_products_table.sql
│   ├── 003_create_orders_table.sql
│   ├── 004_create_payments_table.sql
│   ├── 005_create_servers_table.sql
│   ├── 006_create_tickets_table.sql
│   ├── 007_create_logs_table.sql
│   ├── 008_create_sessions_table.sql
│   ├── 009_create_notifications_table.sql
│   └── 010_create_messages_table.sql
├── policies/                # Políticas RLS por tabla
│   ├── orders-rls.sql
│   ├── products-rls.sql
│   ├── servers-rls.sql
│   ├── tickets-rls.sql
│   └── users-rls.sql
├── seed/                    # Datos iniciales
│   ├── products.sql
│   ├── roles.sql
│   └── ...
└── triggers/                # Triggers de BD
```

## Edge Functions

```
edge-functions/
├── generate-invoice/        # Generar facturas
├── process-webhook/         # Procesar webhooks de pago
├── send-email/              # Enviar emails
└── sync-servers/            # Sincronizar servidores
```

## Docs

```
docs/
├── guia-instalacion.md      # Cómo instalar y deployar
├── arquitectura.md          # Arquitectura del proyecto
├── estructura.md            # Esta carpeta (estructura de directorios)
├── endpoints.md             # Endpoints de API
├── autenticacion.md         # Flujo de auth
├── pagos.md                 # Integración de pagos
├── realtime.md              # Funcionalidad realtime
├── rls-policies.md          # Políticas de seguridad
├── storage.md               # Almacenamiento (files)
├── supabase-setup.md        # Setup inicial de Supabase
├── edge-functions.md        # Desarrollo de edge functions
└── migraciones.md           # Crear migraciones SQL
```

## Scripts

```
scripts/
├── install.sh               # Instalación inicial
├── deploy.sh                # Deploy a producción
├── migrate.sh               # Ejecutar migraciones
├── backup.sh                # Backup de BD
├── seed.sh                  # Cargar datos iniciales
└── supabase-init.sh         # Inicializar Supabase local
```
