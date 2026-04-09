/**
 * Dashboard Component
 * Renders the main dashboard with overview information - Clean Version
 */

/**
 * Render dashboard page
 */
async function renderDashboard() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch dashboard data
    const [user, appointments, vitals, records] = await Promise.all([
      apiService.fetchUser(),
      apiService.fetchAppointments(),
      apiService.fetchVitals(),
      apiService.fetchRecords()
    ]);

    // Update state
    stateManager.setState({
      user,
      appointments,
      vitals,
      records
    });

    // Get upcoming appointment
    const upcomingAppointment = appointments.find(apt => apt.status === 'upcoming');
    
    // Get recent activity (last 3 records)
    const recentActivity = records.slice(0, 3);

    // Render dashboard content
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <!-- Welcome Section -->
          ${renderWelcomeSection(user, upcomingAppointment)}
          
          <!-- Top Row: Upcoming & Quick Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            ${renderUpcomingAppointment(upcomingAppointment)}
            ${renderQuickActions()}
          </div>
          
          <!-- Bottom Row: Recent Vitals & Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${renderRecentVitals(vitals)}
            ${renderRecentActivity(recentActivity)}
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading dashboard:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading dashboard. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render welcome section
 */
function renderWelcomeSection(user, upcomingAppointment) {
  const greeting = getGreeting();
  
  return `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          ${greeting}, ${user?.firstName || 'Patient'}!
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-base">
          ${upcomingAppointment ? `Your next appointment is ${formatDate(upcomingAppointment.date)} at ${upcomingAppointment.time}` : 'No upcoming appointments'}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm text-slate-500 dark:text-slate-400">Last checkup</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">${user?.lastVisit ? formatDate(user.lastVisit) : 'No previous visits'}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">calendar_month</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render upcoming appointment card
 */
function renderUpcomingAppointment(appointment) {
  if (!appointment) {
    return `
      <div class="card p-6 text-center">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Upcoming Appointments</h3>
            <p class="text-slate-500 dark:text-slate-400">Schedule your next appointment</p>
          </div>
          <button onclick="navigateToPage('appointments')" class="btn btn-primary">
            Book Appointment
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointment</h3>
        <span class="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
          ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-600 dark:text-blue-300">person</span>
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">${appointment.doctorName}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">${appointment.specialty}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 text-sm">
          <span class="material-symbols-outlined text-slate-400">calendar_today</span>
          <span class="text-slate-600 dark:text-slate-400">${formatDate(appointment.date)} at ${appointment.time}</span>
        </div>
        
        <div class="flex items-center gap-4 text-sm">
          <span class="material-symbols-outlined text-slate-400">location_on</span>
          <span class="text-slate-600 dark:text-slate-400">${appointment.type} - ${appointment.location}</span>
        </div>
        
        <div class="flex gap-3">
          <button class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold">
            <span class="material-symbols-outlined text-[18px]">video_call</span>
            Join Call
          </button>
          <button class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium">
            <span class="material-symbols-outlined text-[18px]">event_note</span>
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render quick actions
 */
function renderQuickActions() {
  return `
    <div class="card p-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 gap-3">
        <button onclick="navigateToPage('appointments')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">calendar_month</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Book Appointment</span>
        </button>
        <button onclick="navigateToPage('records')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">description</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">View Records</span>
        </button>
        <button onclick="navigateToPage('prescriptions')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">medication</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Prescriptions</span>
        </button>
        <button onclick="navigateToPage('settings')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">settings</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Settings</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render recent vitals
 */
function renderRecentVitals(vitals) {
  if (!vitals || vitals.length === 0) {
    return `
      <div class="card p-6 text-center">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-4xl text-slate-300">monitoring</span>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Recent Vitals</h3>
            <p class="text-slate-500 dark:text-slate-400">No vital signs recorded yet</p>
          </div>
          <button class="btn btn-secondary">
            Record Vitals
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="card p-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Vitals</h3>
      <div class="space-y-4">
        ${vitals.slice(0, 3).map(vital => renderVitalItem(vital)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render vital item
 */
function renderVitalItem(vital) {
  const vitalColors = {
    'Blood Pressure': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300',
    'Heart Rate': 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300',
    'Temperature': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
    'Weight': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
  };

  return `
    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full ${vitalColors[vital.type]} flex items-center justify-center">
          <span class="material-symbols-outlined">favorite</span>
        </div>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">${vital.type}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">Dr. ${vital.doctorName}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold text-slate-900 dark:text-white">${vital.value}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${vital.unit}</p>
      </div>
    </div>
  `;
}

/**
 * Render recent activity
 */
function renderRecentActivity(recentActivity) {
  if (!recentActivity || recentActivity.length === 0) {
    return `
      <div class="card p-6 text-center">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-4xl text-slate-300">history</span>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Recent Activity</h3>
            <p class="text-slate-500 dark:text-slate-400">No recent medical activity</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="card p-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
      <div class="space-y-4">
        ${recentActivity.map(activity => renderActivityItem(activity)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render activity item
 */
function renderActivityItem(activity) {
  const typeColors = {
    'Lab Results': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    'Clinical Notes': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
    'Prescription': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
  };

  return `
    <div class="flex items-start gap-3">
      <div class="w-8 rounded-full ${typeColors[activity.recordType]} dark:${typeColors[activity.recordType].replace('text-', 'dark:bg-')} text-${typeColors[activity.recordType].replace('text-', 'dark:text-300')} flex items-center justify-center flex-shrink-0 mt-1">
        <span class="material-symbols-outlined text-[16px]">description</span>
      </div>
      <div class="flex-1">
        <p class="text-sm text-slate-900 dark:text-white">
          ${activity.recordType} by Dr. ${activity.doctorName}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${formatDate(activity.date)} at ${activity.time}</p>
      </div>
    </div>
  `;
}

/**
 * Get greeting based on time of day
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Navigate to page
 */
function navigateToPage(pageId) {
  // Update current page in state
  stateManager.setState({ currentPage: pageId });
  
  // Update navigation to show active state
  renderNavigation();
  
  // Render the appropriate page content
  switch (pageId) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'appointments':
      renderAppointments();
      break;
    case 'records':
      renderRecords();
      break;
    case 'prescriptions':
      renderPrescriptions();
      break;
    case 'settings':
      renderSettings();
      break;
    default:
      renderDashboard();
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDashboard };
}
