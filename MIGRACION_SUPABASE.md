# 🚀 MIGRACIÓN A SUPABASE - CONFIGURACIÓN PASO A PASO

## 1. Crear cuenta en Supabase
1. Ve a https://supabase.com
2. Crea cuenta gratuita
3. Crea nuevo proyecto
4. Guarda la URL y API Key

## 2. Configurar variables de entorno
```bash
# En .env del backend
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[TU_ANON_KEY]
SUPABASE_SERVICE_KEY=[TU_SERVICE_KEY]
```

## 3. Ejecutar migraciones
```sql
-- Ejecutar en Supabase SQL Editor:
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Package" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_photos INTEGER NOT NULL,
  locations_included INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CalendarEvent" (
  id SERIAL PRIMARY KEY,
  sessionId INTEGER REFERENCES "Session"(id) ON DELETE CASCADE,
  start TIMESTAMP NOT NULL,
  "end" TIMESTAMP NOT NULL,
  title VARCHAR(200) NOT NULL,
  color VARCHAR(7) DEFAULT '#2563eb',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. VENTAJAS DE SUPABASE:
✅ **Sin cold starts** - siempre disponible
✅ **Dashboard visual** para gestionar datos
✅ **Backups automáticos**
✅ **SSL por defecto**
✅ **APIs REST automáticas**
✅ **Authentication integrada** (opcional)
✅ **Storage para archivos** (para fotos futuras)
✅ **Tier gratuito generoso**: 500MB DB + 1GB bandwidth

## 5. ALTERNATIVA RÁPIDA - USAR NEON ACTUAL
Si prefieres, Neon que ya usamos es excelente:
- Ya está configurado
- No tiene sleep problems
- Tier gratuito sólido
- PostgreSQL puro

¿Quieres migrar a Supabase o optimizar Neon actual?
