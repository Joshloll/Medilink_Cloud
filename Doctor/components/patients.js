/**
 * Patients Component
 * Renders and manages patient database and records
 */

/**
 * Render patients page
 */
async function renderPatients() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch patients data
    const patients = await apiService.fetchPatients();
    
    // Update state
    stateManager.setState({ patients });

    // Render patients page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex flex-col gap-6">
          <!-- Header Section -->
          ${renderPatientsHeader()}
          
          <!-- Quick Stats -->
          ${renderPatientsStats()}
          
          <!-- Filters and Search -->
          ${renderFilters()}
          
          <!-- Patients List -->
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th class="px-6 py-3 text-left">Patient</th>
                    <th class="px-6 py-3 text-left">Contact</th>
                    <th class="px-6 py-3 text-left">Last Visit</th>
                    <th class="px-6 py-3 text-left">Status</th>
                    <th class="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700" id="patients-table-body">
                  ${renderPatientsList(patients)}
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p class="text-sm text-slate-500 dark:text-slate-400" id="pagination-info">Showing <span id="pagination-start">0</span>-<span id="pagination-end">0</span> of <span id="pagination-total">0</span> patients</p>
              <div class="flex items-center gap-2">
                <button id="pagination-prev" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <div id="pagination-numbers" class="flex items-center gap-2">
                  <button class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">1</button>
                  <button class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">2</button>
                  <button class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">3</button>
                </div>
                <button id="pagination-next" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupPatientsEventListeners();

  } catch (error) {
    console.error('Error loading patients:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading patients. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render patients header
 */
function renderPatientsHeader() {
  const totalPatients = stateManager.getState().patients.length;
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Patients</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Manage your patient database and medical records.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button onclick="handleNewPatient()" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20">
          <span class="material-slate-outlined text-[20px]">person_add</span>
          <span>Add New Patient</span>
        </button>
        <button class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="material-slate-outlined text-[20px]">download</span>
          <span>Export List</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render patients statistics
 */
function renderPatientsStats() {
  const patients = stateManager.getState().patients;
  
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Patients</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${patients.length}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">+${patients.filter(p => p.status === 'active').length} active</p>
        </div>
        <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <span class="material-symbols-outlined">group</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Patients</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${patients.filter(p => p.status === 'active').length}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${Math.round((patients.filter(p => p.status === 'active').length / patients.length * 100)}%} of total</p>
        </div>
        <div class="size-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center">
          <span class="material-symbols-outlined">person_check</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">New This Month</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${patients.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length}</p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">+${patients.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length - (patients.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth() - 1).length} vs last month</p>
        </div>
        <div class="size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
          <span class="material-symbols-outlined">trending_up</span>
        </div>
      </div>
      <div class="card p-5 flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Critical Cases</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${patients.filter(p => p.status === 'critical').length}</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-1">Requires attention</p>
        </div>
        <div class="size-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <span class="material-symbols-outlined">priority_high</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render filters
 */
function renderFilters() {
  const currentFilter = stateManager.getState().currentPatientFilter || 'all';
  
  return `
    <div class="card p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by:</span>
          <div class="flex flex-wrap gap-2">
            <button onclick="setPatientFilter('all')" class="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium">All Patients</button>
            <button onclick="setPatientFilter('active')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Active</button>
            <button onclick="setPatientFilter('inactive')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Inactive</button>
            <button onclick="setPatientFilter('critical')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Critical</button>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <span class="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
          <select class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
            <option value="last-visit">Last Visit</option>
            <option value="name">Name</option>
            <option value="date-added">Date Added</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render patients list
 */
function renderPatientsList(patients) {
  const currentFilter = stateManager.getState().currentPatientFilter || 'all';
  
  let filteredPatients = patients;
  
  // Apply filter
  if (currentFilter !== 'all') {
    filteredPatients = patients.filter(patient => patient.status === currentFilter);
  }
  
  if (filteredPatients.length === 0) {
    return `
      <tr>
        <td colspan="5" class="p-8 text-center">
          <div class="flex flex-col items-center gap-4">
            <span class="material-symbols-outlined text-4xl text-slate-300">group_off</span>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Patients Found</h3>
              <p class="text-slate-500 dark:text-slate-400">No patients have been added yet</p>
            </div>
            <button class="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-all">
              Add Your First Patient
            </button>
          </div>
        </td>
      </tr>
    `;
  }
  
  return filteredPatients.map(patient => renderPatientRow(patient)).join('');
}

/**
 * Render individual patient row
 */
function renderPatientRow(patient) {
  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };

  const statusIcons = {
    active: 'check_circle',
    inactive: 'person_off',
    critical: 'priority_high'
  };

  return `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-${statusColors[patient.status].split(' ')[0]} dark:${statusColors[patient.status].replace('text-', 'dark:bg-')} text-${statusColors[patient.status].replace('text-', 'dark:text-300')} flex items-center justify-center">
            <span class="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div>
            <p class="font-semibold text-slate-900 dark:text-white">${patient.firstName} ${patient.lastName}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">ID: ${patient.id}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="text-sm">
          <p class="text-slate-900 dark:text-white">${patient.email}</p>
          <p class="text-slate-500 dark:text-slate-400">${patient.phone}</p>
        </div>
      </td>
      <td class="px-6 py-4">
        <p class="text-sm text-slate-900 dark:text-white">${formatDate(patient.lastVisit)}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Last visit: ${getDaysSince(patient.lastVisit)}</p>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[patient.status]}">
          <span class="${statusIcons[patient.status]}"></span>
          ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
        </span>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <button onclick="handleViewPatient('${patient.id}')" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 transform hover:scale-110">
            <span class="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <button onclick="handleEditPatient('${patient.id}')" class="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-300 transform hover:scale-110">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button onclick="handleScheduleAppointment('${patient.id}')" class="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-300 transform hover:scale-110">
            <span class="material-symbols-outlined text-[20px]">calendar_month</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Get days since last visit
 */
function getDaysSince(lastVisit) {
  if (!lastVisit) return 'Never';
  const today = new Date();
  const lastVisitDate = new Date(lastVisit);
  const diffTime = today - lastVisitDate;
  const days = Math.floor(diffTime / (1000 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

/**
 * Handle view patient details
 */
function handleViewPatient(patientId) {
  const patient = stateManager.getState().patients.find(p => p.id === patientId);
  if (patient) {
    showPatientDetails(patient);
  }
}

/**
 * Handle edit patient
 */
function handleEditPatient(patientId) {
  const patient = stateManager.getState().patients.find(p => p.id === patientId);
  if (patient) {
    showEditPatientModal(patient);
  }
}

/**
 * Handle schedule appointment
 */
function handleScheduleAppointment(patientId) {
  const patient = stateManager.getState().patients.find(p => p.id === patientId);
  if (patient) {
    showScheduleModal(patient);
  }
}

/**
 * Show patient details modal
 */
function showPatientDetails(patient) {
  // In a real app, this would open a modal with patient details
  alert(`Patient Details:\n\nName: ${patient.firstName} ${patient.lastName}\nEmail: ${patient.email}\nPhone: ${patient.phone}\nLast Visit: ${formatDate(patient.lastVisit)}\nStatus: ${patient.status}`);
}

/**
 * Show edit patient modal
 */
function showEditPatientModal(patient) {
  // In a real app, this would open an edit modal
  const updatedData = {
    firstName: prompt('First Name:', patient.firstName),
    lastName: prompt('Last Name:', patient.lastName),
    email: prompt('Email:', patient.email),
    phone: prompt('Phone:', patient.phone),
    address: prompt('Address:', patient.address)
  };
  
  if (updatedData.firstName && updatedData.lastName) {
    apiService.updatePatient(patient.id, updatedData);
    stateManager.updateInArray('patients', patient.id, updatedData);
    showSuccess('Patient updated successfully!');
    renderPatients();
  }
}

/**
 * Show schedule modal
 */
function showScheduleModal(patient) {
  // In a real app, this would open a scheduling modal
  alert(`Schedule Appointment for ${patient.firstName} ${patient.lastName}`);
}

/**
 * Filter patients by status
 */
function setPatientFilter(filter) {
  stateManager.updateProperty('currentPatientFilter', filter);
  renderPatientsList();
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPatients };
}
