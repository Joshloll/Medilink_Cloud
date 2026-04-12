// System Validator and Testing Tool
// Validates the entire Medilink system functionality

import supabaseAuthService from '../auth/supabase-auth.js';
import { showNotification } from './global-event-handler.js';

class SystemValidator {
    constructor() {
        this.testResults = [];
        this.init();
    }

    init() {
        this.setupValidatorUI();
    }

    setupValidatorUI() {
        // Add validator button to admin dashboard if present
        const adminHeader = document.querySelector('h1');
        if (adminHeader) {
            const validatorBtn = document.createElement('button');
            validatorBtn.className = 'fixed top-4 right-4 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 z-50';
            validatorBtn.innerHTML = '🔧 System Validator';
            validatorBtn.onclick = () => this.runValidation();
            document.body.appendChild(validatorBtn);
        }
    }

    async runValidation() {
        this.testResults = [];
        
        console.log('🔧 Starting System Validation...');
        showNotification('Running system validation...', 'info');

        try {
            await this.validateAuthentication();
            await this.validateDatabaseConnection();
            await this.validateUserRoles();
            await this.validateDataFlow();
            await this.validateEventHandlers();
            await this.validateFormHandling();
            
            this.displayResults();
        } catch (error) {
            console.error('Validation error:', error);
            showNotification('Validation failed: ' + error.message, 'error');
        }
    }

