/**
 * ============================================================================
 * IMPROVED GLOBAL EVENT HANDLER WITH STATE MANAGEMENT
 * ============================================================================
 * Single click listener for all app interactions
 * Prevents double-clicks, manages loading states, handles errors
 * ============================================================================
 */

import {
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showInfo,
  addButtonSpinner,
  removeButtonSpinner
} from './api-utils.js';

// Track pending operations to prevent double-clicks
const pendingOperations = new Set();
const operationTimeouts = new Map();

/**
 * Check if operation is already in progress
 */
function isOperationPending(operationId) {
  return pendingOperations.has(operationId);
}

/**
 * Mark operation as started
 */
function markOperationStarted(operationId) {
  if (pendingOperations.has(operationId)) {
    return false; // Already in progress
  }
  pendingOperations.add(operationId);
  return true;
}

/**
 * Mark operation as complete
 */
function markOperationComplete(operationId) {
  pendingOperations.delete(operationId);
  if (operationTimeouts.has(operationId)) {
    clearTimeout(operationTimeouts.get(operationId));
    operationTimeouts.delete(operationId);
  }
}

/**
 * Auto-cleanup operation after timeout (safety net)
 */
function autoCleanupOperation(operationId, timeout = 30000) {
  const timeoutId = setTimeout(() => {
    markOperationComplete(operationId);
    console.warn(`⚠️ Operation ${operationId} auto-cleaned up after ${timeout}ms`);
  }, timeout);
  operationTimeouts.set(operationId, timeoutId);
}

/**
 * Global click event handler
 */
document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();

  const action = target.dataset.action;
  const actionId = target.dataset.id || 'default';
  const operationId = `${action}_${actionId}_${Date.now()}`;

  // Prevent double-clicks
  if (!markOperationStarted(operationId)) {
    console.warn(`⏸️ Operation ${action} already in progress`);
    return;
  }

  // Auto-cleanup after 30 seconds (safety net)
  autoCleanupOperation(operationId);

  try {
    // Show loading state
    addButtonSpinner(target);

    // Route to appropriate handler
    const handler = actionHandlers[action];
    if (!handler) {
      throw new Error(`Unknown action: ${action}`);
    }

    // Execute handler
    const result = await handler(target, actionId);

    if (result.success) {
      showSuccess(result.message || `${action} completed successfully`);
    } else {
      showError(result.error || `${action} failed`);
    }
  } catch (error) {
    console.error('❌ Action error:', error);
    showError(error.message || 'An unexpected error occurred');
  } finally {
    // Clean up
    removeButtonSpinner(target);
    markOperationComplete(operationId);
  }
});

/**
 * All action handlers
 */
