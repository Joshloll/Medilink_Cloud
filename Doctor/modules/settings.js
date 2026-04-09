// Settings Module - Doctor Settings Rendering
export function renderDoctorSettings(container, state) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Settings</h1>
                <div class="flex gap-2">
                    <button data-action="save-settings" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <span class="material-symbols-outlined mr-2">save</span>
                        Save Changes
                    </button>
                </div>
            </div>
            
            <!-- Settings Sections -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Profile Section -->
                <div class="lg:col-span-2 space-y-6">
                    ${renderProfileSection(state.doctor)}
                    ${renderWorkingHoursSection(state.doctor.workingHours)}
                    ${renderNotificationsSection()}
                </div>
                
                <!-- Sidebar -->
                <div class="space-y-6">
                    ${renderAccountSection(state.doctor)}
                    ${renderSecuritySection()}
                </div>
            </div>
        </div>
    `;
}

function renderProfileSection(doctor) {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Profile Information</h2>
            <form data-action="update-profile" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                        <input type="text" name="firstName" value="${doctor.name?.split(' ')[0] || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                        <input type="text" name="lastName" value="${doctor.name?.split(' ')[1] || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input type="email" name="email" value="${doctor.email || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                        <input type="tel" name="phone" value="${doctor.phone || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialty</label>
                        <input type="text" name="specialty" value="${doctor.specialty || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">License Number</label>
                        <input type="text" name="license" value="${doctor.license || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department</label>
                        <input type="text" name="department" value="${doctor.department || ''}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years of Experience</label>
                        <input type="number" name="experience" value="${doctor.experience || 0}" 
                            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                    <textarea name="bio" rows="4" 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell us about yourself..."></textarea>
                </div>
            </form>
        </div>
    `;
}

function renderWorkingHoursSection(workingHours) {
    const days = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ];
    
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Working Hours</h2>
            <form data-action="update-working-hours" class="space-y-3">
                ${days.map(day => `
                    <div class="flex items-center gap-4">
                        <div class="w-24">
                            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">${day.label}</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="time" name="${day.key}-start" 
                                value="${workingHours?.[day.key]?.start || ''}" 
                                class="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                            <span class="text-slate-600 dark:text-slate-400">to</span>
                            <input type="time" name="${day.key}-end" 
                                value="${workingHours?.[day.key]?.end || ''}" 
                                class="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="${day.key}-closed" 
                                    ${workingHours?.[day.key]?.start === 'closed' ? 'checked' : ''}
                                    class="rounded border-slate-300 text-primary focus:ring-primary">
                                <span class="text-sm text-slate-600 dark:text-slate-400">Closed</span>
                            </label>
                        </div>
                    </div>
                `).join('')}
            </form>
        </div>
    `;
}

function renderNotificationsSection() {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Notification Preferences</h2>
            <form data-action="update-notifications" class="space-y-4">
                <div class="space-y-3">
                    <label class="flex items-center gap-3">
                        <input type="checkbox" name="email-appointments" checked class="rounded border-slate-300 text-primary focus:ring-primary">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-slate-300">Email Notifications</p>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Receive email alerts for new appointments</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center gap-3">
                        <input type="checkbox" name="email-patients" checked class="rounded border-slate-300 text-primary focus:ring-primary">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-slate-300">Patient Updates</p>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Get notified when patients update their information</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center gap-3">
                        <input type="checkbox" name="email-reminders" checked class="rounded border-slate-300 text-primary focus:ring-primary">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-slate-300">Appointment Reminders</p>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Daily summary of upcoming appointments</p>
                        </div>
                    </label>
                    
                    <label class="flex items-center gap-3">
                        <input type="checkbox" name="sms-alerts" class="rounded border-slate-300 text-primary focus:ring-primary">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-slate-300">SMS Alerts</p>
                            <p class="text-sm text-slate-600 dark:text-slate-400">Receive urgent updates via SMS</p>
                        </div>
                    </label>
                </div>
            </form>
        </div>
    `;
}

function renderAccountSection(doctor) {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Account</h2>
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                        <p class="font-medium">${doctor.name || 'Doctor'}</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">${doctor.email || 'doctor@medilink.com'}</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <button data-action="change-avatar" class="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                        Change Avatar
                    </button>
                    <button data-action="change-password" class="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                        Change Password
                    </button>
                    <button data-action="export-data" class="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                        Export Data
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSecuritySection() {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Security</h2>
            <div class="space-y-4">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <p class="font-medium">Two-Factor Authentication</p>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                </div>
                
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <p class="font-medium">Login Alerts</p>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Get notified when someone logs into your account</p>
                </div>
                
                <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button data-action="logout" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <span class="material-symbols-outlined mr-2">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Settings-specific actions
export async function updateDoctorProfile(data) {
    try {
        // This would call the store method
        console.log('Updating doctor profile:', data);
        return { success: true };
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        return { success: false, error: error.message };
    }
}

export function updateWorkingHours(data) {
    console.log('Updating working hours:', data);
    // This would update the working hours in the store
}

export function updateNotifications(data) {
    console.log('Updating notification preferences:', data);
    // This would update notification preferences
}

export function changePassword() {
    console.log('Changing password');
    // This would open a password change modal
}

export function changeAvatar() {
    console.log('Changing avatar');
    // This would open an avatar upload modal
}

export function exportData() {
    console.log('Exporting data');
    // This would trigger a data export
}

export function logout() {
    console.log('Logging out');
    // This would clear session and redirect to login
}
