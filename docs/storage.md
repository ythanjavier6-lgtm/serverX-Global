# Storage — ServerX

## Introducción

Supabase Storage permite guardar archivos (imágenes, documentos, invoices) con control de acceso granular. En ServerX se usa para:

- Avatares de usuario
- Logos de productos
- Facturas en PDF
- Backups
- Screenshots de servidores

## Crear Buckets

### 1. Via Dashboard

Dashboard → Storage → Buckets → New Bucket

Crear buckets:

- `avatars` (público)
- `invoices` (privado)
- `backups` (privado)
- `documents` (privado)

### 2. Via SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('invoices', 'invoices', false),
  ('backups', 'backups', false),
  ('documents', 'documents', false);
```

## Upload de Archivos

### Upload Básico

```javascript
// frontend/js/services/storage.js
import { supabase } from "../supabase-client.js";

async function uploadAvatar(userId, file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Sobrescribir si existe
    });

  if (error) throw error;

  return data;
}
```

### Upload con Progress

```javascript
async function uploadFileWithProgress(bucket, path, file, onProgress) {
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", (event) => {
    const percent = (event.loaded / event.total) * 100;
    onProgress?.(percent);
  });

  return new Promise((resolve, reject) => {
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      resolve(response);
    });

    xhr.addEventListener("error", reject);

    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", `/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${supabase.auth.session().access_token}`
    );
    xhr.send(formData);
  });
}
```

### Upload Múltiples

```javascript
async function uploadMultiple(bucket, files) {
  const promises = files.map((file) =>
    supabase.storage.from(bucket).upload(`${Date.now()}_${file.name}`, file)
  );

  const results = await Promise.all(promises);
  return results;
}
```

## Descargar Archivos

### Download Público

```javascript
// Archivo público en bucket 'avatars'
const { data } = await supabase.storage
  .from("avatars")
  .getPublicUrl("user-123.jpg");

console.log(data.publicUrl);
// https://xxxxx.supabase.co/storage/v1/object/public/avatars/user-123.jpg
```

### Download Privado

```javascript
// Archivo privado en bucket 'invoices'
const { data, error } = await supabase.storage
  .from("invoices")
  .download("invoice-001.pdf");

if (error) throw error;

// Crear blob y descargar
const url = URL.createObjectURL(new Blob([data]));
const a = document.createElement("a");
a.href = url;
a.download = "invoice.pdf";
a.click();
```

### URL con Expiración

```javascript
// Link que expira en 1 hora
const { data } = await supabase.storage
  .from("documents")
  .createSignedUrl("confidential.pdf", 3600); // segundos

console.log(data.signedUrl);
```

## Listar Archivos

```javascript
async function listFiles(bucket, folderPath = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folderPath);

  if (error) throw error;

  return data; // Array de archivos
}

// Uso
const avatars = await listFiles("avatars");
avatars.forEach((file) => {
  console.log(file.name, file.metadata);
});
```

## Eliminar Archivos

### Eliminar Uno

```javascript
async function deleteFile(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).remove([path]);

  if (error) throw error;
}
```

### Eliminar Múltiples

```javascript
async function deleteFiles(bucket, paths) {
  const { data, error } = await supabase.storage.from(bucket).remove(paths); // Array de paths

  if (error) throw error;
}
```

## Políticas de Storage

### Policía Pública (Bucket = avatars)

```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');
```

### Política Privada (Bucket = invoices)

```sql
-- Usuarios ven solo sus propias facturas
CREATE POLICY "Users can view own invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices'
  AND owner = auth.uid()
);

