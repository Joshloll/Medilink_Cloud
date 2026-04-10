/**
 * ============================================================================
 * MEDILINK UNIFIED API LAYER WITH ERROR HANDLING & NOTIFICATIONS
 * ============================================================================
 * Single source of truth for all API calls
 * Handles loading states, retries, caching, and error reporting
 * ============================================================================
 */

// Cache storage for frequently accessed data
const apiCache = {
  users: null,
  appointments: null,
  records: null,
  prescriptions: null,
  lastFetch: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Show loading state to user
 */
export function showLoading(message = 'Loading...') {
  const loader = document.getElementById('app-loader') || createLoader();
  loader.style.display = 'flex';
  loader.innerHTML = `
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p class="text-slate-600 dark:text-slate-400">${message}</p>
    </div>
  `;
  return loader;
}

/**
 * Hide loading state
 */
export function hideLoading() {
  const loader = document.getElementById('app-loader');
  if (loader) loader.style.display = 'none';
}

/**
 * Create loader element if it doesn't exist
 */
function createLoader() {
  const loader = document.createElement('div');
  loader.id = 'app-loader';
  loader.className = 'fixed inset-0 bg-black/30 flex items-center justify-center z-50 hidden';
  document.body.appendChild(loader);
  return loader;
}

/**
 * Show success notification (toast)
 */
export function showSuccess(message, duration = 3000) {
  showNotification({
    type: 'success',
    message,
    duration,
    icon: 'check_circle'
  });
}

/**
 * Show error notification (toast)
 */
export function showError(message, duration = 4000) {
  showNotification({
    type: 'error',
    message,
    duration,
    icon: 'error'
  });
  console.error('🔴 Error:', message);
}

/**
 * Show info notification (toast)
 */
export function showInfo(message, duration = 3000) {
  showNotification({
    type: 'info',
    message,
    duration,
    icon: 'info'
  });
}

/**
 * Universal notification system
 */
function showNotification({ type = 'info', message, duration = 3000, icon = 'info' }) {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  
  const bgColors = {
    success: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
  };

  const textColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200',
    warning: 'text-yellow-800 dark:text-yellow-200'
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400'
  };

  const notification = document.createElement('div');
  notification.className = `
    ${bgColors[type] || bgColors.info}
    border rounded-lg shadow-lg p-4 mb-3 flex items-center gap-3
    animate-slide-in-right max-w-sm
  `;

  notification.innerHTML = `
    <span class="material-symbols-outlined ${iconColors[type]} text-[20px]">${icon}</span>
    <div class="flex-1">
      <p class="${textColors[type]} font-medium text-sm">${escapeHtml(message)}</p>
    </div>
    <button class="text-gray-400 hover:text-gray-600 transition" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  `;

  container.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Create notification container if it doesn't exist
 */
function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
  document.body.appendChild(container);
  return container;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Clear cache for a specific key
 */
export function clearCache(key) {
  if (apiCache[key]) {
    apiCache[key] = null;
    apiCache.lastFetch[key] = 0;
  }
}

/**
 * Check if cache is still valid
 */
function isCacheValid(key) {
  if (!apiCache[key]) return false;
  const age = Date.now() - (apiCache.lastFetch[key] || 0);
  return age < CACHE_DURATION;
}

/**
 * Set cache
 */
function setCache(key, data) {
  apiCache[key] = data;
  apiCache.lastFetch[key] = Date.now();
}

/**
 * Get cache
 */
function getCache(key) {
  if (isCacheValid(key)) {
    console.log(`✅ Using cached ${key}`);
    return apiCache[key];
  }
  return null;
}

// ============================================================================
// API CALLS WITH ERROR HANDLING
// ============================================================================

/**
 * Fetch users with error handling
 */
export async function fetchUsers(role = null) {
  try {
    // Check cache first
    const cacheKey = role ? `users_${role}` : 'users';
    const cached = getCache(cacheKey);
    if (cached) return { success: true, data: cached };

    showLoading(`Fetching ${role || 'all'} users...`);
    
    // Simulate API call (replace with real Supabase call)
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, email: 'admin@test.com', role: 'admin', status: 'approved' }
          ]
        });
      }, 500);
    });

    hideLoading();

    if (!response.success) throw new Error('Failed to fetch users');

    setCache(cacheKey, response.data);
    return response;
  } catch (error) {
    hideLoading();
    showError(`Failed to fetch users: ${error.message}`);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Fetch appointments with error handling
 */
export async function fetchAppointments(filters = {}) {
  try {
    const cached = getCache('appointments');
    if (cached) return { success: true, data: cached };

    showLoading('Loading appointments...');

    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: []
        });
      }, 500);
    });

    hideLoading();

    if (!response.success) throw new Error('Failed to fetch appointments');

    setCache('appointments', response.data);
    return response;
  } catch (error) {
    hideLoading();
    showError(`Failed to fetch appointments: ${error.message}`);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Generic API call with retry logic
 */
export async function apiCall(action, data = {}, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Add your actual API logic here
      // This is a placeholder
      
      return { success: true, data };
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        console.warn(`⚠️ Attempt ${attempt} failed, retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
      }
    }
  }

  showError(`Operation failed after ${retries} attempts: ${lastError.message}`);
  return { success: false, error: lastError.message };
}

/**
 * Handle form submission with validation
 */
export async function handleFormSubmit(formElement, onSuccess) {
  const submitBtn = formElement.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    // Validate form
    if (!formElement.checkValidity()) {
      showError('Please fill in all required fields');
      return false;
    }

    // Get form data
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-[20px] inline mr-2">sync</span>
      Processing...
    `;

    // Make API call
    const result = await apiCall('submit_form', data);

    if (result.success) {
      formElement.reset();
      showSuccess('Action completed successfully!');
      if (onSuccess) await onSuccess(result.data);
    } else {
      showError(result.error || 'Operation failed');
    }

    return result.success;
  } catch (error) {
    showError(`Error: ${error.message}`);
    return false;
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

/**
 * Add spinner to button during async operation
 */
export function addButtonSpinner(button) {
  if (!button) return;
  button.disabled = true;
  button.dataset.originalContent = button.innerHTML;
  button.innerHTML = `
    <span class="material-symbols-outlined animate-spin text-[18px]">sync</span>
  `;
}

/**
 * Remove spinner from button after operation
 */
export function removeButtonSpinner(button) {
  if (!button) return;
  button.disabled = false;
  button.innerHTML = button.dataset.originalContent || 'Done';
}

// Add CSS animations to document head if not already present
if (!document.querySelector('style[data-animations]')) {
  const style = document.createElement('style');
  style.setAttribute('data-animations', 'true');
  style.textContent = `
    @keyframes slide-in-right {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fade-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }

    .animate-fade-out {
      animation: fade-out 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
