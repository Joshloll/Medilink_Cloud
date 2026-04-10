// ============================================================================
// MEDILINK GLOBAL EVENT HANDLER SYSTEM
// ============================================================================
// Centralized click event handling for ALL modules (Admin, Doctor, Patient)
// Every clickable element uses data-action and optional data-id attributes
// ============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Get Supabase credentials
function getSupabaseCredentials() {
  if (typeof window?.CONFIG !== 'undefined') {
    return {
      url: window.CONFIG.SUPABASE_URL,
      key: window.CONFIG.SUPABASE_ANON_KEY
    };
  }
  
  if (typeof import?.meta?.env?.VITE_SUPABASE_URL !== 'undefined') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  throw new Error('Supabase credentials not found');
}

const credentials = getSupabaseCredentials();
export const supabase = createClient(credentials.url, credentials.key);

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

export function showNotification(message, type = 'info', duration = 3000) {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  
  const notification = document.createElement('div');
  const bgClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-blue-500';
  
  notification.className = `${bgClass} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-in text-sm font-medium`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  container.className = 'fixed top-4 right-4 z-50 max-w-sm';
  document.body.appendChild(container);
  return container;
}

// ============================================================================
// MODAL SYSTEM
// ============================================================================

export function showModal(title, content, actions = []) {
  const existingModal = document.getElementById('global-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.id = 'global-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  
  const actionButtons = actions.map(action => 
    `<button class="px-4 py-2 rounded-lg ${action.className || 'bg-blue-500 text-white'}" data-action="${action.action}" data-modal-close="true">${action.label}</button>`
  ).join('');
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 class="text-lg font-bold">${title}</h2>
        <button class="text-slate-500 hover:text-slate-700" data-close-modal="true">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="px-6 py-4">
        ${content}
      </div>
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
        ${actionButtons}
        <button class="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300" data-close-modal="true">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal listeners
  modal.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => modal.remove());
  });
}

export function closeModal() {
  const modal = document.getElementById('global-modal');
  if (modal) modal.remove();
}

// ============================================================================
// GLOBAL CLICK EVENT HANDLER
// ============================================================================

export function initializeGlobalEventHandler() {
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const id = target.dataset.id;
    const value = target.dataset.value;
    
    try {
      // Prevent double-clicks
      target.disabled = true;
      const originalHTML = target.innerHTML;
      target.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span>';
      
      await handleAction(action, id, value, target);
      
      target.innerHTML = originalHTML;
      target.disabled = false;
    } catch (error) {
      console.error(`Error executing action ${action}:`, error);
      showNotification(error.message || 'An error occurred', 'error');
      target.innerHTML = originalHTML;
      target.disabled = false;
    }
  });
}

// ============================================================================
// MAIN ACTION DISPATCHER
// ============================================================================

async function handleAction(action, id, value, element) {
  // ===== ADMIN ACTIONS =====
  if (action === 'approve-user') {
    await approveUser(id);
  } else if (action === 'reject-user') {
    await rejectUser(id);
  } else if (action === 'delete-user') {
    await deleteUser(id);
  } else if (action === 'edit-user') {
    showEditUserModal(id);
  } else if (action === 'view-user-details') {
    await showUserDetails(id);
  } else if (action === 'create-user') {
    showCreateUserModal();
  } else if (action === 'create-appointment') {
    showCreateAppointmentModal();
  } else if (action === 'delete-appointment') {
    await deleteAppointment(id);
  } else if (action === 'view-appointment') {
    await viewAppointmentDetails(id);
  }
  
  // ===== DOCTOR ACTIONS =====
  else if (action === 'mark-appointment-complete') {
    await markAppointmentComplete(id);
  } else if (action === 'view-patient-details') {
    await viewPatientDetails(id);
  } else if (action === 'create-medical-record') {
    showCreateMedicalRecordModal(id);
  } else if (action === 'create-prescription') {
    showCreatePrescriptionModal(id);
  } else if (action === 'view-medical-records') {
    await viewMedicalRecords(id);
  } else if (action === 'cancel-appointment-doctor') {
    await cancelAppointmentDoctor(id);
  } else if (action === 'reschedule-appointment') {
    showRescheduleModal(id);
  }
  
  // ===== PATIENT ACTIONS =====
  else if (action === 'book-appointment') {
    showBookingModal();
  } else if (action === 'cancel-appointment') {
    await cancelAppointmentPatient(id);
  } else if (action === 'view-appointment-patient') {
    await viewPatientAppointmentDetails(id);
  } else if (action === 'request-prescription-refill') {
    await requestPrescriptionRefill(id);
  } else if (action === 'view-medical-record') {
    await viewSingleMedicalRecord(id);
  } else if (action === 'view-prescription') {
    await viewSinglePrescription(id);
  } else if (action === 'find-doctors') {
    await displayAvailableDoctors();
  } else if (action === 'book-with-doctor') {
    showBookingModalForDoctor(id);
  }
  
  // ===== COMMON ACTIONS =====
  else if (action === 'logout') {
    await handleLogout();
  } else if (action === 'toggle-dark-mode') {
    toggleDarkMode();
  } else if (action === 'toggle-sidebar') {
    toggleSidebar();
  } else if (action === 'close-modal') {
    closeModal();
  } else {
    console.warn(`Unknown action: ${action}`);
  }
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

async function approveUser(userId) {
  if (!confirm('Are you sure you want to approve this user?')) return;
  
  const { error } = await supabase
    .from('users')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) throw error;
  
  showNotification('✓ User approved successfully', 'success');
  window.location.reload();
}

