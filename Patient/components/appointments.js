/**
 * Appointments Component
 * Renders and manages patient appointments
 */

/**
 * Render appointments page
 */
async function renderAppointments() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch appointments data
    const appointments = await apiService.fetchAppointments();
    
    // Update state
    stateManager.setState({ appointments });

    // Render appointments page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
          <!-- Header Section -->
          ${renderAppointmentsHeader()}
          
          <!-- Filter Tabs -->
          ${renderFilterTabs()}
          
          <!-- Appointments List -->
          <div class="card overflow-hidden">
            <div class="overflow-y-auto max-h-[600px]">
              <div class="divide-y divide-slate-200 dark:divide-slate-700" id="appointments-list">
                ${renderAppointmentsList(appointments)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupAppointmentsEventListeners();

  } catch (error) {
    console.error('Error loading appointments:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading appointments. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render appointments header
 */
function renderAppointmentsHeader() {
  const totalAppointments = stateManager.getState().appointments.length;
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Appointments</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Manage your appointments and schedule new ones.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button onclick="handleBookAppointment()" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20">
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Book Appointment</span>
        </button>
        <button class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined text-[20px]">calendar_month</span>
          <span>Calendar View</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render filter tabs
 */
function renderFilterTabs() {
  const currentFilter = stateManager.getState().currentAppointmentFilter || 'all';
  const appointments = stateManager.getState().appointments;
  
  return `
    <div class="card p-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button onclick="setAppointmentFilter('all')" class="px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        All (${appointments.length})
      </button>
      <button onclick="setAppointmentFilter('upcoming')" class="px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentFilter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        Upcoming (${appointments.filter(apt => apt.status === 'upcoming').length})
      </button>
      <button onclick="setAppointmentFilter('completed')" class="px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        Completed (${appointments.filter(apt => apt.status === 'completed').length})
      </button>
      <button onclick="setAppointmentFilter('cancelled')" class="px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentFilter === 'cancelled' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        Cancelled (${appointments.filter(apt => apt.status === 'cancelled').length})
      </button>
    </div>
  `;
}

/**
 * Render appointments list
 */
function renderAppointmentsList(appointments) {
  const currentFilter = stateManager.getState().currentAppointmentFilter || 'all';
  
  let filteredAppointments = appointments;
  
  // Apply filter
  if (currentFilter !== 'all') {
    filteredAppointments = appointments.filter(apt => apt.status === currentFilter);
  }
  
  if (filteredAppointments.length === 0) {
    return `
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">event_busy</span>
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Appointments Found</h3>
          <p class="text-slate-500 dark:text-slate-400">No ${currentFilter === 'all' ? 'appointments' : currentFilter} have been scheduled yet</p>
        </div>
        <button onclick="handleBookAppointment()" class="mt-4 btn btn-primary">
          Book Your First Appointment
        </button>
      </div>
    `;
  }
  
  return filteredAppointments.map(appointment => renderAppointmentCard(appointment)).join('');
}

/**
 * Render appointment card
 */
function renderAppointmentCard(appointment) {
  const statusColors = {
    upcoming: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  const statusIcons = {
    upcoming: 'event_available',
    completed: 'check_circle',
    cancelled: 'cancel'
  };

  const typeIcons = {
    'Video Consultation': 'video_call',
    'In-Person': 'person',
    'Phone Call': 'call',
    'Home Visit': 'home'
  };

  return `
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left Column: Doctor Info -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">${typeIcons[appointment.type] || 'person'}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">${appointment.doctorName}</h3>
              <span class="px-3 py-1 rounded-full ${statusColors[appointment.status]} text-xs font-medium">
                <span class="material-symbols-outlined text-[14px] ${statusIcons[appointment.status]}"></span>
                ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-sm">${appointment.specialty}</p>
          </div>
        </div>
        
        <!-- Right Column: Appointment Details -->
        <div class="flex-1 lg:text-right">
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex items-center gap-2 justify-end">
              <span class="material-symbols-outlined text-slate-400">calendar_today</span>
              <span class="text-slate-600 dark:text-slate-400">${formatDate(appointment.date)} at ${appointment.time}</span>
            </div>
            <div class="flex items-center gap-2 justify-end">
              <span class="material-symbols-outlined text-slate-400">schedule</span>
              <span class="text-slate-600 dark:text-slate-400">${appointment.time} - ${appointment.endTime}</span>
            </div>
            <div class="flex items-center gap-2 justify-end">
              <span class="material-symbols-outlined text-slate-400">location_on</span>
              <span class="text-slate-600 dark:text-slate-400">${appointment.type} - ${appointment.location}</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2 justify-end mt-4">
            ${appointment.status === 'upcoming' ? `
              <button onclick="handleJoinCall('${appointment.id}')" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold">
                <span class="material-symbols-outlined text-[18px]">video_call</span>
                Join Call
              </button>
            ` : ''}
            ${appointment.status === 'upcoming' ? `
              <button onclick="handleReschedule('${appointment.id}')" class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined text-[18px]">event</span>
                Reschedule
              </button>
            ` : ''}
            ${appointment.status === 'upcoming' ? `
              <button onclick="handleCancel('${appointment.id}')" class="btn btn-danger flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors">
                <span class="material-symbols-outlined text-[18px]">cancel</span>
                Cancel
              </button>
            ` : ''}
            ${appointment.status === 'completed' ? `
              <button onclick="handleBookFollowUp()" class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined text-[18px]">event_repeat</span>
                Book Follow-up
              </button>
            ` : ''}
            <button onclick="handleViewDetails('${appointment.id}')" class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Filter appointments by status
 */
function setAppointmentFilter(filter) {
  stateManager.updateProperty('currentAppointmentFilter', filter);
  renderAppointmentsList();
}

/**
 * Handle book appointment
 */
function handleBookAppointment() {
  // In a real app, this would open a booking modal
  alert('Book Appointment feature coming soon!');
}

/**
 * Handle join call
 */
function handleJoinCall(appointmentId) {
  const appointment = stateManager.getState().appointments.find(apt => apt.id === appointmentId);
  if (appointment) {
    showInfo(`Joining call with Dr. ${appointment.doctorName}...`);
    // In a real app, this would initiate video call
  }
}

/**
 * Handle reschedule appointment
 */
function handleReschedule(appointmentId) {
  const appointment = stateManager.getState().appointments.find(apt => apt.id === appointmentId);
  if (appointment) {
    const newDate = prompt('New date (YYYY-MM-DD):', appointment.date);
    const newTime = prompt('New time (HH:MM AM/PM):', appointment.time);
    
    if (newDate && newTime) {
      apiService.rescheduleAppointment(appointmentId, newDate, newTime);
      stateManager.updateInArray('appointments', appointmentId, {
        date: newDate,
        time: newTime
      });
      showSuccess('Appointment rescheduled successfully!');
      renderAppointments();
    }
  }
}

/**
 * Handle cancel appointment
 */
function handleCancel(appointmentId) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    apiService.cancelAppointment(appointmentId);
    stateManager.updateInArray('appointments', appointmentId, {
      status: 'cancelled'
    });
    showSuccess('Appointment cancelled successfully!');
    renderAppointments();
  }
}

/**
 * Handle view details
 */
function handleViewDetails(appointmentId) {
  const appointment = stateManager.getState().appointments.find(apt => apt.id === appointmentId);
  if (appointment) {
    alert(`Appointment Details:\n\nDoctor: ${appointment.doctorName}\nSpecialty: ${appointment.specialty}\nDate: ${formatDate(appointment.date)} at ${appointment.time}\nType: ${appointment.type}\nLocation: ${appointment.location}\nStatus: ${appointment.status}`);
  }
}

/**
 * Handle book follow-up
 */
function handleBookFollowUp() {
  alert('Book Follow-up feature coming soon!');
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderAppointments };
}
