/**
 * Appointments Component
 * Renders and manages appointments page
 */

let currentFilter = 'all';
let appointmentsData = [];

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
    appointmentsData = appointments;
    
    // Update state
    stateManager.setState({ appointments });

    // Render appointments page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <!-- Header Section -->
          ${renderAppointmentsHeader()}
          
          <!-- Filter Tabs -->
          ${renderFilterTabs()}
          
          <!-- Appointments List -->
          <div class="flex flex-col gap-4" id="appointments-list">
            ${renderAppointmentsList(getFilteredAppointments())}
          </div>
        </div>
      </div>
    `;

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
  const user = stateManager.getState().user;
  
  return `
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight">My Appointments</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Manage your upcoming and past appointments</p>
      </div>
      <button onclick="handleBookAppointment()" 
              class="btn btn-primary flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary/25">
        <span class="material-symbols-outlined">add_circle</span>
        <span class="text-sm font-bold">Book New Appointment</span>
      </button>
    </div>
  `;
}

/**
 * Render filter tabs
 */
function renderFilterTabs() {
  const filters = [
    { key: 'all', label: 'All Appointments' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  return `
    <div class="flex flex-wrap gap-2">
      ${filters.map(filter => `
        <button onclick="handleFilterChange('${filter.key}')" 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.05]
                       ${currentFilter === filter.key 
                         ? 'bg-primary text-white' 
                         : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}">
          ${filter.label}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Get filtered appointments based on current filter
 */
function getFilteredAppointments() {
  const today = new Date();
  
  switch (currentFilter) {
    case 'upcoming':
      return appointmentsData.filter(apt => apt.status === 'upcoming');
    case 'past':
      return appointmentsData.filter(apt => apt.status === 'completed');
    case 'cancelled':
      return appointmentsData.filter(apt => apt.status === 'cancelled');
    default:
      return appointmentsData;
  }
}

/**
 * Render appointments list
 */
function renderAppointmentsList(appointments) {
  if (!appointments || appointments.length === 0) {
    return `
      <div class="card p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">event_busy</span>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Appointments Found</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-4">
          ${currentFilter === 'all' ? 'You have no appointments yet' : `No ${currentFilter} appointments`}
        </p>
        <button onclick="handleBookAppointment()" class="btn btn-primary">
          Book Appointment
        </button>
      </div>
    `;
  }

  return appointments.map(appointment => renderAppointmentCard(appointment)).join('');
}

/**
 * Render individual appointment card
 */
function renderAppointmentCard(appointment) {
  const isUpcoming = appointment.status === 'upcoming';
  const isPast = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';

  return `
    <div class="card p-6 ${isPast ? 'opacity-75' : ''} transition-all duration-300 ${isPast ? 'hover:opacity-100' : ''}">
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="flex-1">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3
                           ${getStatusClass(appointment.status)}">
                ${getStatusIcon(appointment.status)}
                ${getStatusLabel(appointment.status)}
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1">${appointment.doctorName}</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium mb-4">${appointment.specialty}</p>
            </div>
            <span class="text-slate-500 dark:text-slate-400 text-sm">
              ${formatDate(appointment.date)} ${appointment.time}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">event</span>
              <span>${formatDate(appointment.date)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">schedule</span>
              <span>${appointment.time} - ${appointment.endTime}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">location_on</span>
              <span>${appointment.location}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">videocam</span>
              <span>${appointment.type}</span>
            </div>
          </div>
          
          <div class="flex gap-3 mt-2">
            ${renderAppointmentActions(appointment)}
          </div>
        </div>
        
        <!-- Doctor Image -->
        <div class="w-full lg:w-48 aspect-video lg:aspect-square rounded-xl bg-cover bg-center shadow-inner" 
             data-alt="Portrait of ${appointment.doctorName}"
             style='${appointment.doctorImage ? `background-image: url("${appointment.doctorImage}");` : ''}'>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render appointment action buttons
 */
function renderAppointmentActions(appointment) {
  const isUpcoming = appointment.status === 'upcoming';
  const isPast = appointment.status === 'completed';

  if (isUpcoming) {
    return `
      <button onclick="handleJoinCall('${appointment.id}')" 
              class="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5">
        <span class="material-symbols-outlined text-[18px]">videocam</span>
        Join Call
      </button>
      <button onclick="handleRescheduleAppointment('${appointment.id}')" 
              class="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5">
        <span class="material-symbols-outlined text-[18px]">edit</span>
        Reschedule
      </button>
      <button onclick="handleCancelAppointment('${appointment.id}')" 
              class="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5">
        <span class="material-symbols-outlined text-[18px]">cancel</span>
        Cancel
      </button>
    `;
  }

  if (isPast) {
    return `
      <button onclick="handleViewReport('${appointment.id}')" 
              class="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5">
        <span class="material-symbols-outlined text-[18px]">download</span>
        View Report
      </button>
      <button onclick="handleBookFollowUp('${appointment.id}')" 
              class="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5">
        <span class="material-symbols-outlined text-[18px]">calendar_month</span>
        Book Follow-up
      </button>
    `;
  }

  return '';
}

/**
 * Get status class for appointment
 */
function getStatusClass(status) {
  const classes = {
    upcoming: 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-300',
    completed: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300',
    cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
  };
  return classes[status] || classes.upcoming;
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
  const icons = {
    upcoming: '<span class="size-2 rounded-full bg-primary animate-pulse"></span>',
    completed: '<span class="material-symbols-outlined text-[14px]">check_circle</span>',
    cancelled: '<span class="material-symbols-outlined text-[14px]">cancel</span>'
  };
  return icons[status] || icons.upcoming;
}

/**
 * Get status label
 */
function getStatusLabel(status) {
  const labels = {
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status] || 'Upcoming';
}

/**
 * Handle filter change
 */
function handleFilterChange(filter) {
  currentFilter = filter;
  
  // Re-render filter tabs
  const filterTabs = document.querySelector('.flex.flex-wrap.gap-2');
  if (filterTabs) {
    filterTabs.innerHTML = renderFilterTabs();
  }
  
  // Re-render appointments list
  const appointmentsList = document.getElementById('appointments-list');
  if (appointmentsList) {
    appointmentsList.innerHTML = renderAppointmentsList(getFilteredAppointments());
  }
}

/**
 * Handle book appointment
 */
async function handleBookAppointment() {
  try {
    // In a real app, this would open a booking modal
    const newAppointment = {
      doctorName: 'Dr. New Doctor',
      specialty: 'General Practice',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '2:00 PM',
      endTime: '3:00 PM',
      type: 'In-Person',
      location: 'Main Clinic, Room 101'
    };

    const appointment = await apiService.addAppointment(newAppointment);
    appointmentsData.push(appointment);
    stateManager.setState({ appointments: appointmentsData });
    
    // Re-render appointments list
    const appointmentsList = document.getElementById('appointments-list');
    if (appointmentsList) {
      appointmentsList.innerHTML = renderAppointmentsList(getFilteredAppointments());
    }
    
    alert('Appointment booked successfully!');
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert('Error booking appointment. Please try again.');
  }
}

/**
 * Handle cancel appointment
 */
async function handleCancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }

  try {
    await apiService.cancelAppointment(appointmentId);
    
    // Update local data
    const appointment = appointmentsData.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = 'cancelled';
    }
    
    stateManager.setState({ appointments: appointmentsData });
    
    // Re-render appointments list
    const appointmentsList = document.getElementById('appointments-list');
    if (appointmentsList) {
      appointmentsList.innerHTML = renderAppointmentsList(getFilteredAppointments());
    }
    
    alert('Appointment cancelled successfully!');
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    alert('Error cancelling appointment. Please try again.');
  }
}

