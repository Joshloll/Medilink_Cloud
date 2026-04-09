/**
 * Prescriptions Component
 * Renders and manages prescriptions page
 */

let prescriptionsData = [];

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
    prescriptionsData = prescriptions;
    
    // Update state
    stateManager.setState({ prescriptions });

    // Calculate statistics
    const stats = calculatePrescriptionsStats(prescriptions);

    // Render prescriptions page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <!-- Header Section -->
          ${renderPrescriptionsHeader()}
          
          <!-- Quick Stats -->
          ${renderPrescriptionsStats(stats)}
          
          <!-- Active Prescriptions -->
          ${renderActivePrescriptions()}
        </div>
      </div>
    `;

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
 * Calculate prescriptions statistics
 */
function calculatePrescriptionsStats(prescriptions) {
  return {
    active: prescriptions.filter(p => p.status === 'active').length,
    refillNeeded: prescriptions.filter(p => p.status === 'refill_needed').length,
    completed: prescriptions.filter(p => p.status === 'completed').length,
    pharmacies: [...new Set(prescriptions.map(p => p.pharmacy))].length
  };
}

/**
 * Render prescriptions header
 */
function renderPrescriptionsHeader() {
  return `
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight">Prescriptions</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Manage your medications and request refills</p>
      </div>
      <button onclick="handleRequestRefill()" 
              class="btn btn-primary flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary/25">
        <span class="material-symbols-outlined">add_circle</span>
        <span class="text-sm font-bold">Request Refill</span>
      </button>
    </div>
  `;
}

/**
 * Render prescriptions statistics cards
 */
function renderPrescriptionsStats(stats) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-blue-500 text-[24px]">medication</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.active}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Prescriptions</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-amber-500 text-[24px]">warning</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.refillNeeded}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Refills Needed</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-green-500 text-[24px]">check_circle</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.completed}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-purple-500 text-[24px]">local_pharmacy</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.pharmacies}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pharmacies</p>
      </div>
    </div>
  `;
}

/**
 * Render active prescriptions section
 */
function renderActivePrescriptions() {
  const activePrescriptions = prescriptionsData.filter(p => 
    p.status === 'active' || p.status === 'refill_needed'
  );

  if (activePrescriptions.length === 0) {
    return `
      <div class="flex flex-col gap-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Active Prescriptions</h3>
        <div class="card p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">medication</span>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Active Prescriptions</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-4">You don't have any active prescriptions</p>
          <button onclick="handleRequestRefill()" class="btn btn-primary">
            Request Prescription
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Active Prescriptions</h3>
      <div class="space-y-4">
        ${activePrescriptions.map(prescription => renderPrescriptionCard(prescription)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual prescription card
 */
function renderPrescriptionCard(prescription) {
  const needsRefill = prescription.status === 'refill_needed';
  const statusColor = needsRefill ? 'amber' : 'green';
  const statusIcon = needsRefill ? 'warning' : 'check_circle';
  const statusText = needsRefill ? 'Refill Needed' : 'Active';

  return `
    <div class="card p-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="flex-1">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-1">${prescription.name}</h4>
              <p class="text-slate-500 dark:text-slate-400 font-medium">${prescription.dosage} ${prescription.frequency}</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold 
                       ${needsRefill ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}">
              ${needsRefill ? '<span class="material-symbols-outlined text-[14px]">warning</span>' : '<span class="size-1.5 rounded-full bg-current"></span>'}
              ${statusText}
            </span>
          </div>
          
          <div class="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">person</span>
              <span>${prescription.doctor}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">calendar_today</span>
              <span>Started: ${formatDate(prescription.startDate)}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">local_pharmacy</span>
              <span>${prescription.pharmacy}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between p-4 ${needsRefill ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50 dark:bg-slate-800/50'} rounded-xl mb-4">
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Refills remaining</p>
              <p class="text-lg font-bold text-slate-900 dark:text-white">${prescription.refillsRemaining} of ${prescription.totalRefills}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">${needsRefill ? 'Status' : 'Next refill eligible'}</p>
              <p class="text-lg font-bold ${needsRefill ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}">
                ${needsRefill ? 'Refill Required' : (prescription.nextRefillDate ? formatDate(prescription.nextRefillDate) : 'N/A')}
              </p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button onclick="handleRequestRefillForPrescription('${prescription.id}')" 
                    class="btn btn-primary flex items-center justify-center gap-2 px-5 py-2.5">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
              Request Refill
            </button>
            <button onclick="handlePrescriptionDetails('${prescription.id}')" 
                    class="btn btn-secondary flex items-center justify-center gap-2 px-5 py-2.5">
              <span class="material-symbols-outlined text-[18px]">info</span>
              Details
            </button>
          </div>
        </div>
        
        <!-- Medication Icon -->
        <div class="w-full lg:w-32 h-32 bg-gradient-to-br ${needsRefill ? 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20' : 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'} rounded-xl flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl ${needsRefill ? 'text-amber-500' : 'text-blue-500'}">medication</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle request refill (general)
 */
function handleRequestRefill() {
  alert('Request Refill: This would open a form to request a new prescription or refill');
  // In a real app, this would open a refill request form
}

/**
 * Handle request refill for specific prescription
 */
async function handleRequestRefillForPrescription(prescriptionId) {
  if (!confirm('Are you sure you want to request a refill for this prescription?')) {
    return;
  }

  try {
    await apiService.requestRefill(prescriptionId);
    
    // Update local data
    const prescription = prescriptionsData.find(p => p.id === prescriptionId);
    if (prescription) {
      prescription.status = 'refill_requested';
    }
    
    stateManager.setState({ prescriptions: prescriptionsData });
    
    // Re-render prescriptions
    await renderPrescriptions();
    
    alert('Refill request submitted successfully!');
  } catch (error) {
    console.error('Error requesting refill:', error);
    alert('Error requesting refill. Please try again.');
  }
}

/**
 * Handle prescription details
 */
function handlePrescriptionDetails(prescriptionId) {
  const prescription = prescriptionsData.find(p => p.id === prescriptionId);
  if (prescription) {
    alert(`Prescription Details:\n\nName: ${prescription.name}\nDosage: ${prescription.dosage}\nFrequency: ${prescription.frequency}\nDoctor: ${prescription.doctor}\nPharmacy: ${prescription.pharmacy}\nStarted: ${formatDate(prescription.startDate)}\nRefills: ${prescription.refillsRemaining}/${prescription.totalRefills}`);
  }
  // In a real app, this would show a detailed modal
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPrescriptions };
}
