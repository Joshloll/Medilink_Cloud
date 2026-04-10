-- Supabase Schema for MediLink Healthcare System
-- Run these SQL commands in Supabase SQL Editor

-- 1. Users Table (Authentication + Roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'pending', -- admin, doctor, patient, pending
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by_admin BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(255),
  department VARCHAR(255),
  years_of_experience INTEGER,
  education TEXT,
  phone_number VARCHAR(20),
  working_days VARCHAR(255), -- "Monday,Tuesday,Wednesday,Thursday,Friday"
  working_hours_start TIME,
  working_hours_end TIME,
  bio TEXT,
  consultation_duration_minutes INTEGER DEFAULT 30,
  is_available BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_patients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  insurance_provider VARCHAR(255),
  insurance_plan VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_expiry DATE,
  blood_type VARCHAR(5),
  allergies TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_history TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type VARCHAR(100), -- checkup, followup, consultation, emergency, new-patient
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, in-progress, completed, cancelled, pending
  notes TEXT,
  reason_for_visit TEXT,
  is_reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- 5. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  record_type VARCHAR(100), -- diagnosis, prescription, lab-result, imaging, notes
  title VARCHAR(255),
  description TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_date DATE,
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100), -- "Once daily", "Twice daily", etc
  duration_days INTEGER,
  quantity INTEGER,
  instructions TEXT,
  refills_remaining INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, expired, refill-requested
  prescribed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_is_available ON doctors(is_available);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - adjust based on your security requirements)
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Patients can view own patient record
CREATE POLICY "Patients can view own record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

-- Doctors can view their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all appointments
CREATE POLICY "Admins can view appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients can view own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Doctors can view their appointments
CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );
