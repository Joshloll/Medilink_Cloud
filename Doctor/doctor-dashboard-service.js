// Doctor Dashboard Service
// Handles all doctor dashboard functionality with Supabase integration

import supabaseAuthService from '../auth/supabase-auth.js';
import { showNotification } from '../js/global-event-handler.js';

class DoctorDashboardService {
    constructor() {
        this.supabase = supabaseAuthService.getSupabaseClient();
        this.currentUser = null;
        this.doctorProfile = null;
        this.init();
    }

    async init() {
        // Get current user
        this.currentUser = supabaseAuthService.getCurrentUser();
        
        if (!this.currentUser || !supabaseAuthService.isDoctor()) {
            showNotification('Access denied. Doctor privileges required.', 'error');
            window.location.href = '../Login_Register/Login.html';
            return;
        }

        // Initialize dashboard
        await this.loadDoctorData();
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
        
        greeting += `, Dr. ${this.currentUser.full_name || 'Doctor'}`;
        
        greetingElement.textContent = greeting;
    }

    async loadDoctorData() {
        try {
            // Get doctor profile
            const { data: doctor, error: doctorError } = await this.supabase
                .from('doctors')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (doctorError && doctorError.code !== 'PGRST116') {
                throw doctorError;
            }

            this.doctorProfile = doctor;

            // Load all dashboard data in parallel
            const [
                appointmentsResult,
                todayAppointmentsResult,
                patientsResult,
                statsResult
            ] = await Promise.all([
                    this.getDoctorAppointments(),
                    this.getTodayAppointments(),
                    this.getMyPatients(),
                    this.getDoctorStats()
                ]);

            // Update UI
            if (appointmentsResult.success) {
                this.renderAppointments(appointmentsResult.appointments);
            }

            if (todayAppointmentsResult.success) {
                this.renderTodaySchedule(todayAppointmentsResult.appointments);
            }

            if (patientsResult.success) {
                this.renderPatients(patientsResult.patients);
            }

            if (statsResult.success) {
                this.updateStats(statsResult.stats);
            }

        } catch (error) {
            console.error('Error loading doctor data:', error);
            showNotification('Failed to load doctor data', 'error');
        }
    }

