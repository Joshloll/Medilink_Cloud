// Medical Records Module - Doctor Records Rendering
export function renderDoctorRecords(container, state) {
    const filteredRecords = getFilteredRecords(state.records, state.filters.records);
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Medical Records</h1>
                <div class="flex gap-2">
                    <button data-action="add-record" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                        <span class="material-symbols-outlined mr-2">add</span>
                        Add Record
                    </button>
                    <button data-action="refresh-data" class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                        <span class="material-symbols-outlined mr-2">refresh</span>
                        Refresh
                    </button>
                </div>
            </div>
            
            <!-- Filter Tabs -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                <div class="flex gap-2">
                    ${renderFilterTabs(state.filters.records)}
                </div>
            </div>
            
            <!-- Records List -->
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                ${filteredRecords.length > 0 ? renderRecordsList(filteredRecords) : renderEmptyRecords()}
            </div>
        </div>
    `;
}

function renderFilterTabs(activeFilter) {
    const filters = [
        { key: 'all', label: 'All Records', icon: 'description' },
        { key: 'clinical', label: 'Clinical Notes', icon: 'medical_services' },
        { key: 'lab', label: 'Lab Results', icon: 'science' },
        { key: 'imaging', label: 'Imaging', icon: 'image' },
        { key: 'prescription', label: 'Prescriptions', icon: 'medication' }
    ];
    
    return filters.map(filter => `
        <button 
            data-action="filter-records" 
            data-type="${filter.key}"
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === filter.key 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }"
        >
            <span class="material-symbols-outlined text-[18px]">${filter.icon}</span>
            <span class="text-sm font-medium">${filter.label}</span>
        </button>
    `).join('');
}

function renderRecordsList(records) {
    const groupedRecords = groupRecordsByPatient(records);
    
    return `
        <div class="divide-y divide-slate-200 dark:divide-slate-700">
            ${Object.entries(groupedRecords).map(([patientName, patientRecords]) => `
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-slate-900 dark:text-white">${patientName}</h3>
                        <span class="text-sm text-slate-600 dark:text-slate-400">
                            ${patientRecords.length} record${patientRecords.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div class="space-y-3">
                        ${patientRecords.map(record => renderRecordCard(record)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecordCard(record) {
    return `
        <div class="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
             data-action="view-record" data-id="${record.id}">
            <div class="w-10 h-10 rounded-full bg-${getRecordTypeColor(record.type)}-100 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-${getRecordTypeColor(record.type)}-600">${getRecordTypeIcon(record.type)}</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-medium text-slate-900 dark:text-white">${record.title}</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${record.content}</p>
                        
                        ${record.attachments && record.attachments.length > 0 ? `
                            <div class="flex items-center gap-2 mt-2">
                                <span class="material-symbols-outlined text-[16px] text-slate-400">attach_file</span>
                                <span class="text-xs text-slate-600 dark:text-slate-400">
                                    ${record.attachments.length} attachment${record.attachments.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-600 dark:text-slate-400">
                            ${new Date(record.date).toLocaleDateString()}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            Dr. ${record.doctor?.split(' ')[1] || record.doctor}
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button data-action="edit-record" data-id="${record.id}" 
                    class="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Edit">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button data-action="download-record" data-id="${record.id}" 
                    class="p-2 text-green-600 hover:bg-green-100 rounded" title="Download">
                    <span class="material-symbols-outlined text-[18px]">download</span>
                </button>
            </div>
        </div>
    `;
}

function renderEmptyRecords() {
    return `
        <div class="text-center py-12">
            <span class="material-symbols-outlined text-6xl text-slate-300">description</span>
            <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-400 mt-4">No records found</h3>
            <p class="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your filter criteria</p>
        </div>
    `;
}

function groupRecordsByPatient(records) {
    return records.reduce((groups, record) => {
        const patientName = record.patientName;
        if (!groups[patientName]) {
            groups[patientName] = [];
        }
        groups[patientName].push(record);
        return groups;
    }, {});
}

function getFilteredRecords(records, filter) {
    if (filter === 'all' || !filter) return records;
    return records.filter(record => record.type === filter);
}

function getRecordTypeColor(type) {
    const colors = {
        'clinical': 'blue',
        'lab': 'green',
        'prescription': 'purple',
        'imaging': 'amber'
    };
    return colors[type] || 'slate';
}

function getRecordTypeIcon(type) {
    const icons = {
        'clinical': 'medical_services',
        'lab': 'science',
        'prescription': 'medication',
        'imaging': 'image'
    };
    return icons[type] || 'description';
}

// Records-specific actions
export function viewRecord(recordId) {
    console.log('Viewing record:', recordId);
    // This would show a detailed record view
}

export function filterRecords(type) {
    console.log('Filtering records by type:', type);
    // This would update the filter in the store
}

export async function addMedicalRecord(data) {
    try {
        // This would call the store method
        console.log('Adding medical record:', data);
        return { success: true };
    } catch (error) {
        console.error('Error adding medical record:', error);
        return { success: false, error: error.message };
    }
}

export function editRecord(recordId) {
    console.log('Editing record:', recordId);
    // This would open an edit modal
}

export function downloadRecord(recordId) {
    console.log('Downloading record:', recordId);
    // This would trigger a download
}
