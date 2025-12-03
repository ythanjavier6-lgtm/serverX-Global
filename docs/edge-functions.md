# Edge Functions — ServerX

## Introducción

Las Edge Functions son funciones serverless ejecutadas en el edge (cerca del usuario). En ServerX, se usan para:

- Procesar webhooks de Stripe
- Enviar emails de notificación
- Generar facturas
- Sincronizar datos de servidores externos
- Ejecutar lógica que no debe exponerse en el cliente

**Ubicación**: `edge-functions/`

## Setup Inicial

### Instalar Supabase CLI

```bash
npm install -g supabase
```

### Inicializar Edge Functions

```bash
supabase functions new mi-funcion
```

Esto crea:

```
edge-functions/mi-funcion/
├── index.ts
└── deno.json
```

### Estructura de una Función

```typescript
// edge-functions/mi-funcion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Tu lógica aquí
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

## Funciones de ServerX

### 1. process-webhook (Webhooks de Pago)

**Propósito**: Procesar eventos de Stripe (pago completado, refund, etc.)

**Ubicación**: `edge-functions/process-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
    });
  }

  // Crear cliente Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  // Procesar eventos
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_transaction_id", paymentIntent.id);
      break;

    case "charge.refunded":
      const charge = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "refunded" })
        .eq("stripe_transaction_id", charge.id);
      break;
  }

  return new Response(JSON.stringify({ received: true }));
});
```

**Variables de Entorno Requeridas**:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. send-email (Envío de Emails)

**Propósito**: Enviar emails transaccionales (confirmación, reset password, notificaciones)

**Ubicación**: `edge-functions/send-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as postmark from "https://deno.land/x/postmark@1.0.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, subject, template, variables } = await req.json();

    const client = new postmark.Client(Deno.env.get("POSTMARK_API_KEY"));

    const result = await client.sendEmailWithTemplate({
      From: "noreply@serverx.com",
      To: email,
      TemplateId: getTemplateId(template),
      TemplateModel: variables,
    });

    return new Response(
      JSON.stringify({ success: true, message_id: result.MessageID }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

function getTemplateId(template: string): number {
  const templates = {
    welcome: 123456,
    "password-reset": 123457,
    invoice: 123458,
    notification: 123459,
  };
  return templates[template] || templates.notification;
}
```

**Uso desde Cliente**:

```javascript
// En cualquier servicio
const response = await fetch(
  "https://project.supabase.co/functions/v1/send-email",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabase.auth.session().access_token}`,
    },
    body: JSON.stringify({
      email: user.email,
      subject: "Welcome to ServerX",
      template: "welcome",
      variables: { name: user.full_name },
    }),
  }
);
```

### 3. generate-invoice (Generar Facturas)

**Propósito**: Generar PDF de facturas cuando se completa un pago

**Ubicación**: `edge-functions/generate-invoice/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import PDFDocument from "https://esm.sh/pdfkit@0.13.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // Obtener datos de la orden
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, user_id, total")
      .eq("id", order_id)
      .single();

    if (error) throw error;

    // Generar PDF
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    doc.fontSize(25).text("INVOICE", 100, 50);
    doc.fontSize(12).text(`Order ID: ${order.id}`, 100, 100);
    doc.text(`Total: $${order.total.toFixed(2)}`, 100, 120);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 100, 140);

    doc.end();

    const pdfData = Buffer.concat(buffers);

    // Guardar en Storage
    const { data: file, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(`${order_id}.pdf`, pdfData, {
        contentType: "application/pdf",
      });

    if (uploadError) throw uploadError;

    return new Response(JSON.stringify({ success: true, file: file.path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

### 4. sync-servers (Sincronizar Servidores)

**Propósito**: Sincronizar estado de servidores externos (AWS, DigitalOcean, etc.)

**Ubicación**: `edge-functions/sync-servers/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // Obtener todos los servidores
    const { data: servers, error } = await supabase.from("servers").select("*");

    if (error) throw error;

    // Sincronizar cada servidor
    for (const server of servers) {
      try {
        // Llamar API del proveedor (ejemplo)
        const response = await fetch(
          `https://api.provider.com/instances/${server.provider_id}`,
          {
            headers: { Authorization: `Bearer ${server.provider_token}` },
          }
        );

        const data = await response.json();

        // Actualizar estado
        await supabase
          .from("servers")
          .update({
            status: data.status,
            cpu_usage: data.cpu_usage,
            memory_usage: data.memory_usage,
            last_sync: new Date(),
          })
          .eq("id", server.id);
      } catch (err) {
        console.error(`Error syncing server ${server.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

## Deployment

### Deploy Individual

```bash
supabase functions deploy send-email
```

### Deploy Todas las Funciones

```bash
supabase functions deploy
```

### Verificar Deploy

```bash
supabase functions list
```

## Testing Local

```bash
supabase start
supabase functions serve
```

Luego acceder a: `http://localhost:54321/functions/v1/send-email`

## Variables de Entorno

Definir en Supabase Dashboard → Functions → Secrets

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
POSTMARK_API_KEY=pm_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Limits y Cuotas

| Recurso         | Límite                |
| --------------- | --------------------- |
| Duración máxima | 60 segundos           |
| Memoria         | 512MB                 |
| Storage         | 20MB por función      |
| Payload máximo  | 50MB                  |
| Ejecuciones/mes | Ilimitadas (plan pro) |

## Error Handling

Siempre retornar estructura consistente:

```typescript
{
  success: boolean
  data?: any
  error?: string
  code?: string
  status: number
}
```
