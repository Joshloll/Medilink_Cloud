/**
 * Navigation Component
 * Renders the side navigation menu
 */

/**
 * Render navigation menu
 */
function renderNavigation() {
  const nav = document.getElementById('navigation');
  if (!nav) return;

  const currentPage = stateManager.getState().currentPage;
  
  nav.innerHTML = `
    <aside class="flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark h-full hidden lg:flex flex-shrink-0 z-20">
      <div class="flex flex-col h-full justify-between p-4">
        <div class="flex flex-col gap-6">
          <!-- Branding -->
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-10 shadow-sm" 
                 data-alt="MediLink abstract blue logo with white cross" 
                 style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxI3pjrPKcPkRoL588sNS-yKX6G80NqVVkMieXpypt1lj312V87i-erOI8i4mqLjhj3QP28m5KRbbcziNuQY2PZzKxVMlJj24uAOgGhfQMyZFRnWUfDtcqnc4I3VrvQTbPnQ19nsh1ddL8Zo4-cJg3Ts_sGHmbKXa99HRr8V3rHK5zYGXhdgieZc99_a35nHHDRJyj16qqi53ARoZSf3Bme6i5wcgDNt5nEcxCd0qKNrfb0CJ_P5cOOTeQ5jArpJ100fP10o1aH0gl");'>
            </div>
            <div class="flex flex-col">
              <h1 class="text-slate-900 dark:text-white text-lg font-bold leading-none tracking-tight">MediLink Cloud</h1>
              <p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Patient Portal</p>
            </div>
          </div>
          
          <!-- Navigation Links -->
          <nav class="flex flex-col gap-2">
            ${renderNavLink('dashboard', 'Dashboard', 'dashboard', currentPage === 'dashboard')}
            ${renderNavLink('appointments', 'My Appointments', 'calendar_month', currentPage === 'appointments')}
            ${renderNavLink('records', 'Medical Records', 'description', currentPage === 'records')}
            ${renderNavLink('prescriptions', 'Prescriptions', 'medication', currentPage === 'prescriptions')}
            ${renderNavLink('settings', 'Settings', 'settings', currentPage === 'settings')}
          </nav>
        </div>
        
        <!-- Bottom Action -->
        <div class="mt-auto">
          <button onclick="handleGetHelp()" 
                  class="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 bg-slate-100 dark:bg-slate-800 text-primary dark:text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-[1.02] text-sm font-bold tracking-wide">
            <span class="material-symbols-outlined text-[20px]">support_agent</span>
            <span>Get Help</span>
          </button>
        </div>
      </div>
    </aside>
  `;

  // Add event listeners to navigation links
  addNavigationListeners();
}

/**
 * Render individual navigation link
 */
function renderNavLink(page, label, icon, isActive) {
  const activeClass = isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : '';
  const filledIcon = isActive ? 'style="font-variation-settings: \'FILL\' 1;"' : '';
  
  return `
    <a href="#${page}" 
       class="nav-link ${activeClass}" 
       data-page="${page}">
      <span class="material-symbols-outlined" ${filledIcon}>${icon}</span>
      <span class="text-sm ${isActive ? 'font-semibold' : 'font-medium'}">${label}</span>
    </a>
  `;
}

/**
 * Add event listeners to navigation links
 */
function addNavigationListeners() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateToPage(page);
    });
  });
}

/**
 * Navigate to specific page
 */
function navigateToPage(page) {
  // Update current page in state
  stateManager.setState({ currentPage: page });
  
  // Re-render navigation to update active state
  renderNavigation();
  
  // Render the appropriate page content
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'appointments':
      renderAppointments();
      break;
    case 'records':
      renderRecords();
      break;
    case 'prescriptions':
      renderPrescriptions();
      break;
    case 'settings':
      renderSettings();
      break;
    default:
      renderDashboard();
  }
}

/**
 * Handle get help button click
 */
function handleGetHelp() {
  alert('Help & Support: This would open a help modal or redirect to support page');
  // In a real app, this would open a help modal or navigate to support
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderNavigation, navigateToPage };
}
