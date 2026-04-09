/**
 * Header Component
 * Renders the top header with user info and actions
 */

/**
 * Render header component
 */
function renderHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const user = stateManager.getState().user;
  const currentPage = stateManager.getState().currentPage;
  
  // Get page title based on current page
  const pageTitle = getPageTitle(currentPage);
  
  header.innerHTML = `
    <header class="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark px-6 py-4 z-10 shrink-0">
      <!-- Mobile Menu Toggle -->
      <button class="lg:hidden mr-4 text-slate-600 dark:text-slate-300 transition-all duration-300 hover:scale-110" onclick="toggleMobileMenu()">
        <span class="material-symbols-outlined">menu</span>
      </button>
      
      <!-- Page Title -->
      <div class="flex items-center gap-4">
        <h2 class="text-slate-900 dark:text-white text-xl font-bold leading-tight hidden sm:block">${pageTitle}</h2>
      </div>
      
      <!-- Search & Actions -->
      <div class="flex flex-1 justify-end items-center gap-4 sm:gap-6">
        <!-- Search Bar -->
        <div class="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 w-full max-w-xs transition-colors focus-within:ring-2 focus-within:ring-primary/20">
          <span class="material-symbols-outlined text-slate-400">search</span>
          <input type="text" 
                 class="bg-transparent border-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-0 w-full ml-2" 
                 placeholder="Search records, doctors..."
                 onkeyup="handleSearch(event)">
        </div>
        
        <!-- Notifications & Icons -->
        <div class="flex items-center gap-2">
          <button class="relative flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-300 transform hover:scale-110"
                  onclick="handleNotifications()">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-card-dark"></span>
          </button>
          
          <button class="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-300 transform hover:scale-110"
                  onclick="handleMessages()">
            <span class="material-symbols-outlined">chat_bubble</span>
          </button>
        </div>
        
        <!-- User Profile -->
        <div class="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-slate-900 dark:text-white leading-none">
              ${user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ${user ? `Patient ID: #${user.id}` : 'Not logged in'}
            </p>
          </div>
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white dark:ring-slate-700 shadow-sm cursor-pointer"
               data-alt="Profile picture"
               style='${user ? `background-image: url("${user.profileImage}");` : ''}'
               onclick="handleProfileClick()">
          </div>
        </div>
      </div>
    </header>
  `;
}

/**
 * Get page title based on current page
 */
function getPageTitle(page) {
  const titles = {
    dashboard: 'Dashboard',
    appointments: 'My Appointments',
    records: 'Medical Records',
    prescriptions: 'Prescriptions',
    settings: 'Settings'
  };
  return titles[page] || 'Dashboard';
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  
  // Filter data based on current page
  const currentPage = stateManager.getState().currentPage;
  
  switch (currentPage) {
    case 'appointments':
      filterAppointments(query);
      break;
    case 'records':
      filterRecords(query);
      break;
    case 'prescriptions':
      filterPrescriptions(query);
      break;
    default:
      console.log('Search:', query);
  }
}

/**
 * Filter appointments by search query
 */
function filterAppointments(query) {
  const appointments = stateManager.getState().appointments;
  const filtered = appointments.filter(apt => 
    apt.doctorName.toLowerCase().includes(query) ||
    apt.specialty.toLowerCase().includes(query) ||
    apt.type.toLowerCase().includes(query)
  );
  
  // Re-render appointments with filtered results
  renderAppointmentsList(filtered);
}

/**
 * Filter records by search query
 */
function filterRecords(query) {
  const records = stateManager.getState().records;
  const filtered = records.filter(record => 
    record.description.toLowerCase().includes(query) ||
    record.doctor.toLowerCase().includes(query) ||
    record.type.toLowerCase().includes(query)
  );
  
  // Re-render records with filtered results
  renderRecordsList(filtered);
}

/**
 * Filter prescriptions by search query
 */
function filterPrescriptions(query) {
  const prescriptions = stateManager.getState().prescriptions;
  const filtered = prescriptions.filter(pres => 
    pres.name.toLowerCase().includes(query) ||
    pres.doctor.toLowerCase().includes(query) ||
    pres.pharmacy.toLowerCase().includes(query)
  );
  
  // Re-render prescriptions with filtered results
  renderPrescriptionsList(filtered);
}

/**
 * Handle notifications button click
 */
function handleNotifications() {
  alert('Notifications: This would open the notifications panel');
  // In a real app, this would open a notifications dropdown/modal
}

/**
 * Handle messages button click
 */
function handleMessages() {
  alert('Messages: This would open the messages panel');
  // In a real app, this would open a messages dropdown/modal
}

/**
 * Handle profile click
 */
function handleProfileClick() {
  // Navigate to settings page
  navigateToPage('settings');
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  alert('Mobile menu: This would toggle the mobile navigation menu');
  // In a real app, this would show/hide mobile navigation
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderHeader };
}
