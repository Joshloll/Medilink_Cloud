/**
 * Settings Component
 * Renders and manages doctor settings
 */

/**
 * Render settings page
 */
async function renderSettings() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch user data
    const user = await apiService.fetchUser();
    
    // Update state
    stateManager.setState({ user });

    // Render settings page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
          <!-- Page Header -->
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
            <p class="text-slate-500 dark:text-slate-400 text-base">Manage your account settings and preferences.</p>
          </div>
          
          <!-- Settings Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column - Profile & Account -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Profile Settings -->
              ${renderProfileSettings(user)}
              
              <!-- Professional Settings -->
              ${renderProfessionalSettings()}
              
              <!-- Security Settings -->
              ${renderSecuritySettings()}
              
              <!-- Notification Settings -->
              ${renderNotificationSettings()}
            </div>
            
            <!-- Right Column - Quick Actions -->
            <div class="space-y-6">
              <!-- Quick Actions -->
              ${renderQuickActions()}
              
              <!-- Account Status -->
              ${renderAccountStatus(user)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupSettingsEventListeners();

  } catch (error) {
    console.error('Error loading settings:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading settings. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render profile settings
 */
function renderProfileSettings(user) {
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
        <button onclick="handleEditProfile()" class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Edit Profile
        </button>
      </div>
      <div class="flex flex-col sm:flex-row gap-6">
        <div class="flex-shrink-0">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-white dark:ring-slate-700 shadow-lg cursor-pointer"
               data-alt="Profile picture of Dr. ${user?.lastName || 'Doctor'}"
               style='background-image: url("${user?.profileImage || ''}");'>
          </div>
        </div>
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">First Name</label>
              <p class="text-slate-900 dark:text-white font-medium">${user?.firstName || 'N/A'}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Last Name</label>
              <p class="text-slate-900 dark:text-white font-medium">${user?.lastName || 'N/A'}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Date of Birth</label>
              <p class="text-slate-900 dark:text-white font-medium">${formatDate(user?.dateOfBirth) || 'N/A'}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Gender</label>
              <p class="text-slate-900 dark:text-white font-medium">${user?.gender || 'N/A'}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Email</label>
              <p class="text-slate-900 dark:text-white font-medium">${user?.email || 'N/A'}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Phone</label>
              <p class="text-slate-900 dark:text-white font-medium">${user?.phone || 'N/A'}</p>
            </div>
          </div>
          <div>
            <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">License Number</label>
            <p class="text-slate-900 dark:text-white font-medium">${user?.licenseNumber || 'N/A'}</p>
          </div>
          <div>
            <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Specialization</label>
            <p class="text-slate-900 dark:text-white font-medium">${user?.specialization || 'N/A'}</p>
          </div>
          <div>
            <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Office Address</label>
            <p class="text-slate-900 dark:text-white font-medium">${user?.officeAddress || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render professional settings
 */
function renderProfessionalSettings() {
  const settings = stateManager.getState().settings;
  
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Professional Settings</h3>
        <button class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Manage
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <span class="material-symbols-outlined">medical_services</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Practice Information</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Manage your practice details and services</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-all">
            Edit
          </button>
        </div>
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Working Hours</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Mon-Fri: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-all">
            Edit
          </button>
        </div>
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Billing Settings</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Consultation fees and payment methods</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-all">
            Edit
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render security settings
 */
function renderSecuritySettings() {
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
        <button class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Manage Security
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <span class="material-symbols-outlined">password</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Password</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Last changed 30 days ago</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-all">
            Change
          </button>
        </div>
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
              <span class="material-symbols-outlined">phone_android</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Extra security for your account</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">
            Enabled
          </button>
        </div>
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300">
              <span class="material-symbols-outlined">security</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Login Activity</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">View recent login attempts</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-all">
            View
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render notification settings
 */
function renderNotificationSettings() {
  const settings = stateManager.getState().settings;
  
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
        <button class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Manage All
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Email Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Receive updates about appointments and patient messages</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.email ? 'checked' : ''} onchange="toggleNotification('email', this.checked)">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">SMS Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Get text messages for urgent updates</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.sms ? 'checked' : ''} onchange="toggleNotification('sms', this.checked)">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Push Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Receive alerts on your device</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.push ? 'checked' : ''} onchange="toggleNotification('push', this.checked)">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render quick actions
 */
function renderQuickActions() {
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div class="space-y-3">
        <button onclick="handleExportData()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">download</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Export Data</span>
        </button>
        <button onclick="handlePrivacySettings()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">privacy_tip</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Privacy Settings</span>
        </button>
        <button onclick="handleHelpSupport()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">help</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Help & Support</span>
        </button>
        <button onclick="handleSignOut()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">logout</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Sign Out</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render account status
 */
function renderAccountStatus(user) {
  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Status</h3>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-green-500">check_circle</span>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Account Active</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">All features available</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-blue-500">verified</span>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Email Verified</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">${user?.email || 'N/A'}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-500">star</span>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Premium Member</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Since ${formatDate(user?.memberSince) || 'N/A'}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-purple-500">workspace_premium</span>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">HIPAA Compliant</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Security standards met</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle edit profile
 */
function handleEditProfile() {
  const user = stateManager.getState().user;
  if (!user) return;

  const updatedProfile = {
    firstName: prompt('First Name:', user.firstName),
    lastName: prompt('Last Name:', user.lastName),
    email: prompt('Email:', user.email),
    phone: prompt('Phone:', user.phone),
    officeAddress: prompt('Office Address:', user.officeAddress)
  };

  if (updatedProfile.firstName && updatedProfile.lastName) {
    apiService.updateUserProfile(updatedProfile);
    stateManager.updateProperty('user', { ...user, ...updatedProfile });
    showSuccess('Profile updated successfully!');
    renderSettings();
  }
}

/**
 * Toggle notification setting
 */
function toggleNotification(type, enabled) {
  const settings = stateManager.getState().settings;
  settings.notifications[type] = enabled;
  stateManager.updateProperty('settings', settings);
  
  showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Handle export data
 */
function handleExportData() {
  showInfo('Exporting your data...');
  
  // Simulate export
  setTimeout(() => {
    showSuccess('Data exported successfully!');
  }, 1000);
}

/**
 * Handle privacy settings
 */
function handlePrivacySettings() {
  showInfo('Opening privacy settings...');
  // In a real app, this would open privacy settings modal
}

/**
 * Handle help and support
 */
function handleHelpSupport() {
  showInfo('Opening help & support...');
  // In a real app, this would open help modal or redirect to support
}

/**
 * Handle sign out
 */
function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    stateManager.clear();
    window.location.href = 'index.html';
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderSettings };
}
