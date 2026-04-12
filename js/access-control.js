// Role-Based Access Control System
// Ensures users can only access appropriate dashboards

import supabaseAuthService from '../auth/supabase-auth.js';
import { showNotification } from './global-event-handler.js';

class AccessControl {
    constructor() {
        this.init();
    }

    async init() {
        // Check access on page load
        await this.checkPageAccess();
        
        // Set up periodic access checks
        setInterval(() => {
            this.checkSessionValidity();
        }, 60000); // Check every minute
    }

    async checkPageAccess() {
        const currentPage = this.getCurrentPage();
        const currentUser = supabaseAuthService.getCurrentUser();
        
        // If no current user, redirect to login (except on login/register pages)
        if (!currentUser && !this.isAuthPage(currentPage)) {
            this.redirectToLogin();
            return;
        }

        // If user exists but on auth page, redirect to appropriate dashboard
        if (currentUser && this.isAuthPage(currentPage)) {
            this.redirectToDashboard(currentUser.role);
            return;
        }

        // Check role-based access
        if (currentUser && !this.hasAccess(currentUser.role, currentPage)) {
            this.showAccessDenied();
            return;
        }

        // Set up access control for navigation
        this.setupNavigationAccess(currentUser);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('/Admin/')) return 'admin';
        if (path.includes('/Doctor/')) return 'doctor';
        if (path.includes('/Patient/')) return 'patient';
        if (path.includes('/Login_Register/')) return 'auth';
        
        return 'unknown';
    }

    isAuthPage(page) {
        return page === 'auth';
    }

    hasAccess(role, page) {
        const accessRules = {
            'admin': ['admin', 'auth'],
            'doctor': ['doctor', 'auth'],
            'patient': ['patient', 'auth'],
            'unknown': ['auth'] // Fallback for unknown pages
        };

        const allowedPages = accessRules[role] || ['auth'];
        return allowedPages.includes(page);
    }

    redirectToLogin() {
        showNotification('Session expired. Please log in again.', 'warning');
        setTimeout(() => {
            window.location.href = '../Login_Register/Login.html';
        }, 2000);
    }

    redirectToDashboard(role) {
        const dashboards = {
            'admin': '../Admin/Admin_Dashboard.html',
            'doctor': '../Doctor/Dashboard.html',
            'patient': '../Patient/index.html'
        };

        const dashboard = dashboards[role];
        if (dashboard) {
            window.location.href = dashboard;
        }
    }

    showAccessDenied() {
        // Create access denied overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md mx-4 text-center">
                <span class="material-symbols-outlined text-6xl text-red-500 mb-4">block</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">You don't have permission to access this page.</p>
                <div class="space-y-3">
                    <button onclick="window.location.href='../Login_Register/Login.html'" 
                        class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Return to Login
                    </button>
                    <button onclick="window.history.back()" 
                        class="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Auto-redirect after 5 seconds
        setTimeout(() => {
            this.redirectToLogin();
        }, 5000);
    }

    setupNavigationAccess(currentUser) {
        // Hide/show navigation items based on role
        const navItems = document.querySelectorAll('[data-roles]');
        
        navItems.forEach(item => {
            const requiredRoles = item.dataset.roles.split(',');
            const hasAccess = currentUser && requiredRoles.includes(currentUser.role);
            
            item.style.display = hasAccess ? 'block' : 'none';
        });

        // Update user info in navigation
        const userInfoElements = document.querySelectorAll('[data-user-info]');
        userInfoElements.forEach(element => {
            if (currentUser) {
                element.textContent = element.dataset.userInfo
                    .replace('{name}', currentUser.full_name || 'User')
                    .replace('{role}', currentUser.role || 'User')
                    .replace('{email}', currentUser.email || '');
            }
        });
    }

    async checkSessionValidity() {
        const currentUser = supabaseAuthService.getCurrentUser();
        
        if (!currentUser) {
            this.redirectToLogin();
            return;
        }

        // Check if session is still valid (you could add token expiry checking here)
        // For now, just ensure user still exists
        try {
            const supabase = supabaseAuthService.getSupabaseClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error || !user) {
                this.redirectToLogin();
            }
        } catch (error) {
            console.error('Session check error:', error);
            // Don't redirect on network errors, just log them
        }
    }

    // Public method to manually check access
    async validateAccess(requiredRole) {
        const currentUser = supabaseAuthService.getCurrentUser();
        
        if (!currentUser) {
            this.redirectToLogin();
            return false;
        }

        if (currentUser.role !== requiredRole) {
            showNotification(`Access denied. ${requiredRole} privileges required.`, 'error');
            return false;
        }

        return true;
    }

    // Public method to enforce role-based UI elements
    enforceRoleUI() {
        const currentUser = supabaseAuthService.getCurrentUser();
        
        if (!currentUser) return;

        // Show/hide elements based on role
        const roleElements = document.querySelectorAll('[data-show-for-role]');
        
        roleElements.forEach(element => {
            const showForRole = element.dataset.showForRole;
            const shouldShow = showForRole === currentUser.role || showForRole === 'all';
            
            element.style.display = shouldShow ? 'block' : 'none';
        });

        // Update role-specific content
        const roleContentElements = document.querySelectorAll('[data-role-content]');
        
        roleContentElements.forEach(element => {
            const roleContent = element.dataset.roleContent;
            
            if (roleContent === currentUser.role) {
                // Show role-specific content
                const content = element.getAttribute('data-content') || element.innerHTML;
                element.innerHTML = content;
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Method to add access control to navigation
    addNavigationRoleCheck() {
        const navLinks = document.querySelectorAll('a[href]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetPage = this.getPageFromPath(href);
                
                if (!this.hasAccess(supabaseAuthService.getCurrentUser()?.role, targetPage)) {
                    e.preventDefault();
                    showNotification('You do not have access to this page.', 'error');
                }
            });
        });
    }

    getPageFromPath(path) {
        if (path.includes('/Admin/')) return 'admin';
        if (path.includes('/Doctor/')) return 'doctor';
        if (path.includes('/Patient/')) return 'patient';
        if (path.includes('/Login_Register/')) return 'auth';
        
        return 'unknown';
    }

    // Method to protect API calls
    async protectApiCall(requiredRole, apiCall) {
        if (!await this.validateAccess(requiredRole)) {
            throw new Error('Access denied');
        }
        
        return await apiCall();
    }
}

// Initialize access control
const accessControl = new AccessControl();

export default accessControl;

// Make available globally
window.accessControl = accessControl;