async function rejectUser(userId) {
  if (!confirm('Are you sure you want to reject this user?')) return;
  
  const { error } = await supabase
    .from('users')
    .update({ status: 'rejected' })
    .eq('id', userId);
  
  if (error) throw error;
  
  showNotification('✗ User rejected', 'info');
  window.location.reload();
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
  
  showNotification('User deleted successfully', 'success');
  window.location.reload();
}

function showEditUserModal(userId) {
  showModal(
    'Edit User',
    `<form id="edit-user-form">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" placeholder="user@example.com" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" name="full_name" placeholder="Full Name" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Role</label>
          <select name="role" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </form>`,
    [{ label: 'Save Changes', action: `update-user-${userId}`, className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

async function showUserDetails(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  
  showModal(
    `${user.full_name}`,
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Email:</span> ${user.email}</div>
      <div><span class="font-medium">Role:</span> <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${user.role}</span></div>
      <div><span class="font-medium">Status:</span> <span class="px-2 py-1 ${user.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} rounded text-xs">${user.status}</span></div>
      <div><span class="font-medium">Phone:</span> ${user.phone || 'N/A'}</div>
      <div><span class="font-medium">Created:</span> ${new Date(user.created_at).toLocaleDateString()}</div>
    </div>`
  );
}

function showCreateUserModal() {
  showModal(
    'Create New User',
    `<form id="create-user-form">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" placeholder="user@example.com" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" name="full_name" placeholder="Full Name" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Role</label>
          <select name="role" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="">Select Role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input type="tel" name="phone" placeholder="(555) 000-0000" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"/>
        </div>
      </div>
    </form>`,
    [{ label: 'Create User', action: 'create-user-submit', className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

async function deleteAppointment(appointmentId) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);
  
  if (error) throw error;
  
  showNotification('Appointment deleted successfully', 'success');
  window.location.reload();
}

async function viewAppointmentDetails(appointmentId) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(user:users(full_name, email)),
      patient:patients(user:users(full_name, email))
    `)
    .eq('id', appointmentId)
    .single();
  
  if (error) throw error;
  
  const doctorName = appointment.doctor?.user?.full_name || 'N/A';
  const patientName = appointment.patient?.user?.full_name || 'N/A';
  
  showModal(
    'Appointment Details',
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Doctor:</span> ${doctorName}</div>
      <div><span class="font-medium">Patient:</span> ${patientName}</div>
      <div><span class="font-medium">Date:</span> ${new Date(appointment.appointment_date).toLocaleDateString()}</div>
      <div><span class="font-medium">Time:</span> ${appointment.appointment_time}</div>
      <div><span class="font-medium">Reason:</span> ${appointment.reason}</div>
      <div><span class="font-medium">Status:</span> <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${appointment.status}</span></div>
    </div>`
  );
}

function showCreateAppointmentModal() {
  showModal(
    'Create Appointment',
    `<form id="create-appointment-form">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Doctor</label>
          <select name="doctor_id" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="">Select Doctor</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Patient</label>
          <select name="patient_id" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="">Select Patient</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Date</label>
          <input type="date" name="appointment_date" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Time</label>
          <input type="time" name="appointment_time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Reason</label>
          <textarea name="reason" placeholder="Reason for appointment" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required></textarea>
        </div>
      </div>
    </form>`,
    [{ label: 'Create Appointment', action: 'create-appointment-submit', className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

// ============================================================================
// DOCTOR ACTIONS
// ============================================================================

async function markAppointmentComplete(appointmentId) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', appointmentId);
  
  if (error) throw error;
  
  showNotification('✓ Appointment marked as completed', 'success');
  window.location.reload();
}

async function viewPatientDetails(patientId) {
  const { data: patient, error } = await supabase
    .from('patients')
    .select(`
      *,
      user:users(id, email, full_name, phone)
    `)
    .eq('id', patientId)
    .single();
  
  if (error) throw error;
  
  showModal(
    `Patient: ${patient.user.full_name}`,
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Email:</span> ${patient.user.email}</div>
      <div><span class="font-medium">Phone:</span> ${patient.user.phone || 'N/A'}</div>
      <div><span class="font-medium">Blood Type:</span> ${patient.blood_type || 'N/A'}</div>
      <div><span class="font-medium">Allergies:</span> ${patient.allergies || 'None'}</div>
      <div><span class="font-medium">Insurance:</span> ${patient.insurance_provider || 'N/A'}</div>
    </div>`
  );
}

function showCreateMedicalRecordModal(patientId) {
  showModal(
    'Create Medical Record',
    `<form id="create-record-form" data-patient-id="${patientId}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Diagnosis</label>
          <input type="text" name="diagnosis" placeholder="Diagnosis" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Treatment</label>
          <textarea name="treatment" placeholder="Treatment plan" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" placeholder="Additional notes" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"></textarea>
        </div>
      </div>
    </form>`,
    [{ label: 'Create Record', action: `create-record-submit-${patientId}`, className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

function showCreatePrescriptionModal(patientId) {
  showModal(
    'Create Prescription',
    `<form id="create-prescription-form" data-patient-id="${patientId}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Medication</label>
          <input type="text" name="medication_name" placeholder="Medication name" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Dosage</label>
          <input type="text" name="dosage" placeholder="e.g., 500mg" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Frequency</label>
          <select name="frequency" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="once_daily">Once Daily</option>
            <option value="twice_daily">Twice Daily</option>
            <option value="three_times">Three Times Daily</option>
            <option value="as_needed">As Needed</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Duration</label>
          <input type="text" name="duration" placeholder="e.g., 7 days" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Instructions</label>
          <textarea name="instructions" placeholder="Special instructions" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"></textarea>
        </div>
      </div>
    </form>`,
    [{ label: 'Create Prescription', action: `create-prescription-submit-${patientId}`, className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

async function viewMedicalRecords(patientId) {
  const { data: records, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  if (records.length === 0) {
    showModal('Medical Records', '<p class="text-slate-500">No medical records found</p>');
    return;
  }
  
  const recordsHTML = records.map(record => `
    <div class="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm mb-2">
      <div class="font-medium">${record.diagnosis}</div>
      <div class="text-slate-600 dark:text-slate-400 text-xs mt-1">${new Date(record.created_at).toLocaleDateString()}</div>
    </div>
  `).join('');
  
  showModal('Medical Records', `<div class="space-y-2">${recordsHTML}</div>`);
}

async function cancelAppointmentDoctor(appointmentId) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);
  
  if (error) throw error;
  
  showNotification('Appointment cancelled', 'info');
  window.location.reload();
}

function showRescheduleModal(appointmentId) {
  showModal(
    'Reschedule Appointment',
    `<form id="reschedule-form" data-appt-id="${appointmentId}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">New Date</label>
          <input type="date" name="new_date" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">New Time</label>
          <input type="time" name="new_time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
      </div>
    </form>`,
    [{ label: 'Reschedule', action: `reschedule-submit-${appointmentId}`, className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

// ============================================================================
// PATIENT ACTIONS
// ============================================================================

function showBookingModal() {
  showModal(
    'Book Appointment',
    `<form id="booking-form">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Select Doctor</label>
          <select name="doctor_id" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required>
            <option value="">Loading doctors...</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Date</label>
          <input type="date" name="appointment_date" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Time</label>
          <input type="time" name="appointment_time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Reason for Visit</label>
          <textarea name="reason" placeholder="Brief description of your concern" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required></textarea>
        </div>
      </div>
    </form>`,
    [{ label: 'Book Appointment', action: 'book-appointment-submit', className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
  
  // Load doctors
  loadDoctorsIntoSelect('booking-form [name="doctor_id"]');
}

async function loadDoctorsIntoSelect(selector) {
  const select = document.querySelector(selector);
  if (!select) return;
  
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      id,
      specialty,
      user:users(full_name)
    `)
    .eq('availability_status', 'online');
  
  if (error) {
    select.innerHTML = '<option value="">Error loading doctors</option>';
    return;
  }
  
  select.innerHTML = '<option value="">Select Doctor</option>' + 
    doctors.map(doc => `<option value="${doc.id}">${doc.user.full_name} - ${doc.specialty}</option>`).join('');
}

async function cancelAppointmentPatient(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);
  
  if (error) throw error;
  
  showNotification('Appointment cancelled', 'info');
  window.location.reload();
}

async function viewPatientAppointmentDetails(appointmentId) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(specialty, user:users(full_name))
    `)
    .eq('id', appointmentId)
    .single();
  
  if (error) throw error;
  
  showModal(
    'Appointment Details',
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Doctor:</span> ${appointment.doctor.user.full_name}</div>
      <div><span class="font-medium">Specialty:</span> ${appointment.doctor.specialty}</div>
      <div><span class="font-medium">Date:</span> ${new Date(appointment.appointment_date).toLocaleDateString()}</div>
      <div><span class="font-medium">Time:</span> ${appointment.appointment_time}</div>
      <div><span class="font-medium">Reason:</span> ${appointment.reason}</div>
      <div><span class="font-medium">Status:</span> <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${appointment.status}</span></div>
    </div>`
  );
}

async function requestPrescriptionRefill(prescriptionId) {
  const { error } = await supabase
    .from('prescriptions')
    .update({ refill_requested: true, refill_requested_at: new Date().toISOString() })
    .eq('id', prescriptionId);
  
  if (error) throw error;
  
  showNotification('✓ Refill request submitted. Your doctor will review it shortly.', 'success');
  window.location.reload();
}

async function viewSingleMedicalRecord(recordId) {
  const { data: record, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', recordId)
    .single();
  
  if (error) throw error;
  
  showModal(
    'Medical Record',
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Diagnosis:</span> ${record.diagnosis}</div>
      <div><span class="font-medium">Treatment:</span> ${record.treatment}</div>
      <div><span class="font-medium">Date:</span> ${new Date(record.created_at).toLocaleDateString()}</div>
      ${record.notes ? `<div><span class="font-medium">Notes:</span> ${record.notes}</div>` : ''}
    </div>`
  );
}

async function viewSinglePrescription(prescriptionId) {
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', prescriptionId)
    .single();
  
  if (error) throw error;
  
  showModal(
    'Prescription Details',
    `<div class="space-y-3 text-sm">
      <div><span class="font-medium">Medication:</span> ${prescription.medication_name}</div>
      <div><span class="font-medium">Dosage:</span> ${prescription.dosage}</div>
      <div><span class="font-medium">Frequency:</span> ${prescription.frequency}</div>
      <div><span class="font-medium">Duration:</span> ${prescription.duration}</div>
      ${prescription.instructions ? `<div><span class="font-medium">Instructions:</span> ${prescription.instructions}</div>` : ''}
      <div><span class="font-medium">Status:</span> <span class="px-2 py-1 ${prescription.refill_requested ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} rounded text-xs">${prescription.refill_requested ? 'Refill Requested' : 'Active'}</span></div>
    </div>`
  );
}

async function displayAvailableDoctors() {
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      id,
      specialty,
      availability_status,
      user:users(full_name)
    `)
    .eq('availability_status', 'online');
  
  if (error) throw error;
  
  if (doctors.length === 0) {
    showNotification('No doctors available at this time', 'info');
    return;
  }
  
  const doctorsHTML = doctors.map(doc => `
    <div class="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
      <div class="font-medium">${doc.user.full_name}</div>
      <div class="text-sm text-slate-600 dark:text-slate-400">${doc.specialty}</div>
      <button data-action="book-with-doctor" data-id="${doc.id}" class="mt-2 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-blue-600">Book</button>
    </div>
  `).join('');
  
  showModal(
    'Available Doctors',
    `<div class="space-y-3">${doctorsHTML}</div>`
  );
}

function showBookingModalForDoctor(doctorId) {
  showModal(
    'Schedule Appointment',
    `<form id="booking-for-doctor-form" data-doctor-id="${doctorId}">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Date</label>
          <input type="date" name="appointment_date" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Time</label>
          <input type="time" name="appointment_time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Reason for Visit</label>
          <textarea name="reason" placeholder="Brief description" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" required></textarea>
        </div>
      </div>
    </form>`,
    [{ label: 'Schedule', action: `book-doctor-submit-${doctorId}`, className: 'bg-blue-500 text-white hover:bg-blue-600' }]
  );
}

// ============================================================================
// COMMON ACTIONS
// ============================================================================

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  window.location.href = '/Login_Register/Login.html';
}

function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  localStorage.setItem('darkMode', html.classList.contains('dark'));
}

function toggleSidebar() {
  const sidebar = document.querySelector('aside');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGlobalEventHandler);
} else {
  initializeGlobalEventHandler();
}

// Restore dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}

export { initializeGlobalEventHandler };
