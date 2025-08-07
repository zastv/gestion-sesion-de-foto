# 🚀 GUÍA COMPLETA MIGRACIÓN A SUPABASE

## PASO 1: Crear proyecto en Supabase ✅
1. Ve a https://supabase.com
2. Clic en "Start your project" 
3. Sign up con GitHub
4. New Project:
   - Name: `gestion-sesion-foto`
   - Database Password: `[CREAR PASSWORD FUERTE]`
   - Region: `East US (N. Virginia)`
5. Esperar ~2 minutos a que se cree

## PASO 2: Configurar base de datos ✅
1. Ve a SQL Editor en Supabase
2. Copia y pega el contenido de `supabase_migration.sql`
3. Ejecuta el script (botón RUN)
4. Verifica que se crearon las tablas

## PASO 3: Obtener credenciales ✅
1. Ve a Settings → API en tu proyecto Supabase
2. Copia:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGc...` (key que empieza con eyJ)
   - **service_role**: `eyJhbGc...` (key secreta)

## PASO 4: Actualizar .env ✅
Reemplaza en tu archivo `.env`:
```bash
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
USE_SUPABASE=true
```

## PASO 5: Actualizar variables de Render
1. Ve a tu dashboard de Render
2. Environment Variables
3. Agrega las nuevas variables de Supabase
4. Cambiar `USE_SUPABASE=true`

## PASO 6: Actualizar config.ts (frontend)
Cambiar la URL del backend si migras también el backend

## VENTAJAS QUE OBTIENES:
✅ **Sin cold starts** - siempre disponible
✅ **Dashboard visual** para ver/editar datos
✅ **Backups automáticos**
✅ **APIs REST automáticas**
✅ **Auth integrada** (opcional futuro)
✅ **Storage para archivos** (fotos futuras)
✅ **Real-time subscriptions**
✅ **Row Level Security**

## NEXT STEPS:
1. Completar pasos 1-4
2. Testear conexión
3. Migrar datos existentes (si los hay)
4. Cambiar `USE_SUPABASE=true` para activar

---
¿Listo para empezar? 🚀
