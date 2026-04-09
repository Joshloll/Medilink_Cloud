// Dashboard Module - Doctor Dashboard Rendering
export function renderDoctorDashboard(container, state) {
    const stats = calculateDoctorStats(state);
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Welcome Section -->
            <div class="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
                <h1 class="text-2xl font-bold mb-2">Welcome back, Dr. ${state.doctor.name?.split(' ')[1] || 'Doctor'}</h1>
                <p class="opacity-90">Here's your practice overview for today</p>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${createStatCard('Total Patients', stats.totalPatients, 'group', 'text-blue-600')}
                ${createStatCard('Today\'s Appointments', stats.todayAppointments, 'calendar_today', 'text-green-600')}
                ${createStatCard('Pending Requests', stats.pendingRequests, 'pending', 'text-amber-600')}
                ${createStatCard('Completed Today', stats.completedToday, 'check_circle', 'text-purple-600')}
            </div>
            
            <!-- Today's Schedule -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-semibold mb-4">Today's Schedule</h2>
                ${renderTodayAppointments(state.appointments)}
            </div>
            
            <!-- Recent Activity -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
                ${renderRecentActivity(state.records)}
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
                ${renderQuickActions()}
            </div>
        </div>
    `;
}

function createStatCard(title, value, icon, iconColor) {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">${title}</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">${value}</p>
                </div>
                <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <span class="material-symbols-outlined ${iconColor}">${icon}</span>
                </div>
            </div>
        </div>
    `;
}

function renderTodayAppointments(appointments) {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    if (todayAppointments.length === 0) {
        return `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No appointments scheduled for today</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-3">
            ${todayAppointments.map(apt => `
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div>
                            <p class="font-medium">${apt.patientName}</p>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${apt.time} - ${apt.type}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${getStatusBadge(apt.status)}
                        <div class="flex gap-1">
                            <button data-action="update-appointment-status" data-id="${apt.id}" data-status="checked_in" 
                                class="p-2 text-green-600 hover:bg-green-100 rounded" title="Check In">
                                <span class="material-symbols-outlined">login</span>
                            </button>
                            <button data-action="update-appointment-status" data-id="${apt.id}" data-status="completed" 
                                class="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Complete">
                                <span class="material-symbols-outlined">check_circle</span>
                            </button>
                            <button data-action="update-appointment-status" data-id="${apt.id}" data-status="cancelled" 
                                class="p-2 text-red-600 hover:bg-red-100 rounded" title="Cancel">
                                <span class="material-symbols-outlined">cancel</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecentActivity(records) {
    const recentRecords = records
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentRecords.length === 0) {
        return `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">history</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No recent activity</p>
            </div>
        `;
    }
    
    return `
        <div class="space-y-3">
            ${recentRecords.map(record => `
                <div class="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer" 
                    data-action="view-record" data-id="${record.id}">
                    <div class="w-10 h-10 rounded-full bg-${getRecordTypeColor(record.type)}-100 flex items-center justify-center">
                        <span class="material-symbols-outlined text-${getRecordTypeColor(record.type)}-600">${getRecordTypeIcon(record.type)}</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-medium">${record.title}</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">
                            ${record.patientName} - ${new Date(record.date).toLocaleDateString()}
                        </p>
                    </div>
                    <span class="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderQuickActions() {
    return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button data-action="create-appointment" class="flex flex-col items-center gap-2 p-4 bg-primary text-white rounded-lg hover:bg-blue-600">
                <span class="material-symbols-outlined">add_circle</span>
                <span class="text-sm">New Appointment</span>
            </button>
            <button data-nav="patients" class="flex flex-col items-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <span class="material-symbols-outlined">group</span>
                <span class="text-sm">View Patients</span>
            </button>
            <button data-nav="records" class="flex flex-col items-center gap-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <span class="material-symbols-outlined">description</span>
                <span class="text-sm">Medical Records</span>
            </button>
            <button data-action="refresh-data" class="flex flex-col items-center gap-2 p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                <span class="material-symbols-outlined">refresh</span>
                <span class="text-sm">Refresh Data</span>
            </button>
        </div>
    `;
}

function getStatusBadge(status) {
    const statusConfig = {
        'scheduled': { color: 'blue', text: 'Scheduled' },
        'checked_in': { color: 'green', text: 'Checked In' },
        'completed': { color: 'purple', text: 'Completed' },
        'cancelled': { color: 'red', text: 'Cancelled' },
        'pending': { color: 'amber', text: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return `
        <span class="px-2 py-1 bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400 rounded-full text-xs font-medium">
            ${config.text}
        </span>
    `;
}

function getRecordTypeColor(type) {
    const colors = {
        'clinical': 'blue',
        'lab': 'green',
        'prescription': 'purple',
        'imaging': 'amber'
    };
    return colors[type] || 'slate';
}

function getRecordTypeIcon(type) {
    const icons = {
        'clinical': 'medical_services',
        'lab': 'science',
        'prescription': 'medication',
        'imaging': 'image'
    };
    return icons[type] || 'description';
}

function calculateDoctorStats(state) {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = state.appointments.filter(apt => apt.date === today);
    
    return {
        totalPatients: state.patients.length,
        todayAppointments: todayAppointments.length,
        pendingRequests: state.appointments.filter(apt => apt.status === 'pending').length,
        completedToday: todayAppointments.filter(apt => apt.status === 'completed').length
    };
}
