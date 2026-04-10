/**
 * RENDER HELPERS - Dynamic Content Rendering
 * 
 * This module provides all render functions for dynamic population of data
 * from Supabase. All HTML files are now cleaned of mock data and ready
 * to be populated using these functions.
 */

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

/**
 * Creates an empty state message for any list container
 * @param {string} icon - Material Symbols icon name
 * @param {string} title - Title text
 * @param {string} description - Description text
 * @returns {HTMLElement} Empty state div
 */
function createEmptyState(icon, title = 'No data available', description = '') {
  const div = document.createElement('div');
  div.className = 'text-center py-12 px-4';
  div.innerHTML = `
    <span class="material-symbols-outlined text-5xl text-slate-300 inline-block mb-3">${icon}</span>
    <p class="text-slate-600 dark:text-slate-400 mt-2 font-medium">${title}</p>
    ${description ? `<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">${description}</p>` : ''}
  `;
  return div;
}

// ============================================================================
// ADMIN DASHBOARD RENDERS
// ============================================================================

/**
 * Render admin dashboard statistics cards
 * @param {Object} stats - Statistics object {totalPatients, totalDoctors, totalAppointments, pendingApprovals}
 */
function renderAdminStats(stats = {}) {
  const defaults = {
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingApprovals: 0
  };
  
  const data = { ...defaults, ...stats };
  
  document.getElementById('totalPatients').textContent = data.totalPatients;
  document.getElementById('appointmentsToday').textContent = data.totalAppointments;
  document.getElementById('pendingApprovals').textContent = data.pendingApprovals;
}

// ============================================================================
// APPOINTMENTS RENDERS
// ============================================================================

/**
 * Render appointments list (Admin, Doctor, or Patient view)
 * @param {Array} appointments - Array of appointment objects
 * @param {string} containerId - ID of container to render into
 */
function renderAppointments(appointments = [], containerId = 'appointmentsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Empty state
  if (!appointments || appointments.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('calendar_month', 'No appointments available'));
    return;
  }
  
  container.innerHTML = '';
  appointments.forEach(apt => {
    const card = createAppointmentCard(apt);
    container.appendChild(card);
  });
}

/**
 * Create appointment card component
 * @param {Object} apt - Appointment object
 * @returns {HTMLElement} Appointment card
 */
function createAppointmentCard(apt) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-slate-400">calendar_today</span>
          <p class="font-semibold text-slate-900 dark:text-white">${apt.patient || 'Patient'}</p>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 ml-7">${apt.date || 'Date not set'} at ${apt.time || '--:--'}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400 ml-7">Doctor: ${apt.doctor || 'Not assigned'}</p>
      </div>
      <div class="flex gap-2">
        ${getStatusBadge(apt.status || 'scheduled')}
      </div>
    </div>
  `;
  return card;
}

/**
 * Render status badge
 * @param {string} status - Status string
 * @returns {string} HTML badge
 */
function getStatusBadge(status = 'scheduled') {
  const statusMap = {
    'scheduled': { bg: 'bg-blue-100', text: 'text-blue-800', dark_bg: 'dark:bg-blue-900/30', dark_text: 'dark:text-blue-400', label: 'Scheduled' },
    'confirmed': { bg: 'bg-green-100', text: 'text-green-800', dark_bg: 'dark:bg-green-900/30', dark_text: 'dark:text-green-400', label: 'Confirmed' },
    'completed': { bg: 'bg-green-100', text: 'text-green-800', dark_bg: 'dark:bg-green-900/30', dark_text: 'dark:text-green-400', label: 'Completed' },
    'cancelled': { bg: 'bg-red-100', text: 'text-red-800', dark_bg: 'dark:bg-red-900/30', dark_text: 'dark:text-red-400', label: 'Cancelled' },
    'pending': { bg: 'bg-amber-100', text: 'text-amber-800', dark_bg: 'dark:bg-amber-900/30', dark_text: 'dark:text-amber-400', label: 'Pending' }
  };
  
  const config = statusMap[status] || statusMap.scheduled;
  
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.dark_bg} ${config.dark_text}">
    <span class="size-2 rounded-full bg-current opacity-60"></span>
    ${config.label}
  </span>`;
}

// ============================================================================
// PATIENTS RENDERS
// ============================================================================

/**
 * Render patients list
 * @param {Array} patients - Array of patient objects
 * @param {string} containerId - ID of container
 */
function renderPatients(patients = [], containerId = 'patientsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!patients || patients.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('groups', 'No patients found', 'Add your first patient to get started'));
    return;
  }
  
  container.innerHTML = '';
  patients.forEach(patient => {
    const card = createPatientCard(patient);
    container.appendChild(card);
  });
}

/**
 * Create patient card component
 * @param {Object} patient - Patient object
 * @returns {HTMLElement} Patient card
 */
function createPatientCard(patient) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3 flex-1">
        <div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-slate-500">person</span>
        </div>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">${patient.full_name || 'Patient'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${patient.id || '#ML-XXXX'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">DOB: ${patient.date_of_birth || 'Not set'}</p>
        </div>
      </div>
      <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined">more_horiz</span>
      </button>
    </div>
  `;
  return card;
}

// ============================================================================
// DOCTORS RENDERS
// ============================================================================

