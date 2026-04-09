/**
 * Navigation Component
 * Renders the side navigation menu dynamically
 */

/**
 * Render navigation menu
 */
function renderNavigation() {
  const navigation = document.getElementById('navigation');
  if (!navigation) return;

  const currentPage = stateManager.getState().currentPage || 'dashboard';
  const user = stateManager.getState().user;

  navigation.innerHTML = `
    <div class="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151f2b] h-full shrink-0">
      <div class="flex h-full flex-col justify-between p-4">
        <div class="flex flex-col gap-4">
          <!-- User Profile Summary in Sidebar -->
          <div class="flex gap-3 items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <div class="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer"
                 data-alt="Portrait of Dr. ${user?.lastName || 'Doctor'}"
                 style='background-image: url("${user?.profileImage || 'https://via.placeholder.com/48'}");'>
            </div>
            <div class="flex flex-col overflow-hidden">
              <h1 class="text-slate-900 dark:text-white text-sm font-semibold truncate">Dr. ${user?.firstName || 'Doctor'} ${user?.lastName || ''}</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs truncate">${user?.specialization || 'General Practitioner'}</p>
            </div>
          </div>
          
          <!-- Navigation -->
          <nav class="flex flex-col gap-1">
            ${renderNavigationItems(currentPage)}
          </nav>
        </div>
        
        <!-- Bottom Action -->
        <div class="p-2">
          <button onclick="handleSignOut()" class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render navigation items
 */
function renderNavigationItems(currentPage) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'Dashboard.html' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar_month', href: 'Schedule.html' },
    { id: 'patients', label: 'Patients', icon: 'group', href: 'Patients.html' },
    { id: 'records', label: 'Records', icon: 'description', href: 'Records.html' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: 'Settings.html' }
  ];

  return navigationItems.map(item => {
    const isActive = currentPage === item.id;
    const activeClass = isActive ? 'bg-primary/10 text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors group';
    const fillIcon = isActive ? 'fill-1' : '';

    return `
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${activeClass}" href="${item.href}" onclick="handleNavigationClick('${item.id}', event)">
        <span class="material-symbols-outlined text-[24px] ${fillIcon}">${item.icon}</span>
        <span class="text-sm font-medium">${item.label}</span>
      </a>
    `;
  }).join('');
}

/**
 * Handle navigation click
 */
function handleNavigationClick(pageId, event) {
  event.preventDefault();
  
  // Update current page in state
  stateManager.setState({ currentPage: pageId });
  
  // Update navigation to show active state
  renderNavigation();
  
  // Render the appropriate page content
  switch (pageId) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'schedule':
      renderSchedule();
      break;
    case 'patients':
      renderPatients();
      break;
    case 'records':
      renderRecords();
      break;
    case 'settings':
      renderSettings();
      break;
    default:
      renderDashboard();
  }
}

/**
 * Handle sign out
 */
function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    stateManager.clear();
    window.location.href = 'index.html';
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderNavigation };
}
