/**
 * GLOBAL STATE MANAGEMENT
 * Single source of truth for the entire application
 * All data flows through this state object
 */

const state = {
    // Current authenticated user
    currentUser: null,
    
    // All users in the system
    users: [
        {
            id: 'admin-001',
            email: 'admin@medilinkcloud.com',
            password: 'admin123', // Demo only - never store plaintext passwords
            role: 'admin',
            name: 'System Admin',
            status: 'approved',
            created_by_admin: true,
            created_at: new Date().toISOString()
        }
    ],
    
    // Patient records
    patients: [],
    
    // Doctor records
    doctors: [],
    
    // Appointments
    appointments: [],
    
    // Medical records
    records: [],
    
    // Prescriptions
    prescriptions: [],
    
    // System alerts/logs
    logs: []
};

/**
 * Helper to find user by email
 */
function getUserByEmail(email) {
    return state.users.find(user => user.email === email);
}

/**
 * Helper to find user by ID
 */
function getUserById(id) {
    return state.users.find(user => user.id === id);
}

/**
 * Helper to find doctor by ID
 */
function getDoctorById(id) {
    return state.doctors.find(doctor => doctor.id === id);
}

/**
 * Helper to find patient by ID
 */
function getPatientById(id) {
    return state.patients.find(patient => patient.id === id);
}

/**
 * Helper to find appointment by ID
 */
function getAppointmentById(id) {
    return state.appointments.find(apt => apt.id === id);
}

/**
 * Generate unique IDs
 */
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add system log
 */
function addLog(action, details, userId = null) {
    state.logs.push({
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        action,
        details,
        userId
    });
}

/**
 * Add toast notification
 */
function showToast(message, type = 'info') {
    const event = new CustomEvent('showToast', {
        detail: { message, type }
    });
    document.dispatchEvent(event);
}
