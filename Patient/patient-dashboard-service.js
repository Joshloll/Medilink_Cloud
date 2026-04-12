// Patient Dashboard Service
// Handles all patient dashboard functionality with Supabase integration

import supabaseAuthService from '../auth/supabase-auth.js';
import { showNotification } from '../js/global-event-handler.js';

class PatientDashboardService {
    constructor() {
        this.supabase = supabaseAuthService.getSupabaseClient();
        this.currentUser = null;
        this.patientProfile = null;
        this.init();
    }

    async init() {
        // Get current user
        this.currentUser = supabaseAuthService.getCurrentUser();
        
        if (!this.currentUser || !supabaseAuthService.isPatient()) {
            showNotification('Access denied. Patient privileges required.', 'error');
            window.location.href = '../Login_Register/Login.html';
            return;
        }

        // Initialize dashboard
        await this.loadPatientData();
        this.setupEventListeners();
        this.updateGreeting();
    }

    updateGreeting() {
        const greetingElement = document.getElementById('greetingMessage');
        if (!greetingElement) return;

        const hour = new Date().getHours();
        let greeting = 'Good ';
        
        if (hour < 12) greeting += 'Morning';
        else if (hour < 17) greeting += 'Afternoon';
        else greeting += 'Evening';
        
        greeting += `, ${this.currentUser.full_name || 'Patient'}`;
        
        greetingElement.textContent = greeting;
    }

    async loadPatientData() {
        try {
            // Get patient profile
            const { data: patient, error: patientError } = await this.supabase
                .from('patients')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (patientError && patientError.code !== 'PGRST116') {
                throw patientError;
            }

            this.patientProfile = patient;

            // Load all dashboard data in parallel
            const [
                appointmentsResult,
                recordsResult,
                prescriptionsResult,
                availableDoctorsResult
            ] = await Promise.all([
                    this.getPatientAppointments(),
                    this.getMedicalRecords(),
                    this.getPrescriptions(),
                    this.getAvailableDoctors()
                ]);

            // Update UI
            if (appointmentsResult.success) {
                this.renderAppointments(appointmentsResult.appointments);
            }

            if (recordsResult.success) {
                this.renderMedicalRecords(recordsResult.records);
            }

            if (prescriptionsResult.success) {
                this.renderPrescriptions(prescriptionsResult.prescriptions);
            }

            if (availableDoctorsResult.success) {
                this.renderAvailableDoctors(availableDoctorsResult.doctors);
            }

        } catch (error) {
            console.error('Error loading patient data:', error);
            showNotification('Failed to load patient data', 'error');
        }
    }

    async getPatientAppointments() {
        try {
            if (!this.patientProfile) {
                return { success: true, appointments: [] };
            }

            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    *,
                    doctor:doctors(
                        user:users(full_name, email),
                        specialization
                    )
                `)
                .eq('patient_id', this.patientProfile.id)
                .order('appointment_date', { ascending: true });

            if (error) throw error;

            return { success: true, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getMedicalRecords() {
        try {
            if (!this.patientProfile) {
                return { success: true, records: [] };
            }

            const { data, error } = await this.supabase
                .from('medical_records')
                .select(`
                    *,
                    doctor:doctors(
                        user:users(full_name, email)
                    )
                `)
                .eq('patient_id', this.patientProfile.id)
                .eq('is_visible_to_patient', true)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            return { success: true, records: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPrescriptions() {
        try {
            if (!this.patientProfile) {
                return { success: true, prescriptions: [] };
            }

            const { data, error } = await this.supabase
                .from('prescriptions')
                .select(`
                    *,
                    doctor:doctors(
                        user:users(full_name, email)
                    )
                `)
                .eq('patient_id', this.patientProfile.id)
                .order('prescribed_date', { ascending: false })
                .limit(10);

            if (error) throw error;

            return { success: true, prescriptions: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAvailableDoctors() {
        try {
            const { data, error } = await this.supabase
                .from('doctors')
                .select(`
                    *,
                    user:users(full_name, email, status)
                `)
                .eq('is_available', true)
                .eq('user.status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, doctors: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    renderAppointments(appointments) {
        const container = document.getElementById('appointments-list');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No appointments scheduled</p>
                    <button class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors" data-action="book-appointment">
                        Book Appointment
                    </button>
                </div>
            `;
            return;
        }

        // Separate upcoming and past appointments
        const today = new Date().toISOString().split('T')[0];
        const upcoming = appointments.filter(apt => apt.appointment_date >= today);
        const past = appointments.filter(apt => apt.appointment_date < today);

        let html = '';

        if (upcoming.length > 0) {
            html += '<h4 class="font-semibold text-slate-900 dark:text-white mb-3">Upcoming Appointments</h4>';
            html += upcoming.map(apt => this.renderAppointmentCard(apt, 'upcoming')).join('');
        }

        if (past.length > 0) {
            html += '<h4 class="font-semibold text-slate-900 dark:text-white mb-3 mt-6">Past Appointments</h4>';
            html += past.slice(0, 3).map(apt => this.renderAppointmentCard(apt, 'past')).join('');
        }

        container.innerHTML = html;
    }