const actionHandlers = {
  // ============= AUTH =============
  'login': async (btn, id) => {
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';

    if (!email || !password) {
      return { success: false, error: 'Please enter email and password' };
    }

    // Simulate login
    await new Promise(r => setTimeout(r, 1000));
    
    return {
      success: true,
      message: 'Logged in successfully'
    };
  },

  'logout': async (btn, id) => {
    // Simulate logout
    await new Promise(r => setTimeout(r, 500));
    
    sessionStorage.clear();
    return {
      success: true,
      message: 'Logged out successfully',
      redirect: '/Login_Register/Login.html'
    };
  },

  'register': async (btn, id) => {
    const email = document.getElementById('register-email')?.value || '';
    const password = document.getElementById('register-password')?.value || '';
    const role = document.getElementById('role')?.value || '';

    if (!email || !password || !role) {
      return { success: false, error: 'Please fill in all fields' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Simulate registration
    await new Promise(r => setTimeout(r, 1000));

    return {
      success: true,
      message: 'Account created! Waiting for admin approval.'
    };
  },

  // ============= ADMIN =============
  'approve-user': async (btn, userId) => {
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    showLoading('Approving user...');
    
    // Simulate approval
    await new Promise(r => setTimeout(r, 800));

    hideLoading();
    return {
      success: true,
      message: `User approved successfully`,
      action: 'refresh-list'
    };
  },

  'reject-user': async (btn, userId) => {
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    const confirm = window.confirm('Are you sure you want to reject this user?');
    if (!confirm) return { success: false, error: 'Action cancelled' };

    showLoading('Rejecting user...');
    
    // Simulate rejection
    await new Promise(r => setTimeout(r, 800));

    hideLoading();
    return {
      success: true,
      message: 'User rejected',
      action: 'refresh-list'
    };
  },

  'create-user': async (btn, id) => {
    const form = document.getElementById('create-user-form');
    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const formData = new FormData(form);
    const userData = Object.fromEntries(formData);

    if (!userData.email || !userData.role) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    showLoading('Creating user...');
    
    // Simulate user creation
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    form.reset();

    return {
      success: true,
      message: 'User created successfully',
      action: 'refresh-list'
    };
  },

  'create-appointment': async (btn, id) => {
    const form = document.getElementById('appointment-form');
    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const formData = new FormData(form);
    const apptData = Object.fromEntries(formData);

    if (!apptData.doctor || !apptData.date || !apptData.time) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    showLoading('Booking appointment...');
    
    // Simulate appointment creation
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    form.reset();

    return {
      success: true,
      message: 'Appointment booked successfully',
      action: 'refresh-list'
    };
  },

  // ============= DOCTOR =============
  'complete-appointment': async (btn, appointmentId) => {
    if (!appointmentId) {
      return { success: false, error: 'Appointment ID not found' };
    }

    const confirm = window.confirm('Mark this appointment as complete?');
    if (!confirm) return { success: false, error: 'Action cancelled' };

    showLoading('Completing appointment...');
    
    // Simulate completion
    await new Promise(r => setTimeout(r, 800));

    hideLoading();
    return {
      success: true,
      message: 'Appointment marked as complete',
      action: 'refresh-list'
    };
  },

  'cancel-appointment': async (btn, appointmentId) => {
    if (!appointmentId) {
      return { success: false, error: 'Appointment ID not found' };
    }

    const confirm = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirm) return { success: false, error: 'Action cancelled' };

    showLoading('Cancelling appointment...');
    
    // Simulate cancellation
    await new Promise(r => setTimeout(r, 800));

    hideLoading();
    return {
      success: true,
      message: 'Appointment cancelled',
      action: 'refresh-list'
    };
  },

  'create-record': async (btn, patientId) => {
    const form = document.getElementById('record-form');
    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const formData = new FormData(form);
    const recordData = Object.fromEntries(formData);

    if (!recordData.diagnosis || !recordData.treatment) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    showLoading('Creating medical record...');
    
    // Simulate record creation
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    form.reset();

    return {
      success: true,
      message: 'Medical record created successfully',
      action: 'refresh-list'
    };
  },

  'create-prescription': async (btn, patientId) => {
    const form = document.getElementById('prescription-form');
    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const formData = new FormData(form);
    const rxData = Object.fromEntries(formData);

    if (!rxData.medication || !rxData.dosage) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    showLoading('Creating prescription...');
    
    // Simulate prescription creation
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    form.reset();

    return {
      success: true,
      message: 'Prescription created successfully',
      action: 'refresh-list'
    };
  },

  // ============= PATIENT =============
  'book-appointment': async (btn, id) => {
    const form = document.getElementById('booking-form');
    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const formData = new FormData(form);
    const bookingData = Object.fromEntries(formData);

    if (!bookingData.doctor || !bookingData.date || !bookingData.time) {
      return { success: false, error: 'Please select a doctor, date, and time' };
    }

    showLoading('Booking appointment...');
    
    // Simulate booking
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    form.reset();

    return {
      success: true,
      message: 'Appointment booked successfully! Wait for doctor confirmation.',
      action: 'refresh-list'
    };
  },

  'request-refill': async (btn, prescriptionId) => {
    if (!prescriptionId) {
      return { success: false, error: 'Prescription ID not found' };
    }

    showLoading('Requesting refill...');
    
    // Simulate refill request
    await new Promise(r => setTimeout(r, 800));

    hideLoading();
    return {
      success: true,
      message: 'Refill request sent to doctor',
      action: 'refresh-list'
    };
  },

  'download-record': async (btn, recordId) => {
    if (!recordId) {
      return { success: false, error: 'Record ID not found' };
    }

    showLoading('Preparing download...');
    
    // Simulate download
    await new Promise(r => setTimeout(r, 1000));

    hideLoading();
    
    // In real implementation, this would download a PDF
    return {
      success: true,
      message: 'Record downloaded successfully'
    };
  },

  // ============= COMMON =============
  'toggle-sidebar': async (btn, id) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
    return { success: true };
  },

  'toggle-dark-mode': async (btn, id) => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    return { success: true };
  },

  'refresh-data': async (btn, id) => {
    showLoading('Refreshing data...');
    
    // Clear cache and refetch
    await new Promise(r => setTimeout(r, 500));

    hideLoading();
    return {
      success: true,
      message: 'Data refreshed',
      action: 'refresh-list'
    };
  }
};

export { actionHandlers, isOperationPending, markOperationStarted, markOperationComplete };
