/**
 * APPOINTMENTS MODULE
 * Manages appointment booking, updating, and tracking
 * Handles logic for patient, doctor, and admin views
 */

const appointmentsModule = {
    /**
     * Render appointment booking form
     */
    renderBookingForm(containerId, doctors = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        const minDate = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];

        container.innerHTML = `
            <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Book Appointment</h3>
                
                <form id="booking-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Doctor
                        </label>
                        <select name="doctor_id" required class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            <option value="">Choose a doctor...</option>
                            ${doctors.map(doctor => `
                                <option value="${doctor.id}">
                                    ${doctor.name} - ${doctor.specialty || 'General Practice'}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Appointment Date
                        </label>
                        <input type="date" name="date" min="${minDate}" required class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Time
                        </label>
                        <input type="time" name="time" required class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Reason for Visit
                        </label>
                        <textarea name="reason" required rows="3" placeholder="Describe your symptoms or reason for visit..." class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white"></textarea>
                    </div>

                    <button type="submit" data-action="submit-booking-form" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        Book Appointment
                    </button>
                </form>
            </div>
        `;
    },

    /**
     * Render appointments list for patient
     */
    renderPatientAppointments(containerId, appointments = [], doctors = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-12 text-center">
                    <span class="material-symbols-outlined text-5xl text-slate-300 block mb-4">calendar_month</span>
                    <p class="text-slate-500 dark:text-slate-400">No appointments scheduled</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-4">
                ${appointments.map(apt => {
                    const doctor = doctors[apt.doctor_id] || {};
                    const aptDate = new Date(apt.date);
                    const isUpcoming = aptDate > new Date();
                    const statusClass = apt.status === 'confirmed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : apt.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';

                    return `
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h4 class="text-lg font-semibold text-slate-900 dark:text-white">
                                        Dr. ${doctor.name || 'Unknown'}
                                    </h4>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        ${doctor.specialty || 'General Practice'}
                                    </p>
                                    <div class="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                                            ${aptDate.toLocaleDateString()}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-[18px]">schedule</span>
                                            ${apt.time}
                                        </span>
                                    </div>
                                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        <strong>Reason:</strong> ${apt.reason}
                                    </p>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                                        ${apt.status.toUpperCase()}
                                    </span>
                                    ${isUpcoming && apt.status !== 'cancelled' ? `
                                        <button type="button" data-action="cancel-appointment" data-id="${apt.id}" class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                            Cancel
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render appointments list for doctor
     */
    renderDoctorAppointments(containerId, appointments = [], patients = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-12 text-center">
                    <span class="material-symbols-outlined text-5xl text-slate-300 block mb-4">event</span>
                    <p class="text-slate-500 dark:text-slate-400">No appointments scheduled</p>
                </div>
            `;
            return;
        }

        // Separate upcoming and past appointments
        const now = new Date();
        const upcoming = appointments.filter(apt => new Date(apt.date) > now).sort((a, b) => new Date(a.date) - new Date(b.date));
        const past = appointments.filter(apt => new Date(apt.date) <= now);

        let html = '';

        if (upcoming.length > 0) {
            html += `
                <div class="mb-8">
                    <h4 class="font-semibold text-slate-900 dark:text-white mb-4">Upcoming Appointments</h4>
                    <div class="space-y-3">
                        ${upcoming.map(apt => appointmentsModule.renderDoctorAppointmentCard(apt, patients)).join('')}
                    </div>
                </div>
            `;
        }

        if (past.length > 0) {
            html += `
                <div>
                    <h4 class="font-semibold text-slate-900 dark:text-white mb-4">Past Appointments</h4>
                    <div class="space-y-3">
                        ${past.map(apt => appointmentsModule.renderDoctorAppointmentCard(apt, patients)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Helper: Render single appointment card for doctor view
     */
    renderDoctorAppointmentCard(appointment, patients = {}) {
        const patient = patients[appointment.patient_id] || {};
        const aptDate = new Date(appointment.date);
        const statusClass = appointment.status === 'confirmed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : appointment.status === 'completed'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            : appointment.status === 'cancelled'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';

        return `
            <div class="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h5 class="font-semibold text-slate-900 dark:text-white">
                            ${patient.name || 'Unknown Patient'}
                        </h5>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ${aptDate.toLocaleDateString()} at ${appointment.time}
                        </p>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            <strong>Reason:</strong> ${appointment.reason}
                        </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <span class="px-3 py-1 rounded full text-xs font-semibold ${statusClass}">
                            ${appointment.status.toUpperCase()}
                        </span>
                        ${appointment.status === 'pending' ? `
                            <div class="flex gap-2">
                                <button type="button" data-action="confirm-appointment" data-id="${appointment.id}" class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                                    Confirm
                                </button>
                                <button type="button" data-action="reject-appointment" data-id="${appointment.id}" class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                                    Reject
                                </button>
                            </div>
                        ` : appointment.status === 'confirmed' ? `
                            <button type="button" data-action="complete-appointment" data-id="${appointment.id}" class="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors">
                                Mark Complete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render appointments table for admin
     */
    renderAdminAppointments(containerId, appointments = [], doctors = {}, patients = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <p class="text-slate-500 dark:text-slate-400 text-center py-8">No appointments found</p>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Patient</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Doctor</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Date</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Time</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointments.map(apt => {
                            const patient = patients[apt.patient_id] || {};
                            const doctor = doctors[apt.doctor_id] || {};
                            const aptDate = new Date(apt.date);

                            const statusClass = apt.status === 'confirmed'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';

                            return `
                                <tr class="border-b border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td class="px-4 py-4 text-slate-900 dark:text-white">${patient.name || 'Unknown'}</td>
                                    <td class="px-4 py-4 text-slate-900 dark:text-white">${doctor.name || 'Unknown'}</td>
                                    <td class="px-4 py-4 text-slate-600 dark:text-slate-400">${aptDate.toLocaleDateString()}</td>
                                    <td class="px-4 py-4 text-slate-600 dark:text-slate-400">${apt.time}</td>
                                    <td class="px-4 py-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                                            ${apt.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};
