/**
 * Dynamic Render Functions for MediLink Cloud
 * 
 * These functions render data from database (Supabase) into HTML elements.
 * Each function expects an array of objects and renders them into designated containers.
 * 
 * All hardcoded mock data has been removed from pages.
 * Use these functions to populate pages with real database data.
 */

// ============================================================================
// APPOINTMENTS RENDERING
// ============================================================================

/**
 * Render appointments into a table
 * @param {Array} appointments - Array of appointment objects
 * @param {String} containerId - Container element ID
 */
function renderAppointments(appointments = [], containerId = 'appointmentsTableBody') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (appointments.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <span class="material-symbols-outlined text-4xl text-slate-300 inline-block mb-2">calendar_month</span>
                    <p class="text-slate-600 dark:text-slate-400">No appointments found</p>
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = appointments.map(apt => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-slate-200 bg-cover bg-center" 
                         data-alt="Patient ${apt.patientName}"
                         style="background-image: url('${apt.patientAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(apt.patientName) + '&background=137fec&color=fff'}')">
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-900 dark:text-white">${apt.patientName || 'N/A'}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">ID: ${apt.patientId || 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="size-8 rounded-full bg-slate-200 bg-cover bg-center" 
                         data-alt="Doctor ${apt.doctorName}"
                         style="background-image: url('${apt.doctorAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(apt.doctorName) + '&background=137fec&color=fff'}')">
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-900 dark:text-white">${apt.doctorName || 'N/A'}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${apt.specialty || 'N/A'}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${formatDate(apt.appointmentDate)}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${apt.appointmentTime || 'N/A'}</p>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColorClass(apt.type)} ">
                    ${apt.type || 'Appointment'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(apt.status)}">
                    <span class="size-2 rounded-full bg-current"></span>
                    ${apt.status || 'Pending'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button class="text-slate-400 hover:text-primary transition-colors" title="View">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="text-slate-400 hover:text-primary transition-colors" title="Edit">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================================================
// PATIENTS RENDERING
// ============================================================================

/**
 * Render patients list
 * @param {Array} patients - Array of patient objects
 * @param {String} containerId - Container element ID
 */
function renderPatients(patients = [], containerId = 'patientsList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">group</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No patients yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = patients.map((patient, index) => `
        <div class="group flex cursor-pointer items-start gap-3 p-4 border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 transition-colors ${index === 0 ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : ''}">
            <div class="relative shrink-0">
                <div class="size-12 rounded-full bg-slate-200 bg-cover bg-center flex items-center justify-center" 
                     style="background-image: url('${patient.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(patient.name) + '&background=137fec&color=fff'}')">
                    ${!patient.avatar ? '<span class="material-symbols-outlined text-slate-500">person</span>' : ''}
                </div>
                ${patient.status === 'active' ? '<span class="absolute bottom-0 right-0 block size-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#1a2632]"></span>' : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">${patient.name || 'N/A'}</h3>
                    <span class="text-xs text-slate-400">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">${patient.patientId || 'N/A'} • ${patient.age || 'N/A'} yrs</p>
                <div class="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined text-[14px]">event</span>
                    <span>Last visit: ${patient.lastVisit ? formatDate(patient.lastVisit) : 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// DOCTORS RENDERING
// ============================================================================

/**
 * Render doctors list
 * @param {Array} doctors - Array of doctor objects
 * @param {String} containerId - Container element ID
 */
function renderDoctors(doctors = [], containerId = 'doctorsList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (doctors.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">people</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No doctors yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = doctors.map((doctor, index) => `
        <div class="group flex cursor-pointer items-start gap-3 p-4 border-l-4 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 transition-colors ${index === 0 ? 'border-primary bg-blue-50/50 dark:bg-primary/10' : ''}">
            <div class="relative shrink-0">
                <div class="size-12 rounded-full bg-slate-200 bg-cover bg-center flex items-center justify-center" 
                     style="background-image: url('${doctor.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=137fec&color=fff'}')">
                    ${!doctor.avatar ? '<span class="material-symbols-outlined text-slate-500">person</span>' : ''}
                </div>
                ${doctor.status === 'available' ? '<span class="absolute bottom-0 right-0 block size-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#1a2632]"></span>' : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">${doctor.name || 'N/A'}</h3>
                    <span class="text-xs text-slate-400">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">${doctor.specialty || 'Medical Professional'}</p>
                <div class="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined text-[14px]">badge</span>
                    <span>License: ${doctor.licenseNumber || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// DOCTOR STATUS RENDERING (Dashboard)
// ============================================================================

/**
 * Render doctor status indicators
 * @param {Array} doctors - Array of doctor objects with status
 * @param {String} containerId - Container element ID
 */
function renderDoctorStatus(doctors = [], containerId = 'doctor-status-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (doctors.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-slate-500 dark:text-slate-400 text-sm">No data available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = doctors.map(doctor => `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="size-10 rounded-full bg-slate-200 bg-cover bg-center" 
                         style="background-image: url('${doctor.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=137fec&color=fff'}')">
                    </div>
                    <div class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${getStatusIndicatorColor(doctor.status)}"></div>
                </div>
                <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">${doctor.name || 'N/A'}</p>
                    <p class="text-xs text-slate-500">${doctor.specialty || 'Medical Professional'}</p>
                </div>
            </div>
            <span class="text-xs font-medium ${getStatusBadgeClass(doctor.status)} px-2 py-1 rounded">${doctor.status || 'Unknown'}</span>
        </div>
    `).join('');
}

// ============================================================================
// RECORDS RENDERING
// ============================================================================

/**
 * Render medical records
 * @param {Array} records - Array of record objects
 * @param {String} containerId - Container element ID
 */
function renderRecords(records = [], containerId = 'recordsList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (records.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">description</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No records found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = records.map(record => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${record.date ? formatDate(record.date) : 'N/A'}</td>
            <td class="px-6 py-4">${record.title || 'N/A'}</td>
            <td class="px-6 py-4">${record.type || 'N/A'}</td>
            <td class="px-6 py-4">${record.providedBy || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(record.status)}">
                    ${record.status || 'Available'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================================================
// PRESCRIPTIONS RENDERING
// ============================================================================

/**
 * Render prescriptions
 * @param {Array} prescriptions - Array of prescription objects
 * @param {String} containerId - Container element ID
 */
function renderPrescriptions(prescriptions = [], containerId = 'prescriptionsList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (prescriptions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">medication</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No prescriptions available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = prescriptions.map(prescription => `
        <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-slate-900 dark:text-white">${prescription.medicationName || 'N/A'}</h4>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${prescription.dosage || 'N/A'} • ${prescription.frequency || 'N/A'}</p>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(prescription.status)}">
                    ${prescription.status || 'Active'}
                </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                    <p class="text-slate-500 dark:text-slate-400">Prescribed by</p>
                    <p class="text-slate-900 dark:text-white font-medium">${prescription.prescribedBy || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-slate-500 dark:text-slate-400">Started</p>
                    <p class="text-slate-900 dark:text-white font-medium">${prescription.startDate ? formatDate(prescription.startDate) : 'N/A'}</p>
                </div>
                <div>
                    <p class="text-slate-500 dark:text-slate-400">Refills</p>
                    <p class="text-slate-900 dark:text-white font-medium">${prescription.refillsRemaining || '0'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// ACTIVITY/HISTORY RENDERING
// ============================================================================

/**
 * Render activity history
 * @param {Array} activities - Array of activity objects
 * @param {String} containerId - Container element ID
 */
function renderActivityHistory(activities = [], containerId = 'activityTableBody') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (activities.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" class="p-4 text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300 block mb-2">history</span>
                    <p class="text-slate-600 dark:text-slate-400">No recent activity</p>
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = activities.map(activity => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
            <td class="p-4 pl-6">
                <div class="flex items-center gap-3">
                    <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" 
                         style="background-image: url('${activity.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activity.provider) + '&background=137fec&color=fff'}')">
                    </div>
                    <div>
                        <p class="font-bold text-slate-900 dark:text-white">${activity.provider || 'N/A'}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${activity.specialty || 'Healthcare Provider'}</p>
                    </div>
                </div>
            </td>
            <td class="p-4 text-slate-600 dark:text-slate-300">${activity.type || 'N/A'}</td>
            <td class="p-4 text-slate-600 dark:text-slate-300">${activity.date ? formatDate(activity.date) : 'N/A'}</td>
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColorClass(activity.status)}">
                    <span class="size-1.5 rounded-full bg-current"></span>
                    ${activity.status || 'Completed'}
                </span>
            </td>
            <td class="p-4 text-right pr-6">
                <button class="text-slate-400 hover:text-primary transition-all duration-300 transform hover:scale-110">
                    <span class="material-symbols-outlined">download</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================================================
// ALERTS RENDERING
// ============================================================================

/**
 * Render alerts/notifications
 * @param {Array} alerts - Array of alert objects
 * @param {String} containerId - Container element ID
 */
function renderAlerts(alerts = [], containerId = 'alerts-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-slate-500 dark:text-slate-400 text-sm">No alerts at this time</p>
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(alert => {
        const alertColorClass = {
            'warning': 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30',
            'info': 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30',
            'success': 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30',
            'error': 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30'
        }[alert.type] || 'bg-slate-50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900/30';

        const iconColor = {
            'warning': 'text-red-600 dark:text-red-400',
            'info': 'text-blue-600 dark:text-blue-400',
            'success': 'text-green-600 dark:text-green-400',
            'error': 'text-red-600 dark:text-red-400'
        }[alert.type] || 'text-slate-600 dark:text-slate-400';

        const title_color = {
            'warning': 'text-red-800 dark:text-red-300',
            'info': 'text-blue-800 dark:text-blue-300',
            'success': 'text-green-800 dark:text-green-300',
            'error': 'text-red-800 dark:text-red-300'
        }[alert.type] || 'text-slate-800 dark:text-slate-300';

        return `
            <div class="flex gap-3 p-3 rounded-lg ${alertColorClass}">
                <span class="material-symbols-outlined ${iconColor} mt-0.5">${alert.icon || 'info'}</span>
                <div>
                    <p class="text-sm font-semibold ${title_color}">${alert.title || 'Notification'}</p>
                    <p class="text-xs text-slate-600 dark:text-slate-400">${alert.message || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date to readable string
 * @param {String|Date} date - Date to format
 * @returns {String} Formatted date
 */
function formatDate(date) {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
}

/**
 * Get color class for appointment type badge
 * @param {String} type - Appointment type
 * @returns {String} CSS class
 */
function getTypeColorClass(type) {
    const typeColors = {
        'checkup': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'follow-up': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'consultation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        'review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return typeColors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

/**
 * Get color class for status badge
 * @param {String} status - Status value
 * @returns {String} CSS class
 */
function getStatusColorClass(status) {
    const statusColors = {
        'confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

/**
 * Get status badge color class for doctor status indicators
 * @param {String} status - Status value
 * @returns {String} CSS class
 */
function getStatusBadgeClass(status) {
    const statusClasses = {
        'available': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
        'in-consultation': 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
        'in-consult': 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
        'on-break': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
        'on-leave': 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400'
    };
    return statusClasses[status?.toLowerCase()] || 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400';
}

/**
 * Get status indicator color (for dot)
 * @param {String} status - Status value
 * @returns {String} CSS class
 */
function getStatusIndicatorColor(status) {
    const statusIndicators = {
        'available': 'bg-green-500',
        'in-consultation': 'bg-red-500',
        'in-consult': 'bg-red-500',
        'on-break': 'bg-amber-500',
        'on-leave': 'bg-slate-500'
    };
    return statusIndicators[status?.toLowerCase()] || 'bg-slate-500';
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

// For use in HTML (if not using modules)
window.renderFunctions = {
    renderAppointments,
    renderPatients,
    renderDoctors,
    renderDoctorStatus,
    renderRecords,
    renderPrescriptions,
    renderActivityHistory,
    renderAlerts,
    formatDate,
    getTypeColorClass,
    getStatusColorClass,
    getStatusBadgeClass,
    getStatusIndicatorColor
};

// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderAppointments,
        renderPatients,
        renderDoctors,
        renderDoctorStatus,
        renderRecords,
        renderPrescriptions,
        renderActivityHistory,
        renderAlerts,
        formatDate,
        getTypeColorClass,
        getStatusColorClass,
        getStatusBadgeClass,
        getStatusIndicatorColor
    };
}
