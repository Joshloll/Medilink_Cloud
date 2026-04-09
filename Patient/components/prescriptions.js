/**
 * Prescriptions Component
 * Renders and manages patient prescriptions
 */

/**
 * Render prescriptions page
 */
async function renderPrescriptions() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch prescriptions data
    const prescriptions = await apiService.fetchPrescriptions();
    
    // Update state
    stateManager.setState({ prescriptions });

    // Render prescriptions page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
          <!-- Header Section -->
          ${renderPrescriptionsHeader()}
          
          <!-- Quick Stats -->
          ${renderPrescriptionsStats()}
          
          <!-- Filter Tabs -->
          ${renderPrescriptionFilters()}
          
          <!-- Prescriptions List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="prescriptions-list">
            ${renderPrescriptionsList(prescriptions)}
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupPrescriptionsEventListeners();

  } catch (error) {
    console.error('Error loading prescriptions:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading prescriptions. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render prescriptions header
 */
function renderPrescriptionsHeader() {
  const totalPrescriptions = stateManager.getState().prescriptions.length;
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Prescriptions</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">View your current and past prescriptions.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button onclick="handleRequestRefill()" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm shadow-blue-500/20">
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Request Refill</span>
        </button>
        <button class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined text-[20px]">history</span>
          <span>History</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render prescriptions statistics
 */
function renderPrescriptionsStats() {
  const prescriptions = stateManager.getState().prescriptions;
  
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Prescriptions</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${prescriptions.filter(p => p.status === 'active').length}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">${prescriptions.filter(p => p.status === 'active').length} refills available</p>
        </div>
        <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <span class="material-symbols-outlined">medication</span>
        </div>
      </div>
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Expired Prescriptions</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${prescriptions.filter(p => p.status === 'expired').length}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Need renewal</p>
        </div>
        <div class="size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
          <span class="material-symbols-outlined">warning</span>
        </div>
      </div>
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Prescriptions</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${prescriptions.length}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
        </div>
        <div class="size-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center">
          <span class="material-symbols-outlined">pharmacy</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render prescription filters
 */
function renderPrescriptionFilters() {
  const currentFilter = stateManager.getState().currentPrescriptionFilter || 'all';
  const prescriptions = stateManager.getState().prescriptions;
  
  return `
    <div class="card p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button onclick="setPrescriptionFilter('all')" class="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium">All Prescriptions</button>
        <button onclick="setPrescriptionFilter('active')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Active</button>
        <button onclick="setPrescriptionFilter('expired')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Expired</button>
        <button onclick="setPrescriptionFilter('refill_requested')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Refill Requested</button>
      </div>
    </div>
  `;
}

/**
 * Render prescriptions list
 */
function renderPrescriptionsList(prescriptions) {
  const currentFilter = stateManager.getState().currentPrescriptionFilter || 'all';
  
  let filteredPrescriptions = prescriptions;
  
  // Apply filter
  if (currentFilter !== 'all') {
    filteredPrescriptions = prescriptions.filter(prescription => prescription.status === currentFilter);
  }
  
  if (filteredPrescriptions.length === 0) {
    return `
      <div class="col-span-full">
        <div class="flex flex-col items-center justify-center p-12 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">medication</span>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Prescriptions Found</h3>
            <p class="text-slate-500 dark:text-slate-400">No prescriptions have been added yet</p>
          </div>
          <button onclick="handleRequestRefill()" class="mt-4 btn btn-primary">
            Request Prescription
          </button>
        </div>
      </div>
    `;
  }
  
  return filteredPrescriptions.map(prescription => renderPrescriptionCard(prescription)).join('');
}

/**
 * Render prescription card
 */
function renderPrescriptionCard(prescription) {
  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    refill_requested: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    discontinued: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  };

  const statusIcons = {
    active: 'check_circle',
    expired: 'warning',
    refill_requested: 'schedule',
    discontinued: 'block'
  };

  const refillColors = {
    0: 'border-slate-300 dark:border-slate-600',
    1: 'border-green-500 dark:border-green-400',
    2: 'border-amber-500 dark:border-amber-400',
    3: 'border-red-500 dark:border-red-400'
  };

  return `
    <div class="card p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${statusColors[prescription.status]} flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">${statusIcons[prescription.status]}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">${prescription.medicationName}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Prescribed by Dr. ${prescription.doctorName}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full ${statusColors[prescription.status]} text-xs font-medium">
          ${prescription.status.replace('_', ' ').charAt(0).toUpperCase() + prescription.status.slice(1)}
        </span>
      </div>
      
      <!-- Details -->
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 dark:text-slate-400">Dosage</p>
            <p class="font-semibold text-slate-900 dark:text-white">${prescription.dosage}</p>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400">Frequency</p>
            <p class="font-semibold text-slate-900 dark:text-white">${prescription.frequency}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 dark:text-slate-400">Start Date</p>
            <p class="font-semibold text-slate-900 dark:text-white">${formatDate(prescription.startDate)}</p>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400">End Date</p>
            <p class="font-semibold text-slate-900 dark:text-white">${prescription.endDate || 'Ongoing'}</p>
          </div>
        </div>
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Description</p>
          <p class="text-slate-900 dark:text-white">${prescription.description || 'No description available'}</p>
        </div>
      </div>
      
      <!-- Refills -->
      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">refresh</span>
          <span class="text-sm text-slate-600 dark:text-slate-400">Refills Remaining: ${prescription.refillsRemaining}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="handleRequestRefill('${prescription.id}')" class="btn btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Request Refill
          </button>
          ${prescription.status === 'active' ? `
            <button onclick="handleViewDetails('${prescription.id}')" class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              View Details
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Filter prescriptions by status
 */
function setPrescriptionFilter(filter) {
  stateManager.updateProperty('currentPrescriptionFilter', filter);
  renderPrescriptionsList();
}

/**
 * Handle request refill
 */
function handleRequestRefill(prescriptionId) {
  if (!prescriptionId) {
    // Handle general refill request
    alert('Request Refill feature coming soon!');
    return;
  }

  const prescription = stateManager.getState().prescriptions.find(p => p.id === prescriptionId);
  if (prescription) {
    apiService.requestRefill(prescriptionId);
    stateManager.updateInArray('prescriptions', prescriptionId, {
      status: 'refill_requested',
      refillRequestedAt: new Date().toISOString()
    });
    showSuccess('Refill request submitted successfully!');
    renderPrescriptions();
  }
}

/**
 * Handle view details
 */
function handleViewDetails(prescriptionId) {
  const prescription = stateManager.getState().prescriptions.find(p => p.id === prescriptionId);
  if (prescription) {
    alert(`Prescription Details:\n\nMedication: ${prescription.medicationName}\nDosage: ${prescription.dosage}\nFrequency: ${prescription.frequency}\nStart Date: ${formatDate(prescription.startDate)}\nEnd Date: ${prescription.endDate || 'Ongoing'}\nDoctor: Dr. ${prescription.doctorName}\nDescription: ${prescription.description || 'No description available'}\nStatus: ${prescription.status}\nRefills Remaining: ${prescription.refillsRemaining}`);
  }
}

/**
 * Handle general refill request
 */
function handleRequestRefill() {
  // In a real app, this would open a refill request modal
  alert('Request Refill feature coming soon!');
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPrescriptions };
}
