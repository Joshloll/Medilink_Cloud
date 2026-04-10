// ============================================================================
// MEDILINK - ADMIN SERVICE MODULE
// ============================================================================
// Comprehensive admin functions for dashboard, appointments, doctors, patients, etc.
// Uses Supabase for all database operations
// ============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
function getSupabaseCredentials() {
  if (typeof import?.meta?.env?.VITE_SUPABASE_URL !== 'undefined') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  if (typeof process?.env?.VITE_SUPABASE_URL !== 'undefined') {
    return {
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  if (typeof window?.CONFIG !== 'undefined') {
    return {
      url: window.CONFIG.SUPABASE_URL,
      key: window.CONFIG.SUPABASE_ANON_KEY
    };
  }
  
  throw new Error('Supabase credentials not found');
}

const credentials = getSupabaseCredentials();
const supabase = createClient(credentials.url, credentials.key);

// ============================================================================
// ADMIN AUTH & VERIFICATION
// ============================================================================

export async function verifyAdminAccess() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    return data?.role === 'admin';
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

export async function getAdminInfo() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting admin info:', error);
    return null;
  }
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export async function getDashboardStats() {
  try {
    // Get total patients
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get total doctors
    const { count: totalDoctors } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true });

    // Get appointments TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: appointmentsToday } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', today.toISOString().split('T')[0])
      .lte('appointment_date', today.toISOString().split('T')[0]);

    // Get pending approvals
    const { count: pendingApprovals } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      success: true,
      totalPatients: totalPatients || 0,
      totalDoctors: totalDoctors || 0,
      appointmentsToday: appointmentsToday || 0,
      pendingApprovals: pendingApprovals || 0
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: error.message,
      totalPatients: 0,
      totalDoctors: 0,
      appointmentsToday: 0,
      pendingApprovals: 0
    };
  }
}

// ============================================================================
// DOCTOR MANAGEMENT
// ============================================================================

export async function getDoctorsList() {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        user:users(id, email, full_name, status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      doctors: data || []
    };
  } catch (error) {
    console.error('Error getting doctors list:', error);
    return {
      success: false,
      error: error.message,
      doctors: []
    };
  }
}

export async function createDoctor(email, fullName, specialty, licenseNumber) {
  try {
    // Create user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: 'TempPass123!' // Temporary password
    });

    if (authError) throw authError;

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName,
        role: 'doctor',
        status: 'approved',
        created_by_admin: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) throw userError;

    // Create doctor profile
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: userData.id,
        specialty: specialty,
        license_number: licenseNumber,
        availability_status: 'available',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (doctorError) throw doctorError;

    return {
      success: true,
      message: 'Doctor created successfully',
      doctor: doctorData
    };
  } catch (error) {
    console.error('Error creating doctor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function updateDoctor(doctorId, updates) {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctorId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Doctor updated successfully',
      doctor: data
    };
  } catch (error) {
    console.error('Error updating doctor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function deleteDoctor(doctorId) {
  try {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', doctorId);

    if (error) throw error;

    return {
      success: true,
      message: 'Doctor deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// APPOINTMENTS MANAGEMENT
// ============================================================================

export async function getAppointments(filters = {}) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*, user:users(full_name, email)),
        patient:patients(*, user:users(full_name, email))
      `)
      .order('appointment_date', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.date) {
      query = query.eq('appointment_date', filters.date);
    }
    if (filters.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      appointments: data || []
    };
  } catch (error) {
    console.error('Error getting appointments:', error);
    return {
      success: false,
      error: error.message,
      appointments: []
    };
  }
}

export async function createAppointment(doctorId, patientId, date, time, reason) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: date,
        appointment_time: time,
        reason: reason,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Appointment created successfully',
      appointment: data
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function updateAppointmentStatus(appointmentId, status) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: data
    };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function cancelAppointment(appointmentId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Appointment cancelled',
      appointment: data
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// PATIENT MANAGEMENT
// ============================================================================

export async function getPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        user:users(id, email, full_name, status, created_at),
        appointments:appointments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      patients: data || []
    };
  } catch (error) {
    console.error('Error getting patients:', error);
    return {
      success: false,
      error: error.message,
      patients: []
    };
  }
}

export async function getPatientDetails(patientId) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        user:users(*),
        medical_records:medical_records(*),
        appointments:appointments(*),
        prescriptions:prescriptions(*)
      `)
      .eq('id', patientId)
      .single();

    if (error) throw error;

    return {
      success: true,
      patient: data
    };
  } catch (error) {
    console.error('Error getting patient details:', error);
    return {
      success: false,
      error: error.message,
      patient: null
    };
  }
}

export async function updatePatientInfo(patientId, updates) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Patient info updated',
      patient: data
    };
  } catch (error) {
    console.error('Error updating patient:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// USER MANAGEMENT & APPROVALS
// ============================================================================

export async function getPendingUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      users: data || []
    };
  } catch (error) {
    console.error('Error getting pending users:', error);
    return {
      success: false,
      error: error.message,
      users: []
    };
  }
}

export async function approveUserAccount(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'User approved successfully',
      user: data
    };
  } catch (error) {
    console.error('Error approving user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function rejectUserAccount(userId, reason) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'User rejected',
      user: data
    };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getAllUsers(role = null) {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      users: data || []
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      success: false,
      error: error.message,
      users: []
    };
  }
}

// ============================================================================
// MEDICAL RECORDS
// ============================================================================

export async function getMedicalRecords(patientId) {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        doctor:doctors(*, user:users(full_name))
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      records: data || []
    };
  } catch (error) {
    console.error('Error getting medical records:', error);
    return {
      success: false,
      error: error.message,
      records: []
    };
  }
}

export async function addMedicalRecord(patientId, doctorId, diagnosis, treatment, notes) {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis: diagnosis,
        treatment: treatment,
        notes: notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Medical record added',
      record: data
    };
  } catch (error) {
    console.error('Error adding medical record:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// PRESCRIPTIONS
// ============================================================================

export async function getPrescriptions(patientId = null) {
  try {
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(*, user:users(full_name)),
        patient:patients(*, user:users(full_name))
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      prescriptions: data || []
    };
  } catch (error) {
    console.error('Error getting prescriptions:', error);
    return {
      success: false,
      error: error.message,
      prescriptions: []
    };
  }
}

export async function createPrescription(patientId, doctorId, medication, dosage, frequency, startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        medication: medication,
        dosage: dosage,
        frequency: frequency,
        start_date: startDate,
        end_date: endDate || null,
        status: 'active',
        refills_remaining: 3,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Prescription created',
      prescription: data
    };
  } catch (error) {
    console.error('Error creating prescription:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// SYSTEM LOGGING
// ============================================================================

export async function logSystemActivity(action, entityType, entityId, details = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('system_logs')
      .insert({
        user_id: session?.user?.id,
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        details: details,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false };
  }
}

export default {
  verifyAdminAccess,
  getAdminInfo,
  getDashboardStats,
  getDoctorsList,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getPatients,
  getPatientDetails,
  updatePatientInfo,
  getPendingUsers,
  approveUserAccount,
  rejectUserAccount,
  getAllUsers,
  getMedicalRecords,
  addMedicalRecord,
  getPrescriptions,
  createPrescription,
  logSystemActivity
};
