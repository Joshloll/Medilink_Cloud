/**
 * Header Component
 * Renders the top header with user info and actions
 */

/**
 * Render header
 */
function renderHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const user = stateManager.getState().user;
  const notifications = stateManager.getState().notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  header.innerHTML = `
    <div class="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151f2b] px-6 shrink-0 z-20">
      <!-- Logo area -->
      <div class="flex items-center gap-3 text-slate-900 dark:text-white">
        <div class="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
          <span class="material-symbols-outlined">medical_services</span>
        </div>
        <h2 class="text-lg font-bold tracking-tight">MediLink Cloud</h2>
      </div>
      
      <!-- Search & Actions -->
      <div class="flex items-center gap-6">
        <!-- Search -->
        <div class="hidden md:flex relative group">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span class="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input class="block w-64 rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 transition-all" 
                 placeholder="Search patients or records..." 
                 type="text"
                 onkeyup="handleSearch(event)">
        </div>
        
        <!-- Icons -->
        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <button onclick="handleNotifications()" class="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            ${unreadCount > 0 ? `<span class="absolute top-2 right-2 size-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-800"></span>` : ''}
          </button>
          
          <!-- Chat -->
          <button onclick="handleChat()" class="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">chat</span>
          </button>
          
          <!-- Mobile Menu Trigger -->
          <button onclick="handleMobileMenu()" class="flex lg:hidden size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">menu</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle notifications click
 */
function handleNotifications() {
  const notifications = stateManager.getState().notifications;
  
  if (notifications.length === 0) {
    showInfo('No notifications');
    return;
  }

  // In a real app, this would show a notifications dropdown/modal
  const notificationList = notifications.map(n => 
    `-${n.title}: ${n.message} (${formatDate(n.createdAt)})`
  ).join('\n');

  alert(`Notifications:\n\n${notificationList}`);
}

/**
 * Handle chat click
 */
function handleChat() {
  showInfo('Chat feature coming soon!');
  // In a real app, this would open chat interface
}

/**
 * Handle mobile menu
 */
function handleMobileMenu() {
  const navigation = document.getElementById('navigation');
  if (navigation) {
    navigation.classList.toggle('hidden');
  }
}

/**
 * Handle search functionality
 */
window.handleSearch = async function(event) {
  const query = event.target.value.toLowerCase();
  const currentPage = stateManager.getState().currentPage;
  
  if (query.length < 2) {
    // Reset to full list if query is too short
    switch (currentPage) {
      case 'patients':
        renderPatientsList();
        break;
      case 'records':
        renderRecordsList();
        break;
      default:
        console.log('Global search:', query);
    }
    return;
  }

  // Delegate to appropriate component based on current page
  switch (currentPage) {
    case 'patients':
      await handlePatientSearch(query);
      break;
    case 'records':
      await handleRecordSearch(query);
      break;
    default:
      console.log('Global search:', query);
  }
};

/**
 * Handle patient search
 */
async function handlePatientSearch(query) {
  try {
    stateManager.setLoading(true);
    const patients = await apiService.searchPatients(query);
    
    // Update state with filtered patients
    stateManager.setState({ patients });
    
    // Re-render patients list
    const tableBody = document.getElementById('patients-table-body');
    if (tableBody) {
      tableBody.innerHTML = renderPatientsList(patients);
    }
    
    stateManager.setLoading(false);
  } catch (error) {
    console.error('Error searching patients:', error);
    stateManager.setError('Error searching patients');
    stateManager.setLoading(false);
  }
}

/**
 * Handle record search
 */
async function handleRecordSearch(query) {
  try {
    stateManager.setLoading(true);
    const records = await apiService.searchRecords(query);
    
    // Update state with filtered records
    stateManager.setState({ records });
    
    // Re-render records list
    const tableBody = document.getElementById('records-table-body');
    if (tableBody) {
      tableBody.innerHTML = renderRecordsList(records);
    }
    
    stateManager.setLoading(false);
  } catch (error) {
    console.error('Error searching records:', error);
    stateManager.setError('Error searching records');
    stateManager.setLoading(false);
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderHeader };
}
