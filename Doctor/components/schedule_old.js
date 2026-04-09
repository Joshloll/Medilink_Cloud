/**
 * Schedule Component
 * Renders the doctor schedule with calendar view
 */

let currentView = 'week';
let currentDate = new Date();
let selectedDate = new Date();

/**
 * Render schedule page
 */
async function renderSchedule() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch schedule data
    const [appointments, user] = await Promise.all([
      apiService.fetchAppointments(),
      apiService.fetchUser()
    ]);

    // Update state
    stateManager.setState({ appointments, user });

    // Render schedule content
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex flex-col gap-6">
          <!-- Header Section -->
          ${renderScheduleHeader()}
          
          <!-- Quick Stats -->
          ${renderScheduleStats()}
          
          <!-- Calendar View Container -->
          ${renderCalendarView(appointments)}
        </div>
      </div>
    `;

    // Set up calendar interactions
    setupCalendarInteractions();

  } catch (error) {
    console.error('Error loading schedule:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading schedule. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render schedule header
 */
function renderScheduleHeader() {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Schedule</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Manage your appointments and availability.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <!-- Date Navigator -->
        <div class="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
          <button onclick="changeDate(-1)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span class="px-3 text-sm font-semibold text-slate-900 dark:text-white min-w-[100px] text-center">${formattedDate}</span>
          <button onclick="changeDate(1)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
        <!-- View Switcher -->
        <div class="flex items-center rounded-lg bg-slate-200 dark:bg-slate-800 p-1">
          <button onclick="setView('day')" class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : ''}">Day</button>
          <button onclick="setView('week')" class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : ''}">Week</button>
          <button onclick="setView('month')" class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : ''}">Month</button>
        </div>
        <!-- Primary Action -->
        <button onclick="handleNewAppointment()" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20">
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>New Appointment</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render schedule statistics
 */
function renderScheduleStats() {
  const appointments = stateManager.getState().appointments;
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  );
  const pendingRequests = appointments.filter(apt => apt.status === 'pending');
  const cancellations = appointments.filter(apt => apt.status === 'cancelled');
  const availableSlots = 8 - todayAppointments.length - pendingRequests.length - cancellations.length;

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Patients Today</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${todayAppointments.length}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">${availableSlots} available</p>
        </div>
        <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <span class="material-symbols-outlined">group</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Requests</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${pendingRequests.length}</p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">${pendingRequests.length > 0 ? `${pendingRequests.length} urgent` : 'No urgent'}</p>
        </div>
        <div class="size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <span class="material-symbols-outlined">pending_actions</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Cancellations</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${cancellations.length}</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-1">Today</p>
        </div>
        <div class="size-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <span class="material-symbols-outlined">cancel</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Available Slots</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${Math.max(0, availableSlots)}</p>
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
 * Render calendar view
 */
function renderCalendarView(appointments) {
  const weekDays = getWeekDays(currentDate);
  
  return `
    <div class="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden h-[800px]">
      <!-- Days Header -->
      <div class="flex w-full border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1a2634]">
        <!-- Time Column Header spacer -->
        <div class="w-16 shrink-0 border-r border-slate-200 dark:border-slate-700"></div>
        <!-- Days -->
        <div class="grid grid-cols-5 w-full divide-x divide-slate-200 dark:divide-slate-700">
          ${weekDays.map(day => renderDayHeader(day)).join('')}
        </div>
      </div>
      
      <!-- Scrollable Grid -->
      <div class="flex-1 overflow-y-auto relative custom-scrollbar">
        <div class="flex w-full min-h-[1000px] relative">
          <!-- Time Column -->
          ${renderTimeColumn()}
          
          <!-- Grid Lines Overlay -->
          ${renderGridLines()}
          
          <!-- Events Container -->
          ${renderWeekEvents(appointments, weekDays)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Get week days array
 */
function getWeekDays(date) {
  const weekDays = [];
  const startOfWeek = new Date(date);
  
  for (let i = 0; i < 5; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  
  return weekDays;
}

/**
 * Render day header
 */
function renderDayHeader(day) {
  const isToday = day.toDateString() === new Date().toDateString();
  const dayNumber = day.getDate();
  const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
  
  return `
    <div class="flex flex-col items-center justify-center py-3 ${isToday ? 'bg-primary/5' : ''}">
      <span class="text-xs font-semibold ${isToday ? 'text-primary uppercase' : 'text-slate-500 dark:text-slate-400 uppercase'}">${dayName}</span>
      ${isToday ? 
        `<span class="size-8 flex items-center justify-center rounded-full bg-primary text-white text-lg font-bold shadow-md">${dayNumber}</span>` :
        `<span class="text-lg font-bold text-slate-900 dark:text-white">${dayNumber}</span>`
      }
    </div>
  `;
}

/**
 * Render time column
 */
function renderTimeColumn() {
  const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  
  return `
    <div class="w-16 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50 text-xs font-medium text-slate-500 dark:text-slate-400 pt-3">
      ${hours.map(hour => `
        <div class="h-24 text-center">${hour}</div>
      `).join('')}
    </div>
  `;
}

/**
 * Render grid lines
 */
function renderGridLines() {
  const gridLines = Array(9).fill(null);
  
  return `
    <div class="absolute inset-0 left-16 right-0 pointer-events-none flex flex-col z-0">
      ${gridLines.map(() => `
        <div class="h-24 border-b border-slate-100 dark:border-slate-700/50 w-full"></div>
      `).join('')}
    </div>
  `;
}

/**
 * Render week events
 */
function renderWeekEvents(appointments, weekDays) {
  const eventsByDay = {};
  
  // Group appointments by date
  appointments.forEach(appointment => {
    const aptDate = new Date(appointment.date);
    const dayKey = aptDate.toDateString();
    
    if (!eventsByDay[dayKey]) {
      eventsByDay[dayKey] = [];
    }
    eventsByDay[dayKey].push(appointment);
  });
  
  return `
    <div class="grid grid-cols-5 w-full divide-x divide-slate-100 dark:divide-slate-700/50 relative z-10">
      ${weekDays.map((day, index) => {
        const dayKey = day.toDateString();
        const dayEvents = eventsByDay[dayKey] || [];
        
        return `
          <div class="relative h-full ${index === 2 ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''}">
            ${index === 2 ? renderCurrentTimeIndicator() : ''}
            ${dayEvents.map(event => renderEvent(event)).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render individual event
 */
function renderEvent(event) {
  const typeColors = {
    'Video Consultation': 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-purple-500',
    'In-Person': 'bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500',
    'Check-up': 'bg-green-100 dark:bg-green-900/40 border-l-4 border-green-500',
    'Surgery': 'bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500'
  };

  const statusColors = {
    'upcoming': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    'completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  const statusIcons = {
    'upcoming': 'check_circle',
    'pending': 'schedule',
    'completed': 'check_circle',
    'cancelled': 'cancel'
  };

  const startHour = parseInt(event.time.split(':')[0]);
  const startMinute = parseInt(event.time.split(':')[1].split(' ')[0]);
  const duration = 60; // Default 1 hour appointments
  
  const topPosition = (startHour - 8) * 96 + (startMinute / 60) * 96;
  const height = duration;

  return `
    <div class="absolute top-[${topPosition}px] left-1 right-1 h-[${height}px] rounded ${typeColors[event.type]} border-l-4 border-l-500 p-2 cursor-pointer hover:shadow-md transition-shadow" onclick="handleEventClick('${event.id}')">
      <div class="flex justify-between items-start">
        <p class="text-xs font-bold text-${statusColors[event.status].split(' ')[0]} dark:${statusColors[event.status].split(' ')[1]}">${event.time}</p>
        ${event.type === 'Video Consultation' ? '<span class="material-symbols-outlined text-[16px] text-purple-600">videocam</span>' : ''}
      </div>
      <p class="text-sm font-semibold text-slate-800 dark:text-white truncate">${event.patientName}</p>
      <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${event.notes || ''}</p>
    </div>
  `;
}

/**
 * Render current time indicator
 */
function renderCurrentTimeIndicator() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const topPosition = (currentHour - 8) * 96 + (currentMinute / 60) * 96;
  
  return `
    <div class="absolute top-[${topPosition}px] w-full border-t-2 border-red-500 z-20 flex items-center">
      <div class="size-2 bg-red-500 rounded-full -ml-1"></div>
    </div>
  `;
}

/**
 * Handle event click
 */
function handleEventClick(eventId) {
  const appointment = stateManager.getState().appointments.find(apt => apt.id === eventId);
  if (appointment) {
    // Show appointment details modal or navigate to details
    showInfo(`Appointment: ${appointment.patientName} - ${appointment.type} at ${appointment.time}`);
  }
}

/**
 * Change date
 */
function changeDirection(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  renderSchedule();
}

/**
 * Change date
 */
function changeDate(days) {
  currentDate = new Date(currentDate);
  currentDate.setDate(currentDate.getDate() + days);
  renderSchedule();
}

/**
 * Set calendar view
 */
function setView(view) {
  currentView = view;
  renderSchedule();
}

/**
 * Handle new appointment
 */
async function handleNewAppointment() {
  // Navigate to schedule page and open appointment form
  navigateToPage('schedule');
  // In a real app, this would open a modal for appointment creation
}

/**
 * Navigate to page
 */
function navigateToPage(page) {
  // Update current page in state
  stateManager.setState({ currentPage: page });
  
  // Re-render navigation to update active state
  renderNavigation();
  
  // Render the appropriate page content
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'schedule':
      renderSchedule();
      break;
    case 'patients':
      renderPatients();
      break;
    case 'records':
      renderRecords();
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
  module.exports = { renderSchedule };
}