    renderAppointmentCard(appointment, type) {
        const doctor = appointment.doctor?.user;
        const statusColor = this.getAppointmentStatusColor(appointment.status);
        
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-blue-600">person</span>
                            <h5 class="font-medium text-slate-900 dark:text-white">
                                Dr. ${doctor?.full_name || 'Unknown Doctor'}
                            </h5>
                            <span class="px-2 py-1 bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/30 dark:text-${statusColor}-400 rounded-full text-xs font-medium">
                                ${appointment.status}
                            </span>
                        </div>
                        <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                                <span>${new Date(appointment.appointment_date).toLocaleDateString()}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">schedule</span>
                                <span>${appointment.appointment_time}</span>
                            </div>
                            ${appointment.reason_for_visit ? `
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">description</span>
                                    <span>${appointment.reason_for_visit}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex gap-2 ml-4">
                        ${type === 'upcoming' && appointment.status === 'scheduled' ? `
                            <button 
                                data-action="cancel-appointment" 
                                data-id="${appointment.id}"
                                class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">cancel</span>
                                Cancel
                            </button>
                        ` : ''}
                        <button 
                            data-action="view-appointment-patient" 
                            data-id="${appointment.id}"
                            class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMedicalRecords(records) {
        const container = document.getElementById('records-list');
        if (!container) return;

        if (records.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">description</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No medical records found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = records.map(record => {
            const doctor = record.doctor?.user;
            return `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-green-600">medical_information</span>
                                <h5 class="font-medium text-slate-900 dark:text-white">
                                    ${record.diagnosis || 'Medical Record'}
                                </h5>
                            </div>
                            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">person</span>
                                    <span>Dr. ${doctor?.full_name || 'Unknown Doctor'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                                    <span>${new Date(record.created_at).toLocaleDateString()}</span>
                                </div>
                                ${record.treatment_plan ? `
                                    <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                                        ${record.treatment_plan}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <button 
                            data-action="view-medical-record" 
                            data-id="${record.id}"
                            class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                            View
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPrescriptions(prescriptions) {
        const container = document.getElementById('prescriptions-list');
        if (!container) return;

        if (prescriptions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">medication</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No prescriptions found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = prescriptions.map(prescription => {
            const doctor = prescription.doctor?.user;
            const statusColor = prescription.status === 'active' ? 'green' : 'yellow';
            
            return `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-purple-600">medication</span>
                                <h5 class="font-medium text-slate-900 dark:text-white">
                                    ${prescription.medication_name}
                                </h5>
                                <span class="px-2 py-1 bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/30 dark:text-${statusColor}-400 rounded-full text-xs font-medium">
                                    ${prescription.status}
                                </span>
                            </div>
                            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">person</span>
                                    <span>Dr. ${doctor?.full_name || 'Unknown Doctor'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                                    <span>${new Date(prescription.prescribed_date).toLocaleDateString()}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">medication</span>
                                    <span>${prescription.dosage} - ${prescription.frequency} - ${prescription.duration}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2 ml-4">
                            ${prescription.status === 'active' ? `
                                <button 
                                    data-action="request-prescription-refill" 
                                    data-id="${prescription.id}"
                                    class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1">refresh</span>
                                    Refill
                                </button>
                            ` : ''}
                            <button 
                                data-action="view-prescription" 
                                data-id="${prescription.id}"
                                class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                                View
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAvailableDoctors(doctors) {
        const container = document.getElementById('doctors-list');
        if (!container) return;

        if (doctors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">stethoscope</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No doctors available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = doctors.map(doctor => {
            const user = doctor.user;
            return `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-blue-600">stethoscope</span>
                                <h5 class="font-medium text-slate-900 dark:text-white">
                                    Dr. ${user?.full_name || 'Unknown Doctor'}
                                </h5>
                                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                            </div>
                            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">medical_services</span>
                                    <span>${doctor.specialization || 'General Practice'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">email</span>
                                    <span>${user?.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            data-action="book-with-doctor" 
                            data-id="${doctor.id}"
                            class="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">calendar_add_on</span>
                            Book
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getAppointmentStatusColor(status) {
        const colors = {
            'scheduled': 'blue',
            'confirmed': 'green',
            'in-progress': 'yellow',
            'completed': 'green',
            'cancelled': 'red'
        };
        return colors[status] || 'slate';
    }

    setupEventListeners() {
        // Event listeners are handled by the global event handler
        // This method can be used for any patient-specific event handling
    }

    // Book appointment
    async bookAppointment(doctorId, appointmentData) {
        try {
            if (!this.patientProfile) {
                showNotification('Patient profile not found', 'error');
                return { success: false, error: 'Patient profile not found' };
            }

            const { data, error } = await this.supabase
                .from('appointments')
                .insert({
                    patient_id: this.patientProfile.id,
                    doctor_id: doctorId,
                    appointment_date: appointmentData.appointment_date,
                    appointment_time: appointmentData.appointment_time,
                    reason_for_visit: appointmentData.reason,
                    status: 'scheduled'
                })
                .select()
                .single();

            if (error) throw error;

            showNotification('Appointment booked successfully', 'success');
            await this.loadPatientData(); // Refresh dashboard
            
            return { success: true, appointment: data };
        } catch (error) {
            console.error('Error booking appointment:', error);
            showNotification(error.message || 'Failed to book appointment', 'error');
            return { success: false, error: error.message };
        }
    }

    // Cancel appointment
    async cancelAppointment(appointmentId) {
        try {
            const { error } = await this.supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId);

            if (error) throw error;

            showNotification('Appointment cancelled successfully', 'success');
            await this.loadPatientData(); // Refresh dashboard
            
            return { success: true };
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showNotification('Failed to cancel appointment', 'error');
            return { success: false, error: error.message };
        }
    }

    // Request prescription refill
    async requestPrescriptionRefill(prescriptionId) {
        try {
            const { error } = await this.supabase
                .from('prescriptions')
                .update({ 
                    status: 'refill-requested',
                    refill_requested_at: new Date().toISOString()
                })
                .eq('id', prescriptionId);

            if (error) throw error;

            showNotification('Refill request submitted successfully', 'success');
            await this.loadPatientData(); // Refresh dashboard
            
            return { success: true };
        } catch (error) {
            console.error('Error requesting refill:', error);
            showNotification('Failed to request refill', 'error');
            return { success: false, error: error.message };
        }
    }

    // Refresh dashboard data
    async refreshDashboard() {
        await this.loadPatientData();
        showNotification('Dashboard refreshed', 'success');
    }
}

// Initialize patient dashboard service
const patientDashboardService = new PatientDashboardService();

export default patientDashboardService;
