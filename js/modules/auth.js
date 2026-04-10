/**
 * AUTH MODULE
 * Handles user registration, login, logout, and session management
 */

const authModule = {
    /**
     * Render login/register screen
     */
    renderAuthScreen(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div class="w-full max-w-md">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center size-16 bg-primary/10 rounded-lg mb-4">
                            <span class="material-symbols-outlined text-3xl text-primary">local_hospital</span>
                        </div>
                        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">MediLink Cloud</h1>
                        <p class="text-slate-500 dark:text-slate-400 mt-2">Healthcare Management System</p>
                    </div>

                    <!-- Auth Form -->
                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-8">
                        <div class="flex gap-4 mb-6">
                            <button type="button" data-auth-mode="login" class="auth-mode-btn flex-1 py-2 px-4 rounded-lg font-medium bg-primary text-white transition-colors">
                                Sign In
                            </button>
                            <button type="button" data-auth-mode="register" class="auth-mode-btn flex-1 py-2 px-4 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Register
                            </button>
                        </div>

                        <!-- Login Form -->
                        <form id="login-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input type="email" name="email" required placeholder="you@example.com" class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <input type="password" name="password" required placeholder="••••••••" class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <button type="submit" data-action="submit-login" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                                Sign In
                            </button>
                        </form>

                        <!-- Register Form -->
                        <form id="register-form" class="space-y-4 hidden">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <input type="text" name="name" required placeholder="John Doe" class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input type="email" name="email" required placeholder="you@example.com" class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <input type="password" name="password" required placeholder="••••••••" class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    I am a:
                                </label>
                                <select name="role" required class="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="">Select your role...</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="patient">Patient</option>
                                </select>
                            </div>

                            <button type="submit" data-action="submit-register" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                                Create Account
                            </button>
                        </form>

                        <div class="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                            <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
                                <strong>Demo Admin Account:</strong><br>
                                Email: admin@medilinkcloud.com<br>
                                Password: admin123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup auth event listeners
        authModule.setupAuthListeners();
    },

    /**
     * Setup authentication event listeners
     */
    setupAuthListeners() {
        // Switch between login and register
        document.querySelectorAll('[data-auth-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.authMode;
                authModule.switchAuthMode(mode);
            });
        });
    },

    /**
     * Switch between login and register forms
     */
    switchAuthMode(mode) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const buttons = document.querySelectorAll('[data-auth-mode]');

        buttons.forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600');
            if (btn.dataset.authMode === mode) {
                btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600');
                btn.classList.add('bg-primary', 'text-white');
            }
        });

        if (mode === 'login') {
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
        } else {
            loginForm?.classList.add('hidden');
            registerForm?.classList.remove('hidden');
        }
    },

    /**
     * Handle login submission
     */
    async handleLogin(formData) {
        try {
            const result = await api.auth.login(formData.email, formData.password);
            state.currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            showToast('Login successful!', 'success');
            renderApp(); // Re-render app with authenticated view
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle registration submission
     */
    async handleRegister(formData) {
        try {
            const result = await api.auth.register(
                formData.email,
                formData.password,
                formData.role,
                formData.name
            );

            showToast('Account created! Waiting for admin approval...', 'info');

            // Clear form
            const form = document.getElementById('register-form');
            if (form) form.reset();

            // Switch back to login
            authModule.switchAuthMode('login');
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            state.currentUser = null;
            localStorage.removeItem('currentUser');
            addLog('USER_LOGOUT', {}, null);
            showToast('Logged out successfully');
            renderApp();
        }
    },

    /**
     * Restore session from localStorage
     */
    restoreSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                state.currentUser = JSON.parse(savedUser);
                return true;
            } catch (e) {
                console.error('Failed to restore session', e);
                localStorage.removeItem('currentUser');
                return false;
            }
        }
        return false;
    }
};
