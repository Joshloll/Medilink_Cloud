/**
 * Main Application Entry Point for Doctor Portal
 * Initializes the MediLink Doctor Portal
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize the application
    await initializeApp();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load application. Please refresh the page.');
  }
});

/**
 * Initialize the application
 */
async function initializeApp() {
  console.log('Initializing MediLink Doctor Portal...');
  
  // Show loading state
  showLoadingState();
  
  try {
    // Load initial data
    await loadInitialData();
    
    // Render initial UI
    renderInitialUI();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Hide loading state
    hideLoadingState();
    
    console.log('Application initialized successfully!');
    
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

/**
 * Load initial data
 */
async function loadInitialData() {
  // Fetch user data first
  const user = await apiService.fetchUser();
  
  // Update state with user data
  stateManager.setState({ 
    user,
    currentPage: 'dashboard'
  });
  
  // Load other data in parallel
  const [appointments, patients, records, notifications] = await Promise.all([
    apiService.fetchAppointments(),
    apiService.fetchPatients(),
    apiService.fetchRecords(),
    apiService.fetchNotifications()
  ]);
  
  // Update state with all data
  stateManager.setState({
    appointments,
    patients,
    records,
    notifications
  });
  
  console.log('Initial data loaded');
}

/**
 * Render initial UI
 */
function renderInitialUI() {
  // Render navigation
  renderNavigation();
  
  // Render header
  renderHeader();
  
  // Render default page (dashboard)
  renderDashboard();
  
  console.log('Initial UI rendered');
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
  // Handle browser back/forward navigation
  window.addEventListener('popstate', handleBrowserNavigation);
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Handle online/offline status
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
  
  // Set up notification polling
  startNotificationPolling();
  
  console.log('Global event listeners set up');
}

/**
 * Handle browser navigation
 */
function handleBrowserNavigation(event) {
  // In a single-page app, you might want to handle this differently
  console.log('Browser navigation detected');
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + K for search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    focusSearchInput();
  }
  
  // Ctrl/Cmd + / for help
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    handleHelpSupport();
  }
  
  // Ctrl/Cmd + N for new appointment
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    handleNewAppointment();
  }
  
  // Ctrl/Cmd + P for new patient
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault();
    handleNewPatient();
  }
}

/**
 * Focus search input
 */
function focusSearchInput() {
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    searchInput.focus();
  }
}

/**
 * Handle online status
 */
function handleOnlineStatus() {
  console.log('Application is online');
  hideOfflineMessage();
  showSuccess('Connection restored');
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
  console.log('Application is offline');
  showOfflineMessage();
  showWarning('No internet connection');
}

/**
 * Start notification polling
 */
function startNotificationPolling() {
  // Poll for new notifications every 30 seconds
  setInterval(async () => {
    try {
      const notifications = await apiService.fetchNotifications();
      const currentNotifications = stateManager.getState().notifications;
      
      // Check for new notifications
      const newNotifications = notifications.filter(n => 
        !currentNotifications.some(existing => existing.id === n.id)
      );
      
      if (newNotifications.length > 0) {
        stateManager.setState({ notifications });
        showSuccess(`${newNotifications.length} new notification${newNotifications.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, 30000);
}

/**
 * Show loading state
 */
function showLoadingState() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div class="text-center">
          <div class="spinner size-8 mx-auto mb-4"></div>
          <p class="text-slate-600 dark:text-slate-400">Loading MediLink Doctor Portal...</p>
        </div>
      </div>
    `;
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  // Loading state is hidden when actual content is rendered
  console.log('Loading state hidden');
}

/**
 * Show error message
 */
function showError(message) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div class="text-center max-w-md mx-auto p-6">
          <div class="bg-red-100 dark:bg-red-900/30 rounded-full size-16 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-2xl text-red-600 dark:text-red-300">error</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-4">${message}</p>
          <button onclick="location.reload()" 
                  class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  showToast(message, 'success');
}

/**
 * Show warning message
 */
function showWarning(message) {
  showToast(message, 'warning');
}

/**
 * Show info message
 */
function showInfo(message) {
  showToast(message, 'info');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 fade-in`;
  
  // Set colors based on type
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  };
  
  const icons = {
    success: 'check_circle',
    warning: 'warning',
    info: 'info',
    error: 'error'
  };
  
  toast.className += ` ${colors[type]}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${icons[type]}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

/**
 * Handle new appointment
 */
function handleNewAppointment() {
  navigateToPage('schedule');
  // In a real app, this would open an appointment creation modal
}

/**
 * Handle new patient
 */
function handleNewPatient() {
  navigateToPage('patients');
  // In a real app, this would open a patient creation modal
}

/**
 * Handle help support
 */
function handleHelpSupport() {
  alert('Help & Support: This would open a help modal or redirect to support page');
  // In a real app, this would open a help modal or navigate to support
}

/**
 * Handle search functionality (global)
 */
window.handleSearch = async function(event) {
  const query = event.target.value.toLowerCase();
  const currentPage = stateManager.getState().currentPage;
  
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
    renderPatientsList(patients);
    
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
    renderRecordsList(records);
    
    stateManager.setLoading(false);
  } catch (error) {
    console.error('Error searching records:', error);
    stateManager.setError('Error searching records');
    stateManager.setLoading(false);
  }
}

/**
 * Show offline message
 */
function showOfflineMessage() {
  // Remove existing offline message if any
  hideOfflineMessage();
  
  const message = document.createElement('div');
  message.id = 'offline-message';
  message.className = 'fixed top-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
  message.innerHTML = `
    <span class="material-symbols-outlined">wifi_off</span>
    <span>You're offline. Some features may not be available.</span>
  `;
  
  document.body.appendChild(message);
}

/**
 * Hide offline message
 */
function hideOfflineMessage() {
  const message = document.getElementById('offline-message');
  if (message) {
    message.remove();
  }
}

// Make functions globally available for inline event handlers
window.navigateToPage = navigateToPage;
window.renderDashboard = renderDashboard;
window.renderSchedule = renderSchedule;
window.renderPatients = renderPatients;
window.renderRecords = renderRecords;
window.renderSettings = renderSettings;

console.log('Doctor app.js loaded successfully!');
