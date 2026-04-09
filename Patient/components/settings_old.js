/**
 * Settings Component
 * Renders and manages settings page
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
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <!-- Header Section -->
          ${renderSettingsHeader()}
          
          <!-- Settings Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Profile & Account -->
            <div class="lg:col-span-2 space-y-6">
              ${renderProfileSettings(user)}
              ${renderSecuritySettings()}
              ${renderNotificationSettings()}
            </div>
            
            <!-- Right Column - Quick Actions -->
            <div class="space-y-6">
              ${renderQuickActions()}
              ${renderAccountStatus(user)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for settings
    addSettingsEventListeners();

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
 * Render settings header
 */
function renderSettingsHeader() {
  return `
    <div class="flex flex-col gap-2">
      <h1 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight">Settings</h1>
      <p class="text-slate-500 dark:text-slate-400 text-base">Manage your account settings and preferences</p>
    </div>
  `;
}

/**
 * Render profile settings section
 */
function renderProfileSettings(user) {
  return `
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
        <button onclick="handleEditProfile()" 
                class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Edit Profile
        </button>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-6">
        <div class="flex-shrink-0">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-white dark:ring-slate-700 shadow-lg cursor-pointer"
               data-alt="Profile picture of ${user.firstName} ${user.lastName}"
               style='${user.profileImage ? `background-image: url("${user.profileImage}");` : ''}'
               onclick="handleProfileImageClick()">
          </div>
        </div>
        
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">First Name</label>
              <p class="text-slate-900 dark:text-white font-medium">${user.firstName}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Last Name</label>
              <p class="text-slate-900 dark:text-white font-medium">${user.lastName}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Date of Birth</label>
              <p class="text-slate-900 dark:text-white font-medium">${formatDate(user.dateOfBirth)}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Gender</label>
              <p class="text-slate-900 dark:text-white font-medium">${user.gender}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Email</label>
              <p class="text-slate-900 dark:text-white font-medium">${user.email}</p>
            </div>
            <div>
              <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Phone</label>
              <p class="text-slate-900 dark:text-white font-medium">${user.phone}</p>
            </div>
          </div>
          
          <div>
            <label class="text-sm text-slate-500 dark:text-slate-400 font-medium">Address</label>
            <p class="text-slate-900 dark:text-white font-medium">${user.address}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render security settings section
 */
function renderSecuritySettings() {
  return `
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
        <button onclick="handleManageSecurity()" 
                class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Manage Security
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <span class="material-symbols-outlined">password</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Password</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
            </div>
          </div>
          <button onclick="handleChangePassword()" 
                  class="btn btn-primary px-4 py-2">
            Change
          </button>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300">
              <span class="material-symbols-outlined">phone_android</span>
            </div>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Extra security for your account</p>
            </div>
          </div>
          <button onclick="handleToggle2FA()" 
                  class="btn bg-green-600 text-white px-4 py-2">
            Enabled
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render notification settings section
 */
function renderNotificationSettings() {
  const settings = stateManager.getState().settings;
  
  return `
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
        <button onclick="handleManageNotifications()" 
                class="text-primary text-sm font-semibold hover:underline transition-all duration-300">
          Manage All
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Email Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Receive updates about your appointments and health records</p>
          </div>
          <label class="toggle">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.email ? 'checked' : ''} 
                   onchange="handleNotificationChange('email', this.checked)">
            <div class="toggle-slider"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">SMS Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Get text messages for appointment reminders</p>
          </div>
          <label class="toggle">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.sms ? 'checked' : ''} 
                   onchange="handleNotificationChange('sms', this.checked)">
            <div class="toggle-slider"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Push Notifications</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Receive alerts on your device</p>
          </div>
          <label class="toggle">
            <input type="checkbox" class="sr-only peer" ${settings.notifications.push ? 'checked' : ''} 
                   onchange="handleNotificationChange('push', this.checked)">
            <div class="toggle-slider"></div>
          </label>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render quick actions section
 */
function renderQuickActions() {
  return `
    <div class="card p-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div class="space-y-3">
        <button onclick="handleDownloadData()" 
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">download</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Download My Data</span>
        </button>
        
        <button onclick="handlePrivacySettings()" 
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">privacy_tip</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Privacy Settings</span>
        </button>
        
        <button onclick="handleHelpSupport()" 
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">help</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Help & Support</span>
        </button>
        
        <button onclick="handleSignOut()" 
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-left">
          <span class="material-symbols-outlined text-primary">logout</span>
          <span class="text-sm font-medium text-slate-900 dark:text-white">Sign Out</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render account status section
 */
function renderAccountStatus(user) {
  return `
    <div class="card p-6">
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
            <p class="text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-500">star</span>
          <div>
            <p class="font-medium text-slate-900 dark:text-white">Premium Member</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Since ${formatDate(user.memberSince)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Add event listeners for settings
 */
function addSettingsEventListeners() {
  // Event listeners are added inline in the HTML for simplicity
  // In a larger app, you might want to add them here for better organization
}

/**
 * Handle edit profile
 */
async function handleEditProfile() {
  const user = stateManager.getState().user;
  
  // Simple prompt-based editing (in a real app, this would be a modal)
  const newFirstName = prompt('First Name:', user.firstName);
  const newLastName = prompt('Last Name:', user.lastName);
  const newPhone = prompt('Phone:', user.phone);
  
  if (newFirstName && newLastName && newPhone) {
    try {
      const updatedUser = await apiService.updateUserProfile({
        firstName: newFirstName,
        lastName: newLastName,
        phone: newPhone
      });
      
      stateManager.setState({ user: updatedUser });
      
      // Re-render settings
      await renderSettings();
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  }
}

/**
 * Handle profile image click
 */
function handleProfileImageClick() {
  alert('Profile Image: This would open an image upload dialog');
  // In a real app, this would open file picker for profile image
}

/**
 * Handle change password
 */
function handleChangePassword() {
  alert('Change Password: This would open a password change form');
  // In a real app, this would open a secure password change form
}

/**
 * Handle toggle 2FA
 */
function handleToggle2FA() {
  alert('Two-Factor Authentication: This would open 2FA setup/disable options');
  // In a real app, this would handle 2FA setup
}

/**
 * Handle notification change
 */
async function handleNotificationChange(type, enabled) {
  try {
    const currentSettings = stateManager.getState().settings;
    const updatedSettings = {
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        [type]: enabled
      }
    };
    
    await apiService.updateSettings(updatedSettings);
    stateManager.setState({ settings: updatedSettings });
    
    console.log(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    alert('Error updating notification settings. Please try again.');
  }
}

/**
 * Handle manage security
 */
function handleManageSecurity() {
  alert('Manage Security: This would open comprehensive security settings');
  // In a real app, this would show advanced security options
}

/**
 * Handle manage notifications
 */
function handleManageNotifications() {
  alert('Manage Notifications: This would open advanced notification preferences');
  // In a real app, this would show detailed notification settings
}

/**
 * Handle download data
 */
function handleDownloadData() {
  alert('Download Data: This would start a data export process');
  // In a real app, this would initiate GDPR data export
}

/**
 * Handle privacy settings
 */
function handlePrivacySettings() {
  alert('Privacy Settings: This would open privacy and data sharing preferences');
  // In a real app, this would show privacy controls
}

/**
 * Handle help & support
 */
function handleHelpSupport() {
  alert('Help & Support: This would open the help center or contact support');
  // In a real app, this would navigate to help or open support chat
}

/**
 * Handle sign out
 */
function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    // Clear state
    stateManager.clear();
    
    // Redirect to login (in a real app)
    alert('Signed out successfully. You would be redirected to the login page.');
    // In a real app: window.location.href = '/login';
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderSettings };
}