/**
 * Handle reschedule appointment
 */
async function handleRescheduleAppointment(appointmentId) {
  // In a real app, this would open a rescheduling modal
  const newDate = prompt('Enter new date (YYYY-MM-DD):');
  const newTime = prompt('Enter new time (e.g., 2:00 PM):');
  
  if (!newDate || !newTime) {
    return;
  }

  try {
    await apiService.rescheduleAppointment(appointmentId, { 
      date: newDate, 
      time: newTime 
    });
    
    // Update local data
    const appointment = appointmentsData.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.date = newDate;
      appointment.time = newTime;
    }
    
    stateManager.setState({ appointments: appointmentsData });
    
    // Re-render appointments list
    const appointmentsList = document.getElementById('appointments-list');
    if (appointmentsList) {
      appointmentsList.innerHTML = renderAppointmentsList(getFilteredAppointments());
    }
    
    alert('Appointment rescheduled successfully!');
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    alert('Error rescheduling appointment. Please try again.');
  }
}

/**
 * Handle join call
 */
function handleJoinCall(appointmentId) {
  alert(`Join Call: This would start video call for appointment ${appointmentId}`);
  // In a real app, this would initiate video call
}

/**
 * Handle view report
 */
function handleViewReport(appointmentId) {
  alert(`View Report: This would download/show report for appointment ${appointmentId}`);
  // In a real app, this would download or show report
}

/**
 * Handle book follow-up
 */
function handleBookFollowUp(appointmentId) {
  alert(`Book Follow-up: This would open booking form for follow-up to appointment ${appointmentId}`);
  // In a real app, this would open booking form with pre-filled data
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
  module.exports = { renderAppointments };
}
