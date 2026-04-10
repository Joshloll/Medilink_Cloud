/**
 * Patient Dashboard - Real Data Integration Example
 * 
 * This file shows HOW to replace mock data with real database data.
 * Copy this pattern to other pages in your Patient module.
 * 
 * Steps:
 * 1. Add to HTML: <script src="../js/supabase-client.js"></script>
 * 2. Add to HTML: <script src="./dashboard-real-data.js"></script>
 * 3. Replace IDs in HTML if needed
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

let currentUser = null;

/**
 * Initialize page - runs when DOM is ready
 */
async function initializePage() {
  console.log('Initializing Patient Dashboard...');
  
  try {
    // Step 1: Initialize Supabase client
    const client = await initSupabase();
    if (!client) {
      showError('Failed to connect to database');
      return;
    }
    
    // Step 2: Get current logged-in user
    currentUser = await supabaseAuth.getCurrentUser();
    if (!currentUser) {
      showError('Please log in first');
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '../Login_Register/Login.html';
      }, 2000);
      return;
    }
    
    console.log('Current user:', currentUser.full_name);
    
    // Step 3: Load and render all data
    await loadDashboardData();
    
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to load dashboard');
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  console.error('Error:', message);
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerHTML = `<p style="color: red;">❌ ${message}</p>`;
    errorDiv.style.display = 'block';
  }
}

/**
 * Show loading state
 */
function showLoading(show = true) {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
}

// ============================================================================
// LOAD DATA FROM SUPABASE
// ============================================================================

/**
 * Load all dashboard data from database
 */
async function loadDashboardData() {
  showLoading(true);
  
  try {
    // Fetch all data in parallel for better performance
    const [appointments, records, prescriptions, profile] = await Promise.all([
      supabasePatient.getPatientAppointments(currentUser.id),
      supabasePatient.getPatientMedicalRecords(currentUser.id),
      supabasePatient.getPatientPrescriptions(currentUser.id),
      supabasePatient.getPatientProfile(currentUser.id)
    ]);
    
    // Check for errors
    if (!appointments.success || !records.success || !prescriptions.success) {
      console.error('Error loading data');
      showLoading(false);
      return;
    }
    
    // Render statistics
    renderStatistics(
      appointments.appointments,
      records.records,
      prescriptions.prescriptions
    );
    
    // Render recent appointments
    renderAppointments(appointments.appointments);
    
    // Render medical records
    renderMedicalRecords(records.records);
    
    // Render prescriptions
    renderPrescriptions(prescriptions.prescriptions);
    
    console.log('Dashboard loaded successfully');
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data');
  } finally {
    showLoading(false);
  }
}

// ============================================================================
// RENDER FUNCTIONS (REPLACES MOCK DATA)
// ============================================================================

/**
 * Render dashboard statistics
 */
function renderStatistics(appointments = [], records = [], prescriptions = []) {
  const statsContainer = document.getElementById('dashboard-stats') || 
                         document.querySelector('[data-stats]');
  
  if (!statsContainer) return;
  
  // Calculate real stats from database
  const stats = {
    upcomingAppointments: appointments?.filter(a => a.status === 'scheduled').length || 0,
    completedAppointments: appointments?.filter(a => a.status === 'completed').length || 0,
    medicalRecords: records?.length || 0,
    activePrescriptions: prescriptions?.filter(p => p.status === 'active').length || 0
  };
  
  // Update HTML with real data
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Upcoming Appointments</div>
      <div class="stat-value">${stats.upcomingAppointments}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completed Appointments</div>
      <div class="stat-value">${stats.completedAppointments}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Medical Records</div>
      <div class="stat-value">${stats.medicalRecords}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Prescriptions</div>
      <div class="stat-value">${stats.activePrescriptions}</div>
    </div>
  `;
}

/**
 * Render recent appointments
 */
function renderAppointments(appointments = []) {
  const container = document.getElementById('appointments-list') || 
                    document.querySelector('[data-appointments]');
  
  if (!container) return;
  
  // Sort by date and get next 5
  const upcoming = appointments
    ?.filter(a => a.status === 'scheduled')
    ?.slice(0, 5) || [];
  
  if (upcoming.length === 0) {
    container.innerHTML = '<p>No upcoming appointments</p>';
    return;
  }
  
  // Render each appointment
  const html = upcoming.map(appointment => `
    <div class="appointment-item">
      <div class="appointment-header">
        <h3>${appointment.doctors?.specialty || 'Consultation'}</h3>
        <span class="appointment-status">${appointment.status}</span>
      </div>
      <div class="appointment-details">
        <p>📅 Date: ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
        <p>🕒 Time: ${new Date(appointment.appointment_time).toLocaleTimeString()}</p>
        ${appointment.doctors?.user?.full_name ? `
          <p>👨‍⚕️ Doctor: ${appointment.doctors.user.full_name}</p>
        ` : ''}
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

/**
 * Render medical records
 */
function renderMedicalRecords(records = []) {
  const container = document.getElementById('medical-records') || 
                    document.querySelector('[data-records]');
  
  if (!container) return;
  
  if (records.length === 0) {
    container.innerHTML = '<p>No medical records yet</p>';
    return;
  }
  
  const html = records
    ?.slice(0, 5)
    ?.map(record => `
      <div class="record-item">
        <div class="record-date">${new Date(record.created_at).toLocaleDateString()}</div>
        <div class="record-diagnosis">
          <strong>Diagnosis:</strong> ${record.diagnosis || 'N/A'}
        </div>
        <div class="record-treatment">
          <strong>Treatment:</strong> ${record.treatment || 'N/A'}
        </div>
      </div>
    `).join('') || '<p>No records available</p>';
  
  container.innerHTML = html;
}

/**
 * Render prescriptions
 */
function renderPrescriptions(prescriptions = []) {
  const container = document.getElementById('prescriptions-list') || 
                    document.querySelector('[data-prescriptions]');
  
  if (!container) return;
  
  const active = prescriptions?.filter(p => p.status === 'active') || [];
  
  if (active.length === 0) {
    container.innerHTML = '<p>No active prescriptions</p>';
    return;
  }
  
  const html = active
    ?.slice(0, 5)
    ?.map(prescription => `
      <div class="prescription-item">
        <div class="prescription-medication">${prescription.medication || 'Unknown'}</div>
        <div class="prescription-details">
          <span>💊 ${prescription.dosage || 'N/A'}</span>
          <span>⏰ ${prescription.frequency || 'N/A'}</span>
        </div>
        <div class="prescription-date">
          Since: ${new Date(prescription.created_at).toLocaleDateString()}
        </div>
      </div>
    `).join('') || '<p>No active prescriptions</p>';
  
  container.innerHTML = html;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Refresh dashboard data
 */
async function refreshDashboard() {
  console.log('Refreshing dashboard...');
  await loadDashboardData();
}

/**
 * Logout user
 */
async function logoutUser() {
  const result = await supabaseAuth.logoutUser();
  if (result.success) {
    window.location.href = '../Login_Register/Login.html';
  } else {
    showError('Failed to logout');
  }
}

// ============================================================================
// PAGE INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  // DOM is already loaded
  initializePage();
}

// Optional: Add refresh button handler
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshDashboard);
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
});
