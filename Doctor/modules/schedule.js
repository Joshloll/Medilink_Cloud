// Schedule Module - Doctor Schedule Rendering
export function renderSchedule(container, state) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Schedule Header -->
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Schedule</h1>
                <div class="flex gap-2">
                    <button data-action="create-appointment" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                        <span class="material-symbols-outlined mr-2">add</span>
                        New Appointment
                    </button>
                    <button data-action="refresh-data" class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                        <span class="material-symbols-outlined mr-2">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>
            
            <!-- View Toggle -->
            <div class="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg">
                <button data-view="day" class="view-btn flex-1 px-4 py-2 rounded-md bg-primary text-white">Day</button>
                <button data-view="week" class="view-btn flex-1 px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Week</button>
                <button data-view="month" class="view-btn flex-1 px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">Month</button>
            </div>
            
            <!-- Calendar View -->
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                ${renderCalendarView(state.schedule, state.appointments)}
            </div>
        </div>
    `;
    
    // Setup view toggle listeners
    setupViewToggle();
}

function renderCalendarView(schedule, appointments) {
    const today = new Date();
    const currentWeek = schedule.slice(0, 7);
    
    return `
        <div class="p-6">
            <!-- Date Navigation -->
            <div class="flex justify-between items-center mb-6">
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 class="text-lg font-semibold">
                    ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            
            <!-- Week View -->
            <div class="grid grid-cols-8 gap-2">
                <!-- Time Column -->
                <div class="text-sm font-medium text-slate-600 dark:text-slate-400">Time</div>
                ${currentWeek.map(day => `
                    <div class="text-center">
                        <div class="text-sm font-medium">${day.dayName.slice(0, 3)}</div>
                        <div class="text-xs text-slate-600 dark:text-slate-400">${new Date(day.date).getDate()}</div>
                    </div>
                `).join('')}
                
                <!-- Time Slots -->
                ${generateTimeSlots(currentWeek, appointments)}
            </div>
        </div>
    `;
}

function generateTimeSlots(schedule, appointments) {
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    return timeSlots.map(time => `
        <div class="text-sm text-slate-600 dark:text-slate-400 py-4">${time}</div>
        ${schedule.map(day => {
            const slot = day.slots.find(s => s.time === time);
            const appointment = slot && !slot.available 
                ? appointments.find(apt => apt.id === slot.appointmentId) 
                : null;
            
            return `
                <div class="border border-slate-200 dark:border-slate-700 rounded p-2 min-h-[60px] ${!slot?.available ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}">
                    ${appointment ? renderAppointmentSlot(appointment) : renderEmptySlot(day.date, time)}
                </div>
            `;
        }).join('')}
    `).join('');
}

function renderAppointmentSlot(appointment) {
    return `
        <div class="h-full">
            <div class="text-xs font-medium text-blue-800 dark:text-blue-200">${appointment.patientName}</div>
            <div class="text-xs text-slate-600 dark:text-slate-400">${appointment.type}</div>
            <div class="flex gap-1 mt-1">
                <button data-action="update-appointment-status" data-id="${appointment.id}" data-status="checked_in" 
                    class="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                    Check In
                </button>
                <button data-action="update-appointment-status" data-id="${appointment.id}" data-status="completed" 
                    class="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Complete
                </button>
            </div>
        </div>
    `;
}

function renderEmptySlot(date, time) {
    return `
        <button data-action="create-appointment" data-date="${date}" data-time="${time}" 
            class="w-full h-full text-xs text-slate-400 hover:text-primary hover:bg-primary/50 rounded transition-colors">
            <span class="material-symbols-outlined text-lg">add</span>
        </button>
    `;
}

function setupViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active state from all buttons
            document.querySelectorAll('.view-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-700');
            });
            
            // Add active state to clicked button
            e.target.classList.add('bg-primary', 'text-white');
            e.target.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-700');
            
            // Here you would switch the view based on the selected view
            const view = e.target.dataset.view;
            console.log('Switching to view:', view);
        });
    });
}

// Schedule-specific actions
export async function addScheduleSlot(data) {
    try {
        // This would be implemented in the store
        console.log('Adding schedule slot:', data);
        return { success: true };
    } catch (error) {
        console.error('Error adding schedule slot:', error);
        return { success: false, error: error.message };
    }
}

export async function updateAppointmentStatus(id, status) {
    try {
        // This would call the store method
        console.log('Updating appointment status:', id, status);
        return { success: true };
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, error: error.message };
    }
}
