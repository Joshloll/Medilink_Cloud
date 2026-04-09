/**
 * Dashboard Component
 * Renders the main dashboard with overview information
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
          
          <!-- Middle Row: Vitals Stats -->
          ${renderVitalsStats(vitals)}
          
          <!-- Bottom Row: Recent Activity -->
          ${renderRecentActivity(recentActivity)}
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
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const upcomingCount = upcomingAppointment ? 1 : 0;

  return `
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight">
          Welcome back, ${user?.firstName || 'User'}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">
          Today is ${today}. You have <span class="text-primary font-bold">${upcomingCount} upcoming appointment${upcomingCount !== 1 ? 's' : ''}</span>.
        </p>
      </div>
      <button onclick="navigateToPage('appointments')" 
              class="btn btn-primary flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary/25">
        <span class="material-symbols-outlined">add_circle</span>
        <span class="text-sm font-bold">Book Appointment</span>
      </button>
    </div>
  `;
}

/**
 * Render upcoming appointment card
 */
function renderUpcomingAppointment(appointment) {
  if (!appointment) {
    return `
      <div class="lg:col-span-2 card p-6 flex flex-col justify-center items-center text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">event_available</span>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Upcoming Appointments</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-4">You don't have any scheduled appointments</p>
        <button onclick="navigateToPage('appointments')" class="btn btn-primary">
          Book Appointment
        </button>
      </div>
    `;
  }

  return `
    <div class="lg:col-span-2 card p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
      <!-- Decorative bg shape -->
      <div class="absolute -right-10 -top-10 size-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      
      <div class="flex-1 flex flex-col justify-between gap-4 z-10">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <span class="size-2 rounded-full bg-primary animate-pulse"></span>
            Upcoming
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1">${appointment.doctorName}</h3>
          <p class="text-slate-500 dark:text-slate-400 font-medium">${appointment.specialty}</p>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-600 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">event</span>
              <span>${formatDate(appointment.date)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">schedule</span>
              <span>${appointment.time} - ${appointment.endTime}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-3 mt-2">
          <button onclick="handleJoinCall('${appointment.id}')" 
                  class="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5">
            <span class="material-symbols-outlined text-[18px]">videocam</span>
            Join Call
          </button>
          <button onclick="handleAppointmentDetails('${appointment.id}')" 
                  class="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5">
            Details
          </button>
        </div>
      </div>
      
      <!-- Doctor Image -->
      <div class="w-full md:w-48 aspect-video md:aspect-square rounded-xl bg-cover bg-center shadow-inner" 
           data-alt="Portrait of ${appointment.doctorName}"
           style='${appointment.doctorImage ? `background-image: url("${appointment.doctorImage}");` : ''}'>
      </div>
    </div>
  `;
}

/**
 * Render quick actions
 */
function renderQuickActions() {
  return `
    <div class="flex flex-col gap-4">
      <div class="card p-5 cursor-pointer group" onclick="handleFindSpecialist()">
        <div class="flex items-start justify-between">
          <div class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform duration-300">
            <span class="material-symbols-outlined">person_search</span>
          </div>
          <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors duration-300">arrow_forward</span>
        </div>
        <h4 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Find a Specialist</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Search by condition or name</p>
      </div>
      
      <div class="card p-5 cursor-pointer group" onclick="navigateToPage('prescriptions')">
        <div class="flex items-start justify-between">
          <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform duration-300">
            <span class="material-symbols-outlined">pill</span>
          </div>
          <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors duration-300">arrow_forward</span>
        </div>
        <h4 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Request Refill</h4>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Renew current prescriptions</p>
      </div>
    </div>
  `;
}

/**
 * Render vitals statistics
 */
