const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createPackageTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Package" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        photo_count INTEGER DEFAULT 10,
        location_count INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    
    // Insertar paquetes iniciales
    await pool.query(`
      INSERT INTO "Package" (name, price, description, duration_minutes, photo_count, location_count) 
      VALUES 
        ('Personal', '$50', 'Sesión de 30 minutos, 10 fotos editadas, 1 locación.', 30, 10, 1),
        ('Premium', '$45', 'Sesión de 1 hora, 30 fotos editadas, 2 locaciones, 1 álbum digital.', 60, 30, 2),
        ('Personalizado', 'De 50$ en adelante', 'Usted elige el tipo de sesión, el tiempo, el número de fotos y el número de locaciones.', 60, 10, 1),
        ('Promoción Verano', '$78', 'Sesión especial', 90, 25, 2)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Tabla Package creada exitosamente con datos iniciales');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla Package:', error);
    process.exit(1);
  }
}

createPackageTable();
