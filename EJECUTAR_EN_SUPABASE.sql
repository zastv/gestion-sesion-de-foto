-- SCRIPT PARA EJECUTAR EN SUPABASE SQL EDITOR
-- Ve a: https://pgdkcmrpvqxtxihtsewl.supabase.co → SQL Editor → New Query

-- 1. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de paquetes
CREATE TABLE IF NOT EXISTS "Package" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_photos INTEGER NOT NULL,
  locations_included INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS "Session" (
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

-- 4. Crear tabla de eventos del calendario
CREATE TABLE IF NOT EXISTS "CalendarEvent" (
  id SERIAL PRIMARY KEY,
  sessionId INTEGER REFERENCES "Session"(id) ON DELETE CASCADE,
  start TIMESTAMP NOT NULL,
  "end" TIMESTAMP NOT NULL,
  title VARCHAR(200) NOT NULL,
  color VARCHAR(7) DEFAULT '#2563eb',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insertar paquetes de ejemplo
INSERT INTO "Package" (name, description, price, duration_minutes, max_photos, locations_included) 
VALUES
('Básico', 'Sesión fotográfica básica ideal para retratos individuales', 299.99, 60, 15, 1),
('Estándar', 'Sesión completa con múltiples poses y edición profesional', 499.99, 90, 30, 1),
('Premium', 'Sesión fotográfica premium con múltiples locaciones', 799.99, 120, 50, 2),
('Familiar', 'Sesión especial para familias con múltiples configuraciones', 599.99, 90, 40, 1),
('Evento', 'Cobertura completa de eventos especiales', 1299.99, 240, 100, 3)
ON CONFLICT (name) DO NOTHING;

-- 6. Configurar Row Level Security básico
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Packages are publicly readable" ON "Package"
  FOR SELECT USING (true);

-- 7. Mensaje de confirmación
SELECT 'Configuración de Supabase completada exitosamente! ✅' as mensaje;
