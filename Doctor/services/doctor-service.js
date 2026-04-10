/**
 * Doctor Service Module - Complete Backend Service for Doctor Portal
 * Handles all doctor operations, appointments, prescriptions, and patient management
 * Integrates with Supabase backend for real data operations
 */

// Initialize Supabase client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jhjnvvgavlabgsowxjfq.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoanZudmdhbmxhYmdzb3d4amZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MjczMDUsImV4cCI6MjA0ODIwMzMwNX0.FP3TJagL_58BDwL7GZXDN5ijQVtRgBzpQFCPqCNs8pQ';

let supabase;

// Initialize when module loads
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ================================================================
// DOCTOR AUTH & VERIFICATION
// ================================================================

/**
 * Verify if current user is a doctor
 * @returns {Promise<Object>} {success: boolean, hasDoctorAccess: boolean, doctorId: string}
 */
async function verifyDoctorAccess() {
    try {
        if (!supabase) {
            return { success: false, hasDoctorAccess: false, error: 'Supabase not initialized' };
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError);
            return { success: false, hasDoctorAccess: false, error: 'Not authenticated' };
        }

        // Check user role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, status')
            .eq('email', user.email)
            .single();

        if (userError) {
            console.error('User fetch error:', userError);
            return { success: false, hasDoctorAccess: false, error: userError.message };
        }

        if (userData.role !== 'doctor' || userData.status !== 'approved') {
            return {
                success: false,
                hasDoctorAccess: false,
                error: 'Access denied. Doctor account required.'
            };
        }

        // Get doctor profile
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id, user_id')
            .eq('user_id', userData.id)
            .single();

        if (doctorError) {
            console.error('Doctor profile fetch error:', doctorError);
            return { success: false, hasDoctorAccess: false, error: doctorError.message };
        }

        return {
            success: true,
            hasDoctorAccess: true,
            doctorId: doctorData.id,
            userId: userData.id,
            email: user.email
        };
    } catch (error) {
        console.error('Doctor verification error:', error);
        return { success: false, hasDoctorAccess: false, error: error.message };
    }
}

/**
 * Get doctor information
 * @returns {Promise<Object>} Doctor profile information
 */
