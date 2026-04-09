// Doctor Portal Main Controller
import doctorStore from './state/doctorStore.js';
import { renderDoctorDashboard } from './modules/dashboard.js';
import { renderSchedule } from './modules/schedule.js';
import { renderDoctorPatients } from './modules/patients.js';
import { renderDoctorRecords } from './modules/records.js';
import { renderDoctorSettings } from './modules/settings.js';

class DoctorController {
    constructor() {
        this.store = doctorStore;
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Subscribe to state changes
        this.store.subscribe(this.handleStateChange.bind(this));
        
        // Setup global event delegation
        this.setupEventDelegation();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load initial data
        this.loadInitialData();
    }

    handleStateChange(state) {
        // Re-render current page when state changes
        this.renderCurrentPage();
    }

    setupEventDelegation() {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            const data = target.dataset;

            // Prevent default for action buttons
            event.preventDefault();

            // Handle different actions
            this.handleAction(action, id, data, event);
        });

        // Handle form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const action = form.dataset.action;
            
            if (action) {
                event.preventDefault();
                this.handleFormAction(action, form);
            }
        });

        // Handle input changes for filters
        document.addEventListener('input', (event) => {
            const target = event.target;
            if (target.dataset.filter) {
                this.handleFilterChange(target.dataset.filter, target.value);
            }
        });
    }

    setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const page = event.target.dataset.nav;
                this.navigateToPage(page);
            });
        });
    }

    async loadInitialData() {
        try {
            await this.store.loadInitialData();
            this.showNotification('Data loaded successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to load data: ' + error.message, 'error');
        }
    }

    navigateToPage(page) {
        this.currentPage = page;
        this.store.setState({ currentPage: page });
        
        // Update navigation active state
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.classList.toggle('active', link.dataset.nav === page);
        });
        
        // Update page title
        this.updatePageTitle(page);
        
        // Render the page
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        const container = document.getElementById('page-content');
        if (!container) return;

        switch (this.currentPage) {
            case 'dashboard':
                renderDoctorDashboard(container, this.store.getState());
                break;
            case 'schedule':
                renderSchedule(container, this.store.getState());
                break;
            case 'patients':
                renderDoctorPatients(container, this.store.getState());
                break;
            case 'records':
                renderDoctorRecords(container, this.store.getState());
                break;
            case 'settings':
                renderDoctorSettings(container, this.store.getState());
                break;
            default:
                container.innerHTML = '<div class="text-center py-8">Page not found</div>';
        }
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: 'Doctor Dashboard',
            schedule: 'Schedule',
            patients: 'Patients',
            records: 'Medical Records',
            settings: 'Settings'
        };
        
        document.title = `${titles[page] || 'MediLink Cloud'} - Doctor Portal`;
    }

    async handleAction(action, id, data, event) {
        try {
            switch (action) {
                case 'view-patient':
                    this.viewPatient(id);
                    break;
                    
                case 'add-patient-note':
                    this.showAddNoteModal(id);
                    break;
                    
                case 'update-appointment-status':
                    await this.updateAppointmentStatus(id, data.status);
                    break;
                    
                case 'create-appointment':
                    this.showCreateAppointmentModal();
                    break;
                    
                case 'create-prescription':
                    this.showCreatePrescriptionModal(id);
                    break;
                    
                case 'filter-records':
                    this.store.setFilter('records', data.type);
                    break;
                    
                case 'view-record':
                    this.viewRecord(id);
                    break;
                    
                case 'add-record':
                    this.showAddRecordModal();
                    break;
                    
                case 'update-profile':
                    this.updateProfile();
                    break;
                    
                case 'refresh-data':
                    await this.loadInitialData();
                    break;
                    
                case 'logout':
                    this.logout();
                    break;
                    
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            this.showNotification('Action failed: ' + error.message, 'error');
        }
    }

    async handleFormAction(action, form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            switch (action) {
                case 'add-note':
                    await this.addPatientNote(data.patientId, data.note);
                    break;
                    
                case 'create-prescription':
                    await this.createPrescription(data.patientId, data);
                    break;
                    
                case 'add-record':
                    await this.addMedicalRecord(data);
                    break;
                    
                case 'update-profile':
                    await this.updateDoctorProfile(data);
                    break;
                    
                case 'create-appointment':
                    await this.createAppointment(data);
                    break;
                    
                default:
                    console.warn('Unknown form action:', action);
            }
        } catch (error) {
            this.showNotification('Form submission failed: ' + error.message, 'error');
        }
    }

    handleFilterChange(filterType, value) {
        this.store.setFilter(filterType, value);
    }

    // Action Methods
    viewPatient(patientId) {
        const patient = this.store.getState().patients.find(p => p.id === patientId);
        if (patient) {
            this.showPatientModal(patient);
        }
    }

    showPatientModal(patient) {
        const modal = this.createModal('Patient Details', this.renderPatientDetails(patient));
        document.body.appendChild(modal);
    }

    renderPatientDetails(patient) {
        return `
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold">${patient.name}</h3>
                        <p class="text-slate-600">ID: ${patient.id}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-slate-600">Email</p>
                        <p class="font-medium">${patient.email}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Phone</p>
                        <p class="font-medium">${patient.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Age</p>
                        <p class="font-medium">${patient.age}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Blood Type</p>
                        <p class="font-medium">${patient.bloodType}</p>
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-slate-600 mb-2">Conditions</p>
                    <div class="flex flex-wrap gap-2">
                        ${patient.conditions.map(condition => 
                            `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${condition}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-slate-600 mb-2">Medications</p>
                    <div class="flex flex-wrap gap-2">
                        ${patient.medications.map(medication => 
                            `<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">${medication}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="flex gap-2 pt-4">
                    <button data-action="add-patient-note" data-id="${patient.id}" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                        Add Note
                    </button>
                    <button data-action="create-prescription" data-id="${patient.id}" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Prescribe
                    </button>
                </div>
            </div>
        `;
    }

    showAddNoteModal(patientId) {
        const form = `
            <form data-action="add-note">
                <input type="hidden" name="patientId" value="${patientId}">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Note</label>
                    <textarea name="note" rows="4" class="w-full p-2 border rounded-lg" required placeholder="Enter your note..."></textarea>
                </div>
                <div class="flex gap-2">
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                        Save Note
                    </button>
                    <button type="button" onclick="this.closest('.modal').remove()" class="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400">
                        Cancel
                    </button>
                </div>
            </form>
        `;
        
        const modal = this.createModal('Add Patient Note', form);
        document.body.appendChild(modal);
    }

    showCreatePrescriptionModal(patientId) {
        const form = `
            <form data-action="create-prescription">
                <input type="hidden" name="patientId" value="${patientId}">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Medication</label>
                        <input type="text" name="medication" class="w-full p-2 border rounded-lg" required placeholder="Medication name">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Dosage</label>
                        <input type="text" name="dosage" class="w-full p-2 border rounded-lg" required placeholder="e.g., 10mg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Frequency</label>
                        <input type="text" name="frequency" class="w-full p-2 border rounded-lg" required placeholder="e.g., Twice daily">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Duration</label>
                        <input type="text" name="duration" class="w-full p-2 border rounded-lg" required placeholder="e.g., 30 days">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Instructions</label>
                        <textarea name="instructions" rows="3" class="w-full p-2 border rounded-lg" placeholder="Special instructions..."></textarea>
                    </div>
                </div>
                <div class="flex gap-2 pt-4">
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Create Prescription
                    </button>
                    <button type="button" onclick="this.closest('.modal').remove()" class="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400">
                        Cancel
                    </button>
                </div>
            </form>
        `;
        
        const modal = this.createModal('Create Prescription', form);
        document.body.appendChild(modal);
    }

    async updateAppointmentStatus(appointmentId, status) {
        const result = await this.store.updateAppointmentStatus(appointmentId, status);
        if (result.success) {
            this.showNotification(`Appointment status updated to ${status}`, 'success');
        } else {
            this.showNotification('Failed to update appointment status', 'error');
        }
    }

    async addPatientNote(patientId, note) {
        const result = await this.store.addPatientNote(patientId, { note, date: new Date().toISOString() });
        if (result.success) {
            this.showNotification('Note added successfully', 'success');
            document.querySelector('.modal')?.remove();
        } else {
            this.showNotification('Failed to add note', 'error');
        }
    }

    async createPrescription(patientId, data) {
        const result = await this.store.createPrescription(patientId, data);
        if (result.success) {
            this.showNotification('Prescription created successfully', 'success');
            document.querySelector('.modal')?.remove();
        } else {
            this.showNotification('Failed to create prescription', 'error');
        }
    }

    async updateDoctorProfile(profileData) {
        const result = await this.store.updateDoctorProfile(profileData);
        if (result.success) {
            this.showNotification('Profile updated successfully', 'success');
        } else {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 class="text-xl font-semibold mb-4">${title}</h2>
                ${content}
            </div>
        `;
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    logout() {
        // Clear session and redirect to login
        localStorage.removeItem('doctorToken');
        window.location.href = '../Login_Register/Login.html';
    }
}

// Initialize the doctor controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.doctorController = new DoctorController();
});

export default DoctorController;
