 # Integración de Pagos — ServerX

## Visión General

ServerX acepta pagos mediante **Stripe**. El flujo es:

1. Usuario selecciona producto/plan
2. Se crea orden en BD
3. Frontend redirige a checkout de Stripe
4. Stripe procesa pago
5. Webhook notifica a backend
6. Backend actualiza estado de orden y provisiona recurso

## Setup de Stripe

### 1. Crear Cuenta

1. Ir a https://stripe.com
2. Crear cuenta (países soportados)
3. Acceder a Dashboard

### 2. Obtener API Keys

En Stripe Dashboard → Settings → API Keys

```
Publishable key: pk_test_...
Secret key:     sk_test_...
```

### 3. Configurar en ServerX

En `supabase/config/client-config.js`:

```javascript
export const STRIPE_PUBLIC_KEY = 'pk_test_...';
export const STRIPE_SECRET_KEY = 'sk_test_...'; // Solo backend
```

En Edge Function (process-webhook):

```typescript
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
```

## Implementación en Frontend

### 1. Cargar Stripe.js

En `index.html` o `pricing.html`:

```html
<script src="https://js.stripe.com/v3/"></script>
```

### 2. Crear Formulario de Pago

```html
<form id="payment-form">
  <div id="card-element"></div>
  <button type="submit">Pagar $9.99</button>
</form>
```

### 3. Procesar Pago

```javascript
// frontend/js/services/payments.js
import { STRIPE_PUBLIC_KEY } from '/supabase/config/client-config.js'

const stripe = Stripe(STRIPE_PUBLIC_KEY)

async function createPaymentIntent(orderId, amount) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, amount })
  })
  return response.json()
}

async function processPayment(cardElement, clientSecret) {
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Jenny Rosen' }
    }
  })
  
  if (result.error) {
    console.error(result.error.message)
  } else if (result.paymentIntent.status === 'succeeded') {
    console.log('Pago exitoso!')
    updateOrderStatus('completed')
  }
}

// Uso
document.getElementById('payment-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const card = stripe.elements().create('card')
  card.mount('#card-element')
  
  const intent = await createPaymentIntent(orderId, 999) // $9.99
  await processPayment(card, intent.client_secret)
})
```

## Webhook de Stripe

### Configuración

En Stripe Dashboard → Webhooks

1. Click "Add endpoint"
2. URL del webhook: `https://project.supabase.co/functions/v1/process-webhook`
3. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `invoice.payment_succeeded`

4. Copiar "Signing secret" (whsec_...)

### Implementación

En `edge-functions/process-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@12.0.0"

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
  
  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )
  
  switch (event.type) {
    // Pago exitoso
    case 'payment_intent.succeeded':
      const payment = event.data.object
      
      // Obtener orden
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('order_id')
        .eq('stripe_transaction_id', payment.id)
        .single()
      
      // Actualizar orden
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', paymentRecord.order_id)
      
      // Crear servidor/provisionar recurso
      const { data: order } = await supabase
        .from('orders')
        .select('*, users(*), products(*)')
        .eq('id', paymentRecord.order_id)
        .single()
      
      await provisioning.createServer(order)
      
      // Enviar email de confirmación
      await fetch('https://project.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          email: order.users.email,
          template: 'payment-success',
          variables: { order_id: order.id }
        })
      })
      break
    
    // Pago rechazado
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_transaction_id', failedPayment.id)
      
      // Notificar al usuario
      await fetch('https://project.supabase.co/functions/v1/send-email', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          email: failedPayment.billing_details.email,
          template: 'payment-failed',
          variables: { reason: failedPayment.last_payment_error.message }
        })
      })
      break
    
    // Reembolso
    case 'charge.refunded':
      const refund = event.data.object
      
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_transaction_id', refund.id)
      
      // Cancelar servidor si aplica
      await cancelServerIfNeeded(refund.metadata.order_id)
      break
  }
  
  return new Response(JSON.stringify({ received: true }))
})
```

## Ciclo de Vida del Pago

