/**
 * MAIN APPLICATION CONTROLLER
 * Handles routing, event delegation, and app state management
 */

/**
 * Initialize application
 */
function initializeApp() {
    // Restore user session if exists
    authModule.restoreSession();

    // Setup global event listeners
    setupGlobalEventListeners();

    // Setup toast notifications
    setupToastNotifications();

    // Initial render
    renderApp();

    // Log app initialization
    console.log('MediLink Cloud initialized');
}

/**
 * Main app render function - handles routing based on authentication state
 */
async function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    // If no user is logged in - show auth screen
    if (!state.currentUser) {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('topnav').classList.add('hidden');
        authModule.renderAuthScreen('main-content');
        return;
    }

    // User is authenticated - show role-based dashboard
    const role = state.currentUser.role;

    switch (role) {
        case 'admin':
            await adminModule.renderAdminDashboard();
            break;
        case 'doctor':
            await doctorModule.renderDoctorDashboard();
            break;
        case 'patient':
            await patientModule.renderPatientDashboard();
            break;
        default:
            authModule.renderAuthScreen('main-content');
    }
}

/**
 * Global event delegation system
 * Handles all user interactions through data-action attributes
 */
function setupGlobalEventListeners() {
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('submit', handleGlobalSubmit);
}

/**
 * Handle all click events
 */
async function handleGlobalClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    const targetNav = target.dataset.target;

    try {
        // Auth Actions
        if (action === 'submit-login') {
            e.preventDefault();
            const form = document.getElementById('login-form');
            const formData = new FormData(form);
            authModule.handleLogin({
                email: formData.get('email'),
                password: formData.get('password')
            });
        }

        if (action === 'submit-register') {
            e.preventDefault();
            const form = document.getElementById('register-form');
            const formData = new FormData(form);
            authModule.handleRegister({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role')
            });
        }

        if (action === 'logout') {
            authModule.handleLogout();
        }

        // Navigation Actions
        if (action === 'navigate') {
            await handleNavigation(targetNav);
        }

        // Admin Actions
        if (action === 'approve-user') {
            await adminModule.handleApproveUser(id);
        }

        if (action === 'reject-user') {
            await adminModule.handleRejectUser(id);
        }

        if (action === 'refresh-dashboard') {
            await renderApp();
            showToast('Dashboard refreshed', 'info');
        }

        // Appointments Actions
        if (action === 'cancel-appointment') {
            await patientModule.handleCancelAppointment(id);
        }

        if (action === 'confirm-appointment') {
            await doctorModule.handleConfirmAppointment(id);
        }

        if (action === 'complete-appointment') {
            await doctorModule.handleCompleteAppointment(id);
        }

        if (action === 'reject-appointment') {
            await doctorModule.handleRejectAppointment(id);
        }

        // Prescription Actions
        if (action === 'request-refill') {
            await patientModule.handleRequestRefill(id);
        }

        // Touch Reader compatibility
        if (action !== 'navigate' && action !== 'submit-login' && action !== 'submit-register') {
            // Dispatch custom event for Touch Reader tracking
            const detail = { action, id, timestamp: new Date().toISOString() };
            document.dispatchEvent(new CustomEvent('medilinkAction', { detail }));
        }

    } catch (error) {
        console.error('Action handler error:', error);
        showToast(error.message, 'error');
    }
}

/**
 * Handle form submissions
 */
async function handleGlobalSubmit(e) {
    const form = e.target;
    const action = form.querySelector('[type="submit"]')?.dataset.action;

    if (action === 'submit-booking-form') {
        e.preventDefault();
        const formData = new FormData(form);
        
        // Get patient
        const patient = state.patients.find(p => p.user_id === state.currentUser?.id);
        if (!patient) {
            showToast('Patient profile not found', 'error');
            return;
        }

        // Book appointment
        try {
            const appointment = await api.appointments.bookAppointment({
                patient_id: patient.id,
                doctor_id: formData.get('doctor_id'),
                date: formData.get('date'),
                time: formData.get('time'),
                reason: formData.get('reason')
            });

            showToast('Appointment booked successfully!', 'success');
            form.reset();
            await patientModule.renderPatientDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

/**
 * Navigation handler - routes to different pages based on action
 */
async function handleNavigation(target) {
    if (!target) return;

    const role = state.currentUser?.role;

    // Admin Routes
    if (role === 'admin') {
        switch (target) {
            case 'admin-dashboard':
                await adminModule.renderAdminDashboard();
                break;
            case 'manage-doctors':
                showToast('Manage doctors feature coming soon', 'info');
                break;
            case 'manage-patients':
                showToast('Manage patients feature coming soon', 'info');
                break;
            case 'view-appointments':
                showToast('View appointments feature coming soon', 'info');
                break;
            default:
                await adminModule.renderAdminDashboard();
        }
    }

    // Doctor Routes
    if (role === 'doctor') {
        switch (target) {
            case 'doctor-dashboard':
                await doctorModule.renderDoctorDashboard();
                break;
            case 'my-patients':
                await doctorModule.renderMyPatients();
                break;
            case 'my-schedule':
                showToast('Schedule management coming soon', 'info');
                break;
            case 'my-records':
                showToast('Records view coming soon', 'info');
                break;
            case 'create-record':
                showToast('Create record feature coming soon', 'info');
                break;
            case 'create-prescription':
                showToast('Create prescription feature coming soon', 'info');
                break;
            default:
                await doctorModule.renderDoctorDashboard();
        }
    }

    // Patient Routes
    if (role === 'patient') {
        switch (target) {
            case 'patient-dashboard':
                await patientModule.renderPatientDashboard();
                break;
            case 'book-appointment':
                await patientModule.renderBookAppointment();
                break;
            case 'my-records':
                await patientModule.renderMyRecords();
                break;
            case 'my-prescriptions':
                await patientModule.renderMyPrescriptions();
                break;
            default:
                await patientModule.renderPatientDashboard();
        }
    }
}

/**
 * Setup toast notifications
 */
function setupToastNotifications() {
    document.addEventListener('showToast', (e) => {
        const { message, type = 'info' } = e.detail;
        showToast(message, type);
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-amber-500'
    };

    const toast = document.createElement('div');
    toast.className = `${typeClasses[type] || typeClasses.info} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px]">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}
        </span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Utility: Get URL parameters
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Utility: Update URL without reload
 */
function updateURL(path) {
    window.history.pushState({}, '', path);
}

/**
 * Application initialization on DOM ready
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Handle unhandled errors
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason);
    showToast('An error occurred. Please try again.', 'error');
});
