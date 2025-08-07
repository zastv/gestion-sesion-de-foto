-- Script SQL para agregar tablas de pagos - Compatible con autenticación JWT
-- Ejecutar después de las tablas existentes

-- 1. Crear tabla de pagos
CREATE TABLE IF NOT EXISTS "Payment" (
  id SERIAL PRIMARY KEY,
  sessionId INTEGER REFERENCES "Session"(id) ON DELETE CASCADE,
  userId INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Información del pago
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) DEFAULT 'card',
  
  -- Estados del pago
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded, cancelled
  payment_intent_id VARCHAR(255), -- Stripe payment intent ID
  
  -- Información de Stripe
  stripe_customer_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  stripe_payment_method_id VARCHAR(255),
  
  -- Fechas importantes
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de facturas
CREATE TABLE IF NOT EXISTS "Invoice" (
  id SERIAL PRIMARY KEY,
  paymentId INTEGER REFERENCES "Payment"(id) ON DELETE CASCADE,
  
  -- Numeración de facturas
  invoice_number VARCHAR(50) UNIQUE,
  
  -- Detalles de facturación
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Estado de la factura
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  
  -- Fechas
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  
  -- Metadata
  notes TEXT,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de cupones/descuentos
CREATE TABLE IF NOT EXISTS "Coupon" (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Tipo de descuento
  type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
  value DECIMAL(10,2) NOT NULL,
  
  -- Límites de uso
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  
  -- Validez
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla de aplicación de cupones
CREATE TABLE IF NOT EXISTS "PaymentCoupon" (
  id SERIAL PRIMARY KEY,
  paymentId INTEGER REFERENCES "Payment"(id) ON DELETE CASCADE,
  couponId INTEGER REFERENCES "Coupon"(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla de transacciones (log detallado)
CREATE TABLE IF NOT EXISTS "Transaction" (
  id SERIAL PRIMARY KEY,
  paymentId INTEGER REFERENCES "Payment"(id) ON DELETE CASCADE,
  
  -- Detalles de la transacción
  type VARCHAR(50) NOT NULL, -- charge, refund, partial_refund
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Referencias externas (Stripe)
  external_id VARCHAR(255),
  external_status VARCHAR(50),
  
  -- Metadata
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insertar cupones de ejemplo (solo si no existen)
INSERT INTO "Coupon" (code, type, value, usage_limit, valid_until, description) VALUES
('PRIMERASESION', 'percentage', 15.00, 100, '2025-12-31 23:59:59', 'Descuento del 15% para primera sesión'),
('VERANO2025', 'fixed_amount', 50.00, 50, '2025-09-30 23:59:59', 'Descuento fijo de $50 para sesiones de verano'),
('FAMILIAR20', 'percentage', 20.00, 25, '2025-12-31 23:59:59', '20% de descuento en sesiones familiares')
ON CONFLICT (code) DO NOTHING;

-- 7. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_payment_user ON "Payment"(userId);
CREATE INDEX IF NOT EXISTS idx_payment_session ON "Payment"(sessionId);
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"(status);
CREATE INDEX IF NOT EXISTS idx_payment_intent ON "Payment"(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_coupon_code ON "Coupon"(code);
CREATE INDEX IF NOT EXISTS idx_coupon_active ON "Coupon"(is_active);

-- 8. Crear función para generar número de factura automático
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix VARCHAR(4);
  sequence_num INTEGER;
  new_invoice_number VARCHAR(50);
BEGIN
  -- Obtener año actual
  year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  
  -- Obtener siguiente número de secuencia para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM "Invoice"
  WHERE invoice_number LIKE year_suffix || '%';
  
  -- Generar número de factura: 2025-0001, 2025-0002, etc.
  new_invoice_number := year_suffix || '-' || LPAD(sequence_num::VARCHAR, 4, '0');
  
  NEW.invoice_number := new_invoice_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear trigger para auto-generar números de factura
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON "Invoice";
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON "Invoice"
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- 10. Agregar columna package_id a Session si no existe (para vinculación con paquetes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'Session' AND column_name = 'package_id') THEN
    ALTER TABLE "Session" ADD COLUMN package_id INTEGER REFERENCES "Package"(id);
  END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Sistema de pagos configurado exitosamente! 💳✅' as mensaje;

-- Mostrar estadísticas de las tablas creadas
SELECT 
  'Tabla Payment: ' || COUNT(*) || ' registros' as estadistica
FROM "Payment"
UNION ALL
SELECT 
  'Tabla Coupon: ' || COUNT(*) || ' cupones activos' as estadistica
FROM "Coupon" WHERE is_active = true
UNION ALL
SELECT 
  'Tabla Invoice: ' || COUNT(*) || ' facturas' as estadistica
FROM "Invoice";