```
1. PENDING (usuario en checkout)
   ↓
2. PROCESSING (validando tarjeta)
   ↓
3. SUCCEEDED (✓ pago confirmado)
   ├─ Provision server
   ├─ Send confirmation email
   └─ Update order status
   ↓
4. COMPLETED (recurso disponible)

O

3. FAILED (✗ pago rechazado)
   ├─ Send failure email
   └─ Allow retry
```

## Manejo de Refunds

### Reembolso Manual

En `services/payments.js`:

```javascript
async function refundPayment(paymentId, amount = null) {
  const { data: payment } = await supabase
    .from('payments')
    .select('stripe_transaction_id')
    .eq('id', paymentId)
    .single()
  
  const stripe = new Stripe(STRIPE_SECRET_KEY)
  
  const refund = await stripe.refunds.create({
    charge: payment.stripe_transaction_id,
    amount: amount ? amount * 100 : undefined // En centavos
  })
  
  // Actualizar estado
  await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('id', paymentId)
  
  return refund
}
```

### Reembolso Automático por Expiración

```sql
-- Trigger para cancelar órdenes expiradas
CREATE OR REPLACE FUNCTION auto_refund_expired_orders()
RETURNS void AS $$
BEGIN
  UPDATE payments
  SET status = 'refunded'
  WHERE status = 'pending'
    AND created_at < now() - interval '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar cada 10 minutos (configurar en edge function)
```

## Suscripciones Recurrentes

### Setup

En Stripe Dashboard → Products → crear producto con plan mensual

### Implementación

```javascript
async function createSubscription(userId, priceId) {
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()
  
  const subscription = await stripe.subscriptions.create({
    customer: user.stripe_customer_id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  })
  
  // Guardar en BD
  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000)
    })
  
  return subscription
}

async function cancelSubscription(userId) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  
  await stripe.subscriptions.del(sub.stripe_subscription_id)
  
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', sub.stripe_subscription_id)
}
```

## Seguridad

### 1. Validar Amounts

```javascript
// Siempre validar que el monto sea correcto
const expectedAmount = product.price * 100 // en centavos
if (payment.amount !== expectedAmount) {
  throw new Error('Amount mismatch')
}
```

### 2. Usar Webhook Signature

```typescript
// Verificar firma del webhook
const sig = req.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, sig, SECRET)
```

### 3. Idempotency Keys

Para prevenir cobros duplicados:

```javascript
const response = await stripe.paymentIntents.create(
  { amount, currency, customer },
  { idempotencyKey: orderId } // Previene duplicados si se reintenta
)
```

### 4. No exponer Secret Key

```javascript
// ✅ BIEN: Secret en backend/edge function
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))

// ❌ MAL: Secret en frontend
const stripe = new Stripe('sk_test_xxx')
```

## Testing

### Tarjetas de Prueba

| Tarjeta | Resultado |
|---------|-----------|
| 4242 4242 4242 4242 | ✓ Exitoso |
| 4000 0000 0000 0002 | ✗ Rechazado |
| 4000 0025 0000 3155 | ✓ 3D Secure |

### Ambiente de Test

```javascript
// Siempre usar test keys en desarrollo
const STRIPE_KEY = process.env.NODE_ENV === 'production'
  ? 'pk_live_...'
  : 'pk_test_...'
```

## Troubleshooting

### Webhook no recibe eventos

1. Verificar que URL webhook es accesible
2. Verificar firma del webhook en Stripe Dashboard → Webhooks → logs
3. Probar manualmente: Stripe Dashboard → Test in live mode

### Pago exitoso pero no provisiona servidor

1. Verificar que edge function está ejecutándose
2. Ver logs de Stripe webhook
3. Revisar BD si la orden se actualiza

### Transacción duplicada

Usar idempotency keys:

```javascript
stripe.paymentIntents.create({...}, { idempotencyKey: orderId })
```

## Métricas Importantes

```javascript
// MRR (Monthly Recurring Revenue)
SELECT SUM(amount) FROM subscriptions WHERE status = 'active'

// Churn rate
SELECT COUNT(*) / total FROM subscriptions WHERE status = 'cancelled'

// Payment success rate
SELECT COUNT(*) FILTER (WHERE status = 'succeeded') / COUNT(*) FROM payments
```
