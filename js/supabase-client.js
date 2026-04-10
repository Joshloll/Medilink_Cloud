/**
 * Supabase Client Configuration
 * 
 * ⚠️ SECURITY NOTICE:
 * Credentials are loaded from environment variables, NOT hardcoded.
 * .env file is .gitignored and never committed to version control.
 * 
 * For development: Create .env file (see .env.example)
 * For production: Set environment variables in your hosting platform
 */

// ============================================================================
// LOAD CREDENTIALS FROM ENVIRONMENT VARIABLES
// ============================================================================

function getSupabaseCredentials() {
  // Method 1: Vite environment variables (recommended)
  if (import.meta && import.meta.env) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, key };
  }
  
  // Method 2: Process environment variables (Node.js build)
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, key };
  }
  
  // Method 3: Window object (injected at runtime)
  if (typeof window !== 'undefined' && window.__CONFIG__) {
    const { supabaseUrl: url, supabaseAnonKey: key } = window.__CONFIG__;
    if (url && key) return { url, key };
  }
  
  // Method 4: Global fetch from config file (safe endpoint)
  // This would call a secure config endpoint that serves public values only
  
  return null;
}

// Load credentials
const credentials = getSupabaseCredentials();

if (!credentials) {
  console.error(
    '❌ SUPABASE CONFIGURATION ERROR\n' +
    '═'.repeat(60) + '\n' +
    'Missing Supabase credentials. Please ensure:\n\n' +
    '📝 For Local Development:\n' +
    '   1. Copy .env.example to .env\n' +
    '   2. Add your VITE_SUPABASE_URL\n' +
    '   3. Add your VITE_SUPABASE_ANON_KEY\n' +
    '   4. Restart your dev server\n\n' +
    '🚀 For Production:\n' +
    '   1. Set environment variables in your hosting platform\n' +
    '      - Vercel: Project Settings → Environment Variables\n' +
    '      - Netlify: Site Settings → Build & Deploy → Environment\n' +
    '      - Other: Consult your platform documentation\n' +
    '   2. Use VITE_ prefix for frontend variables\n' +
    '   3. Never commit .env file to version control\n' +
    '═'.repeat(60)
  );
  throw new Error('Supabase configuration is missing.');
}

const SUPABASE_URL = credentials.url;
const SUPABASE_ANON_KEY = credentials.key;

// Initialize Supabase client
let supabaseClient = null;

async function initSupabase() {
  try {
    // Verify Supabase library is loaded via CDN
    if (!window.supabase) {
      const error = new Error(
        'Supabase library not loaded. Ensure you have:\n' +
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n' +
        'in your HTML file before this script.'
      );
      console.error('✗', error.message);
      throw error;
    }

    // Verify credentials are loaded
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials are not configured.');
    }

    // Initialize client with secure credentials
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✓ Supabase client initialized successfully');
    console.log(`✓ Project: ${SUPABASE_URL.split('.')[0].split('//')[1]}`);
    
    return supabaseClient;
  } catch (error) {
    console.error('✗ Failed to initialize Supabase:', error.message);
    return null;
  }
}

// Get Supabase client instance
function getSupabaseClient() {
  if (!supabaseClient) {
    console.error('Supabase client not initialized. Call initSupabase() first.');
    return null;
  }
  return supabaseClient;
}