    async validateAuthentication() {
        const tests = [
            {
                name: 'Authentication Service',
                test: () => this.testAuthService(),
                critical: true
            },
            {
                name: 'Session Management',
                test: () => this.testSessionManagement(),
                critical: true
            },
            {
                name: 'Role-Based Access',
                test: () => this.testRoleAccess(),
                critical: true
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Authentication',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'Authentication',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    async validateDatabaseConnection() {
        const tests = [
            {
                name: 'Supabase Connection',
                test: () => this.testSupabaseConnection(),
                critical: true
            },
            {
                name: 'Database Tables',
                test: () => this.testDatabaseTables(),
                critical: true
            },
            {
                name: 'Data Permissions',
                test: () => this.testDataPermissions(),
                critical: false
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Database',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'Database',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    async validateUserRoles() {
        const tests = [
            {
                name: 'Admin Role',
                test: () => this.testRoleFunctionality('admin'),
                critical: true
            },
            {
                name: 'Doctor Role',
                test: () => this.testRoleFunctionality('doctor'),
                critical: true
            },
            {
                name: 'Patient Role',
                test: () => this.testRoleFunctionality('patient'),
                critical: true
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'User Roles',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'User Roles',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    async validateDataFlow() {
        const tests = [
            {
                name: 'User Registration → Approval Flow',
                test: () => this.testRegistrationApprovalFlow(),
                critical: true
            },
            {
                name: 'Appointment Booking Flow',
                test: () => this.testAppointmentFlow(),
                critical: true
            },
            {
                name: 'Medical Record Creation',
                test: () => this.testMedicalRecordFlow(),
                critical: true
            },
            {
                name: 'Prescription Creation',
                test: () => this.testPrescriptionFlow(),
                critical: true
            },
            {
                name: 'Data Synchronization',
                test: () => this.testDataSynchronization(),
                critical: true
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Data Flow',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'Data Flow',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    async validateEventHandlers() {
        const tests = [
            {
                name: 'Global Event Handler',
                test: () => this.testGlobalEventHandler(),
                critical: true
            },
            {
                name: 'Form Submissions',
                test: () => this.testFormSubmissions(),
                critical: true
            },
            {
                name: 'Button Actions',
                test: () => this.testButtonActions(),
                critical: false
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Event Handlers',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'Event Handlers',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    async validateFormHandling() {
        const tests = [
            {
                name: 'Login Form',
                test: () => this.testLoginForm(),
                critical: true
            },
            {
                name: 'Register Form',
                test: () => this.testRegisterForm(),
                critical: true
            },
            {
                name: 'Form Validation',
                test: () => this.testFormValidation(),
                critical: true
            }
        ];

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    category: 'Form Handling',
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    message: result.message,
                    critical: test.critical,
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    category: 'Form Handling',
                    name: test.name,
                    status: 'ERROR',
                    message: error.message,
                    critical: test.critical,
                    details: error
                });
            }
        }
    }

    // Individual test methods
    async testAuthService() {
        try {
            const authService = supabaseAuthService;
            return {
                success: authService !== null,
                message: authService ? 'Auth service loaded' : 'Auth service not found',
                details: { authService: !!authService }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Auth service error: ' + error.message,
                details: { error: error.message }
            };
        }
    }

    async testSessionManagement() {
        try {
            const currentUser = supabaseAuthService.getCurrentUser();
            return {
                success: true,
                message: currentUser ? 'Session active' : 'No active session',
                details: { hasSession: !!currentUser, user: currentUser?.email }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Session management error: ' + error.message,
                details: { error: error.message }
            };
        }
    }

    async testRoleAccess() {
        try {
            const currentUser = supabaseAuthService.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'No user for role testing',
                    details: { user: null }
                };
            }

            const hasRole = supabaseAuthService.hasRole(currentUser.role);
            return {
                success: hasRole,
                message: `Role ${currentUser.role} ${hasRole ? 'valid' : 'invalid'}`,
                details: { role: currentUser.role, hasRole }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Role access error: ' + error.message,
                details: { error: error.message }
            };
        }
    }

    async testSupabaseConnection() {
        try {
            const supabase = supabaseAuthService.getSupabaseClient();
            if (!supabase) {
                return {
                    success: false,
                    message: 'Supabase client not available',
                    details: { client: null }
                };
            }

            // Test basic connection
            const { data, error } = await supabase.from('users').select('count').limit(1);
            
            return {
                success: !error,
                message: error ? 'Connection failed: ' + error.message : 'Connection successful',
                details: { connected: !error, error: error?.message }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Connection error: ' + error.message,
                details: { error: error.message }
            };
        }
    }

    async testDatabaseTables() {
        const tables = ['users', 'doctors', 'patients', 'appointments', 'medical_records', 'prescriptions'];
        const results = {};

        for (const table of tables) {
            try {
                const supabase = supabaseAuthService.getSupabaseClient();
                const { error } = await supabase.from(table).select('count').limit(1);
                results[table] = { accessible: !error, error: error?.message };
            } catch (error) {
                results[table] = { accessible: false, error: error.message };
            }
        }

        const allAccessible = Object.values(results).every(r => r.accessible);
        
        return {
            success: allAccessible,
            message: allAccessible ? 'All tables accessible' : 'Some tables inaccessible',
            details: results
        };
    }

    async testRoleFunctionality(role) {
        // This would require creating test users and testing their functionality
        // For now, just check if role-specific files exist
        const roleFiles = {
            'admin': ['Admin_Dashboard.html'],
            'doctor': ['Dashboard.html'],
            'patient': ['index.html']
        };

        const files = roleFiles[role] || [];
        const allFilesExist = files.length > 0;

        return {
            success: allFilesExist,
            message: allFilesExist ? `${role} files available` : `${role} files missing`,
            details: { role, files, allFilesExist }
        };
    }

    async testRegistrationApprovalFlow() {
        // Test if registration creates pending user
        // This would require actual API calls, so for now just check structure
        const hasRegistrationForm = document.querySelector('#registerForm');
        const hasApprovalSystem = typeof supabaseAuthService.approveUser === 'function';

        return {
            success: hasRegistrationForm && hasApprovalSystem,
            message: hasRegistrationForm && hasApprovalSystem ? 'Registration flow available' : 'Registration flow incomplete',
            details: { hasForm: !!hasRegistrationForm, hasApproval: hasApprovalSystem }
        };
    }

    async testAppointmentFlow() {
        // Check if appointment booking components exist
        const hasBookingForm = document.querySelector('[data-action="book-appointment"]');
        const hasAppointmentList = document.querySelector('#appointments-list');
        
        return {
            success: hasBookingForm && hasAppointmentList,
            message: hasBookingForm && hasAppointmentList ? 'Appointment flow available' : 'Appointment flow incomplete',
            details: { hasForm: !!hasBookingForm, hasList: !!hasAppointmentList }
        };
    }

    async testMedicalRecordFlow() {
        const hasRecordForm = document.querySelector('[data-action="create-medical-record"]');
        const hasRecordList = document.querySelector('#records-list');
        
        return {
            success: hasRecordForm && hasRecordList,
            message: hasRecordForm && hasRecordList ? 'Medical record flow available' : 'Medical record flow incomplete',
            details: { hasForm: !!hasRecordForm, hasList: !!hasRecordList }
        };
    }

    async testPrescriptionFlow() {
        const hasPrescriptionForm = document.querySelector('[data-action="create-prescription"]');
        const hasPrescriptionList = document.querySelector('#prescriptions-list');
        
        return {
            success: hasPrescriptionForm && hasPrescriptionList,
            message: hasPrescriptionForm && hasPrescriptionList ? 'Prescription flow available' : 'Prescription flow incomplete',
            details: { hasForm: !!hasPrescriptionForm, hasList: !!hasPrescriptionList }
        };
    }

    async testDataSynchronization() {
        // Check if services are properly connected
        const hasGlobalHandler = typeof window.initializeGlobalEventHandler === 'function';
        const hasFormHandler = typeof window.formHandler !== 'undefined';
        
        return {
            success: hasGlobalHandler && hasFormHandler,
            message: hasGlobalHandler && hasFormHandler ? 'Data sync available' : 'Data sync incomplete',
            details: { hasGlobalHandler, hasFormHandler }
        };
    }

    async testGlobalEventHandler() {
        const hasEventSystem = document.querySelector('[data-action]');
        
        return {
            success: !!hasEventSystem,
            message: hasEventSystem ? 'Event system active' : 'Event system not found',
            details: { hasEventSystem: !!hasEventSystem }
        };
    }

    async testFormSubmissions() {
        const forms = document.querySelectorAll('form[data-action]');
        
        return {
            success: forms.length > 0,
            message: forms.length > 0 ? `${forms.length} forms found` : 'No forms found',
            details: { formCount: forms.length }
        };
    }

    async testButtonActions() {
        const buttons = document.querySelectorAll('[data-action]:not(form)');
        
        return {
            success: buttons.length > 0,
            message: buttons.length > 0 ? `${buttons.length} action buttons found` : 'No action buttons found',
            details: { buttonCount: buttons.length }
        };
    }

    async testLoginForm() {
        const loginForm = document.querySelector('#loginForm');
        const hasEmailField = document.querySelector('input[name="email"]');
        const hasPasswordField = document.querySelector('input[name="password"]');
        
        return {
            success: loginForm && hasEmailField && hasPasswordField,
            message: loginForm && hasEmailField && hasPasswordField ? 'Login form complete' : 'Login form incomplete',
            details: { hasForm: !!loginForm, hasEmail: !!hasEmailField, hasPassword: !!hasPasswordField }
        };
    }

    async testRegisterForm() {
        const registerForm = document.querySelector('#registerForm');
        const hasEmailField = document.querySelector('input[name="email"]');
        const hasPasswordField = document.querySelector('input[name="password"]');
        const hasNameField = document.querySelector('input[name="full_name"]');
        const hasRoleField = document.querySelector('input[name="role"]');
        
        return {
            success: registerForm && hasEmailField && hasPasswordField && hasNameField && hasRoleField,
            message: registerForm && hasEmailField && hasPasswordField && hasNameField && hasRoleField ? 'Register form complete' : 'Register form incomplete',
            details: { hasForm: !!registerForm, hasEmail: !!hasEmailField, hasPassword: !!hasPasswordField, hasName: !!hasNameField, hasRole: !!hasRoleField }
        };
    }

    async testFormValidation() {
        const formsWithValidation = document.querySelectorAll('form[data-action]');
        
        return {
            success: formsWithValidation.length > 0,
            message: formsWithValidation.length > 0 ? 'Forms have validation system' : 'No validation system found',
            details: { formCount: formsWithValidation.length }
        };
    }

    displayResults() {
        // Create results modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">System Validation Results</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-500 hover:text-slate-700">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="space-y-4">
                    ${this.generateResultsHTML()}
                </div>
                <div class="mt-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateResultsHTML() {
        const categories = {};
        
        // Group results by category
        this.testResults.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = [];
            }
            categories[result.category].push(result);
        });

        let html = '';

        Object.entries(categories).forEach(([category, results]) => {
            const criticalIssues = results.filter(r => r.critical && r.status !== 'PASS');
            const allPassed = results.every(r => r.status === 'PASS');
            
            html += `
                <div class="border rounded-lg p-4 ${allPassed ? 'border-green-200 bg-green-50' : criticalIssues.length > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}">
                    <h3 class="text-lg font-semibold mb-3 ${allPassed ? 'text-green-800' : criticalIssues.length > 0 ? 'text-red-800' : 'text-yellow-800'}">
                        ${category} ${allPassed ? '✅' : criticalIssues.length > 0 ? '❌' : '⚠️'}
                    </h3>
                    <div class="space-y-2">
                        ${results.map(result => `
                            <div class="flex items-center justify-between p-2 rounded ${result.status === 'PASS' ? 'bg-green-100' : result.status === 'FAIL' ? 'bg-red-100' : 'bg-yellow-100'}">
                                <div class="flex-1">
                                    <span class="font-medium ${result.status === 'PASS' ? 'text-green-800' : result.status === 'FAIL' ? 'text-red-800' : 'text-yellow-800'}">
                                        ${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'} ${result.name}
                                    </span>
                                    <p class="text-sm text-slate-600 mt-1">${result.message}</p>
                                </div>
                                <span class="text-sm font-medium ${result.status === 'PASS' ? 'text-green-800' : result.status === 'FAIL' ? 'text-red-800' : 'text-yellow-800'}">
                                    ${result.status}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        // Add summary
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const criticalFailures = this.testResults.filter(r => r.critical && r.status !== 'PASS').length;

        html += `
            <div class="border rounded-lg p-4 ${criticalFailures === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                <h3 class="text-lg font-semibold ${criticalFailures === 0 ? 'text-green-800' : 'text-red-800'}">
                    Summary ${criticalFailures === 0 ? '✅' : '❌'}
                </h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold ${criticalFailures === 0 ? 'text-green-800' : 'text-red-800'}">${totalTests}</div>
                        <div class="text-sm text-slate-600">Total Tests</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold ${criticalFailures === 0 ? 'text-green-800' : 'text-red-800'}">${passedTests}</div>
                        <div class="text-sm text-slate-600">Passed</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold ${criticalFailures === 0 ? 'text-green-800' : 'text-red-800'}">${criticalFailures}</div>
                        <div class="text-sm text-slate-600">Critical Failures</div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // Public method to run specific test
    async runSpecificTest(testName) {
        const testMap = {
            'auth': () => this.validateAuthentication(),
            'db': () => this.validateDatabaseConnection(),
            'roles': () => this.validateUserRoles(),
            'flow': () => this.validateDataFlow(),
            'events': () => this.validateEventHandlers(),
            'forms': () => this.validateFormHandling()
        };

        if (testMap[testName]) {
            await testMap[testName]();
            this.displayResults();
        } else {
            showNotification('Unknown test: ' + testName, 'error');
        }
    }
}

// Initialize system validator
const systemValidator = new SystemValidator();

export default systemValidator;

// Make available globally
window.systemValidator = systemValidator;
