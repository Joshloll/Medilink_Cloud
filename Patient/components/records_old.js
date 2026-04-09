/**
 * Medical Records Component
 * Renders and manages medical records page
 */

let recordsData = [];
let currentRecordsFilter = 'all';

/**
 * Render medical records page
 */
async function renderRecords() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch records data
    const records = await apiService.fetchRecords();
    recordsData = records;
    
    // Update state
    stateManager.setState({ records });

    // Calculate statistics
    const stats = calculateRecordsStats(records);

    // Render records page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-8">
          <!-- Header Section -->
          ${renderRecordsHeader()}
          
          <!-- Quick Stats -->
          ${renderRecordsStats(stats)}
          
          <!-- Records Table -->
          ${renderRecordsTable()}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error loading medical records:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading medical records. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Calculate records statistics
 */
function calculateRecordsStats(records) {
  return {
    total: records.length,
    lab: records.filter(r => r.category === 'lab').length,
    imaging: records.filter(r => r.category === 'imaging').length,
    prescriptions: records.filter(r => r.category === 'prescription').length,
    visits: records.filter(r => r.category === 'visit').length
  };
}

/**
 * Render records header
 */
function renderRecordsHeader() {
  return `
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black tracking-tight">Medical Records</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">Access your complete medical history and test results</p>
      </div>
      <button onclick="handleDownloadAllRecords()" 
              class="btn btn-primary flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary/25">
        <span class="material-symbols-outlined">download</span>
        <span class="text-sm font-bold">Download All Records</span>
      </button>
    </div>
  `;
}

/**
 * Render records statistics cards
 */
function renderRecordsStats(stats) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-blue-500 text-[24px]">folder</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.total}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Records</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-green-500 text-[24px]">science</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.lab}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Lab Results</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-purple-500 text-[24px]">image</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.imaging}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Imaging</p>
      </div>
      
      <div class="card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="material-symbols-outlined text-orange-500 text-[24px]">medication</span>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">${stats.prescriptions + stats.visits}</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Prescriptions & Visits</p>
      </div>
    </div>
  `;
}

/**
 * Render records table
 */
function renderRecordsTable() {
  const filteredRecords = getFilteredRecords();
  
  return `
    <div class="card overflow-hidden">
      <div class="p-6 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Records</h3>
          <div class="flex items-center gap-2">
            <select onchange="handleRecordsFilterChange(this.value)" 
                    class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300">
              <option value="all">All Records</option>
              <option value="visit">Visit Summary</option>
              <option value="lab">Lab Results</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescriptions</option>
            </select>
            <button onclick="handleRefreshRecords()" 
                    class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-[1.05]">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-slate-100 dark:border-slate-700">
              <th class="p-4 pl-6">Date</th>
              <th class="p-4">Type</th>
              <th class="p-4">Description</th>
              <th class="p-4">Doctor / Facility</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            ${filteredRecords.length > 0 
              ? filteredRecords.map(record => renderRecordsRow(record)).join('') 
              : renderNoRecordsRow()}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Get filtered records based on current filter
 */
function getFilteredRecords() {
  if (currentRecordsFilter === 'all') {
    return recordsData;
  }
  return recordsData.filter(record => record.category === currentRecordsFilter);
}

/**
 * Render individual records table row
 */
function renderRecordsRow(record) {
  return `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
      <td class="p-4 pl-6 text-slate-600 dark:text-slate-300">${formatDate(record.date)}</td>
      <td class="p-4">
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getRecordTypeClass(record.category)}">
          <span class="material-symbols-outlined text-[14px]">${getRecordIcon(record.category)}</span>
          ${record.type}
        </span>
      </td>
      <td class="p-4 text-slate-900 dark:text-white font-medium">${record.description}</td>
      <td class="p-4 text-slate-600 dark:text-slate-300">${record.doctor}</td>
      <td class="p-4">
        <span class="${getRecordStatusClass(record.status)}">
          ${getRecordStatusIcon(record.status)}
          ${getRecordStatusLabel(record.status)}
        </span>
      </td>
      <td class="p-4 text-right pr-6">
        <button onclick="handleRecordAction('${record.id}', '${record.status}')" 
                class="text-slate-400 hover:text-primary transition-all duration-300 transform hover:scale-110">
          <span class="material-symbols-outlined">${record.status === 'available' ? 'download' : 'visibility'}</span>
        </button>
      </td>
    </tr>
  `;
}

