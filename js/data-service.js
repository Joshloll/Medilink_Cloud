/**
 * ============================================================================
 * DATA MANAGEMENT LAYER WITH ROLE-BASED ACCESS & ERROR HANDLING
 * ============================================================================
 * Centralized data fetching, caching, and role-based security
 * ============================================================================
 */

import { showError, clearCache, getCache, setCache } from './api-utils.js';

// User session management
export const sessionManager = {
  user: null,
  role: null,
  token: null,

  /**
   * Initialize session from storage
   */
  init() {
    const stored = sessionStorage.getItem('medilink_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        this.user = session.user;
        this.role = session.role;
        this.token = session.token;
        console.log('✅ Session restored:', session.role);
        return true;
      } catch (error) {
        console.error('Failed to parse session:', error);
        this.clear();
        return false;
      }
    }
    return false;
  },

  /**
   * Set user session
   */
  set(user, role, token) {
    this.user = user;
    this.role = role;
    this.token = token;

    sessionStorage.setItem('medilink_session', JSON.stringify({
      user,
      role,
      token,
      timestamp: Date.now()
    }));

    console.log('✅ Session saved for role:', role);
  },

  /**
   * Clear session
   */
  clear() {
    this.user = null;
    this.role = null;
    this.token = null;
    sessionStorage.removeItem('medilink_session');
    console.log('🚪 Session cleared');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user && !!this.role;
  },

  /**
   * Check user role
   */
  hasRole(role) {
    if (!Array.isArray(role)) {
      role = [role];
    }
    return role.includes(this.role);
  }
};

/**
 * Role-based routing guard
 */
export function enforceRoleAccess(requiredRoles) {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }

  if (!sessionManager.isAuthenticated()) {
    showError('Please log in first');
    setTimeout(() => {
      window.location.href = '/Login_Register/Login.html';
    }, 1500);
    return false;
  }

  if (!sessionManager.hasRole(requiredRoles)) {
    showError('You do not have permission to access this page');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
    return false;
  }

  return true;
}

/**
 * Data layer for all CRUD operations
 */
