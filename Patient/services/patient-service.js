/**
 * Patient Service Module - Complete Backend Service for Patient Portal
 * Handles all patient operations, appointments, medical records, and prescriptions
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
// PATIENT AUTH & VERIFICATION
// ================================================================

/**
 * Verify if current user is a patient
 * @returns {Promise<Object>} {success: boolean, hasPatientAccess: boolean, patientId: string}
 */
async function verifyPatientAccess() {
    try {
        if (!supabase) {
            return { success: false, hasPatientAccess: false, error: 'Supabase not initialized' };
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError);
            return { success: false, hasPatientAccess: false, error: 'Not authenticated' };
        }

        // Check user role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, status')
            .eq('email', user.email)
            .single();

        if (userError) {
            console.error('User fetch error:', userError);
            return { success: false, hasPatientAccess: false, error: userError.message };
        }

        if (userData.role !== 'patient' || userData.status !== 'approved') {
            return {
                success: false,
                hasPatientAccess: false,
                error: 'Access denied. Patient account required.'
            };
        }

        // Get patient profile
        const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('id, user_id')
            .eq('user_id', userData.id)
            .single();

        if (patientError) {
            console.error('Patient profile fetch error:', patientError);
            return { success: false, hasPatientAccess: false, error: patientError.message };
        }

        return {
            success: true,
            hasPatientAccess: true,
            patientId: patientData.id,
            userId: userData.id,
            email: user.email
        };
    } catch (error) {
        console.error('Patient verification error:', error);
        return { success: false, hasPatientAccess: false, error: error.message };
    }
}

/**
 * Get patient information
 * @returns {Promise<Object>} Patient profile information
 */