function renderVitalsStats(vitals) {
  return `
    <div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">vital_signs</span>
        Recent Vitals
        <span class="text-xs font-normal text-slate-500 ml-auto">Last updated: ${formatDate(vitals[0]?.lastUpdated || new Date())}</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${vitals.map(vital => renderVitalCard(vital)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual vital card
 */
function renderVitalCard(vital) {
  const statusColors = {
    normal: 'emerald',
    optimal: 'emerald',
    decreased: 'amber',
    increased: 'amber'
  };

  const statusIcons = {
    normal: 'trending_up',
    optimal: 'check',
    decreased: 'trending_down',
    increased: 'trending_up'
  };

  const color = statusColors[vital.status] || 'amber';
  const icon = statusIcons[vital.status] || 'trending_up';

  return `
    <div class="card p-5 flex flex-col gap-2">
      <p class="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
        <span class="material-symbols-outlined text-${vital.color}-500 text-[20px]">${vital.icon}</span>
        ${vital.type}
      </p>
      <div class="flex items-end gap-3">
        <p class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          ${vital.value} <span class="text-lg font-medium text-slate-400">${vital.unit}</span>
        </p>
        ${vital.change !== undefined ? `
          <span class="inline-flex items-center text-xs font-bold text-${color}-600 dark:text-${color}-400 bg-${color}-50 dark:bg-${color}-900/30 px-2 py-1 rounded-md mb-1">
            <span class="material-symbols-outlined text-[14px] mr-0.5">${icon}</span>
            ${vital.change > 0 ? '+' : ''}${vital.change} ${vital.unit}
          </span>
        ` : `
          <span class="inline-flex items-center text-xs font-bold text-${color}-600 dark:text-${color}-400 bg-${color}-50 dark:bg-${color}-900/30 px-2 py-1 rounded-md mb-1">
            <span class="material-symbols-outlined text-[14px] mr-0.5">${icon}</span>
            ${vital.status.charAt(0).toUpperCase() + vital.status.slice(1)}
          </span>
        `}
      </div>
    </div>
  `;
}

/**
 * Render recent activity table
 */
function renderRecentActivity(activity) {
  return `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <button onclick="navigateToPage('records')" 
                class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          View All History
        </button>
      </div>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-slate-100 dark:border-slate-700">
                <th class="p-4 pl-6">Doctor / Clinic</th>
                <th class="p-4">Type</th>
                <th class="p-4">Date</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              ${activity.map(item => renderActivityRow(item)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render activity table row
 */
function renderActivityRow(item) {
  const statusClass = item.status === 'available' ? 'status-available' : 'status-pending';
  const statusText = item.status === 'available' ? 'Available' : 'Processing';
  const statusIcon = item.status === 'available' ? 'check_circle' : 'hourglass_empty';

  return `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
      <td class="p-4 pl-6">
        <div class="flex items-center gap-3">
          <div class="size-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-primary">
            <span class="material-symbols-outlined text-[18px]">${getActivityIcon(item.category)}</span>
          </div>
          <div>
            <p class="font-bold text-slate-900 dark:text-white">${item.doctor}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${getCategoryLabel(item.category)}</p>
          </div>
        </div>
      </td>
      <td class="p-4 text-slate-600 dark:text-slate-300">${item.type}</td>
      <td class="p-4 text-slate-600 dark:text-slate-300">${formatDate(item.date)}</td>
      <td class="p-4">
        <span class="${statusClass}">
          <span class="material-symbols-outlined text-[14px]">${statusIcon}</span>
          ${statusText}
        </span>
      </td>
      <td class="p-4 text-right pr-6">
        <button onclick="handleViewRecord('${item.id}')" 
                class="text-slate-400 hover:text-primary transition-all duration-300 transform hover:scale-110">
          <span class="material-symbols-outlined">${item.status === 'available' ? 'download' : 'visibility'}</span>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Get activity icon based on category
 */
function getActivityIcon(category) {
  const icons = {
    visit: 'description',
    lab: 'science',
    imaging: 'image',
    prescription: 'medication'
  };
  return icons[category] || 'folder';
}

/**
 * Get category label
 */
function getCategoryLabel(category) {
  const labels = {
    visit: 'Doctor Visit',
    lab: 'Laboratory',
    imaging: 'Imaging Center',
    prescription: 'Pharmacy'
  };
  return labels[category] || 'Medical Facility';
}

/**
 * Handle join call button
 */
function handleJoinCall(appointmentId) {
  alert(`Join Call: This would start video call for appointment ${appointmentId}`);
  // In a real app, this would initiate video call
}

/**
 * Handle appointment details
 */
function handleAppointmentDetails(appointmentId) {
  navigateToPage('appointments');
  // In a real app, this would show appointment details modal
}

/**
 * Handle find specialist
 */
function handleFindSpecialist() {
  navigateToPage('appointments');
  // In a real app, this would open specialist search
}

/**
 * Handle view record
 */
function handleViewRecord(recordId) {
  alert(`View Record: This would download/show record ${recordId}`);
  // In a real app, this would download or show record details
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

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDashboard };
}
