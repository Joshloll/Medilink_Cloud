// Admin Dashboard Service
// Handles all admin dashboard functionality with Supabase integration

import supabaseAuthService from '../auth/supabase-auth.js';
import { showNotification } from '../js/global-event-handler.js';

class AdminDashboardService {
    constructor() {
        this.supabase = supabaseAuthService.getSupabaseClient();
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Get current user
        this.currentUser = supabaseAuthService.getCurrentUser();
        
        if (!this.currentUser || !supabaseAuthService.isAdmin()) {
            showNotification('Access denied. Admin privileges required.', 'error');
            window.location.href = '../Login_Register/Login.html';
            return;
        }

        // Initialize dashboard
        await this.loadDashboardData();
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
        
        greeting += `, ${this.currentUser.full_name || 'Admin'}`;
        
        greetingElement.textContent = greeting;
    }

    async loadDashboardData() {
        try {
            // Load all dashboard data in parallel
            const [
                statsResult,
                pendingUsersResult,
                doctorsResult,
                recentAppointmentsResult
            ] = await Promise.all([
                this.getSystemStats(),
                supabaseAuthService.getPendingUsers(),
                this.getAvailableDoctors(),
                this.getRecentAppointments()
            ]);

            // Update stats
            if (statsResult.success) {
                this.updateStats(statsResult.stats);
            }

            // Update pending users
            if (pendingUsersResult.success) {
                this.renderPendingUsers(pendingUsersResult.users);
            }

            // Update doctor status
            if (doctorsResult.success) {
                this.renderDoctorStatus(doctorsResult.doctors);
            }

            // Update recent activity
            if (recentAppointmentsResult.success) {
                this.renderRecentActivity(recentAppointmentsResult.appointments);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        }
    }

    async getSystemStats() {
        try {
            const [patientsResult, doctorsResult, appointmentsResult, pendingResult] = await Promise.all([
                this.supabase.from('patients').select('*', { count: 'exact', head: true }),
                this.supabase.from('doctors').select('*', { count: 'exact', head: true }),
                this.supabase.from('appointments').select('*', { count: 'exact', head: true }),
                this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            return {
                success: true,
                stats: {
                    totalPatients: patientsResult.count || 0,
                    totalDoctors: doctorsResult.count || 0,
                    totalAppointments: appointmentsResult.count || 0,
                    pendingApprovals: pendingResult.count || 0
                }
            };
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
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, doctors: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getRecentAppointments() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await this.supabase
                .from('appointments')
                .select(`
                    *,
                    patient:patients(user:users(full_name, email)),
                    doctor:doctors(user:users(full_name, email))
                `)
                .gte('appointment_date', today)
                .order('appointment_date', { ascending: true })
                .limit(10);

            if (error) throw error;

            return { success: true, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateStats(stats) {
        // Update stat cards
        const elements = {
            totalPatients: document.getElementById('totalPatients'),
            totalDoctors: document.getElementById('totalDoctors'),
            appointentsToday: document.getElementById('appointmentsToday'),
            pendingApprovals: document.getElementById('pendingApprovals'),
            pendingCount: document.getElementById('pendingCount')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                const value = stats[key] || stats[key.replace(/([A-Z])/g, '$1').toLowerCase()] || 0;
                element.textContent = value;
            }
        });
    }

    renderPendingUsers(pendingUsers) {
        const container = document.getElementById('pending-users-container');
        const pendingCount = document.getElementById('pendingCount');
        
        if (!container) return;

        if (pendingCount) {
            pendingCount.textContent = pendingUsers.length;
        }

        if (pendingUsers.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">person_add</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No pending approvals</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pendingUsers.map(user => `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">
                                ${this.getRoleIcon(user.role)}
                            </span>
                        </div>
                        <div>
                            <h4 class="font-medium text-slate-900 dark:text-white text-sm">
                                ${user.full_name || user.email}
                            </h4>
                            <p class="text-xs text-slate-600 dark:text-slate-400">${user.email}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="px-2 py-1 bg-${this.getRoleColor(user.role)}-100 text-${this.getRoleColor(user.role)}-800 dark:bg-${this.getRoleColor(user.role)}-900/30 dark:text-${this.getRoleColor(user.role)}-400 rounded-full text-xs font-medium">
                                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                                <span class="text-xs text-slate-500">
                                    ${new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button 
                            data-action="approve-user" 
                            data-id="${user.id}"
                            class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">check</span>
                            Approve
                        </button>
                        <button 
                            data-action="reject-user" 
                            data-id="${user.id}"
                            class="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                            <span class="material-symbols-outlined text-[14px] align-middle mr-1">close</span>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderDoctorStatus(doctors) {
        const container = document.getElementById('doctor-status-list');
        
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

        container.innerHTML = doctors.map(doctor => `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full ${doctor.is_available ? 'bg-green-500' : 'bg-red-500'}"></div>
                    <div>
                        <p class="font-medium text-sm text-slate-900 dark:text-white">
                            ${doctor.user?.full_name || 'Unknown Doctor'}
                        </p>
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                            ${doctor.specialization || 'General Practice'}
                        </p>
                    </div>
                </div>
                <span class="text-xs ${doctor.is_available ? 'text-green-600' : 'text-red-600'} font-medium">
                    ${doctor.is_available ? 'Available' : 'Unavailable'}
                </span>
            </div>
        `).join('');
    }

    renderRecentActivity(appointments) {
        const container = document.getElementById('alerts-container');
        
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">notifications</span>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(appointment => `
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px] mt-0.5">
                        calendar_today
                    </span>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-slate-900 dark:text-white">
                            New appointment scheduled
                        </p>
                        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            ${appointment.patient?.user?.full_name || 'Unknown Patient'} → ${appointment.doctor?.user?.full_name || 'Unknown Doctor'}
                        </p>
                        <p class="text-xs text-slate-500 mt-1">
                            ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getRoleIcon(role) {
        const icons = {
            'admin': 'admin_panel_settings',
            'doctor': 'stethoscope',
            'patient': 'person'
        };
        return icons[role] || 'person';
    }

    getRoleColor(role) {
        const colors = {
            'admin': 'purple',
            'doctor': 'blue',
            'patient': 'green'
        };
        return colors[role] || 'slate';
    }

    setupEventListeners() {
        // Event listeners are handled by the global event handler
        // This method can be used for any admin-specific event handling
    }

    // Refresh dashboard data
    async refreshDashboard() {
        await this.loadDashboardData();
        showNotification('Dashboard refreshed', 'success');
    }

    // Create user by admin
    async createUser(userData) {
        try {
            const result = await supabaseAuthService.createUserByAdmin(
                userData.email,
                userData.password || Math.random().toString(36).slice(-12),
                userData.full_name,
                userData.role,
                {
                    phone_number: userData.phone,
                    ...(userData.role === 'doctor' && {
                        license_number: userData.license_number,
                        specialization: userData.specialization
                    })
                }
            );

            if (result.success) {
                showNotification('User created successfully', 'success');
                await this.loadDashboardData(); // Refresh dashboard
            } else {
                showNotification(result.error || 'Failed to create user', 'error');
            }

            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            showNotification('Failed to create user', 'error');
            return { success: false, error: error.message };
        }
    }

    // Create appointment
    async createAppointment(appointmentData) {
        try {
            const { data, error } = await this.supabase
                .from('appointments')
                .insert({
                    patient_id: appointmentData.patient_id,
                    doctor_id: appointmentData.doctor_id,
                    appointment_date: appointmentData.appointment_date,
                    appointment_time: appointmentData.appointment_time,
                    reason_for_visit: appointmentData.reason,
                    status: 'scheduled'
                })
                .select()
                .single();

            if (error) throw error;

            showNotification('Appointment created successfully', 'success');
            await this.loadDashboardData(); // Refresh dashboard
            
            return { success: true, appointment: data };
        } catch (error) {
            console.error('Error creating appointment:', error);
            showNotification(error.message || 'Failed to create appointment', 'error');
            return { success: false, error: error.message };
        }
    }
}

// Initialize admin dashboard service
const adminDashboardService = new AdminDashboardService();

export default adminDashboardService;