/**
 * Render no records row
 */
function renderNoRecordsRow() {
  return `
    <tr>
      <td colspan="6" class="p-8 text-center">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Records Found</h3>
            <p class="text-slate-500 dark:text-slate-400">
              ${currentRecordsFilter === 'all' ? 'No medical records available' : `No ${currentRecordsFilter} records found`}
            </p>
          </div>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Get record type class
 */
function getRecordTypeClass(category) {
  const classes = {
    visit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    lab: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    imaging: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    prescription: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  };
  return classes[category] || classes.visit;
}

/**
 * Get record icon
 */
function getRecordIcon(category) {
  const icons = {
    visit: 'description',
    lab: 'science',
    imaging: 'image',
    prescription: 'medication'
  };
  return icons[category] || 'folder';
}

/**
 * Get record status class
 */
function getRecordStatusClass(status) {
  const classes = {
    available: 'status-available',
    processing: 'status-pending',
    pending: 'status-pending'
  };
  return classes[status] || 'status-pending';
}

/**
 * Get record status icon
 */
function getRecordStatusIcon(status) {
  const icons = {
    available: '<span class="size-1.5 rounded-full bg-current"></span>',
    processing: '<span class="material-symbols-outlined text-[14px]">hourglass_empty</span>',
    pending: '<span class="material-symbols-outlined text-[14px]">schedule</span>'
  };
  return icons[status] || icons.pending;
}

/**
 * Get record status label
 */
function getRecordStatusLabel(status) {
  const labels = {
    available: 'Available',
    processing: 'Processing',
    pending: 'Pending Review'
  };
  return labels[status] || 'Pending';
}

/**
 * Handle records filter change
 */
function handleRecordsFilterChange(filter) {
  currentRecordsFilter = filter;
  
  // Re-render records table
  const recordsTable = document.querySelector('.card.overflow-hidden');
  if (recordsTable) {
    recordsTable.outerHTML = renderRecordsTable();
  }
}

/**
 * Handle refresh records
 */
async function handleRefreshRecords() {
  try {
    // Show loading state
    const tableBody = document.querySelector('tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center"><div class="spinner size-8 mx-auto"></div></td></tr>';
    }

    // Fetch fresh data
    const records = await apiService.fetchRecords();
    recordsData = records;
    stateManager.setState({ records });

    // Re-render table
    const recordsTable = document.querySelector('.card.overflow-hidden');
    if (recordsTable) {
      recordsTable.outerHTML = renderRecordsTable();
    }
    
  } catch (error) {
    console.error('Error refreshing records:', error);
    alert('Error refreshing records. Please try again.');
  }
}

/**
 * Handle record action (download/view)
 */
async function handleRecordAction(recordId, status) {
  try {
    if (status === 'available') {
      // Download record
      const result = await apiService.downloadRecords([recordId]);
      alert(`Download started: ${result.filename}`);
      // In a real app, this would trigger actual download
    } else {
      // View record details
      alert(`View Record: This would show details for record ${recordId}`);
      // In a real app, this would show record details modal
    }
  } catch (error) {
    console.error('Error handling record action:', error);
    alert('Error processing record. Please try again.');
  }
}

/**
 * Handle download all records
 */
async function handleDownloadAllRecords() {
  if (!confirm('This will download all your medical records. Continue?')) {
    return;
  }

  try {
    const recordIds = recordsData.map(record => record.id);
    const result = await apiService.downloadRecords(recordIds);
    alert(`Download started: ${result.filename}`);
    // In a real app, this would trigger actual download
  } catch (error) {
    console.error('Error downloading records:', error);
    alert('Error downloading records. Please try again.');
  }
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
  module.exports = { renderRecords };
}
