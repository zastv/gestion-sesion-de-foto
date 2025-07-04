const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://usuario:contraseña@localhost:5432/tu_basededatos',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const userResult = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = userResult.rows[0];
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Successful login for user:', email);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      'INSERT INTO "User" (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [name, email, hashedPassword]
    );
    const user = insertResult.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Successfully registered user:', email);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'El correo es requerido' });
    }
    const userResult = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) {
      // No revelar si el usuario existe o no
      return res.json({ message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
    }
    // Aquí deberías enviar un correo real con un token seguro
    // Por ahora solo simula la respuesta
    return res.json({ message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Cambiar contraseña (requiere autenticación)
app.post('/api/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const userResult = await pool.query('SELECT * FROM "User" WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Middleware para autenticar JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Endpoint para crear sesión (requiere autenticación)
app.post('/api/sessions', authenticateJWT, async (req, res) => {
  try {
    const { title, description, date, duration_minutes, location, packageType } = req.body;
    if (!title || !date || !duration_minutes) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const sessionResult = await pool.query(
      'INSERT INTO "Session" (userId, title, description, date, duration_minutes, location, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, title, description, date, duration_minutes, location, 'pendiente']
    );
    const session = sessionResult.rows[0];
    // Crear evento en el calendario
    const start = date;
    const end = new Date(new Date(date).getTime() + duration_minutes * 60000).toISOString();
    await pool.query(
      'INSERT INTO "CalendarEvent" (sessionId, start, "end", title, color) VALUES ($1, $2, $3, $4, $5)',
      [session.id, start, end, title, '#2563eb']
    );
    res.status(201).json({ message: 'Sesión agendada', session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Endpoint para obtener eventos del calendario (requiere autenticación)
app.get('/api/calendar-events', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "CalendarEvent" WHERE sessionId IN (SELECT id FROM "Session" WHERE userId = $1)',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Endpoint para guardar solicitudes personalizadas de paquetes (requiere autenticación)
app.post('/api/custom-package', authenticateJWT, async (req, res) => {
  try {
    const { tipo, tiempo, fotos, locaciones } = req.body;
    if (!tipo || !tiempo || !fotos || !locaciones) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    await pool.query(
      'INSERT INTO "Session" (userId, title, description, date, duration_minutes, location, status) VALUES ($1, $2, $3, NOW(), $4, $5, $6)',
      [req.user.userId, `Personalizado: ${tipo}`, `Fotos: ${fotos}, Locaciones: ${locaciones}`, parseInt(tiempo), 'Personalizado', 'personalizado']
    );
    res.status(201).json({ message: 'Solicitud personalizada guardada' });
  } catch (error) {
    console.error('Custom package error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
});

// Start server with error handling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// User table creation (to be run once)
// CREATE TABLE "User" (
//   id SERIAL PRIMARY KEY,
//   email TEXT UNIQUE NOT NULL,
//   password TEXT NOT NULL,
//   name TEXT NOT NULL,
//   phone TEXT,
//   provider TEXT NOT NULL DEFAULT 'local',
//   createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );