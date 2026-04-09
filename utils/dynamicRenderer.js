// Dynamic Renderer - Placeholder functions for database-driven UI
class DynamicRenderer {
    constructor() {
        this.loadingStates = new Map();
        this.emptyStates = new Map();
        this.init();
    }

    init() {
        this.setupEmptyStates();
        this.setupLoadingStates();
    }

    setupEmptyStates() {
        this.emptyStates.set('appointments', {
            icon: 'calendar_today',
            title: 'No appointments found',
            message: 'No appointments are currently scheduled.',
            action: 'Schedule Appointment'
        });

        this.emptyStates.set('patients', {
            icon: 'group',
            title: 'No patients yet',
            message: 'No patients have been added to the system yet.',
            action: 'Add Patient'
        });

        this.emptyStates.set('records', {
            icon: 'description',
            title: 'No records found',
            message: 'No medical records are available.',
            action: 'Add Record'
        });

        this.emptyStates.set('prescriptions', {
            icon: 'medication',
            title: 'No prescriptions available',
            message: 'No prescriptions have been issued.',
            action: 'Create Prescription'
        });

        this.emptyStates.set('doctors', {
            icon: 'stethoscope',
            title: 'No doctors available',
            message: 'No doctors are currently registered.',
            action: 'Add Doctor'
        });

        this.emptyStates.set('billing', {
            icon: 'payments',
            title: 'No billing data',
            message: 'No billing information is available.',
            action: 'Create Invoice'
        });

        this.emptyStates.set('documents', {
            icon: 'folder',
            title: 'No documents found',
            message: 'No documents have been uploaded.',
            action: 'Upload Document'
        });

        this.emptyStates.set('dashboard-stats', {
            icon: 'dashboard',
            title: 'No data available',
            message: 'Dashboard statistics will appear here once data is loaded.'
        });

        this.emptyStates.set('schedule', {
            icon: 'event',
            title: 'No schedule data',
            message: 'No schedule information is available.',
            action: 'Set Schedule'
        });
    }

    setupLoadingStates() {
        this.loadingStates.set('default', {
            icon: 'hourglass_empty',
            message: 'Loading data...'
        });

        this.loadingStates.set('appointments', {
            icon: 'calendar_month',
            message: 'Loading appointments...'
        });

        this.loadingStates.set('patients', {
            icon: 'group',
            message: 'Loading patients...'
        });

        this.loadingStates.set('records', {
            icon: 'description',
            message: 'Loading records...'
        });

        this.loadingStates.set('prescriptions', {
            icon: 'medication',
            message: 'Loading prescriptions...'
        });
    }

    // Render empty state
    renderEmptyState(containerId, type = 'default') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const emptyState = this.emptyStates.get(type) || this.emptyStates.get('default');
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">
                        ${emptyState.icon}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    ${emptyState.title}
                </h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                    ${emptyState.message}
                </p>
                ${emptyState.action ? `
                    <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <span class="material-symbols-outlined text-[18px] align-middle mr-2">add</span>
                        ${emptyState.action}
                    </button>
                ` : ''}
            </div>
        `;
    }

    // Render loading state
    renderLoadingState(containerId, type = 'default') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingState = this.loadingStates.get(type) || this.loadingStates.get('default');
        
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-2xl text-slate-400 dark:text-slate-500 animate-spin">
                        ${loadingState.icon}
                    </span>
                </div>
                <p class="text-slate-600 dark:text-slate-400">
                    ${loadingState.message}
                </p>
            </div>
        `;
    }

    // Render empty state for stats
    renderEmptyStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-8">
                <span class="material-symbols-outlined text-4xl text-slate-300">dashboard</span>
                <p class="text-slate-600 dark:text-slate-400 mt-2">No data available</p>
            </div>
        `;
    }

    // Render placeholder value
    renderPlaceholder(elementId, placeholder = '0') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = placeholder;
        }
    }

    // Clear container
    clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    // Show error state
    renderErrorState(containerId, message = 'Failed to load data') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                        error
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Error Loading Data
                </h3>
                <p class="text-red-600 dark:text-red-400 mb-6 max-w-md">
                    ${message}
                </p>
                <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <span class="material-symbols-outlined text-[18px] align-middle mr-2">refresh</span>
                    Try Again
                </button>
            </div>
        `;
    }
}

// Placeholder render functions for future database integration
window.renderAppointments = function(data) {
    console.log('renderAppointments called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data || data.length === 0) {
        renderer.renderEmptyState('appointments-list', 'appointments');
        return;
    }
    
    // Placeholder for future implementation
    const container = document.getElementById('appointments-list');
    if (container) {
        container.innerHTML = '<div class="text-center py-8 text-slate-600">Appointments will be rendered here when connected to database</div>';
    }
};

window.renderPatients = function(data) {
    console.log('renderPatients called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data || data.length === 0) {
        renderer.renderEmptyState('patients-list', 'patients');
        return;
    }
    
    // Placeholder for future implementation
    const container = document.getElementById('patients-list');
    if (container) {
        container.innerHTML = '<div class="text-center py-8 text-slate-600">Patients will be rendered here when connected to database</div>';
    }
};

window.renderRecords = function(data) {
    console.log('renderRecords called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data || data.length === 0) {
        renderer.renderEmptyState('records-list', 'records');
        return;
    }
    
    // Placeholder for future implementation
    const container = document.getElementById('records-list');
    if (container) {
        container.innerHTML = '<div class="text-center py-8 text-slate-600">Records will be rendered here when connected to database</div>';
    }
};

window.renderPrescriptions = function(data) {
    console.log('renderPrescriptions called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data || data.length === 0) {
        renderer.renderEmptyState('prescriptions-list', 'prescriptions');
        return;
    }
    
    // Placeholder for future implementation
    const container = document.getElementById('prescriptions-list');
    if (container) {
        container.innerHTML = '<div class="text-center py-8 text-slate-600">Prescriptions will be rendered here when connected to database</div>';
    }
};

window.renderDashboardStats = function(data) {
    console.log('renderDashboardStats called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data) {
        renderer.renderEmptyStats('dashboard-stats');
        return;
    }
    
    // Update placeholder values
    renderer.renderPlaceholder('total-patients', data.totalPatients || '0');
    renderer.renderPlaceholder('today-appointments', data.todayAppointments || '0');
    renderer.renderPlaceholder('pending-requests', data.pendingRequests || '0');
    renderer.renderPlaceholder('completed-today', data.completedToday || '0');
};

window.renderSchedule = function(data) {
    console.log('renderSchedule called with data:', data);
    // This will be implemented when connecting to Supabase
    const renderer = new DynamicRenderer();
    
    if (!data || data.length === 0) {
        renderer.renderEmptyState('schedule-container', 'schedule');
        return;
    }
    
    // Placeholder for future implementation
    const container = document.getElementById('schedule-container');
    if (container) {
        container.innerHTML = '<div class="text-center py-8 text-slate-600">Schedule will be rendered here when connected to database</div>';
    }
};

// Initialize renderer
const dynamicRenderer = new DynamicRenderer();

// Make renderer globally available
window.dynamicRenderer = dynamicRenderer;

// Export for module usage
export default dynamicRenderer;
