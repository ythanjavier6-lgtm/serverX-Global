# Endpoints de API — ServerX

## Base URL

```
https://[PROJECT_ID].supabase.co/rest/v1
```

## Headers Requeridos

```
Headers:
  Authorization: Bearer [JWT_TOKEN]
  Content-Type: application/json
  apikey: [SUPABASE_ANONKEY]
```

## Usuarios

### GET /users

Obtener todos los usuarios (solo admin).

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/users' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json'
```

**Respuesta**:

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "avatar_url": "https://...",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

### GET /users?id=eq.UUID

Obtener usuario por ID.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/users?id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer TOKEN'
```

### POST /users

Crear nuevo usuario (solo admin).

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/users' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@example.com",
    "full_name": "Jane Doe",
    "role": "user"
  }'
```

### PATCH /users?id=eq.UUID

Actualizar usuario.

```bash
curl -X PATCH 'https://xxxxx.supabase.co/rest/v1/users?id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "full_name": "Updated Name",
    "avatar_url": "https://..."
  }'
```

### DELETE /users?id=eq.UUID

Eliminar usuario.

```bash
curl -X DELETE 'https://xxxxx.supabase.co/rest/v1/users?id=eq.550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer TOKEN'
```

## Productos

### GET /products

Listar todos los productos.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/products?select=*' \
  -H 'Content-Type: application/json'
```

**Parámetros**:

- `limit`: Número máximo de resultados (default: 1000)
- `offset`: Desplazamiento (para paginación)
- `order`: Campo para ordenar (ej: `order=price.desc`)

**Respuesta**:

```json
[
  {
    "id": "uuid",
    "name": "Servidor VPS",
    "description": "Servidor privado virtual",
    "price": 9.99,
    "cpu": "2 cores",
    "ram": "4GB",
    "storage": "50GB",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### POST /products

Crear producto (solo admin).

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/products' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Servidor Cloud",
    "description": "Infraestructura en la nube",
    "price": 19.99,
    "cpu": "4 cores",
    "ram": "8GB",
    "storage": "100GB",
    "status": "active"
  }'
```

### PATCH /products?id=eq.UUID

Actualizar producto.

```bash
curl -X PATCH 'https://xxxxx.supabase.co/rest/v1/products?id=UUID' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "price": 24.99,
    "status": "active"
  }'
```

## Órdenes

### GET /orders

Listar órdenes del usuario actual.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/orders?user_id=eq.UUID' \
  -H 'Authorization: Bearer TOKEN'
```

**Respuesta**:

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "total": 99.99,
    "status": "completed",
    "items_count": 3,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T15:30:00Z"
  }
]
```

### POST /orders

Crear orden.

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/orders' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "total": 9.99
  }'
```

### PATCH /orders?id=eq.UUID

Actualizar estado de orden.

```bash
curl -X PATCH 'https://xxxxx.supabase.co/rest/v1/orders?id=UUID' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "shipped"
  }'
```

## Pagos

### GET /payments

Listar pagos del usuario.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/payments?user_id=eq.UUID' \
  -H 'Authorization: Bearer TOKEN'
```

**Respuesta**:

```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "amount": 99.99,
    "status": "completed",
    "payment_method": "card",
    "stripe_transaction_id": "ch_xxxxx",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### POST /payments

Procesar pago (webhook de Stripe).

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/payments' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "uuid",
    "amount": 99.99,
    "payment_method": "card",
    "stripe_token": "tok_xxxx"
  }'
```

## Tickets

### GET /tickets

Listar tickets del usuario.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/tickets?user_id=eq.UUID' \
  -H 'Authorization: Bearer TOKEN'
```

**Respuesta**:

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "El servidor no responde",
    "description": "Servidor caído desde hace 2 horas",
    "status": "open",
    "priority": "high",
    "assigned_to": "support@serverx.com",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T15:30:00Z"
  }
]
```

### POST /tickets

Crear ticket.

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/tickets' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "uuid",
    "title": "Problema de conexión",
    "description": "Tengo problemas para conectarme",
    "priority": "medium"
  }'
```

### PATCH /tickets?id=eq.UUID

Actualizar ticket.

```bash
curl -X PATCH 'https://xxxxx.supabase.co/rest/v1/tickets?id=UUID' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "resolved"
  }'
```

## Notificaciones

### GET /notifications

Listar notificaciones del usuario.

```bash
curl -X GET 'https://xxxxx.supabase.co/rest/v1/notifications?user_id=eq.UUID' \
  -H 'Authorization: Bearer TOKEN'
```

### POST /notifications/:id/mark-read

Marcar notificación como leída.

```bash
curl -X POST 'https://xxxxx.supabase.co/rest/v1/notifications?id=eq.UUID' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "is_read": true
  }'
```

## Filtrado y Búsqueda

### Operadores de Filtro

```
eq          → igual a
neq         → no igual a
gt          → mayor que
gte         → mayor o igual
lt          → menor que
lte         → menor o igual
like        → búsqueda de texto
ilike       → búsqueda insensible a mayúsculas
in          → en lista
is          → null/true/false
```

### Ejemplos

```bash
# Mayor que
?price=gt.10

# Búsqueda de texto
?name=like.%VPS%

# En lista
?status=in.(active,pending)

# Múltiples filtros
?price=gte.5&status=eq.active&created_at=gt.2024-01-01
```

## Paginación

```bash
# Limit
?limit=10

# Offset
?offset=20

# Con orden
?order=created_at.desc&limit=10&offset=0
```

## Códigos de Estado HTTP

| Código | Significado        |
| ------ | ------------------ |
| 200    | OK                 |
| 201    | Creado             |
| 204    | Sin contenido      |
| 400    | Solicitud inválida |
| 401    | No autenticado     |
| 403    | No autorizado      |
| 404    | No encontrado      |
| 409    | Conflicto          |
| 500    | Error del servidor |

## Errores

**Respuesta de error**:

```json
{
  "code": "PGRST001",
  "message": "The search for the target resource failed",
  "hint": null,
  "details": null
}
```

## Rate Limiting

- **Límite**: 10,000 requests/minuto por proyecto
- **Headers de respuesta**:
  - `RateLimit-Limit`: 10000
  - `RateLimit-Remaining`: 9999
  - `RateLimit-Reset`: 1705392600
