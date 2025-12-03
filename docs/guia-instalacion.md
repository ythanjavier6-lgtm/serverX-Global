# Guía de Instalación — ServerX

## Requisitos previos

- Node.js 18+ o superior
- npm o yarn
- Una cuenta de Supabase (gratis en https://supabase.com)
- Git

## Pasos de instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/serverx/serverx.git
cd serverx
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4. Configurar Supabase

Actualiza `supabase/config/client-config.js`:

```javascript
window.SUPABASE_CONF = {
  url: "https://your-project.supabase.co",
  anonKey: "your-public-anon-key",
};
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## Deployment

### Producción con Vercel

```bash
npm run build
vercel --prod
```

### Producción con GitHub Pages

```bash
npm run build
git add dist/
git commit -m "Deploy"
git push
```

## Solución de problemas

### Supabase no se conecta

- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctos
- Revisa la consola del navegador (F12) para errores

### Formularios no envían datos

- Asegúrate de que las tablas de Supabase existan (`contacts`, `newsletter_subscriptions`, etc.)
- Verifica que las políticas RLS permitan inserciones anónimas

### Estilos no cargan

- Limpia cache: `npm run clean`
- Reinicia el servidor de desarrollo

## Próximos pasos

- Personaliza el contenido en `index.html` y páginas relacionadas
- Configura tus propias tablas de base de datos
- Añade tu dominio personalizado
