/**
 * Main Application Entry Point
 * Initializes the MediLink Patient Portal
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
  console.log('Initializing MediLink Patient Portal...');
  
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
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
  console.log('Application is offline');
  showOfflineMessage();
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
          <div class="spinner size-12 mx-auto mb-4"></div>
          <p class="text-slate-600 dark:text-slate-400">Loading MediLink...</p>
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
            <span class="material-symbols-outlined text-red-600 dark:text-red-300 text-2xl">error</span>
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
 * Show offline message
 */
function showOfflineMessage() {
  // Remove existing offline message if any
  hideOfflineMessage();
  
  const message = document.createElement('div');
  message.id = 'offline-message';
  message.className = 'fixed top-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
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

/**
 * Global utility functions
 */

/**
 * Format date consistently across the app
 */
window.formatDate = function(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Format time consistently across the app
 */
window.formatTime = function(timeString) {
  if (!timeString) return 'N/A';
  return timeString;
};

/**
 * Show success message
 */
window.showSuccess = function(message) {
  showToast(message, 'success');
};

/**
 * Show error message
 */
window.showError = function(message) {
  showToast(message, 'error');
};

/**
 * Show info message
 */
window.showInfo = function(message) {
  showToast(message, 'info');
};

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
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
  };
  
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
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
 * Handle search functionality (global)
 */
window.handleSearch = function(event) {
  const query = event.target.value.toLowerCase();
  const currentPage = stateManager.getState().currentPage;
  
  // Delegate to appropriate component based on current page
  switch (currentPage) {
    case 'appointments':
      if (typeof filterAppointments === 'function') {
        filterAppointments(query);
      }
      break;
    case 'records':
      if (typeof filterRecords === 'function') {
        filterRecords(query);
      }
      break;
    case 'prescriptions':
      if (typeof filterPrescriptions === 'function') {
        filterPrescriptions(query);
      }
      break;
    default:
      console.log('Global search:', query);
  }
};

/**
 * Initialize Tailwind CSS configuration
 */
window.tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "primary-dark": "#0b63be",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "card-light": "#ffffff",
        "card-dark": "#1e2936",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem", 
        "lg": "0.5rem", 
        "xl": "0.75rem", 
        "2xl": "1rem", 
        "full": "9999px"
      },
    },
  },
};

// Make functions globally available for inline event handlers
window.navigateToPage = navigateToPage;
window.renderDashboard = renderDashboard;
window.renderAppointments = renderAppointments;
window.renderRecords = renderRecords;
window.renderPrescriptions = renderPrescriptions;
window.renderSettings = renderSettings;

console.log('App.js loaded successfully!');
