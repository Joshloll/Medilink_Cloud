// Patients Module - Doctor Patients Rendering
export function renderDoctorPatients(container, state) {
    const filteredPatients = getFilteredPatients(state.patients, state.filters.patients);
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Patients</h1>
                <div class="flex gap-2">
                    <button data-action="refresh-data" class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                        <span class="material-symbols-outlined mr-2">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>
            
            <!-- Search and Filter -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                <div class="flex gap-4">
                    <div class="flex-1 relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span class="material-symbols-outlined text-slate-400">search</span>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            data-filter="patients"
                            class="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            value="${state.filters.patients || ''}"
                        >
                    </div>
                </div>
            </div>
            
            <!-- Patients Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${filteredPatients.length > 0 ? filteredPatients.map(patient => renderPatientCard(patient)).join('') : renderEmptyState()}
            </div>
        </div>
    `;
}

function renderPatientCard(patient) {
    return `
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">person</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-900 dark:text-white truncate">${patient.name}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">ID: ${patient.id}</p>
                    <div class="mt-2 space-y-1">
                        <p class="text-sm text-slate-600 dark:text-slate-400">
                            <span class="material-symbols-outlined text-[16px] align-middle">email</span>
                            ${patient.email}
                        </p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">
                            <span class="material-symbols-outlined text-[16px] align-middle">phone</span>
                            ${patient.phone}
                        </p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">
                            <span class="material-symbols-outlined text-[16px] align-middle">cake</span>
                            Age ${patient.age} (${patient.bloodType})
                        </p>
                    </div>
                    
                    <!-- Conditions and Medications -->
                    ${patient.conditions && patient.conditions.length > 0 ? `
                        <div class="mt-3">
                            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conditions:</p>
                            <div class="flex flex-wrap gap-1">
                                ${patient.conditions.slice(0, 2).map(condition => 
                                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">${condition}</span>`
                                ).join('')}
                                ${patient.conditions.length > 2 ? `<span class="text-xs text-slate-500">+${patient.conditions.length - 2} more</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${patient.medications && patient.medications.length > 0 ? `
                        <div class="mt-2">
                            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Medications:</p>
                            <div class="flex flex-wrap gap-1">
                                ${patient.medications.slice(0, 2).map(medication => 
                                    `<span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">${medication}</span>`
                                ).join('')}
                                ${patient.medications.length > 2 ? `<span class="text-xs text-slate-500">+${patient.medications.length - 2} more</span>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Last Visit -->
                    <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                            Last visit: ${new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="mt-4 flex gap-2">
                        <button 
                            data-action="view-patient" 
                            data-id="${patient.id}"
                            class="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-blue-600"
                        >
                            View Details
                        </button>
                        <button 
                            data-action="add-patient-note" 
                            data-id="${patient.id}"
                            class="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            <span class="material-symbols-outlined text-[18px]">note_add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="col-span-full text-center py-12">
            <span class="material-symbols-outlined text-6xl text-slate-300">group</span>
            <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-400 mt-4">No patients found</h3>
            <p class="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search criteria</p>
        </div>
    `;
}

function getFilteredPatients(patients, filter) {
    if (!filter) return patients;
    
    const searchTerm = filter.toLowerCase();
    return patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm)
    );
}

// Patient-specific actions
export function viewPatient(patientId) {
    console.log('Viewing patient:', patientId);
    // This would show a detailed patient view
}

export async function addPatientNote(patientId, note) {
    try {
        // This would call the store method
        console.log('Adding note to patient:', patientId, note);
        return { success: true };
    } catch (error) {
        console.error('Error adding patient note:', error);
        return { success: false, error: error.message };
    }
}

export function createPrescription(patientId, data) {
    console.log('Creating prescription for patient:', patientId, data);
    // This would open the prescription modal
}