export const dataService = {
  
  // ============= USERS =============

  /**
   * Fetch all users
   */
  async getUsers(filters = {}) {
    try {
      // Check authorization
      if (!sessionManager.hasRole(['admin'])) {
        throw new Error('Not authorized to view users');
      }

      // Try cache first
      const cacheKey = `users_${JSON.stringify(filters)}`;
      const cached = getCache(cacheKey);
      if (cached) return { success: true, data: cached };

      // Simulate API call
      const response = await this.simulateRequest([
        { id: 1, email: 'admin@test.com', role: 'admin', status: 'approved' },
        { id: 2, email: 'doctor@test.com', role: 'doctor', status: 'pending' },
        { id: 3, email: 'patient@test.com', role: 'patient', status: 'pending' }
      ], 500);

      setCache(cacheKey, response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Get pending users (for admin)
   */
  async getPendingUsers() {
    try {
      if (!sessionManager.hasRole(['admin'])) {
        throw new Error('Not authorized');
      }

      const cached = getCache('pending_users');
      if (cached) return { success: true, data: cached };

      const response = await this.simulateRequest([
        { id: 2, email: 'doctor@test.com', role: 'doctor', registered: '2024-04-08' },
        { id: 3, email: 'patient@test.com', role: 'patient', registered: '2024-04-09' }
      ], 400);

      setCache('pending_users', response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Approve user
   */
  async approveUser(userId) {
    try {
      if (!sessionManager.hasRole(['admin'])) {
        throw new Error('Not authorized');
      }

      // Simulate approval
      await this.simulateRequest(null, 600);

      // Clear cache to force refresh
      clearCache('pending_users');
      clearCache('users');

      return { success: true, message: 'User approved successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============= APPOINTMENTS =============

  /**
   * Get user's appointments
   */
  async getAppointments(userId, filters = {}) {
    try {
      // Verify user can see appointments
      if (sessionManager.user && sessionManager.user.id !== userId) {
        if (!sessionManager.hasRole(['admin', 'doctor'])) {
          throw new Error('Not authorized to view these appointments');
        }
      }

      const cacheKey = `appointments_${userId}`;
      const cached = getCache(cacheKey);
      if (cached) return { success: true, data: cached };

      const response = await this.simulateRequest([
        { id: 1, doctor: 'Dr. Smith', date: '2024-04-15', time: '10:00 AM', status: 'scheduled' }
      ], 500);

      setCache(cacheKey, response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Book appointment
   */
  async bookAppointment(appointmentData) {
    try {
      if (!sessionManager.hasRole(['patient'])) {
        throw new Error('Only patients can book appointments');
      }

      // Validate data
      if (!appointmentData.doctor || !appointmentData.date || !appointmentData.time) {
        throw new Error('Missing required fields');
      }

      // Simulate booking
      await this.simulateRequest(null, 800);

      // Clear appointment cache
      clearCache(`appointments_${sessionManager.user.id}`);

      return {
        success: true,
        message: 'Appointment booked successfully',
        appointmentId: Math.floor(Math.random() * 10000)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, newStatus) {
    try {
      if (!sessionManager.hasRole(['doctor', 'admin'])) {
        throw new Error('Not authorized');
      }

      // Simulate update
      await this.simulateRequest(null, 600);

      // Clear cache
      clearCache('appointments');

      return { success: true, message: `Appointment ${newStatus}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============= MEDICAL RECORDS =============

  /**
   * Get patient's medical records
   */
  async getMedicalRecords(patientId) {
    try {
      // Verify access
      if (sessionManager.user && sessionManager.user.id !== patientId) {
        if (!sessionManager.hasRole(['admin', 'doctor'])) {
          throw new Error('Not authorized to view these records');
        }
      }

      const cacheKey = `records_${patientId}`;
      const cached = getCache(cacheKey);
      if (cached) return { success: true, data: cached };

      const response = await this.simulateRequest([
        { id: 1, type: 'Diagnosis', title: 'Flu', date: '2024-03-15' }
      ], 500);

      setCache(cacheKey, response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Create medical record
   */
  async createMedicalRecord(recordData) {
    try {
      if (!sessionManager.hasRole(['doctor', 'admin'])) {
        throw new Error('Not authorized');
      }

      // Validate
      if (!recordData.patientId || !recordData.diagnosis) {
        throw new Error('Missing required fields');
      }

      await this.simulateRequest(null, 800);

      clearCache(`records_${recordData.patientId}`);

      return {
        success: true,
        message: 'Medical record created',
        recordId: Math.floor(Math.random() * 10000)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============= PRESCRIPTIONS =============

  /**
   * Get patient's prescriptions
   */
  async getPrescriptions(patientId) {
    try {
      const cacheKey = `prescriptions_${patientId}`;
      const cached = getCache(cacheKey);
      if (cached) return { success: true, data: cached };

      const response = await this.simulateRequest([
        { id: 1, medication: 'Ibuprofen', dosage: '200mg', status: 'active' }
      ], 500);

      setCache(cacheKey, response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  /**
   * Request prescription refill
   */
  async requestRefill(prescriptionId) {
    try {
      if (!sessionManager.hasRole(['patient'])) {
        throw new Error('Only patients can request refills');
      }

      await this.simulateRequest(null, 600);
      clearCache('prescriptions');

      return { success: true, message: 'Refill request sent to doctor' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============= UTILITY METHODS =============

  /**
   * Simulate API request with delay
   */
  async simulateRequest(data, delay = 500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly fail sometimes to test error handling
        if (Math.random() > 0.95) {
          reject(new Error('Network error (simulated)'));
        } else {
          resolve(data || {});
        }
      }, delay);
    });
  },

  /**
   * Clear all data cache
   */
  clearAllCache() {
    clearCache('users');
    clearCache('pending_users');
    clearCache('appointments');
    clearCache('records');
    clearCache('prescriptions');
    console.log('✅ All cache cleared');
  }
};

// Initialize session on page load
document.addEventListener('DOMContentLoaded', () => {
  sessionManager.init();
});

export default { sessionManager, dataService, enforceRoleAccess };
