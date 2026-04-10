-- ============================================================================
-- MEDILINK SAMPLE DATA - Production-Ready Test Data
-- ============================================================================
-- This script populates your Supabase database with realistic healthcare data
-- Run this in: Supabase Dashboard → SQL Editor → Copy & Paste → Run
-- 
-- Tables populated:
-- 1. users (admin, doctors, patients)
-- 2. patients (patient profiles)
-- 3. doctors (doctor profiles with specialties)
-- 4. appointments (scheduled appointments)
-- 5. medical_records (patient health records)
-- 6. prescriptions (active prescriptions)
-- ============================================================================

-- ============================================================================
-- 1. INSERT TEST USERS
-- ============================================================================

-- Admin User
INSERT INTO users (email, full_name, role, status, created_at)
VALUES (
  'admin@medilink.com',
  'Admin Manager',
  'admin',
  'approved',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Doctor Users
INSERT INTO users (email, full_name, role, status, created_at)
VALUES 
  ('dr.sarah@medilink.com', 'Dr. Sarah Johnson', 'doctor', 'approved', NOW()),
  ('dr.michael@medilink.com', 'Dr. Michael Chen', 'doctor', 'approved', NOW()),
  ('dr.emily@medilink.com', 'Dr. Emily Rodriguez', 'doctor', 'approved', NOW()),
  ('dr.james@medilink.com', 'Dr. James Wilson', 'doctor', 'approved', NOW())
ON CONFLICT (email) DO NOTHING;

-- Patient Users
INSERT INTO users (email, full_name, role, status, created_at)
VALUES 
  ('john.doe@email.com', 'John Doe', 'patient', 'approved', NOW()),
  ('jane.smith@email.com', 'Jane Smith', 'patient', 'approved', NOW()),
  ('robert.brown@email.com', 'Robert Brown', 'patient', 'approved', NOW()),
  ('mary.johnson@email.com', 'Mary Johnson', 'patient', 'approved', NOW()),
  ('david.lee@email.com', 'David Lee', 'patient', 'approved', NOW()),
  ('sarah.williams@email.com', 'Sarah Williams', 'patient', 'approved', NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 2. INSERT DOCTOR PROFILES
-- ============================================================================

INSERT INTO doctors (user_id, specialty, phone_number, license_number, bio, experience_years)
SELECT u.id, d.specialty, d.phone, d.license, d.bio, d.years
FROM (
  VALUES 
    ('dr.sarah@medilink.com', 'Cardiology', '555-0101', 'LIC-001-2020', 'Specializes in heart diseases and cardiovascular care', 12),
    ('dr.michael@medilink.com', 'Orthopedics', '555-0102', 'LIC-002-2019', 'Expert in bone and joint disorders', 15),
    ('dr.emily@medilink.com', 'Dermatology', '555-0103', 'LIC-003-2021', 'Treats skin conditions and allergies', 8),
    ('dr.james@medilink.com', 'General Medicine', '555-0104', 'LIC-004-2018', 'General practitioner and primary care specialist', 20)
) AS d(email, specialty, phone, license, bio, years)
JOIN users u ON u.email = d.email
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 3. INSERT PATIENT PROFILES
-- ============================================================================

INSERT INTO patients (user_id, phone_number, date_of_birth, address, blood_type, medical_history)
SELECT u.id, p.phone, p.dob, p.address, p.blood_type, p.history
FROM (
  VALUES 
    ('john.doe@email.com', '555-1001', '1985-03-15', '123 Main St, Springfield, IL', 'O+', 'No major conditions'),
    ('jane.smith@email.com', '555-1002', '1992-07-22', '456 Oak Ave, Chicago, IL', 'A+', 'Hypertension (controlled)'),
    ('robert.brown@email.com', '555-1003', '1978-11-30', '789 Pine Rd, Evanston, IL', 'B+', 'Diabetes Type 2 (managed)'),
    ('mary.johnson@email.com', '555-1004', '1988-05-18', '321 Elm St, Oak Park, IL', 'AB-', 'Asthma (mild)'),
    ('david.lee@email.com', '555-1005', '1995-09-12', '654 Maple Dr, Naperville, IL', 'O-', 'No major conditions'),
    ('sarah.williams@email.com', '555-1006', '1981-02-28', '987 Cedar Ln, Aurora, IL', 'A-', 'Thyroid disorder (hypothyroidism)')
) AS p(email, phone, dob, address, blood_type, history)
JOIN users u ON u.email = p.email
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 4. INSERT APPOINTMENTS
-- ============================================================================

INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, status, reason)
SELECT 
  d.id,
  p.id,
  a.apt_date,
  a.apt_time,
  a.status,
  a.reason
FROM (
  VALUES 
    -- Dr. Sarah's appointments
    ('dr.sarah@medilink.com', 'john.doe@email.com', NOW() + INTERVAL '3 days', '09:00:00'::time, 'scheduled', 'Regular checkup'),
    ('dr.sarah@medilink.com', 'mary.johnson@email.com', NOW() + INTERVAL '5 days', '14:00:00'::time, 'scheduled', 'Heart palpitations'),
    ('dr.sarah@medilink.com', 'jane.smith@email.com', NOW() - INTERVAL '1 days', '10:30:00'::time, 'completed', 'Blood pressure check'),
    
    -- Dr. Michael's appointments
    ('dr.michael@medilink.com', 'robert.brown@email.com', NOW() + INTERVAL '2 days', '11:00:00'::time, 'scheduled', 'Knee pain treatment'),
    ('dr.michael@medilink.com', 'david.lee@email.com', NOW() + INTERVAL '7 days', '15:00:00'::time, 'scheduled', 'Back pain consultation'),
    ('dr.michael@medilink.com', 'john.doe@email.com', NOW() - INTERVAL '5 days', '13:30:00'::time, 'completed', 'Fractured arm followup'),
    
    -- Dr. Emily's appointments
    ('dr.emily@medilink.com', 'sarah.williams@email.com', NOW() + INTERVAL '4 days', '10:00:00'::time, 'scheduled', 'Skin rash examination'),
    ('dr.emily@medilink.com', 'jane.smith@email.com', NOW() + INTERVAL '6 days', '16:00:00'::time, 'scheduled', 'Allergy testing'),
    
    -- Dr. James's appointments
    ('dr.james@medilink.com', 'mary.johnson@email.com', NOW() + INTERVAL '1 days', '09:30:00'::time, 'scheduled', 'General wellness check'),
    ('dr.james@medilink.com', 'robert.brown@email.com', NOW() - INTERVAL '3 days', '11:00:00'::time, 'completed', 'Diabetes monitoring')
) AS a(doctor_email, patient_email, apt_date, apt_time, status, reason)
JOIN doctors d ON d.user_id = (SELECT id FROM users WHERE email = a.doctor_email)
JOIN patients p ON p.user_id = (SELECT id FROM users WHERE email = a.patient_email)
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE appointments.doctor_id = d.id 
  AND appointments.patient_id = p.id
  AND appointments.appointment_date = a.apt_date
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. INSERT MEDICAL RECORDS
-- ============================================================================

INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes, created_at)
SELECT 
  p.id,
  d.id,
  m.diagnosis,
  m.treatment,
  m.notes,
  m.created
