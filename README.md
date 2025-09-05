# SAKI Portal (Starter)

Portal de clientes con Next.js + Supabase.

## Configuración rápida

1. Crear un proyecto en Supabase y copiar:
   - **NEXT_PUBLIC_SUPABASE_URL**
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**

2. Crear un archivo `.env.local` en el root con:

```
NEXT_PUBLIC_SUPABASE_URL=TU_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

3. Instalar dependencias y ejecutar en local:

```
npm install
npm run dev
```

4. Deploy en Vercel: importar este repo y en *Environment Variables* pegar las mismas variables.
