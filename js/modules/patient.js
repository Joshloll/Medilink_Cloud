/**
 * PATIENT MODULE
 * Handles patient dashboard, appointments, medical records, and prescriptions
 */

const patientModule = {
    /**
     * Render patient dashboard
     */
    async renderPatientDashboard() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Render sidebar
        patientModule.renderPatientSidebar();

        // Render top nav
        patientModule.renderPatientTopNav();

        // Get patient profile
        const patient = state.patients.find(p => p.user_id === state.currentUser?.id);
        const myAppointments = patient ? await api.appointments.getPatientAppointments(patient.id) : [];
        const myRecords = patient ? await api.records.getPatientRecords(patient.id) : [];
        const myPrescriptions = patient ? await api.prescriptions.getPatientPrescriptions(patient.id) : [];

        // Build doctors map
        const doctors = {};
        myAppointments.forEach(apt => {
            const doctor = state.doctors.find(d => d.id === apt.doctor_id);
            if (doctor) doctors[doctor.id] = doctor;
        });

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <!-- Welcome Section -->
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, ${state.currentUser?.name || 'Patient'}
                    </h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">
                        Manage your health and appointments
                    </p>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Upcoming Appointments</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            ${myAppointments.filter(apt => {
                                const aptDate = new Date(apt.date);
                                return aptDate > new Date() && apt.status !== 'cancelled';
                            }).length}
                        </p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Medical Records</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${myRecords.length}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Prescriptions</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            ${myPrescriptions.filter(p => p.status === 'active').length}
                        </p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Past Appointments</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${myAppointments.filter(apt => new Date(apt.date) <= new Date()).length}</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">My Appointments</h2>
                            <div id="patient-appointments">
                                <p class="text-slate-500 dark:text-slate-400 text-center py-8">Loading...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-4">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button data-action="navigate" data-target="book-appointment" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">calendar_add_on</span>
                                    Book Appointment
                                </button>
                                <button data-action="navigate" data-target="my-records" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">description</span>
                                    Medical Records
                                </button>
                                <button data-action="navigate" data-target="my-prescriptions" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">prescription</span>
                                    Prescriptions
                                </button>
                            </div>
                        </div>

                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Health Profile</h3>
                            <div class="space-y-3 text-sm">
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Date of Birth</p>
                                    <p class="text-slate-900 dark:text-white font-medium">${patient?.dob || 'Not set'}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Phone</p>
                                    <p class="text-slate-900 dark:text-white font-medium">${patient?.phone || 'Not set'}</p>
                                </div>
                                <div>
                                    <p class="text-slate-500 dark:text-slate-400">Allergies</p>
                                    <p class="text-slate-900 dark:text-white font-medium">${patient?.allergies?.length > 0 ? patient.allergies.join(', ') : 'None documented'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load appointments
        appointmentsModule.renderPatientAppointments('patient-appointments', myAppointments, doctors);
    },

    /**
     * Render patient sidebar
     */
    renderPatientSidebar() {
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
                            <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Patient Portal</p>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav class="flex flex-col gap-1">
                        <a href="#" data-action="navigate" data-target="patient-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                            <span class="material-symbols-outlined">home</span>
                            <span class="text-sm">Dashboard</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="book-appointment" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">calendar_add_on</span>
                            <span class="text-sm">Book Appointment</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="my-records" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">description</span>
                            <span class="text-sm">Medical Records</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="my-prescriptions" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">prescription</span>
                            <span class="text-sm">Prescriptions</span>
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
     * Render patient top navigation
     */
    renderPatientTopNav() {
        const topnav = document.getElementById('topnav');
        if (!topnav) return;

        topnav.classList.remove('hidden');
        topnav.innerHTML = `
            <header class="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex-shrink-0 z-10">
                <div class="flex items-center gap-4">
                    <button class="md:hidden text-slate-500 hover:text-slate-700">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <h2 class="hidden sm:block text-lg font-bold tracking-tight">Patient Dashboard</h2>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium leading-none">${state.currentUser?.name}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Patient</p>
                        </div>
                        <div class="size-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            ${(state.currentUser?.name || 'P').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Render book appointment page
     */
    async renderBookAppointment() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        patientModule.renderPatientSidebar();
        patientModule.renderPatientTopNav();

        const doctors = state.doctors;

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Book Appointment</h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Schedule a consultation with a doctor</p>
                </div>

                <div id="booking-form-container"></div>
            </div>
        `;

        // Render booking form
        appointmentsModule.renderBookingForm('booking-form-container', doctors);
    },

    /**
     * Render medical records page
     */
    async renderMyRecords() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        patientModule.renderPatientSidebar();
        patientModule.renderPatientTopNav();

        const patient = state.patients.find(p => p.user_id === state.currentUser?.id);
        const records = patient ? await api.records.getPatientRecords(patient.id) : [];

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Medical Records</h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Your health records and documents</p>
                </div>

                <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    ${records.length === 0 ? `
                        <div class="text-center py-12">
                            <span class="material-symbols-outlined text-5xl text-slate-300 block mb-4">description</span>
                            <p class="text-slate-500 dark:text-slate-400">No medical records found</p>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            ${records.map(record => `
                                <div class="border border-border-light dark:border-border-dark rounded-lg p-4">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h4 class="font-semibold text-slate-900 dark:text-white">
                                                ${record.diagnosis}
                                            </h4>
                                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                ${new Date(record.created_at).toLocaleDateString()}
                                            </p>
                                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                <strong>Treatment:</strong> ${record.treatment}
                                            </p>
                                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                <strong>Notes:</strong> ${record.notes}
                                            </p>
                                        </div>
                                        <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                            Documented
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Render prescriptions page
     */
    async renderMyPrescriptions() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        patientModule.renderPatientSidebar();
        patientModule.renderPatientTopNav();

        const patient = state.patients.find(p => p.user_id === state.currentUser?.id);
        const prescriptions = patient ? await api.prescriptions.getPatientPrescriptions(patient.id) : [];

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">My Prescriptions</h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Your active and past prescriptions</p>
                </div>

                <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    ${prescriptions.length === 0 ? `
                        <div class="text-center py-12">
                            <span class="material-symbols-outlined text-5xl text-slate-300 block mb-4">prescription</span>
                            <p class="text-slate-500 dark:text-slate-400">No prescriptions found</p>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            ${prescriptions.map(rx => `
                                <div class="border border-border-light dark:border-border-dark rounded-lg p-4">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h4 class="font-semibold text-slate-900 dark:text-white">
                                                ${rx.medication}
                                            </h4>
                                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Dosage: ${rx.dosage}
                                            </p>
                                            <p class="text-sm text-slate-500 dark:text-slate-400">
                                                Frequency: ${rx.frequency} | Duration: ${rx.duration}
                                            </p>
                                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                Refills Remaining: <strong>${rx.refills_remaining}</strong>
                                            </p>
                                        </div>
                                        <div class="flex flex-col items-end gap-2">
                                            <span class="px-3 py-1 ${rx.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'} rounded text-xs font-medium">
                                                ${rx.status.toUpperCase()}
                                            </span>
                                            ${rx.status === 'active' && rx.refills_remaining > 0 ? `
                                                <button data-action="request-refill" data-id="${rx.id}" class="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                                                    Request Refill
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Handle book appointment
     */
    async handleBookAppointment(formData) {
        try {
            const patient = state.patients.find(p => p.user_id === state.currentUser?.id);
            if (!patient) throw new Error('Patient profile not found');

            const appointment = await api.appointments.bookAppointment({
                patient_id: patient.id,
                doctor_id: formData.doctor_id,
                date: formData.date,
                time: formData.time,
                reason: formData.reason
            });

            showToast('Appointment booked successfully!', 'success');
            patientModule.renderPatientDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle cancel appointment
     */
    async handleCancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.appointments.cancelAppointment(appointmentId);
                showToast('Appointment cancelled', 'info');
                patientModule.renderPatientDashboard();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    },

    /**
     * Handle request refill
     */
    async handleRequestRefill(prescriptionId) {
        try {
            await api.prescriptions.requestRefill(prescriptionId);
            showToast('Refill requested successfully!', 'success');
            patientModule.renderMyPrescriptions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};