FROM (
  VALUES 
    -- John Doe records
    ('john.doe@email.com', 'dr.sarah@medilink.com', 'Hypertension', 'Lisinopril 10mg daily', 'Patient showing good response to treatment', NOW() - INTERVAL '30 days'),
    ('john.doe@email.com', 'dr.michael@medilink.com', 'Fractured arm', 'Immobilization and physical therapy', 'Healing progressing well', NOW() - INTERVAL '15 days'),
    
    -- Jane Smith records
    ('jane.smith@email.com', 'dr.sarah@medilink.com', 'Hypertension', 'Amlodipine 5mg daily', 'Blood pressure controlled', NOW() - INTERVAL '45 days'),
    ('jane.smith@email.com', 'dr.emily@medilink.com', 'Allergic rhinitis', 'Cetirizine as needed', 'Symptoms manageable', NOW() - INTERVAL '20 days'),
    
    -- Robert Brown records
    ('robert.brown@email.com', 'dr.michael@medilink.com', 'Osteoarthritis of knee', 'Ibuprofen 400mg, physical therapy', 'Mobility improving', NOW() - INTERVAL '60 days'),
    ('robert.brown@email.com', 'dr.james@medilink.com', 'Type 2 Diabetes', 'Metformin 500mg twice daily', 'Blood sugar levels stable', NOW() - INTERVAL '10 days'),
    
    -- Mary Johnson records
    ('mary.johnson@email.com', 'dr.sarah@medilink.com', 'Palpitations', 'EKG normal, monitoring advised', 'Likely anxiety-related', NOW() - INTERVAL '5 days'),
    ('mary.johnson@email.com', 'dr.james@medilink.com', 'Asthma (mild)', 'Albuterol inhaler as needed', 'No recent attacks', NOW() - INTERVAL '25 days'),
    
    -- David Lee records
    ('david.lee@email.com', 'dr.michael@medilink.com', 'Muscle strain', 'Rest and NSAIDs', 'Self-limited condition', NOW() - INTERVAL '8 days'),
    
    -- Sarah Williams records
    ('sarah.williams@email.com', 'dr.james@medilink.com', 'Hypothyroidism', 'Levothyroxine 50mcg daily', 'TSH levels normal', NOW() - INTERVAL '40 days'),
    ('sarah.williams@email.com', 'dr.emily@medilink.com', 'Dermatitis', 'Hydrocortisone 1% cream', 'Improving with treatment', NOW() - INTERVAL '12 days')
) AS m(patient_email, doctor_email, diagnosis, treatment, notes, created)
JOIN patients p ON p.user_id = (SELECT id FROM users WHERE email = m.patient_email)
JOIN doctors d ON d.user_id = (SELECT id FROM users WHERE email = m.doctor_email)
WHERE NOT EXISTS (
  SELECT 1 FROM medical_records 
  WHERE medical_records.patient_id = p.id 
  AND medical_records.doctor_id = d.id
  AND medical_records.diagnosis = m.diagnosis
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. INSERT PRESCRIPTIONS
-- ============================================================================

INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, start_date, end_date, status)
SELECT 
  p.id,
  d.id,
  pr.medication,
  pr.dosage,
  pr.frequency,
  pr.start_dt,
  pr.end_dt,
  pr.status