async function getDoctorInfo() {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data: doctorData, error } = await supabase
            .from('doctors')
            .select(`
                *,
                user:user_id(id, full_name, email, created_at)
            `)
            .eq('id', accessCheck.doctorId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, doctor: doctorData };
    } catch (error) {
        console.error('Error fetching doctor info:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// DOCTOR DASHBOARD & APPOINTMENTS
// ================================================================

/**
 * Get doctor's dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
async function getDoctorDashboardStats() {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const doctorId = accessCheck.doctorId;
        const today = new Date().toISOString().split('T')[0];

        // Get today's appointments
        const { data: todayAppointments, error: todayError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('appointment_date', today);

        // Get total patients
        const { data: patients, error: patientsError } = await supabase
            .from('appointments')
            .select('patient_id', { count: 'exact' })
            .eq('doctor_id', doctorId);

        // Get pending prescriptions
        const { data: pendingPrescriptions, error: prescError } = await supabase
            .from('prescriptions')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('status', 'pending');

        // Get completed appointments this month
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const { data: completedAppointments, error: completedError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('status', 'completed')
            .gte('appointment_date', monthStart);

        return {
            success: true,
            appointmentsToday: todayAppointments?.length || 0,
            totalPatients: new Set(patients?.map(p => p.patient_id))?.size || 0,
            pendingPrescriptions: pendingPrescriptions?.length || 0,
            completedThisMonth: completedAppointments?.length || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get doctor's appointments
 * @param {Object} filters - Filter options (date, status, etc.)
 * @returns {Promise<Object>} List of appointments
 */
async function getDoctorAppointments(filters = {}) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        let query = supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id(
                    id,
                    user:user_id(
                        full_name,
                        email
                    ),
                    blood_type
                ),
                doctor:doctor_id(id, user_id)
            `)
            .eq('doctor_id', accessCheck.doctorId);

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.date) {
            query = query.eq('appointment_date', filters.date);
        }

        const { data, error } = await query.order('appointment_date', { ascending: true });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, appointments: data };
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment ID
 * @param {string} status - New status (completed, no_show, cancelled)
 * @returns {Promise<Object>} Updated appointment
 */
async function updateAppointmentStatus(appointmentId, status) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .eq('doctor_id', accessCheck.doctorId)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return { success: false, error: 'Appointment not found or access denied' };
        }

        // Log activity
        await logDoctorActivity('appointment_updated', 'appointments', appointmentId, {
            newStatus: status
        });

        return { success: true, appointment: data[0] };
    } catch (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new appointment
 * @param {string} patientId - Patient ID
 * @param {string} appointmentDate - Appointment date
 * @param {string} appointmentTime - Appointment time
 * @param {string} reason - Reason for visit
 * @returns {Promise<Object>} Created appointment
 */
async function createAppointment(patientId, appointmentDate, appointmentTime, reason) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert({
                doctor_id: accessCheck.doctorId,
                patient_id: patientId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                reason: reason,
                status: 'scheduled',
                created_at: new Date().toISOString()
            })
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        await logDoctorActivity('appointment_created', 'appointments', data[0].id);

        return { success: true, appointment: data[0] };
    } catch (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// PATIENT MANAGEMENT
// ================================================================

/**
 * Get doctor's patients
 * @returns {Promise<Object>} List of patients
 */
async function getDoctorPatients() {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        // Get unique patients from appointments
        const { data: appointmentData, error: appointmentError } = await supabase
            .from('appointments')
            .select('patient_id')
            .eq('doctor_id', accessCheck.doctorId)
            .eq('status', 'completed');

        if (appointmentError) {
            return { success: false, error: appointmentError.message };
        }

        const patientIds = [...new Set(appointmentData.map(a => a.patient_id))];

        if (patientIds.length === 0) {
            return { success: true, patients: [] };
        }

        // Get patient details
        const { data: patients, error: patientError } = await supabase
            .from('patients')
            .select(`
                *,
                user:user_id(
                    full_name,
                    email
                )
            `)
            .in('id', patientIds);

        if (patientError) {
            return { success: false, error: patientError.message };
        }

        return { success: true, patients };
    } catch (error) {
        console.error('Error fetching patients:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get patient details including medical history
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Patient information
 */
async function getPatientDetails(patientId) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        // Get patient info
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select(`
                *,
                user:user_id(
                    full_name,
                    email,
                    phone
                )
            `)
            .eq('id', patientId)
            .single();

        if (patientError) {
            return { success: false, error: patientError.message };
        }

        // Get medical records
        const { data: records, error: recordsError } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        // Get prescriptions
        const { data: prescriptions, error: prescError } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        return {
            success: true,
            patient,
            medicalRecords: records || [],
            prescriptions: prescriptions || []
        };
    } catch (error) {
        console.error('Error fetching patient details:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// MEDICAL RECORDS
// ================================================================

/**
 * Create medical record for patient
 * @param {string} patientId - Patient ID
 * @param {string} diagnosis - Diagnosis
 * @param {string} treatment - Treatment provided
 * @param {string} notes - Additional notes
 * @returns {Promise<Object>} Created record
 */
async function createMedicalRecord(patientId, diagnosis, treatment, notes = '') {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('medical_records')
            .insert({
                patient_id: patientId,
                doctor_id: accessCheck.doctorId,
                diagnosis: diagnosis,
                treatment: treatment,
                notes: notes,
                created_at: new Date().toISOString()
            })
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        await logDoctorActivity('record_created', 'medical_records', data[0].id);

        return { success: true, record: data[0] };
    } catch (error) {
        console.error('Error creating medical record:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get medical records for patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Medical records
 */
async function getPatientMedicalRecords(patientId) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, records: data };
    } catch (error) {
        console.error('Error fetching medical records:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// PRESCRIPTIONS
// ================================================================

/**
 * Create prescription for patient
 * @param {string} patientId - Patient ID
 * @param {string} medication - Medication name
 * @param {string} dosage - Dosage
 * @param {string} frequency - Frequency (e.g., "3 times daily")
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>} Created prescription
 */
async function createPrescription(patientId, medication, dosage, frequency, startDate, endDate) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .insert({
                patient_id: patientId,
                doctor_id: accessCheck.doctorId,
                medication: medication,
                dosage: dosage,
                frequency: frequency,
                start_date: startDate,
                end_date: endDate,
                status: 'active',
                created_at: new Date().toISOString()
            })
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        await logDoctorActivity('prescription_created', 'prescriptions', data[0].id);

        return { success: true, prescription: data[0] };
    } catch (error) {
        console.error('Error creating prescription:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get patient's prescriptions
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Prescriptions
 */
async function getPatientPrescriptions(patientId) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, prescriptions: data };
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update prescription status
 * @param {string} prescriptionId - Prescription ID
 * @param {string} status - New status (active, completed, cancelled)
 * @returns {Promise<Object>} Updated prescription
 */
async function updatePrescriptionStatus(prescriptionId, status) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', prescriptionId)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        await logDoctorActivity('prescription_updated', 'prescriptions', prescriptionId);

        return { success: true, prescription: data[0] };
    } catch (error) {
        console.error('Error updating prescription:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// ACTIVITY LOGGING
// ================================================================

/**
 * Log doctor activity
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity (appointments, prescriptions, etc.)
 * @param {string} entityId - Entity ID
 * @param {Object} details - Additional details
 * @returns {Promise<Object>}
 */
async function logDoctorActivity(action, entityType, entityId, details = {}) {
    try {
        const accessCheck = await verifyDoctorAccess();
        if (!accessCheck.success) return { success: false };

        await supabase
            .from('system_logs')
            .insert({
                user_id: accessCheck.userId,
                action: action,
                entity_type: entityType,
                entity_id: entityId,
                details: JSON.stringify(details),
                created_at: new Date().toISOString()
            });

        return { success: true };
    } catch (error) {
        console.error('Error logging activity:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// EXPORT ALL FUNCTIONS
// ================================================================

const doctorService = {
    // Auth
    verifyDoctorAccess,
    getDoctorInfo,

    // Dashboard
    getDoctorDashboardStats,

    // Appointments
    getDoctorAppointments,
    updateAppointmentStatus,
    createAppointment,

    // Patients
    getDoctorPatients,
    getPatientDetails,

    // Medical Records
    createMedicalRecord,
    getPatientMedicalRecords,

    // Prescriptions
    createPrescription,
    getPatientPrescriptions,
    updatePrescriptionStatus,

    // Logging
    logDoctorActivity
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = doctorService;
}
