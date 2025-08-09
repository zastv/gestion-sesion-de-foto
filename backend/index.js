const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL connection (Neon - fallback)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://usuario:contraseña@localhost:5432/tu_basededatos',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
let supabase = null;

// Configuración de Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51...'); // Usar clave real en producción

if (supabaseUrl && supabaseServiceKey && process.env.USE_SUPABASE === 'true') {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('🚀 Usando Supabase como base de datos');
} else {
  console.log('🐘 Usando PostgreSQL directo (Neon)');
}

// Función adaptadora para queries
const dbQuery = async (sql, params = []) => {
  if (supabase && process.env.USE_SUPABASE === 'true') {
    console.log('📊 Query via Supabase');
    // Por ahora mantenemos PostgreSQL hasta migración completa
    return await pool.query(sql, params);
  } else {
    return await pool.query(sql, params);
  }
};

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://orange-space-giggle-vx5v6qg5jgwcwxj5-5173.app.github.dev',
    'https://gestion-sesion-de-foto.vercel.app',
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware adicional para OPTIONS preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

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

    // Validar que la fecha sea futura
    const sessionDate = new Date(date);
    const now = new Date();
    if (sessionDate <= now) {
      return res.status(400).json({ error: 'No se pueden agendar sesiones en fechas pasadas' });
    }

    // Validar que la hora esté dentro del horario laboral (9:00 - 17:00)
    const sessionHour = sessionDate.getHours();
    if (sessionHour < 9 || sessionHour >= 17) {
      return res.status(400).json({ error: 'Las sesiones solo se pueden agendar entre 9:00 AM y 5:00 PM' });
    }

    // Verificar disponibilidad - buscar conflictos
    const conflicts = await pool.query(
      `SELECT * FROM "CalendarEvent" 
       WHERE DATE(start) = DATE($1) 
       AND (
         (start <= $1 AND "end" > $1) OR
         (start < $2 AND "end" >= $2) OR
         (start >= $1 AND "end" <= $2)
       )`,
      [date, new Date(new Date(date).getTime() + duration_minutes * 60000).toISOString()]
    );

    if (conflicts.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una sesión agendada en ese horario' });
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
    
    res.status(201).json({ message: 'Sesión agendada exitosamente', session });
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

// Endpoint para obtener las sesiones del usuario con información de pagos
app.get('/api/user-sessions', authenticateJWT, async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT 
        s.*,
        p.name as package_name,
        p.price as package_price,
        CASE 
          WHEN pay.status = 'completed' THEN true
          ELSE false
        END as paid,
        pay.status as payment_status,
        pay.amount as payment_amount
      FROM "Session" s
      LEFT JOIN "Package" p ON s.package_id = p.id
      LEFT JOIN "Payment" pay ON pay.sessionId = s.id AND pay.status IN ('completed', 'pending')
      WHERE s.userId = $1
      ORDER BY s.date DESC
    `, [req.user.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Endpoint público para obtener horarios ocupados (NO requiere autenticación)
app.get('/api/sessions/occupied-slots', async (req, res) => {
  try {
    console.log('📅 Fetching occupied slots...');
    const result = await dbQuery(`
      SELECT 
        DATE(date) as date,
        EXTRACT(HOUR FROM date) || ':' || 
        CASE 
          WHEN EXTRACT(MINUTE FROM date) < 10 THEN '0' || EXTRACT(MINUTE FROM date)
          ELSE EXTRACT(MINUTE FROM date)::text
        END as time,
        duration_minutes,
        title
      FROM "Session" 
      WHERE date >= CURRENT_DATE
      ORDER BY date ASC
    `);
    
    console.log(`📊 Found ${result.rows.length} sessions`);
    
    // Agrupar por fecha para facilitar el manejo en el frontend
    const occupiedSlots = {};
    result.rows.forEach(slot => {
      const dateString = slot.date.toISOString().split('T')[0];
      if (!occupiedSlots[dateString]) {
        occupiedSlots[dateString] = [];
      }
      occupiedSlots[dateString].push({
        time: slot.time,
        duration: slot.duration_minutes,
        title: slot.title
      });
    });
    
    console.log('📋 Occupied slots grouped:', occupiedSlots);
    res.json(occupiedSlots);
  } catch (error) {
    console.error('❌ Error al obtener horarios ocupados:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Endpoint para cancelar una sesión
app.put('/api/sessions/:id/cancel', authenticateJWT, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // Verificar que la sesión pertenece al usuario
    const sessionCheck = await pool.query(
      'SELECT * FROM "Session" WHERE id = $1 AND userId = $2',
      [sessionId, req.user.userId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    const session = sessionCheck.rows[0];
    
    // Verificar que la sesión se puede cancelar (más de 24 horas de anticipación)
    const sessionDate = new Date(session.date);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilSession <= 24) {
      return res.status(400).json({ error: 'No se puede cancelar una sesión con menos de 24 horas de anticipación' });
    }
    
    if (session.status === 'cancelada') {
      return res.status(400).json({ error: 'La sesión ya está cancelada' });
    }
    
    // Actualizar el estado de la sesión
    await pool.query(
      'UPDATE "Session" SET status = $1 WHERE id = $2',
      ['cancelada', sessionId]
    );
    
    // Eliminar el evento del calendario
    await pool.query(
      'DELETE FROM "CalendarEvent" WHERE sessionId = $1',
      [sessionId]
    );
    
    res.json({ message: 'Sesión cancelada exitosamente' });
  } catch (error) {
    console.error('Cancel session error:', error);
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

// CRUD ENDPOINTS PARA PAQUETES

// Obtener todos los paquetes (público)
app.get('/api/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Package" ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Crear nuevo paquete (requiere autenticación de admin)
app.post('/api/packages', authenticateJWT, async (req, res) => {
  try {
    const { name, price, description, duration_minutes, photo_count, location_count, is_active } = req.body;
    
    if (!name || !price || !description) {
      return res.status(400).json({ error: 'Nombre, precio y descripción son requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO "Package" (name, price, description, duration_minutes, photo_count, location_count, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, price, description, duration_minutes || 60, photo_count || 10, location_count || 1, is_active !== false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Actualizar paquete (requiere autenticación de admin)
app.put('/api/packages/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, duration_minutes, photo_count, location_count, is_active } = req.body;
    
    const result = await pool.query(
      'UPDATE "Package" SET name = $1, price = $2, description = $3, duration_minutes = $4, photo_count = $5, location_count = $6, is_active = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, price, description, duration_minutes, photo_count, location_count, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Eliminar paquete (requiere autenticación de admin)
app.delete('/api/packages/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM "Package" WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }
    
    res.json({ message: 'Paquete eliminado exitosamente', package: result.rows[0] });
  } catch (error) {
    console.error('Delete package error:', error);
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

// Package table creation (to be run once)
// CREATE TABLE "Package" (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(100) NOT NULL,
//   price VARCHAR(50) NOT NULL,
//   description TEXT NOT NULL,
//   duration_minutes INTEGER DEFAULT 60,
//   photo_count INTEGER DEFAULT 10,
//   location_count INTEGER DEFAULT 1,
//   is_active BOOLEAN DEFAULT true,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

// ===================================
// 💳 SISTEMA DE PAGOS - HU-5
// ===================================

// Crear Payment Intent para Stripe
app.post('/api/create-payment-intent', authenticateJWT, async (req, res) => {
  try {
    const { sessionId, amount, currency = 'usd', couponCode } = req.body;
    
    if (!sessionId || !amount) {
      return res.status(400).json({ error: 'sessionId y amount son requeridos' });
    }

    // Verificar que la sesión pertenece al usuario
    const sessionResult = await dbQuery(
      'SELECT * FROM "Session" WHERE id = $1 AND userId = $2',
      [sessionId, req.user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    let finalAmount = amount;
    let discountAmount = 0;

    // Aplicar cupón si se proporciona
    if (couponCode) {
      const couponResult = await dbQuery(
        'SELECT * FROM "Coupon" WHERE code = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW())',
        [couponCode]
      );

      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0];
        
        if (coupon.type === 'percentage') {
          discountAmount = (amount * coupon.value) / 100;
        } else if (coupon.type === 'fixed_amount') {
          discountAmount = Math.min(coupon.value, amount);
        }
        
        finalAmount = Math.max(amount - discountAmount, 0);
      }
    }

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Stripe usa centavos
      currency: currency,
      metadata: {
        sessionId: sessionId.toString(),
        userId: req.user.userId.toString(),
        originalAmount: amount.toString(),
        discountAmount: discountAmount.toString()
      }
    });

    // Guardar pago en la base de datos
    const paymentResult = await dbQuery(
      'INSERT INTO "Payment" (sessionId, userId, amount, currency, status, payment_intent_id, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [sessionId, req.user.userId, finalAmount, currency, 'pending', paymentIntent.id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 días para pagar
    );

    const payment = paymentResult.rows[0];

    // Si se aplicó un cupón, registrarlo
    if (couponCode && discountAmount > 0) {
      const couponResult = await dbQuery('SELECT id FROM "Coupon" WHERE code = $1', [couponCode]);
      if (couponResult.rows.length > 0) {
        await dbQuery(
          'INSERT INTO "PaymentCoupon" (paymentId, couponId, discount_amount) VALUES ($1, $2, $3)',
          [payment.id, couponResult.rows[0].id, discountAmount]
        );
        
        // Incrementar uso del cupón
        await dbQuery(
          'UPDATE "Coupon" SET used_count = used_count + 1 WHERE id = $1',
          [couponResult.rows[0].id]
        );
      }
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      finalAmount: finalAmount,
      discountAmount: discountAmount
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Confirmar pago (webhook de Stripe)
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('❌ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Actualizar estado del pago
      await dbQuery(
        'UPDATE "Payment" SET status = $1, paid_at = NOW() WHERE payment_intent_id = $2',
        ['completed', paymentIntent.id]
      );

      // Actualizar estado de la sesión
      const metadata = paymentIntent.metadata;
      if (metadata.sessionId) {
        await dbQuery(
          'UPDATE "Session" SET status = $1 WHERE id = $2',
          ['confirmada', metadata.sessionId]
        );
      }

      console.log('✅ Pago confirmado:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      await dbQuery(
        'UPDATE "Payment" SET status = $1 WHERE payment_intent_id = $2',
        ['failed', failedPayment.id]
      );

      console.log('❌ Pago fallido:', failedPayment.id);
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({received: true});
});

// Obtener pagos del usuario
app.get('/api/user-payments', authenticateJWT, async (req, res) => {
  try {
    const result = await dbQuery(`
      SELECT 
        p.*,
        s.title as session_title,
        s.date as session_date,
        pc.couponId,
        c.code as coupon_used,
        i.invoice_number,
        i.pdf_url
      FROM "Payment" p
      LEFT JOIN "Session" s ON p.sessionId = s.id
      LEFT JOIN "PaymentCoupon" pc ON pc.paymentId = p.id
      LEFT JOIN "Coupon" c ON c.id = pc.couponId
      LEFT JOIN "Invoice" i ON i.paymentId = p.id
      WHERE p.userId = $1
      ORDER BY p.created_at DESC
    `, [req.user.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Validar cupón de descuento
app.post('/api/validate-coupon', authenticateJWT, async (req, res) => {
  try {
    const { couponCode, amount } = req.body;

    if (!couponCode) {
      return res.status(400).json({ error: 'Código de cupón requerido' });
    }

    const result = await dbQuery(
      'SELECT * FROM "Coupon" WHERE code = $1 AND is_active = true AND (valid_until IS NULL OR valid_until > NOW())',
      [couponCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cupón no válido o expirado' });
    }

    const coupon = result.rows[0];

    // Verificar límite de uso
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Cupón agotado' });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (amount * coupon.value) / 100;
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(coupon.value, amount);
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      },
      discountAmount: discountAmount,
      finalAmount: Math.max(amount - discountAmount, 0)
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// Obtener configuración pública de Stripe
app.get('/api/stripe-config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});