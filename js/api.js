/**
 * MOCK API - Simulates backend behavior
 * Provides async operations with realistic delays
 * Ready to be replaced with real Supabase calls
 */

/**
 * Generic async simulator with delay
 * @param {any} data - Data to return
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} shouldFail - Simulate failure
 * @returns {Promise}
 */
async function simulate(data, delay = 300, shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error('API request failed'));
            } else {
                resolve(data);
            }
        }, delay);
    });
}

/**
 * AUTH API ENDPOINTS
 */
const authAPI = {
    /**
     * Register new user
     */
    async register(email, password, role, name) {
        const existingUser = getUserByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: generateId('user'),
            email,
            password, // Demo only
            name,
            role,
            status: 'pending', // New users need approval
            created_by_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        state.users.push(newUser);
        addLog('USER_REGISTERED', { email, role }, null);

        return await simulate({ success: true, user: newUser });
    },

    /**
     * Login user
     */
    async login(email, password) {
        const user = getUserByEmail(email);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        if (user.status === 'pending') {
            throw new Error('Your account is pending admin approval. Please try again later.');
        }

        if (user.status === 'rejected') {
            throw new Error('Your account has been rejected. Contact admin for details.');
        }

        addLog('USER_LOGIN', { email }, user.id);
        return await simulate({ success: true, user });
    },

    /**
     * Get current user
     */
    async getCurrentUser(userId) {
        const user = getUserById(userId);
        if (!user) throw new Error('User not found');
        return await simulate(user);
    }
};

/**
 * ADMIN API ENDPOINTS
 */
const adminAPI = {
    /**
     * Get all pending users
     */
    async getPendingUsers() {
        const pending = state.users.filter(u => u.status === 'pending');
        return await simulate(pending);
    },

    /**
     * Approve user registration
     */
    async approveUser(userId) {
        const user = getUserById(userId);
        if (!user) throw new Error('User not found');

        user.status = 'approved';
        user.updated_at = new Date().toISOString();

        if (user.role === 'doctor') {
            // Create doctor profile
            state.doctors.push({
                id: generateId('doctor'),
                user_id: user.id,
                name: user.name,
                email: user.email,
                specialty: '',
                license_number: '',
                bio: '',
                status: 'active',
                working_hours: {},
                created_at: new Date().toISOString()
            });
        }

        if (user.role === 'patient') {
            // Create patient profile
            state.patients.push({
                id: generateId('patient'),
                user_id: user.id,
                name: user.name,
                email: user.email,
                dob: '',
                phone: '',
                address: '',
                insurance: {},
                medical_history: [],
                allergies: [],
                created_at: new Date().toISOString()
            });
        }

        addLog('USER_APPROVED', { user_id: userId }, state.currentUser?.id);
        return await simulate({ success: true, user });
    },

    /**
     * Reject user registration
     */
    async rejectUser(userId, reason = '') {
        const user = getUserById(userId);
        if (!user) throw new Error('User not found');

        user.status = 'rejected';
        user.rejection_reason = reason;
        user.updated_at = new Date().toISOString();

        addLog('USER_REJECTED', { user_id: userId, reason }, state.currentUser?.id);
        return await simulate({ success: true, user });
    },

    /**
     * Get system statistics
     */
    async getSystemStats() {
        const stats = {
            total_patients: state.patients.length,
            total_doctors: state.doctors.length,
            total_appointments: state.appointments.length,
            today_appointments: state.appointments.filter(apt => {
                const aptDate = new Date(apt.date).toDateString();
                const today = new Date().toDateString();
                return aptDate === today;
            }).length,
            pending_users: state.users.filter(u => u.status === 'pending').length,
            active_users: state.users.filter(u => u.status === 'approved').length
        };

        return await simulate(stats);
    }
};

/**
 * APPOINTMENTS API ENDPOINTS
 */