    async getDoctorAppointments() {
        try {
            if (!this.doctorProfile) {
                return { success: true, appointments: [] };
            }

            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    *,
                    patient:patients(
                        user:users(full_name, email, phone_number)
                    )
                `)
                .eq('doctor_id', this.doctorProfile.id)
                .order('appointment_date', { ascending: true });

            if (error) throw error;

            return { success: true, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTodayAppointments() {
        try {
            if (!this.doctorProfile) {
                return { success: true, appointments: [] };
            }

            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    *,
                    patient:patients(
                        user:users(full_name, email, phone_number)
                    )
                `)
                .eq('doctor_id', this.doctorProfile.id)
                .eq('appointment_date', today)
                .order('appointment_time', { ascending: true });

            if (error) throw error;

            return { success: true, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getMyPatients() {
        try {
            if (!this.doctorProfile) {
                return { success: true, patients: [] };
            }

            // Get patients who have appointments with this doctor
            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    patient_id,
                    patient:patients(
                        user:users(full_name, email, phone_number, date_of_birth)
                    )
                `)
                .eq('doctor_id', this.doctorProfile.id)
                .not('status', 'in', '["cancelled"]');

            if (error) throw error;

            // Remove duplicates and get unique patients
            const uniquePatients = data.reduce((acc, apt) => {
                if (apt.patient && !acc.find(p => p.patient.id === apt.patient.id)) {
                    acc.push(apt.patient);
                }
                return acc;
            }, []);

            return { success: true, patients: uniquePatients };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getDoctorStats() {
        try {
            if (!this.doctorProfile) {
                return { success: true, stats: this.getDefaultStats() };
            }

            const today = new Date().toISOString().split('T')[0];
            
            const [totalAppointmentsResult, todayAppointmentsResult, completedAppointmentsResult] = await Promise.all([
                this.supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', this.doctorProfile.id),
                this.supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', this.doctorProfile.id).eq('appointment_date', today),
                this.supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', this.doctorProfile.id).eq('status', 'completed')
            ]);

            return {
                success: true,
                stats: {
                    totalAppointments: totalAppointmentsResult.count || 0,
                    todayAppointments: todayAppointmentsResult.count || 0,
                    completedAppointments: completedAppointmentsResult.count || 0,
                    totalPatients: 0 // Will be updated from getMyPatients
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getDefaultStats() {
        return {
            totalAppointments: 0,
            todayAppointments: 0,
            completedAppointments: 0,
            totalPatients: 0
        };
    }

    renderAppointments(appointments) {
        const container = document.getElementById('appointments-list');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">calendar_today</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No appointments scheduled</p>
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
            html += past.slice(0, 5).map(apt => this.renderAppointmentCard(apt, 'past')).join('');
        }

        container.innerHTML = html;
    }

    renderTodaySchedule(appointments) {
        const container = document.getElementById('today-schedule');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">event_available</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No appointments today</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(appointment => {
            const patient = appointment.patient?.user;
            return `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-blue-600">person</span>
                                <h5 class="font-medium text-slate-900 dark:text-white">
                                    ${patient?.full_name || 'Unknown Patient'}
                                </h5>
                                <span class="px-2 py-1 bg-${this.getAppointmentStatusColor(appointment.status)}-100 text-${this.getAppointmentStatusColor(appointment.status)}-800 dark:bg-${this.getAppointmentStatusColor(appointment.status)}-900/30 dark:text-${this.getAppointmentStatusColor(appointment.status)}-400 rounded-full text-xs font-medium">
                                    ${appointment.status}
                                </span>
                            </div>
                            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
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
                                ${patient?.phone_number ? `
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">phone</span>
                                        <span>${patient.phone_number}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex gap-2 ml-4">
                            ${appointment.status === 'scheduled' ? `
                                <button 
                                    data-action="mark-appointment-complete" 
                                    data-id="${appointment.id}"
                                    class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1">check</span>
                                    Complete
                                </button>
                            ` : ''}
                            ${appointment.status === 'scheduled' ? `
                                <button 
                                    data-action="cancel-appointment-doctor" 
                                    data-id="${appointment.id}"
                                    class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1">cancel</span>
                                    Cancel
                                </button>
                            ` : ''}
                            <button 
                                data-action="view-patient-details" 
                                data-id="${appointment.patient_id}"
                                class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                                View Patient
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAppointmentCard(appointment, type) {
        const patient = appointment.patient?.user;
        const statusColor = this.getAppointmentStatusColor(appointment.status);
        
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-blue-600">person</span>
                            <h5 class="font-medium text-slate-900 dark:text-white">
                                ${patient?.full_name || 'Unknown Patient'}
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
                                data-action="create-medical-record" 
                                data-id="${appointment.patient_id}"
                                class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">medical_information</span>
                                Add Record
                            </button>
                            <button 
                                data-action="create-prescription" 
                                data-id="${appointment.patient_id}"
                                class="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">medication</span>
                                Prescription
                            </button>
                        ` : ''}
                        <button 
                            data-action="view-patient-details" 
                            data-id="${appointment.patient_id}"
                            class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPatients(patients) {
        const container = document.getElementById('patients-list');
        if (!container) return;

        if (patients.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">group</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No patients found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = patients.map(patient => {
            const user = patient.user;
            return `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="material-symbols-outlined text-green-600">person</span>
                                <h5 class="font-medium text-slate-900 dark:text-white">
                                    ${user?.full_name || 'Unknown Patient'}
                                </h5>
                            </div>
                            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                ${user?.email ? `
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">email</span>
                                        <span>${user.email}</span>
                                    </div>
                                ` : ''}
                                ${user?.phone_number ? `
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">phone</span>
                                        <span>${user.phone_number}</span>
                                    </div>
                                ` : ''}
                                ${user?.date_of_birth ? `
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[16px]">cake</span>
                                        <span>DOB: ${new Date(user.date_of_birth).toLocaleDateString()}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex gap-2 ml-4">
                            <button 
                                data-action="view-patient-details" 
                                data-id="${patient.id}"
                                class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
                                View
                            </button>
                            <button 
                                data-action="create-medical-record" 
                                data-id="${patient.id}"
                                class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">medical_information</span>
                                Record
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats(stats) {
        const elements = {
            totalAppointments: document.getElementById('totalAppointments'),
            todayAppointments: document.getElementById('todayAppointments'),
            completedAppointments: document.getElementById('completedAppointments'),
            totalPatients: document.getElementById('totalPatients')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                element.textContent = stats[key] || 0;
            }
        });
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
        // This method can be used for any doctor-specific event handling
    }

    // Complete appointment
    async completeAppointment(appointmentId) {
        try {
            const { error } = await this.supabase
                .from('appointments')
                .update({ 
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', appointmentId);

            if (error) throw error;

            showNotification('Appointment marked as completed', 'success');
            await this.loadDoctorData(); // Refresh dashboard
            
            return { success: true };
        } catch (error) {
            console.error('Error completing appointment:', error);
            showNotification('Failed to complete appointment', 'error');
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
            await this.loadDoctorData(); // Refresh dashboard
            
            return { success: true };
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showNotification('Failed to cancel appointment', 'error');
            return { success: false, error: error.message };
        }
    }

    // Add medical record
    async addMedicalRecord(patientId, recordData) {
        try {
            if (!this.doctorProfile) {
                showNotification('Doctor profile not found', 'error');
                return { success: false, error: 'Doctor profile not found' };
            }

            const { data, error } = await this.supabase
                .from('medical_records')
                .insert({
                    patient_id: patientId,
                    doctor_id: this.doctorProfile.id,
                    diagnosis: recordData.diagnosis,
                    treatment_plan: recordData.treatment,
                    description: recordData.notes,
                    record_type: 'diagnosis',
                    is_visible_to_patient: true
                })
                .select()
                .single();

            if (error) throw error;

            showNotification('Medical record added successfully', 'success');
            await this.loadDoctorData(); // Refresh dashboard
            
            return { success: true, record: data };
        } catch (error) {
            console.error('Error adding medical record:', error);
            showNotification('Failed to add medical record', 'error');
            return { success: false, error: error.message };
        }
    }

    // Create prescription
    async createPrescription(patientId, prescriptionData) {
        try {
            if (!this.doctorProfile) {
                showNotification('Doctor profile not found', 'error');
                return { success: false, error: 'Doctor profile not found' };
            }

            const { data, error } = await this.supabase
                .from('prescriptions')
                .insert({
                    patient_id: patientId,
                    doctor_id: this.doctorProfile.id,
                    medication_name: prescriptionData.medication_name,
                    dosage: prescriptionData.dosage,
                    frequency: prescriptionData.frequency,
                    duration: prescriptionData.duration,
                    instructions: prescriptionData.instructions,
                    status: 'active',
                    prescribed_date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            showNotification('Prescription created successfully', 'success');
            await this.loadDoctorData(); // Refresh dashboard
            
            return { success: true, prescription: data };
        } catch (error) {
            console.error('Error creating prescription:', error);
            showNotification('Failed to create prescription', 'error');
            return { success: false, error: error.message };
        }
    }

    // Refresh dashboard data
    async refreshDashboard() {
        await this.loadDoctorData();
        showNotification('Dashboard refreshed', 'success');
    }
}

// Initialize doctor dashboard service
const doctorDashboardService = new DoctorDashboardService();

export default doctorDashboardService;