/**
 * Render doctors list
 * @param {Array} doctors - Array of doctor objects
 * @param {string} containerId - ID of container
 */
function renderDoctors(doctors = [], containerId = 'doctorsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!doctors || doctors.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('stethoscope', 'No doctors found', 'Add your first doctor to get started'));
    return;
  }
  
  container.innerHTML = '';
  doctors.forEach(doctor => {
    const card = createDoctorCard(doctor);
    container.appendChild(card);
  });
}

/**
 * Create doctor card component
 * @param {Object} doctor - Doctor object
 * @returns {HTMLElement} Doctor card
 */
function createDoctorCard(doctor) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3 flex-1">
        <div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-slate-500">medical_services</span>
        </div>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">${doctor.full_name || 'Doctor'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${doctor.specialization || 'Specialization'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">License: ${doctor.license_number || 'Not set'}</p>
        </div>
      </div>
      <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined">more_horiz</span>
      </button>
    </div>
  `;
  return card;
}

// ============================================================================
// MEDICAL RECORDS RENDERS
// ============================================================================

/**
 * Render medical records list
 * @param {Array} records - Array of record objects
 * @param {string} containerId - ID of container
 */
function renderRecords(records = [], containerId = 'recordsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!records || records.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('description', 'No records available', 'Medical records will appear here'));
    return;
  }
  
  container.innerHTML = '';
  records.forEach(record => {
    const card = createRecordCard(record);
    container.appendChild(card);
  });
}

/**
 * Create medical record card component
 * @param {Object} record - Record object
 * @returns {HTMLElement} Record card
 */
function createRecordCard(record) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-slate-400">description</span>
          <p class="font-semibold text-slate-900 dark:text-white">${record.record_type || 'Medical Record'}</p>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400">Created: ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Date not available'}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400">By: Dr. ${record.doctor_name || 'Unassigned'}</p>
      </div>
      <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined">download</span>
      </button>
    </div>
  `;
  return card;
}

// ============================================================================
// PRESCRIPTIONS RENDERS
// ============================================================================

/**
 * Render prescriptions list
 * @param {Array} prescriptions - Array of prescription objects
 * @param {string} containerId - ID of container
 */
function renderPrescriptions(prescriptions = [], containerId = 'prescriptionsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!prescriptions || prescriptions.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('medication', 'No prescriptions available', 'Active prescriptions will appear here'));
    return;
  }
  
  container.innerHTML = '';
  prescriptions.forEach(rx => {
    const card = createPrescriptionCard(rx);
    container.appendChild(card);
  });
}

/**
 * Create prescription card component
 * @param {Object} rx - Prescription object
 * @returns {HTMLElement} Prescription card
 */
function createPrescriptionCard(rx) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <p class="font-semibold text-slate-900 dark:text-white">${rx.medication || 'Medication'}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Dosage: ${rx.dosage || 'Not specified'}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400">Frequency: ${rx.frequency || 'Not specified'}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Status: ${rx.status || 'Active'}</p>
      </div>
      <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined">more_horiz</span>
      </button>
    </div>
  `;
  return card;
}

// ============================================================================
// DOCUMENTS/FILES RENDERS
// ============================================================================

/**
 * Render documents list
 * @param {Array} documents - Array of document objects
 * @param {string} containerId - ID of container
 */
function renderDocuments(documents = [], containerId = 'documentsList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!documents || documents.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('folder', 'No files uploaded', 'Upload files to see them here'));
    return;
  }
  
  container.innerHTML = '';
  documents.forEach(doc => {
    const card = createDocumentCard(doc);
    container.appendChild(card);
  });
}

/**
 * Create document card component
 * @param {Object} doc - Document object
 * @returns {HTMLElement} Document card
 */
function createDocumentCard(doc) {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow';
  card.innerHTML = `
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 flex-1">
        <div class="size-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-slate-500">file_present</span>
        </div>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white truncate">${doc.file_name || 'Document'}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Uploaded: ${doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Date not available'}</p>
        </div>
      </div>
      <button class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined">download</span>
      </button>
    </div>
  `;
  return card;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show loading state in container
 * @param {string} containerId - Container ID
 */
function showLoadingState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center py-12">
      <div class="inline-block">
        <div class="animate-spin">
          <span class="material-symbols-outlined text-4xl text-slate-400">hourglass_bottom</span>
        </div>
      </div>
      <p class="text-slate-600 dark:text-slate-400 mt-4 font-medium">Loading...</p>
    </div>
  `;
}

/**
 * Show error state in container
 * @param {string} containerId - Container ID
 * @param {string} message - Error message
 */
function showErrorState(containerId, message = 'Failed to load data') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center py-12">
      <span class="material-symbols-outlined text-5xl text-red-300 inline-block mb-3">error</span>
      <p class="text-red-600 dark:text-red-400 font-medium">${message}</p>
    </div>
  `;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createEmptyState,
    renderAdminStats,
    renderAppointments,
    createAppointmentCard,
    getStatusBadge,
    renderPatients,
    createPatientCard,
    renderDoctors,
    createDoctorCard,
    renderRecords,
    createRecordCard,
    renderPrescriptions,
    createPrescriptionCard,
    renderDocuments,
    createDocumentCard,
    showLoadingState,
    showErrorState
  };
}