async function getPatientInfo() {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data: patientData, error } = await supabase
            .from('patients')
            .select(`
                *,
                user:user_id(id, full_name, email, created_at)
            `)
            .eq('id', accessCheck.patientId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, patient: patientData };
    } catch (error) {
        console.error('Error fetching patient info:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// PATIENT DASHBOARD
// ================================================================

/**
 * Get patient's dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
async function getPatientDashboardStats() {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const patientId = accessCheck.patientId;
        const today = new Date().toISOString().split('T')[0];

        // Get upcoming appointments
        const { data: upcomingAppointments } = await supabase
            .from('appointments')
            .select('id')
            .eq('patient_id', patientId)
            .gte('appointment_date', today)
            .eq('status', 'scheduled');

        // Get medical records count
        const { data: medicalRecords } = await supabase
            .from('medical_records')
            .select('id', { count: 'exact' })
            .eq('patient_id', patientId);

        // Get active prescriptions
        const { data: prescriptions } = await supabase
            .from('prescriptions')
            .select('id')
            .eq('patient_id', patientId)
            .eq('status', 'active');

        // Get total appointments
        const { data: totalAppointments, count: totalCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact' })
            .eq('patient_id', patientId);

        return {
            success: true,
            upcomingAppointments: upcomingAppointments?.length || 0,
            medicalRecords: medicalRecords?.length || 0,
            activePrescriptions: prescriptions?.length || 0,
            totalAppointments: totalCount || 0
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// APPOINTMENTS
// ================================================================

/**
 * Get patient's appointments
 * @param {Object} filters - Filter options (status, date, etc.)
 * @returns {Promise<Object>} List of appointments
 */
async function getPatientAppointments(filters = {}) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        let query = supabase
            .from('appointments')
            .select(`
                *,
                doctor:doctor_id(
                    id,
                    specialty,
                    availability_status,
                    user:user_id(
                        full_name,
                        email
                    )
                )
            `)
            .eq('patient_id', accessCheck.patientId);

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.upcomingOnly) {
            const today = new Date().toISOString().split('T')[0];
            query = query.gte('appointment_date', today);
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
 * Booking an appointment
 * @param {string} doctorId - Doctor ID
 * @param {string} appointmentDate - Appointment date
 * @param {string} appointmentTime - Appointment time
 * @param {string} reason - Reason for visit
 * @returns {Promise<Object>} Created appointment
 */
async function bookAppointment(doctorId, appointmentDate, appointmentTime, reason) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        // Validate doctor exists
        const { data: doctorCheck, error: doctorError } = await supabase
            .from('doctors')
            .select('id')
            .eq('id', doctorId)
            .single();

        if (doctorError || !doctorCheck) {
            return { success: false, error: 'Doctor not found' };
        }

        // Create appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                doctor_id: doctorId,
                patient_id: accessCheck.patientId,
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

        await logPatientActivity('appointment_booked', 'appointments', data[0].id);

        return { success: true, appointment: data[0] };
    } catch (error) {
        console.error('Error booking appointment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Updated appointment
 */
async function cancelAppointment(appointmentId) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .eq('patient_id', accessCheck.patientId)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return { success: false, error: 'Appointment not found or access denied' };
        }

        await logPatientActivity('appointment_cancelled', 'appointments', appointmentId);

        return { success: true, appointment: data[0] };
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Reschedule appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} newDate - New appointment date
 * @param {string} newTime - New appointment time
 * @returns {Promise<Object>} Updated appointment
 */
async function rescheduleAppointment(appointmentId, newDate, newTime) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({
                appointment_date: newDate,
                appointment_time: newTime,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .eq('patient_id', accessCheck.patientId)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return { success: false, error: 'Appointment not found or access denied' };
        }

        await logPatientActivity('appointment_rescheduled', 'appointments', appointmentId);

        return { success: true, appointment: data[0] };
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// MEDICAL RECORDS
// ================================================================

/**
 * Get patient's medical records
 * @returns {Promise<Object>} Medical records
 */
async function getPatientMedicalRecords() {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('medical_records')
            .select(`
                *,
                doctor:doctor_id(
                    user:user_id(full_name)
                )
            `)
            .eq('patient_id', accessCheck.patientId)
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

/**
 * Request medical records from doctor
 * @param {string} recordType - Type of record requested
 * @param {string} reason - Reason for request
 * @returns {Promise<Object>} Request status
 */
async function requestMedicalRecords(recordType, reason) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        // Create a note/request in medical records
        await logPatientActivity('records_requested', 'medical_records', accessCheck.patientId, {
            recordType,
            reason
        });

        return { success: true, message: 'Request submitted successfully' };
    } catch (error) {
        console.error('Error requesting records:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// PRESCRIPTIONS
// ================================================================

/**
 * Get patient's prescriptions
 * @returns {Promise<Object>} Prescriptions
 */
async function getPatientPrescriptions() {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                doctor:doctor_id(
                    user:user_id(full_name)
                )
            `)
            .eq('patient_id', accessCheck.patientId)
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
 * Request prescription refill
 * @param {string} prescriptionId - Prescription ID
 * @param {string} reason - Reason for refill
 * @returns {Promise<Object>} Refill request status
 */
async function requestPrescriptionRefill(prescriptionId, reason = '') {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        // Verify prescription belongs to patient
        const { data: prescription, error: prescError } = await supabase
            .from('prescriptions')
            .select('id')
            .eq('id', prescriptionId)
            .eq('patient_id', accessCheck.patientId)
            .single();

        if (prescError || !prescription) {
            return { success: false, error: 'Prescription not found' };
        }

        await logPatientActivity('refill_requested', 'prescriptions', prescriptionId, { reason });

        return { success: true, message: 'Refill request submitted' };
    } catch (error) {
        console.error('Error requesting refill:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// DOCTORS DIRECTORY
// ================================================================

/**
 * Get list of available doctors
 * @param {Object} filters - Filter options (specialty, availability, etc.)
 * @returns {Promise<Object>} List of doctors
 */
async function getAvailableDoctors(filters = {}) {
    try {
        let query = supabase
            .from('doctors')
            .select(`
                *,
                user:user_id(
                    full_name,
                    email
                )
            `)
            .eq('availability_status', 'online');

        if (filters.specialty) {
            query = query.eq('specialty', filters.specialty);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, doctors: data };
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get doctor details
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor information
 */
async function getDoctorDetails(doctorId) {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select(`
                *,
                user:user_id(
                    full_name,
                    email
                )
            `)
            .eq('id', doctorId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, doctor: data };
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// PATIENT PROFILE
// ================================================================

/**
 * Update patient profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated profile
 */
async function updatePatientProfile(updates) {
    try {
        const accessCheck = await verifyPatientAccess();
        if (!accessCheck.success) {
            return { success: false, error: 'Not authorized' };
        }

        const { data, error } = await supabase
            .from('patients')
            .update(updates)
            .eq('id', accessCheck.patientId)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        await logPatientActivity('profile_updated', 'patients', accessCheck.patientId);

        return { success: true, patient: data[0] };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

// ================================================================
// ACTIVITY LOGGING
// ================================================================

/**
 * Log patient activity
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity
 * @param {string} entityId - Entity ID
 * @param {Object} details - Additional details
 * @returns {Promise<Object>}
 */
async function logPatientActivity(action, entityType, entityId, details = {}) {
    try {
        const accessCheck = await verifyPatientAccess();
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

const patientService = {
    // Auth
    verifyPatientAccess,
    getPatientInfo,

    // Dashboard
    getPatientDashboardStats,

    // Appointments
    getPatientAppointments,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,

    // Medical Records
    getPatientMedicalRecords,
    requestMedicalRecords,

    // Prescriptions
    getPatientPrescriptions,
    requestPrescriptionRefill,

    // Doctors
    getAvailableDoctors,
    getDoctorDetails,

    // Profile
    updatePatientProfile,

    // Logging
    logPatientActivity
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = patientService;
}