FROM (
  VALUES 
    -- John Doe prescriptions
    ('john.doe@email.com', 'dr.sarah@medilink.com', 'Lisinopril', '10mg', 'Once daily', NOW() - INTERVAL '30 days', NOW() + INTERVAL '90 days', 'active'),
    
    -- Jane Smith prescriptions
    ('jane.smith@email.com', 'dr.sarah@medilink.com', 'Amlodipine', '5mg', 'Once daily', NOW() - INTERVAL '45 days', NOW() + INTERVAL '75 days', 'active'),
    ('jane.smith@email.com', 'dr.emily@medilink.com', 'Cetirizine', '10mg', 'Once daily as needed', NOW() - INTERVAL '20 days', NOW() + INTERVAL '100 days', 'active'),
    
    -- Robert Brown prescriptions
    ('robert.brown@email.com', 'dr.michael@medilink.com', 'Ibuprofen', '400mg', 'Three times daily with food', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', 'active'),
    ('robert.brown@email.com', 'dr.james@medilink.com', 'Metformin', '500mg', 'Twice daily with meals', NOW() - INTERVAL '90 days', NOW() + INTERVAL '180 days', 'active'),
    
    -- Mary Johnson prescriptions
    ('mary.johnson@email.com', 'dr.james@medilink.com', 'Albuterol', '100mcg', 'Use inhaler 1-2 puffs as needed', NOW() - INTERVAL '25 days', NOW() + INTERVAL '185 days', 'active'),
    
    -- Sarah Williams prescriptions
    ('sarah.williams@email.com', 'dr.james@medilink.com', 'Levothyroxine', '50mcg', 'Once daily on empty stomach', NOW() - INTERVAL '120 days', NOW() + INTERVAL '240 days', 'active'),
    ('sarah.williams@email.com', 'dr.emily@medilink.com', 'Hydrocortisone cream', '1%', 'Apply twice daily to affected area', NOW() - INTERVAL '12 days', NOW() + INTERVAL '48 days', 'active')
) AS pr(patient_email, doctor_email, medication, dosage, frequency, start_dt, end_dt, status)
JOIN patients p ON p.user_id = (SELECT id FROM users WHERE email = pr.patient_email)
JOIN doctors d ON d.user_id = (SELECT id FROM users WHERE email = pr.doctor_email)
WHERE NOT EXISTS (
  SELECT 1 FROM prescriptions 
  WHERE prescriptions.patient_id = p.id 
  AND prescriptions.medication = pr.medication
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. VERIFICATION - Display inserted data
-- ============================================================================

-- Check users count
SELECT COUNT(*) as total_users, 
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
       SUM(CASE WHEN role = 'doctor' THEN 1 ELSE 0 END) as doctors,
       SUM(CASE WHEN role = 'patient' THEN 1 ELSE 0 END) as patients
FROM users;

-- Check doctors
SELECT u.full_name, d.specialty, d.experience_years 
FROM doctors d
JOIN users u ON u.id = d.user_id
ORDER BY u.full_name;

-- Check patients
SELECT u.full_name, p.blood_type, p.date_of_birth
FROM patients p
JOIN users u ON u.id = p.user_id
ORDER BY u.full_name;

-- Check appointments
SELECT 
  u_patient.full_name as patient_name,
  u_doctor.full_name as doctor_name,
  a.appointment_date,
  a.appointment_time,
  a.status,
  a.reason
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN doctors d ON d.id = a.doctor_id
JOIN users u_patient ON u_patient.id = p.user_id
JOIN users u_doctor ON u_doctor.id = d.user_id
ORDER BY a.appointment_date DESC;

-- Check medical records (recent)
SELECT 
  u_patient.full_name as patient_name,
  u_doctor.full_name as doctor_name,
  m.diagnosis,
  m.treatment,
  m.created_at
FROM medical_records m
JOIN patients p ON p.id = m.patient_id
JOIN doctors d ON d.id = m.doctor_id
JOIN users u_patient ON u_patient.id = p.user_id
JOIN users u_doctor ON u_doctor.id = d.user_id
ORDER BY m.created_at DESC;

-- Check prescriptions (active)
SELECT 
  u_patient.full_name as patient_name,
  u_doctor.full_name as doctor_name,
  pr.medication,
  pr.dosage,
  pr.frequency,
  pr.status
FROM prescriptions pr
JOIN patients p ON p.id = pr.patient_id
JOIN doctors d ON d.id = pr.doctor_id
JOIN users u_patient ON u_patient.id = p.user_id
JOIN users u_doctor ON u_doctor.id = d.user_id
WHERE pr.status = 'active'
ORDER BY u_patient.full_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Data inserted:
-- - 1 Admin user
-- - 4 Doctors (specialties: Cardiology, Orthopedics, Dermatology, General Medicine)
-- - 6 Patients
-- - 10 Appointments (mix of scheduled and completed)
-- - 11 Medical records with diagnoses and treatments
-- - 8 Active prescriptions
--
-- Next steps:
-- 1. Test data is now ready
-- 2. Open Patient/Dashboard.html in browser
-- 3. Test in console: await supabasePatient.getPatientAppointments()
-- 4. Your real data should now appear!
-- ============================================================================