// Authentication Functions
const supabaseAuth = {
  // Register a new user
  async registerUser(email, fullName, role = 'patient') {
    try {
      const client = getSupabaseClient();
      
      // 1. Create auth user
      const { data: authData, error: authError } = await client.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        options: {
          data: { full_name: fullName, role }
        }
      });

      if (authError) throw authError;

      // 2. Create user record in database
      const { data: userData, error: userError } = await client
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          status: role === 'admin' ? 'approved' : 'pending',
          created_by_admin: false
        })
        .select()
        .single();

      if (userError) throw userError;

      return { success: true, user: userData, message: 'Registration successful. Awaiting admin approval.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  async loginUser(email, password) {
    try {
      const client = getSupabaseClient();
      
      const { data: authData, error: authError } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Get user record to check status and role
      const { data: userData, error: userError } = await client
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      // Check if user is approved
      if (userData.status === 'pending') {
        await client.auth.signOut();
        return { success: false, error: 'Your account is pending admin approval.' };
      }

      if (userData.status === 'rejected') {
        await client.auth.signOut();
        return { success: false, error: 'Your account has been rejected.' };
      }

      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const client = getSupabaseClient();
      
      const { data: { user: authUser }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;

      if (!authUser) return null;

      const { data: userData, error: userError } = await client
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout user
  async logoutUser() {
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Request password reset
  async resetPassword(email) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, message: 'Reset link sent to email' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Admin Functions
const supabaseAdmin = {
  // Get pending users
  async getPendingUsers() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, users: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Approve user
  async approveUser(userId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reject user
  async rejectUser(userId, reason = '') {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get system statistics
  async getSystemStats() {
    try {
      const client = getSupabaseClient();

      // Get counts
      const [patients, doctors, appointments, pending] = await Promise.all([
        client.from('patients').select('*', { count: 'exact', head: true }),
        client.from('doctors').select('*', { count: 'exact', head: true }),
        client.from('appointments').select('*', { count: 'exact', head: true }),
        client.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        success: true,
        stats: {
          totalPatients: patients.count || 0,
          totalDoctors: doctors.count || 0,
          totalAppointments: appointments.count || 0,
          pendingApprovals: pending.count || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create user by admin
  async createUserByAdmin(email, fullName, role) {
    try {
      const client = getSupabaseClient();
      
      // Use Supabase admin API or create through regular signup
      const { data, error } = await supabaseAuth.registerUser(email, fullName, role);
      
      if (data && role !== 'admin') {
        // Auto-approve if created by admin
        await this.approveUser(data.id);
      }

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Doctor Functions
const supabaseDoctor = {
  // Get doctor profile
  async getDoctorProfile(userId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, doctor: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update doctor profile
  async updateDoctorProfile(userId, updates) {
    try {
      const client = getSupabaseClient();
      
      // Get doctor ID first
      const { data: doctor, error: getError } = await client
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (getError) throw getError;

      // Update doctor record
      const { data, error } = await client
        .from('doctors')
        .update(updates)
        .eq('id', doctor.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, doctor: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get doctor's appointments
  async getDoctorAppointments(userId, status = null) {
    try {
      const client = getSupabaseClient();
      
      // Get doctor ID
      const { data: doctor } = await client
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!doctor) throw new Error('Doctor profile not found');

      // Get appointments
      let query = client
        .from('appointments')
        .select('*, patients(id, full_name, phone_number), doctors(specialty)')
        .eq('doctor_id', doctor.id);

      if (status) query = query.eq('status', status);

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;
      return { success: true, appointments: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, appointment: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add medical record
  async addMedicalRecord(patientId, doctorId, recordData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('medical_records')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          ...recordData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, record: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create prescription
  async createPrescription(patientId, doctorId, prescriptionData) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          ...prescriptionData,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, prescription: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Patient Functions
const supabasePatient = {
  // Get patient profile
  async getPatientProfile(userId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, patient: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update patient profile
  async updatePatientProfile(userId, updates) {
    try {
      const client = getSupabaseClient();
      
      // Get patient ID first
      const { data: patient, error: getError } = await client
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (getError) throw getError;

      // Update patient record
      const { data, error } = await client
        .from('patients')
        .update(updates)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, patient: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get patient's appointments
  async getPatientAppointments(userId) {
    try {
      const client = getSupabaseClient();
      
      // Get patient ID
      const { data: patient } = await client
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) throw new Error('Patient profile not found');

      // Get appointments
      const { data, error } = await client
        .from('appointments')
        .select('*, doctors(full_name, specialization, user_id)')
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return { success: true, appointments: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Book appointment
  async bookAppointment(userId, doctorId, appointmentData) {
    try {
      const client = getSupabaseClient();
      
      // Get patient ID
      const { data: patient } = await client
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) throw new Error('Patient profile not found');

      // Create appointment
      const { data, error } = await client
        .from('appointments')
        .insert({
          patient_id: patient.id,
          doctor_id: doctorId,
          ...appointmentData,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, appointment: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Cancel appointment
  async cancelAppointment(appointmentId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, appointment: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get medical records
  async getMedicalRecords(userId) {
    try {
      const client = getSupabaseClient();
      
      // Get patient ID
      const { data: patient } = await client
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) throw new Error('Patient profile not found');

      // Get records
      const { data, error } = await client
        .from('medical_records')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('is_visible_to_patient', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, records: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get prescriptions
  async getPrescriptions(userId) {
    try {
      const client = getSupabaseClient();
      
      // Get patient ID
      const { data: patient } = await client
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) throw new Error('Patient profile not found');

      // Get prescriptions
      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('prescribed_date', { ascending: false });

      if (error) throw error;
      return { success: true, prescriptions: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Request prescription refill
  async requestRefill(prescriptionId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('prescriptions')
        .update({ status: 'refill-requested' })
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, prescription: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Appointments Functions
const supabaseAppointments = {
  // Get all appointments (admin)
  async getAllAppointments(filters = {}) {
    try {
      const client = getSupabaseClient();
      
      let query = client
        .from('appointments')
        .select('*, patients(full_name), doctors(full_name, specialization)');

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.doctorId) query = query.eq('doctor_id', filters.doctorId);
      if (filters.date) query = query.eq('appointment_date', filters.date);

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;
      return { success: true, appointments: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get available doctors for date
  async getAvailableDoctors(appointmentDate) {
    try {
      const client = getSupabaseClient();
      
      // Get all available doctors
      const { data, error } = await client
        .from('doctors')
        .select('*, users(full_name, email)')
        .eq('is_available', true);

      if (error) throw error;

      // Filter by availability
      const availableDoctors = data.filter(doctor => {
        const dayOfWeek = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' });
        return doctor.working_days && doctor.working_days.includes(dayOfWeek);
      });

      return { success: true, doctors: availableDoctors };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export for use in modules
window.supabaseAuth = supabaseAuth;
window.supabaseAdmin = supabaseAdmin;
window.supabaseDoctor = supabaseDoctor;
window.supabasePatient = supabasePatient;
window.supabaseAppointments = supabaseAppointments;
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
