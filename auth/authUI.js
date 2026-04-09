// Authentication UI Components - Forms and User Management
import authService from './authService.js';

class AuthUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventDelegation();
        this.checkExistingSession();
    }

    setupEventDelegation() {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const userId = target.dataset.id;
            const data = target.dataset;

            // Prevent default for action buttons
            event.preventDefault();

            // Handle different actions
            this.handleAction(action, userId, data, event);
        });

        // Handle form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const action = form.dataset.action;
            
            if (action) {
                event.preventDefault();
                this.handleFormAction(action, form);
            }
        });
    }

    async handleAction(action, userId, data, event) {
        try {
            switch (action) {
                case 'approve-user':
                    await this.approveUser(userId);
                    break;
                    
                case 'reject-user':
                    await this.rejectUser(userId);
                    break;
                    
                case 'delete-user':
                    await this.deleteUser(userId);
                    break;
                    
                case 'pre-register-user':
                    this.showPreRegisterModal();
                    break;
                    
                case 'logout':
                    authService.logout();
                    break;
                    
                case 'toggle-user-status':
                    await this.toggleUserStatus(userId);
                    break;
                    
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            this.showNotification('Action failed: ' + error.message, 'error');
        }
    }

    async handleFormAction(action, form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            switch (action) {
                case 'register':
                    await this.handleRegistration(data);
                    break;
                    
                case 'login':
                    await this.handleLogin(data);
                    break;
                    
                case 'pre-register':
                    await this.handlePreRegistration(data);
                    break;
                    
                default:
                    console.warn('Unknown form action:', action);
            }
        } catch (error) {
            this.showNotification('Form submission failed: ' + error.message, 'error');
        }
    }

    // Registration Handler
    async handleRegistration(data) {
        const result = await authService.registerUser(data.email, data.role, {
            name: data.name,
            phone: data.phone,
            password: data.password
        });

        if (result.success) {
            this.showNotification(result.message, 'success');
            
            // If auto-approved, redirect to login
            if (result.user.status === 'approved') {
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 2000);
            } else {
                // Clear form for pending approval
                form.reset();
            }
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    // Login Handler
    async handleLogin(data) {
        const result = await authService.loginUser(data.email);

        if (result.success) {
            this.showNotification(result.message, 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                window.location.href = result.redirectUrl;
            }, 1000);
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    // Pre-registration Handler (Admin)
    async handlePreRegistration(data) {
        const result = await authService.preRegisterUser(data.email, data.role, {
            name: data.name,
            phone: data.phone,
            specialty: data.specialty
        });

        if (result.success) {
            this.showNotification(result.message, 'success');
            this.closeModal();
            if (typeof renderPendingUsers === 'function') {
                renderPendingUsers();
            }
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    // Approval Functions
    async approveUser(userId) {
        if (confirm('Are you sure you want to approve this user?')) {
            const result = await authService.approveUser(userId);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                if (typeof renderPendingUsers === 'function') {
                    renderPendingUsers();
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        }
    }

    async rejectUser(userId) {
        if (confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
            const result = await authService.rejectUser(userId);
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                if (typeof renderPendingUsers === 'function') {
                    renderPendingUsers();
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        }
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const result = await authService.rejectUser(userId); // Using reject as delete
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                if (typeof renderAllUsers === 'function') {
                    renderAllUsers();
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        }
    }

    // UI Rendering Functions
    renderPendingUsers() {
        const container = document.getElementById('pending-users-container');
        if (!container) return;

        const pendingUsers = authService.getPendingUsers();
        
        if (pendingUsers.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">person_add</span>
                    <p class="text-slate-600 dark:text-slate-400 mt-2">No pending users</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="space-y-4">
                ${pendingUsers.map(user => this.renderPendingUserCard(user)).join('')}
            </div>
        `;
    }

    renderPendingUserCard(user) {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">${this.getRoleIcon(user.role)}</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-slate-900 dark:text-white">${user.name || user.email}</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${user.email}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="px-2 py-1 bg-${this.getRoleColor(user.role)}-100 text-${this.getRoleColor(user.role)}-800 dark:bg-${this.getRoleColor(user.role)}-900/30 dark:text-${this.getRoleColor(user.role)}-400 rounded-full text-xs font-medium">
                                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                                <span class="text-xs text-slate-500">
                                    Registered ${new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button data-action="approve-user" data-id="${user.id}" 
                            class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                            <span class="material-symbols-outlined text-[16px] align-middle mr-1">check</span>
                            Approve
                        </button>
                        <button data-action="reject-user" data-id="${user.id}" 
                            class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                            <span class="material-symbols-outlined text-[16px] align-middle mr-1">close</span>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderAllUsers() {
        const container = document.getElementById('all-users-container');
        if (!container) return;

        const allUsers = authService.getAllUsers();
        
        container.innerHTML = `
            <div class="space-y-4">
                ${allUsers.map(user => this.renderUserCard(user)).join('')}
            </div>
        `;
    }

    renderUserCard(user) {
        const statusColor = user.status === 'approved' ? 'green' : user.status === 'pending' ? 'amber' : 'red';
        
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">${this.getRoleIcon(user.role)}</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-slate-900 dark:text-white">${user.name || user.email}</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${user.email}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="px-2 py-1 bg-${this.getRoleColor(user.role)}-100 text-${this.getRoleColor(user.role)}-800 dark:bg-${this.getRoleColor(user.role)}-900/30 dark:text-${this.getRoleColor(user.role)}-400 rounded-full text-xs font-medium">
                                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                                <span class="px-2 py-1 bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900/30 dark:text-${statusColor}-400 rounded-full text-xs font-medium">
                                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>
                                ${user.createdByAdmin ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Pre-registered</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${user.status === 'pending' ? `
                            <button data-action="approve-user" data-id="${user.id}" 
                                class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                <span class="material-symbols-outlined text-[16px] align-middle mr-1">check</span>
                                Approve
                            </button>
                            <button data-action="reject-user" data-id="${user.id}" 
                                class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                                <span class="material-symbols-outlined text-[16px] align-middle mr-1">close</span>
                                Reject
                            </button>
                        ` : `
                            <button data-action="delete-user" data-id="${user.id}" 
                                class="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-[16px] align-middle mr-1">delete</span>
                                Delete
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // Modal Functions
    showPreRegisterModal() {
        const modal = this.createModal('Pre-register User', this.renderPreRegisterForm());
        document.body.appendChild(modal);
    }

    renderPreRegisterForm() {
        return `
            <form data-action="pre-register" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                    <input type="email" name="email" required 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="user@medilink.com">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role *</label>
                    <select name="role" required 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select role</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                    <input type="text" name="name" required 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John Doe">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                    <input type="tel" name="phone" 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+1 (555) 123-4567">
                </div>
                
                <div id="doctor-fields" style="display: none;">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialty</label>
                    <input type="text" name="specialty" 
                        class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Cardiology">
                </div>
                
                <div class="flex gap-2 pt-4">
                    <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Pre-register User
                    </button>
                    <button type="button" onclick="this.closest('.modal').remove()" 
                        class="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        `;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-slate-900 dark:text-white">${title}</h2>
                    <button onclick="this.closest('.modal').remove()" 
                        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                ${content}
            </div>
        `;
        
        // Setup role field toggle
        if (title === 'Pre-register User') {
            const roleSelect = modal.querySelector('select[name="role"]');
            const doctorFields = modal.querySelector('#doctor-fields');
            
            roleSelect.addEventListener('change', (e) => {
                doctorFields.style.display = e.target.value === 'doctor' ? 'block' : 'none';
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    // Check existing session
    checkExistingSession() {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isLoggedIn()) {
            // User is already logged in, redirect to appropriate dashboard
            const redirectUrl = authService.getRedirectUrl(currentUser.role);
            if (window.location.pathname.includes('Login.html') || window.location.pathname.includes('Register.html')) {
                window.location.href = redirectUrl;
            }
        }
    }

    // Utility Functions
    getRoleIcon(role) {
        const icons = {
            'admin': 'admin_panel_settings',
            'doctor': 'stethoscope',
            'patient': 'person'
        };
        return icons[role] || 'person';
    }

    getRoleColor(role) {
        const colors = {
            'admin': 'purple',
            'doctor': 'blue',
            'patient': 'green'
        };
        return colors[role] || 'slate';
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize Auth UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
    
    // Make renderPendingUsers available globally
    window.renderPendingUsers = () => {
        window.authUI.renderPendingUsers();
    };
    
    window.renderAllUsers = () => {
        window.authUI.renderAllUsers();
    };
});

export default AuthUI;
