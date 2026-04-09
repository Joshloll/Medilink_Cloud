/**
 * Dashboard Component
 * Renders the doctor dashboard with overview information - Clean Version
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
    const [user, stats] = await Promise.all([
      apiService.fetchUser(),
      apiService.getDashboardStats()
    ]);

    // Update state
    stateManager.setState({ user });

    // Render dashboard content
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex flex-col gap-6">
          <!-- Header Section -->
          ${renderDashboardHeader(user)}
          
          <!-- Quick Stats -->
          ${renderQuickStats(stats)}
          
          <!-- Today's Schedule Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            ${renderTodayAppointments()}
            ${renderRecentActivity()}
          </div>
          
          <!-- Quick Actions -->
          ${renderQuickActions()}
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
 * Render dashboard header
 */
function renderDashboardHeader(user) {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, Dr. ${user?.lastName || 'Doctor'}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">
          Here's your practice overview for today, ${today}.
        </p>
      </div>
      <button onclick="handleNewAppointment()" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20">
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>New Appointment</span>
      </button>
    </div>
  `;
}

/**
 * Render quick stats
 */
function renderQuickStats(stats) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Patients</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.totalPatients}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">+${stats.newThisMonth || 0} this month</p>
        </div>
        <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <span class="material-symbols-outlined">group</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Appointments Today</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.appointmentsToday}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${stats.pendingRequests} pending</p>
        </div>
        <div class="size-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
          <span class="material-symbols-outlined">event_available</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Requests</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.pendingRequests}</p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">${stats.urgentRequests} urgent</p>
        </div>
        <div class="size-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <span class="material-symbols-outlined">cancel</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Available Slots</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.availableSlots}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">Available today</p>
        </div>
        <div class="size-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
          <span class="material-symbols-outlined">event_available</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render today's appointments
 */
function renderTodayAppointments() {
  const appointments = stateManager.getState().appointments;
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );

  if (todayAppointments.length === 0) {
    return `
      <div class="lg:col-span-2 card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex flex-col items-center justify-center py-8">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">event_busy</span>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">No appointments scheduled</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">Your schedule is clear for today</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="lg:col-span-2 card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Today's Appointments</h3>
        <a href="#" class="text-primary text-sm font-semibold hover:underline">View Full Schedule</a>
      </div>
      <div class="space-y-3">
        ${todayAppointments.map(apt => renderAppointmentCard(apt)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render appointment card for dashboard
 */
function renderAppointmentCard(appointment) {
  const statusColors = {
    upcoming: 'bg-green-100 dark:bg-green-900/40 border-l-4 border-green-500 p-2 cursor-pointer hover:shadow-md transition-shadow',
    pending: 'bg-amber-100 dark:bg-amber-900/40 border-l-4 border-amber-500 p-2 cursor-pointer hover:shadow-md transition-shadow',
    completed: 'bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500 p-2 cursor-pointer hover:shadow-md transition-shadow'
  };

  const statusIcons = {
    upcoming: 'check_circle',
    pending: 'schedule',
    completed: 'check_circle'
  };

  return `
    <div class="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div class="size-10 rounded-full ${statusColors[appointment.status]} flex items-center justify-center">
        <span class="material-symbols-outlined text-[14px]">${statusIcons[appointment.status]}</span>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <p class="font-semibold text-slate-900 dark:text-white">${appointment.patientName}</p>
          <span class="text-xs text-slate-500 dark:text-slate-400">${appointment.time} - ${appointment.endTime}</span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400">${appointment.type}</p>
      </div>
      <span class="px-2 py-1 bg-${statusColors[appointment.status]} text-${statusColors[appointment.status].split(' ')[0]} text-${statusColors[appointment.status].split(' ')[1]} text-xs font-medium rounded">
        ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
      </span>
    </div>
  `;
}

/**
 * Render recent activity
 */
function renderRecentActivity() {
  const records = stateManager.getState().records;
  const recentRecords = records.slice(0, 3);

  if (recentRecords.length === 0) {
    return `
      <div class="lg:col-span-1 card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div class="flex flex-col items-center justify-center py-8">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">history</span>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">No recent activity</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">No activity to display yet</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="lg:col-span-1 card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
      <div class="space-y-4">
        ${recentRecords.map(record => renderActivityItem(record)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render activity item
 */
function renderActivityItem(record) {
  const typeColors = {
    'Clinical Notes': 'text-blue-600 dark:text-blue-300',
    'Lab Results': 'text-green-600 dark:text-green-300',
    'Prescription': 'text-purple-600 dark:text-purple-300',
    'Emergency Report': 'text-red-600 dark:text-red-300'
  };

  const iconColors = {
    'Clinical Notes': 'description',
    'Lab Results': 'science',
    'Prescription': 'medication',
    'Emergency Report': 'emergency'
  };

  return `
    <div class="flex items-start gap-3">
      <div class="size-8 rounded-full ${typeColors[record.recordType]} dark:${typeColors[record.recordType].replace('text-', 'dark:bg-')} text-${typeColors[recordType]} flex items-center justify-center flex-shrink-0 mt-1">
        <span class="material-symbols-outlined text-[16px]">${iconColors[record.recordType]}</span>
      </div>
      <div class="flex-1">
        <p class="text-sm text-slate-900 dark:text-white">
          ${record.recordType} for <span class="font-semibold">${record.patientName}</span>
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${formatDate(record.date)} at ${record.time}</p>
      </div>
    </div>
  `;
}

/**
 * Render quick actions
 */
function renderQuickActions() {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 border border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span class="material-symbols-outlined">person_add</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">arrow_forward</span>
        </div>
        <h4 class="font-semibold text-slate-900 dark:text-white">New Patient</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Register new patient</p>
      </div>
      <div class="card p-5 border border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center">
            <span class="material-symbols-outlined">medication</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">arrow_forward</span>
        </div>
        <h4 class="font-semibold text-slate-900 dark:text-white">Prescribe</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Issue prescription</p>
      </div>
      <div class="card p-5 border border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <span class="material-symbols-outlined">science</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">arrow_forward</span>
        </div>
        <h4 class="font-semibold text-slate-900 dark:text-white">Lab Results</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Review test results</p>
      </div>
      <div class="card p-5 border border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div class="flex items-center justify-between mb-3">
          <div class="size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
            <span class="material-symbols-outlined">analytics</span>
          </div>
          <span class="material-symbols-outlined text-slate-400">arrow_forward</span>
        </div>
        <h4 class="font-semibold text-slate-900 dark:text-white">Analytics</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">View reports</p>
      </div>
    </div>
  `;
}

/**
 * Handle new appointment
 */
async function handleNewAppointment() {
  try {
    stateManager.setLoading(true);
    
    const newAppointment = {
      doctorName: prompt('Doctor Name:'),
      specialty: prompt('Specialty:'),
      date: prompt('Date (YYYY-MM-DD):'),
      time: prompt('Time (HH:MM AM/PM):'),
      type: 'In-Person',
      location: 'Office',
      notes: ''
    };
    
    if (newAppointment.doctorName && newAppointment.date && newAppointment.time) {
      const appointment = await apiService.createAppointment(newAppointment);
      stateManager.addToArray('appointments', appointment);
      showSuccess('Appointment created successfully!');
      renderDashboard();
    }
    
    stateManager.setLoading(false);
  } catch (error) {
    console.error('Error creating appointment:', error);
    stateManager.setError('Error creating appointment');
    stateManager.setLoading(false);
    showError('Error creating appointment. Please try again.');
  }
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
