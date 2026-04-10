/**
 * ADMIN MODULE
 * Handles admin dashboard, user approvals, and system management
 */

const adminModule = {
    /**
     * Render admin dashboard
     */
    async renderAdminDashboard() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Render sidebar
        adminModule.renderAdminSidebar();

        // Render top nav
        adminModule.renderAdminTopNav();

        // Get system stats
        const stats = await api.admin.getSystemStats();

        mainContent.innerHTML = `
            <div class="p-6 md:p-8 space-y-6 fade-in">
                <!-- Welcome Section -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
                            Welcome back, ${state.currentUser?.name || 'Admin'}
                        </h1>
                        <p class="text-slate-500 dark:text-slate-400 mt-2">
                            System Overview & Management
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button data-action="refresh-dashboard" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span class="material-symbols-outlined align-middle mr-2">refresh</span>
                            Refresh
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Patients</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${stats.total_patients}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Doctors</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${stats.total_doctors}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Today's Appointments</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${stats.today_appointments}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Users</p>
                        <p class="text-3xl font-bold text-slate-900 dark:text-white mt-2">${stats.active_users}</p>
                    </div>

                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Approvals</p>
                        <p class="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">${stats.pending_users}</p>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Pending Users Section -->
                    <div class="lg:col-span-2">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
                                Pending User Approvals (${stats.pending_users})
                            </h2>
                            <div id="pending-users-list">
                                <p class="text-slate-500 dark:text-slate-400 text-center py-8">Loading...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-4">
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button data-action="navigate" data-target="manage-doctors" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">stethoscope</span>
                                    Manage Doctors
                                </button>
                                <button data-action="navigate" data-target="manage-patients" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">groups</span>
                                    Manage Patients
                                </button>
                                <button data-action="navigate" data-target="view-appointments" class="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined align-middle mr-2">calendar_month</span>
                                    View Appointments
                                </button>
                            </div>
                        </div>

                        <!-- System Status -->
                        <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">System Status</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-600 dark:text-slate-400">Server Status</span>
                                    <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        Online
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-600 dark:text-slate-400">Database</span>
                                    <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        Connected
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load and render pending users
        adminModule.loadPendingUsers();
    },

    /**
     * Render admin sidebar
     */
    renderAdminSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.classList.remove('hidden');
        sidebar.innerHTML = `
            <div class="w-64 flex-shrink-0 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col justify-between hidden md:flex z-20">
                <div class="flex flex-col p-4 gap-6">
                    <!-- Brand -->
                    <div class="flex items-center gap-3 px-2">
                        <div class="bg-primary/10 flex items-center justify-center rounded-lg size-10 text-primary">
                            <span class="material-symbols-outlined text-2xl">local_hospital</span>
                        </div>
                        <div class="flex flex-col">
                            <h1 class="text-base font-bold leading-tight">MediLink Cloud</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Admin Portal</p>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav class="flex flex-col gap-1">
                        <a href="#" data-action="navigate" data-target="admin-dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                            <span class="material-symbols-outlined">grid_view</span>
                            <span class="text-sm">Dashboard</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="manage-doctors" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">stethoscope</span>
                            <span class="text-sm">Doctors</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="manage-patients" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">groups</span>
                            <span class="text-sm">Patients</span>
                        </a>
                        <a href="#" data-action="navigate" data-target="view-appointments" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined">calendar_month</span>
                            <span class="text-sm">Appointments</span>
                        </a>
                    </nav>
                </div>

                <!-- Logout -->
                <div class="p-4 border-t border-border-light dark:border-border-dark">
                    <button data-action="logout" class="w-full flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors">
                        <span class="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render admin top navigation
     */
    renderAdminTopNav() {
        const topnav = document.getElementById('topnav');
        if (!topnav) return;

        topnav.classList.remove('hidden');
        topnav.innerHTML = `
            <header class="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex-shrink-0 z-10">
                <div class="flex items-center gap-4">
                    <button class="md:hidden text-slate-500 hover:text-slate-700">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <h2 class="hidden sm:block text-lg font-bold tracking-tight">Admin Panel</h2>
                </div>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-medium leading-none">${state.currentUser?.name}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">System Administrator</p>
                        </div>
                        <div class="size-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            ${(state.currentUser?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Load and display pending users
     */
    async loadPendingUsers() {
        try {
            const pendingUsers = await api.admin.getPendingUsers();
            adminModule.renderPendingUsersList('pending-users-list', pendingUsers);
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Render pending users list
     */
    renderPendingUsersList(containerId, users) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">All users approved!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-3">
                ${users.map(user => `
                    <div class="bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <h4 class="font-semibold text-slate-900 dark:text-white">${user.name}</h4>
                            <p class="text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
                            <span class="inline-block mt-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                                ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <button data-action="approve-user" data-id="${user.id}" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                                Approve
                            </button>
                            <button data-action="reject-user" data-id="${user.id}" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                                Reject
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Handle approve user
     */
    async handleApproveUser(userId) {
        try {
            await api.admin.approveUser(userId);
            showToast('User approved successfully!', 'success');
            adminModule.loadPendingUsers();
            
            // Update stats
            const stats = await api.admin.getSystemStats();
            document.querySelectorAll('[data-stat="pending"]').forEach(el => {
                el.textContent = stats.pending_users;
            });
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle reject user
     */
    async handleRejectUser(userId) {
        const reason = prompt('Enter rejection reason (optional):');
        try {
            await api.admin.rejectUser(userId, reason);
            showToast('User rejected', 'info');
            adminModule.loadPendingUsers();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};
