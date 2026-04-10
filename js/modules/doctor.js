/**
 * DOCTOR MODULE
 * Handles doctor dashboard, appointments, medical records, and prescriptions
 */

const doctorModule = {
    /**
     * Render doctor dashboard
     */
    async renderDoctorDashboard() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Render sidebar
        doctorModule.renderDoctorSidebar();

        // Render top nav
        doctorModule.renderDoctorTopNav();

        // Get doctor profile
        const doctor = state.doctors.find(d => d.user_id === state.currentUser?.id);
        const myAppointments = doctor ? await api.appointments.getDoctorAppointments(doctor.id) : [];
        const patients = {};
        
        myAppointments.forEach(apt => {
            const patient = state.patients.find(p => p.id === apt.patient_id);
            if (patient) patients[patient.id] = patient;
        });

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <!-- Welcome Section -->
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, Dr. ${state.currentUser?.name || 'Doctor'}
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">
                        Manage your schedule and patients
                    </p>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Today's Appointments</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            ${myAppointments.filter(apt => {
                                const aptDate = new Date(apt.date).toDateString();
                                const today = new Date().toDateString();
                                return aptDate === today;
                            }).length}
                        </p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Patients</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${Object.keys(patients).length}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Appointments</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            ${myAppointments.filter(apt => apt.status === 'pending').length}
                        </p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">My Appointments</h2>
                            <div id="doctor-appointments">
                                <p class="text-slate-500 dark:text-slate-400 text-center py-8">Loading...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-4">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button data-action="navigate" data-target="my-patients" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">groups</span>
                                    My Patients
                                </button>
                                <button data-action="navigate" data-target="create-record" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">description</span>
                                    Add Medical Record
                                </button>
                                <button data-action="navigate" data-target="create-prescription" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">prescription</span>
                                    Create Prescription
                                </button>
                            </div>
                        </div>

                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Profile</h3>
                            <div class="space-y-3 text-sm">
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Specialty</p>
                                    <p class="text-slate-900 dark:text-white font-medium">${doctor?.specialty || 'Not set'}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">License</p>
                                    <p class="text-slate-900 dark:text-white font-medium">${doctor?.license_number || 'Not set'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load appointments
        appointmentsModule.renderDoctorAppointments('doctor-appointments', myAppointments, patients);
    },

    /**
     * Render doctor sidebar
     */
    renderDoctorSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.classList.remove('hidden');
        sidebar.innerHTML = `
            <div class="w-64 flex-shrink-0 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col justify-between hidden md:flex z-20">
                <div class="flex flex-col p-4 gap-6">
                    <!-- Brand -->
                    <div class="flex items-center gap-3 px-2">
                        <div class="bg-primary/10 flex items-center justify-center rounded-lg size-10 text-primary">
                            <span class="material-symbols-outlined text-2xl">local_hospital</span>
                        </div>
                        <div class="flex flex-col">
                            <h1 class="text-base font-bold leading-tight">MediLink Cloud</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Doctor Portal</p>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav class="flex flex-col gap-1">
                        <a href="#" data-action="navigate" data-target="doctor-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                            <span class="material-symbols-outlined">home</span>
                            <span class="text-sm">Dashboard</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="my-schedule" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">calendar_month</span>
                            <span class="text-sm">Schedule</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="my-patients" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">groups</span>
                            <span class="text-sm">My Patients</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="my-records" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">description</span>
                            <span class="text-sm">Medical Records</span>
                        </a>
                    </nav>
                </div>

                <!-- Logout -->
                <div class="p-4 border-t border-border-light dark:border-border-dark">
                    <button data-action="logout" class="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors">
                        <span class="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render doctor top navigation
     */
    renderDoctorTopNav() {
        const topnav = document.getElementById('topnav');
        if (!topnav) return;

        topnav.classList.remove('hidden');
        topnav.innerHTML = `
            <header class="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex-shrink-0 z-10">
                <div class="flex items-center gap-4">
                    <button class="md:hidden text-slate-500 hover:text-slate-700">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <h2 class="hidden sm:block text-lg font-bold tracking-tight">Doctor Dashboard</h2>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium leading-none">Dr. ${state.currentUser?.name}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Medical Professional</p>
                        </div>
                        <div class="size-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                            ${(state.currentUser?.name || 'D').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Render my patients list
     */
    async renderMyPatients() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const doctor = state.doctors.find(d => d.user_id === state.currentUser?.id);
        const myAppointments = doctor ? await api.appointments.getDoctorAppointments(doctor.id) : [];
        
        // Get unique patients from appointments
        const patientIds = [...new Set(myAppointments.map(apt => apt.patient_id))];
        const patients = patientIds.map(id => state.patients.find(p => p.id === id)).filter(Boolean);

        doctorModule.renderDoctorSidebar();
        doctorModule.renderDoctorTopNav();

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Patients</h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Total: ${patients.length} patients</p>
                </div>

                <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    <div class="space-y-3">
                        ${patients.length === 0 ? `
                            <div class="text-center py-8">
                                <span class="material-symbols-outlined text-4xl text-slate-300">groups</span>
                                <p class="text-slate-500 dark:text-slate-400 mt-2">No patients yet</p>
                            </div>
                        ` : `
                            <div class="space-y-3">
                                ${patients.map(patient => `
                                    <div class="bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div>
                                            <h4 class="font-semibold text-slate-900 dark:text-white">${patient.name}</h4>
                                            <p class="text-sm text-slate-500 dark:text-slate-400">${patient.email}</p>
                                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Phone: ${patient.phone || 'Not provided'}
                                            </p>
                                        </div>
                                        <div class="flex gap-2">
                                            <button data-action="view-record" data-id="${patient.id}" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                                View Records
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Handle confirm appointment
     */
    async handleConfirmAppointment(appointmentId) {
        try {
            await api.appointments.updateAppointmentStatus(appointmentId, 'confirmed');
            showToast('Appointment confirmed!', 'success');
            doctorModule.renderDoctorDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle complete appointment
     */
    async handleCompleteAppointment(appointmentId) {
        try {
            await api.appointments.updateAppointmentStatus(appointmentId, 'completed');
            showToast('Appointment marked as completed!', 'success');
            doctorModule.renderDoctorDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle reject appointment
     */
    async handleRejectAppointment(appointmentId) {
        try {
            await api.appointments.updateAppointmentStatus(appointmentId, 'rejected');
            showToast('Appointment rejected', 'info');
            doctorModule.renderDoctorDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};
