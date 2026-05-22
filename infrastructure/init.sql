-- VetCare System — Schema de base de datos
-- Ejecutar este script en Supabase SQL Editor

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- user-management
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('veterinario', 'dueno', 'administrador')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- clinical-history
-- =============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(20) CHECK (gender IN ('macho', 'hembra')),
  weight DECIMAL(5,2),
  color VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vet_id UUID NOT NULL REFERENCES users(id),
  date TIMESTAMPTZ DEFAULT NOW(),
  reason VARCHAR(500),
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  weight DECIMAL(5,2),
  temperature DECIMAL(4,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  next_date DATE,
  administered_by UUID REFERENCES users(id),
  batch_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- tracking-reminders
-- =============================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL CHECK (type IN ('vacuna', 'control', 'tratamiento', 'otro')),
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- notification-service
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'push', 'sms')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Índices para rendimiento
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_records_pet ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_records_vet ON medical_records(vet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =============================================
-- Datos de prueba
-- =============================================
-- Admin por defecto: admin@vetcare.com / Admin1234!
INSERT INTO users (email, password_hash, role, name)
VALUES (
  'admin@vetcare.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: Admin1234!
  'administrador',
  'Administrador VetCare'
) ON CONFLICT (email) DO NOTHING;
