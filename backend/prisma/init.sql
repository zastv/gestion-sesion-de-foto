CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  provider TEXT NOT NULL DEFAULT 'local',
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE "Client" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  sessionType TEXT NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  userId INTEGER NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Tabla de sesiones
CREATE TABLE "Session" (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  hour TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  notes TEXT,
  clientId INTEGER NOT NULL,
  packageId INTEGER,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client FOREIGN KEY (clientId) REFERENCES "Client"(id) ON DELETE CASCADE,
  CONSTRAINT fk_package FOREIGN KEY (packageId) REFERENCES "Package"(id)
);

-- Tabla de paquetes
CREATE TABLE "Package" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  examples TEXT[] -- Arreglo de URLs
);

-- Tabla de imágenes en galería
CREATE TABLE "GalleryImage" (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  uploadedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  userId INTEGER NOT NULL,
  CONSTRAINT fk_gallery_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
