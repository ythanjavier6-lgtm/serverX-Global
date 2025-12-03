# Arquitectura — ServerX

## Visión general

ServerX es una aplicación web full-stack construida con:

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Real-time**: WebSockets de Supabase
- **Almacenamiento**: Supabase Storage

## Estructura de carpetas

```
serverx/
├── frontend/                    # Código del cliente
│   ├── css/                     # Estilos compartidos
│   ├── js/
│   │   ├── core/               # Lógica central (app, auth, router)
│   │   ├── services/           # Servicios de datos (users, servers, etc)
│   │   ├── ui/                 # Componentes UI (modals, dropdowns, etc)
│   │   └── utils/              # Funciones auxiliares
│   ├── assets/                 # Imágenes, iconos, fuentes
│   └── components/             # Componentes HTML reutilizables
├── supabase/                    # Configuración de Supabase
│   ├── config/                 # Configuración cliente y constantes
│   ├── functions/              # Funciones Edge
│   ├── migrations/             # SQL de migraciones
│   ├── policies/               # Políticas RLS
│   ├── seed/                   # Datos iniciales
│   └── triggers/               # Triggers SQL
├── edge-functions/             # Funciones serverless
├── scripts/                     # Scripts de utilidad (deploy, backup)
├── docs/                        # Documentación
└── *.html                       # Páginas públicas
```

## Flujo de datos

```
Usuario → HTML Form
  ↓
Frontend JS (services/)
  ↓
Supabase Client (supabase-client.js)
  ↓
Supabase REST API / PostgreSQL
  ↓
Respuesta JSON
  ↓
UI Update (ui/)
```

## Componentes principales

### Core (`frontend/js/core/`)

- **app.js**: Bootstrap de la aplicación
- **session-control.js**: Gestión de sesiones
- **auth-guard.js**: Protección de rutas
- **router.js**: Navegación SPA
- **events.js**: Bus de eventos
- **theme.js**: Temas (dark/light)

### Services (`frontend/js/services/`)

CRUD y lógica de negocio:

- **users.js**: Gestión de usuarios
- **servers.js**: Gestión de servidores
- **products.js**: Catálogo
- **orders.js**: Órdenes
- **payments.js**: Pagos
- **tickets.js**: Soporte
- **dashboard.js**: Agregación de datos

### UI (`frontend/js/ui/`)

Componentes visuales:

- Modal, Toast, Dropdown, Paginator
- Chart Engine, Filters, Panel, Slider

### Utils (`frontend/js/utils/`)

Funciones auxiliares:

- Validaciones, Fechas, Storage
- Texto, Dispositivo, Red, Parser

## Flujo de autenticación

1. Usuario llena formulario de login/registro
2. `supabase.auth.signIn/signUp()` en `login.js`
3. Supabase valida credenciales
4. JWT token guardado en localStorage
5. `session-control.js` recupera sesión en startup
6. `auth-guard.js` protege rutas admin

## Políticas RLS

- Usuarios solo ven sus propios datos
- Admins ven todo (tabla `user_roles`)
- Anónimos pueden insertar en `contacts` y `newsletter_subscriptions`

## Escalabilidad

- **Caché**: LocalStorage para sesiones y cart
- **Realtime**: Supabase suscripción para updates vivos
- **Edge Functions**: Lógica serverless (webhooks, email)
- **CDN**: Supabase Storage para assets estáticos

## Seguridad

- JWT tokens en localStorage
- HTTPS obligatorio en producción
- Validación client-side + server-side (RLS)
- CORS configurado en Supabase
- Roles y permisos granulares
