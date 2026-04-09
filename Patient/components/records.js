/**
 * Records Component
 * Renders and manages medical records
 */

/**
 * Render records page
 */
async function renderRecords() {
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Show loading state
  pageContent.innerHTML = '<div class="flex items-center justify-center h-64"><div class="spinner size-8"></div></div>';

  try {
    // Fetch records data
    const records = await apiService.fetchRecords();
    
    // Update state
    stateManager.setState({ records });

    // Render records page
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
          <!-- Header Section -->
          ${renderRecordsHeader()}
          
          <!-- Quick Stats -->
          ${renderRecordsStats()}
          
          <!-- Filter Tabs -->
          ${renderRecordFilters()}
          
          <!-- Records List -->
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th class="px-6 py-3 text-left">Date</th>
                    <th class="px-6 py-3 text-left">Type</th>
                    <th class="px-6 py-3 text-left">Doctor</th>
                    <th class="px-6 py-3 text-left">Description</th>
                    <th class="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700" id="records-table-body">
                  ${renderRecordsList(records)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up event listeners
    setupRecordsEventListeners();

  } catch (error) {
    console.error('Error loading records:', error);
    pageContent.innerHTML = `
      <div class="p-4 sm:p-6 lg:p-10">
        <div class="text-center text-red-500">
          <p>Error loading records. Please try again.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render records header
 */
function renderRecordsHeader() {
  const totalRecords = stateManager.getState().records.length;
  
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Medical Records</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base">View your medical history and test results.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button onclick="handleDownloadAll()" class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined text-[20px]">download</span>
          <span>Download All</span>
        </button>
        <button class="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined text-[20px]">share</span>
          <span>Share</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render records statistics
 */
function renderRecordsStats() {
  const records = stateManager.getState().records;
  
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Records</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${records.length}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">+${records.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length} this month</p>
        </div>
        <div class="size-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <span class="material-symbols-outlined">folder</span>
        </div>
      </div>
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Lab Results</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${records.filter(r => r.recordType === 'Lab Results').length}</p>
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">${records.filter(r => r.status === 'pending').length} pending review</p>
        </div>
        <div class="size-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center">
          <span class="material-symbols-outlined">science</span>
        </div>
      </div>
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Imaging Reports</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${records.filter(r => r.recordType === 'Imaging').length}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${records.filter(r => new Date(r.date).getWeek() === new Date().getWeek()).length} this week</p>
        </div>
        <div class="size-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center">
          <span class="material-symbols-outlined">image</span>
        </div>
      </div>
      <div class="card p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Prescriptions</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${records.filter(r => r.recordType === 'Prescription').length}</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">${records.filter(r => r.status === 'active').length} active</p>
        </div>
        <div class="size-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center">
          <span class="material-symbols-outlined">medication</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render record filters
 */
function renderRecordFilters() {
  const currentFilter = stateManager.getState().currentRecordFilter || 'all';
  const records = stateManager.getState().records;
  
  return `
    <div class="card p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button onclick="setRecordFilter('all')" class="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium">All Records</button>
        <button onclick="setRecordFilter('Lab Results')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Lab Results</button>
        <button onclick="setRecordFilter('Imaging')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Imaging</button>
        <button onclick="setRecordFilter('Prescriptions')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Prescriptions</button>
        <button onclick="setRecordFilter('Clinical Notes')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Clinical Notes</button>
      </div>
    </div>
  `;
}

/**
 * Render records list
 */
function renderRecordsList(records) {
  const currentFilter = stateManager.getState().currentRecordFilter || 'all';
  
  let filteredRecords = records;
  
  // Apply filter
  if (currentFilter !== 'all') {
    filteredRecords = records.filter(record => record.recordType === currentFilter);
  }
  
  if (filteredRecords.length === 0) {
    return `
      <tr>
        <td colspan="6" class="p-8 text-center">
          <div class="flex flex-col items-center gap-4">
            <span class="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">No Records Found</h3>
              <p class="text-slate-500 dark:text-slate-400">No medical records have been added yet</p>
            </div>
            <button class="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-all">
              Request Records
            </button>
          </div>
        </td>
      </tr>
    `;
  }
  
  return filteredRecords.map(record => renderRecordRow(record)).join('');
}

/**
 * Render individual record row
 */
function renderRecordRow(record) {
  const typeColors = {
    'Lab Results': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    'Imaging': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
    'Prescription': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
    'Clinical Notes': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300'
  };

  const statusColors = {
    'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'available': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  };

  return `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
      <td class="px-6 py-4">
        <div class="text-sm">
          <p class="font-semibold text-slate-900 dark:text-white">${formatDate(record.date)}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${record.time}</p>
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] ${typeColors[record.recordType].split(' ')[0]}">${getRecordIcon(record.recordType)}</span>
          <span class="text-sm text-slate-900 dark:text-white">${record.recordType}</span>
        </div>
      </td>
      <td class="px-6 py-4">
        <p class="text-sm text-slate-900 dark:text-white">Dr. ${record.doctorName}</p>
      </td>
      <td class="px-6 py-4">
        <p class="text-sm text-slate-900 dark:text-white">${record.description}</p>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <button onclick="handleViewRecord('${record.id}')" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 transform hover:scale-110">
            <span class="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <button onclick="handleDownloadRecord('${record.id}')" class="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-300 transform hover:scale-110">
            <span class="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Get record icon
 */
function getRecordIcon(recordType) {
  const icons = {
    'Lab Results': 'science',
    'Imaging': 'image',
    'Prescription': 'medication',
    'Clinical Notes': 'description'
  };
  return icons[recordType] || 'description';
}

/**
 * Filter records by type
 */
function setRecordFilter(filter) {
  stateManager.updateProperty('currentRecordFilter', filter);
  renderRecordsList();
}

/**
 * Handle view record details
 */
function handleViewRecord(recordId) {
  const record = stateManager.getState().records.find(r => r.id === recordId);
  if (record) {
    alert(`Record Details:\n\nType: ${record.recordType}\nDate: ${formatDate(record.date)} at ${record.time}\nDoctor: Dr. ${record.doctorName}\nDescription: ${record.description}\nStatus: ${record.status}`);
  }
}

/**
 * Handle download record
 */
function handleDownloadRecord(recordId) {
  const record = stateManager.getState().records.find(r => r.id === recordId);
  if (record) {
    showInfo(`Downloading ${record.recordType}...`);
    
    // Simulate download
    setTimeout(() => {
      showSuccess(`${record.recordType} downloaded successfully!`);
    }, 1000);
  }
}

/**
 * Handle download all records
 */
function handleDownloadAll() {
  const records = stateManager.getState().records;
  if (records.length === 0) {
    showWarning('No records to download');
    return;
  }
  
  showInfo('Downloading all records...');
  
  // Simulate download
  setTimeout(() => {
    showSuccess('All records downloaded successfully!');
  }, 1000);
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderRecords };
}