-- Sistema crea facturas
CREATE POLICY "System creates invoices"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Usuarios eliminan sus propias facturas
CREATE POLICY "Users can delete own invoices"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoices'
  AND owner = auth.uid()
);
```

### Política Admin (Bucket = backups)

```sql
-- Solo admin accede a backups
CREATE POLICY "Admin can access backups"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'backups'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System creates backups"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'backups'
  AND auth.role() = 'service_role'
);
```

## Implementación en Servicios

### Avatar Service

```javascript
// frontend/js/services/storage.js
class StorageService {
  async uploadAvatar(userId, file) {
    // Validar
    if (!file.type.startsWith("image/")) {
      throw new Error("Solo se aceptan imágenes");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      throw new Error("Archivo muy grande (máx 5MB)");
    }

    // Upload
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    // Obtener URL pública
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Actualizar perfil
    await supabase
      .from("users")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);

    return data.publicUrl;
  }

  async uploadInvoice(orderId, invoicePdf) {
    const userId = getCurrentUserId();
    const fileName = `${userId}/${orderId}.pdf`;

    const { data, error } = await supabase.storage
      .from("invoices")
      .upload(fileName, invoicePdf, {
        contentType: "application/pdf",
      });

    if (error) throw error;

    // Obtener URL firmada (válida 1 hora)
    const { data: signedUrl } = await supabase.storage
      .from("invoices")
      .createSignedUrl(fileName, 3600);

    return signedUrl.signedUrl;
  }

  async getInvoiceUrl(orderId) {
    const userId = getCurrentUserId();
    const path = `${userId}/${orderId}.pdf`;

    const { data } = await supabase.storage
      .from("invoices")
      .createSignedUrl(path, 3600);

    return data.signedUrl;
  }

  async deleteAvatar(userId) {
    // Obtener nombre actual
    const { data: user } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (user.avatar_url) {
      const fileName = user.avatar_url.split("/").pop();

      await supabase.storage.from("avatars").remove([fileName]);

      // Actualizar perfil
      await supabase
        .from("users")
        .update({ avatar_url: null })
        .eq("id", userId);
    }
  }
}

export const storageService = new StorageService();
```

## Compresión de Imágenes

```javascript
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Reducir tamaño
        const maxWidth = 800;
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.8
        ); // 80% quality
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// Uso
const compressed = await compressImage(file);
await storageService.uploadAvatar(userId, compressed);
```

## Transformaciones de Imagen

Supabase permite transformar imágenes al acceder:

```javascript
// Redimensionar
const { data } = supabase.storage.from("avatars").getPublicUrl("user-123.jpg", {
  transform: {
    width: 200,
    height: 200,
    resize: "cover",
  },
});

// Avatar pequeño
console.log(data.publicUrl);
// https://...jpg?width=200&height=200&resize=cover
```

## Limpieza de Archivos Antiguos

Edge Function para limpiar archivos viejos:

```typescript
// edge-functions/cleanup-storage/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  // Archivos más viejos que 30 días
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: files } = await supabase.storage.from("backups").list();

  const oldFiles = files.filter((f) => new Date(f.created_at) < thirtyDaysAgo);

  // Eliminar
  const filesToDelete = oldFiles.map((f) => f.name);

  if (filesToDelete.length > 0) {
    await supabase.storage.from("backups").remove(filesToDelete);
  }

  return new Response(
    JSON.stringify({
      deleted: filesToDelete.length,
    })
  );
});
```

Ejecutar cada día vía scheduler.

## Limits

| Recurso        | Límite               |
| -------------- | -------------------- |
| Tamaño archivo | 5GB                  |
| Total storage  | Según plan           |
| Rate limit     | 100 requests/segundo |

## Troubleshooting

### "Bucket not found"

Verificar bucket existe:

```javascript
const { data: buckets } = await supabase.storage.listBuckets();
console.log(buckets);
```

### "Permission denied"

RLS está bloqueando. Verificar políticas de storage:

```sql
SELECT * FROM pg_policies WHERE tablename LIKE '%storage%'
```

### File upload muy lento

Comprimir antes de subir:

```javascript
const compressed = await compressImage(file);
await uploadAvatar(userId, compressed);
```