const appointmentsAPI = {
    /**
     * Book new appointment
     */
    async bookAppointment(data) {
        const appointment = {
            id: generateId('apt'),
            patient_id: data.patient_id,
            doctor_id: data.doctor_id,
            date: data.date,
            time: data.time,
            reason: data.reason,
            status: 'pending',
            notes: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        state.appointments.push(appointment);
        addLog('APPOINTMENT_BOOKED', { appointment_id: appointment.id }, data.patient_id);

        return await simulate(appointment);
    },

    /**
     * Update appointment status
     */
    async updateAppointmentStatus(appointmentId, status) {
        const appointment = getAppointmentById(appointmentId);
        if (!appointment) throw new Error('Appointment not found');

        appointment.status = status;
        appointment.updated_at = new Date().toISOString();

        addLog('APPOINTMENT_STATUS_UPDATED', { appointment_id: appointmentId, status }, state.currentUser?.id);
        return await simulate(appointment);
    },

    /**
     * Get appointments for patient
     */
    async getPatientAppointments(patientId) {
        const appointments = state.appointments.filter(apt => apt.patient_id === patientId);
        return await simulate(appointments);
    },

    /**
     * Get appointments for doctor
     */
    async getDoctorAppointments(doctorId) {
        const appointments = state.appointments.filter(apt => apt.doctor_id === doctorId);
        return await simulate(appointments);
    },

    /**
     * Cancel appointment
     */
    async cancelAppointment(appointmentId) {
        const appointment = getAppointmentById(appointmentId);
        if (!appointment) throw new Error('Appointment not found');

        appointment.status = 'cancelled';
        appointment.updated_at = new Date().toISOString();

        addLog('APPOINTMENT_CANCELLED', { appointment_id: appointmentId }, state.currentUser?.id);
        return await simulate(appointment);
    }
};

/**
 * MEDICAL RECORDS API ENDPOINTS
 */
const recordsAPI = {
    /**
     * Create medical record
     */
    async createRecord(data) {
        const record = {
            id: generateId('record'),
            patient_id: data.patient_id,
            doctor_id: data.doctor_id,
            appointment_id: data.appointment_id,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            notes: data.notes,
            prescriptions: data.prescriptions || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        state.records.push(record);
        addLog('RECORD_CREATED', { record_id: record.id, patient_id: data.patient_id }, data.doctor_id);

        return await simulate(record);
    },

    /**
     * Get patient medical records
     */
    async getPatientRecords(patientId) {
        const records = state.records.filter(r => r.patient_id === patientId);
        return await simulate(records);
    }
};

/**
 * PRESCRIPTIONS API ENDPOINTS
 */
const prescriptionsAPI = {
    /**
     * Create prescription
     */
    async createPrescription(data) {
        const prescription = {
            id: generateId('rx'),
            patient_id: data.patient_id,
            doctor_id: data.doctor_id,
            medication: data.medication,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            refills_remaining: data.refills || 3,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        state.prescriptions.push(prescription);
        addLog('PRESCRIPTION_CREATED', { prescription_id: prescription.id }, data.doctor_id);

        return await simulate(prescription);
    },

    /**
     * Request refill
     */
    async requestRefill(prescriptionId) {
        const prescription = state.prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) throw new Error('Prescription not found');

        if (prescription.refills_remaining <= 0) {
            throw new Error('No refills remaining. Contact doctor for new prescription.');
        }

        prescription.refills_remaining--;
        prescription.updated_at = new Date().toISOString();

        addLog('REFILL_REQUESTED', { prescription_id: prescriptionId }, prescription.patient_id);
        return await simulate(prescription);
    },

    /**
     * Get patient prescriptions
     */
    async getPatientPrescriptions(patientId) {
        const prescriptions = state.prescriptions.filter(p => p.patient_id === patientId);
        return await simulate(prescriptions);
    }
};

/**
 * Export all API modules
 */
const api = {
    simulate,
    auth: authAPI,
    admin: adminAPI,
    appointments: appointmentsAPI,
    records: recordsAPI,
    prescriptions: prescriptionsAPI
};
