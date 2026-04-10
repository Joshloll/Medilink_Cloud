/**
 * Authentication Utilities Module
 * Handles all authentication operations with Supabase
 * Manages login, registration, and role-based access
 */

// Initialize Supabase client
const SUPABASE_URL = 'https://jhjnvvgavlabgsowxjfq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoanZudmdhbmxhYmdzb3d4amZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MjczMDUsImV4cCI6MjA0ODIwMzMwNX0.FP3TJagL_58BDwL7GZXDN5ijQVtRgBzpQFCPqCNs8pQ';

let supabase = null;

// Initialize Supabase from CDN
async function initSupabase() {
    if (supabase) return supabase;

    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return supabase;
    }

    throw new Error('Supabase client not available');
}

// ================================================================
// LOGIN
// ================================================================

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result with redirect path
 */
export async function loginUser(email, password) {
    try {
        const client = await initSupabase();

        // Authenticate with Supabase Auth
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            return {
                success: false,
                error: authError.message || 'Authentication failed'
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'Authentication failed'
            };
        }

        // Get user role and status from users table
        const { data: userData, error: userError } = await client
            .from('users')
            .select('role, status, full_name')
            .eq('email', email)
            .single();

        if (userError) {
            console.error('User fetch error:', userError);
            return {
                success: false,
                error: 'Unable to fetch user information'
            };
        }

        // Check if user is approved
        if (userData.status === 'pending') {
            return {
                success: false,
                error: 'Your account is pending approval. Please wait for admin confirmation.',
                status: 'pending'
            };
        }

        if (userData.status === 'rejected') {
            return {
                success: false,
                error: 'Your account application was rejected. Please contact support.',
                status: 'rejected'
            };
        }

        // Determine redirect based on role
        let redirectPath = '/';

        switch (userData.role) {
            case 'admin':
                redirectPath = '../Admin/Admin_Dashboard.html';
                break;
            case 'doctor':
                redirectPath = '../Doctor/Dashboard.html';
                break;
            case 'patient':
                redirectPath = '../Patient/index.html';
                break;
            default:
                redirectPath = '../';
        }

        // Log login activity
        try {
            await client
                .from('system_logs')
                .insert({
                    user_id: authData.user.id,
                    action: 'user_login',
                    entity_type: 'users',
                    entity_id: authData.user.id,
                    details: JSON.stringify({ email: email, role: userData.role }),
                    created_at: new Date().toISOString()
                });
        } catch (logError) {
            console.warn('Could not log login activity:', logError);
        }

        return {
            success: true,
            user: {
                id: authData.user.id,
                email: email,
                role: userData.role,
                fullName: userData.full_name
            },
            redirectTo: redirectPath,
            message: `Welcome back, ${userData.full_name}!`
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// ================================================================
// REGISTRATION
// ================================================================

/**
 * Register new user with email, password, and role
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @param {string} role - User role (doctor, patient, admin)
 * @param {Object} additionalData - Additional user data (phone, specialty, etc.)
 * @returns {Promise<Object>} Registration result
 */
export async function registerUser(email, password, fullName, role, additionalData = {}) {
    try {
        const client = await initSupabase();

        // Create auth user
        const { data: authData, error: authError } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });

        if (authError) {
            return {
                success: false,
                error: authError.message || 'Registration failed'
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'Registration failed'
            };
        }

        // Insert user into users table
        const { error: userError } = await client
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: role,
                status: 'pending',  // All new users start as pending
                phone: additionalData.phone || null,
                created_at: new Date().toISOString()
            });

        if (userError) {
            // Delete auth user if users table insert fails
            await client.auth.admin.deleteUser(authData.user.id);
            return {
                success: false,
                error: 'Failed to create user profile: ' + userError.message
            };
        }

        // Create role-specific profile
        if (role === 'doctor') {
            const { error: doctorError } = await client
                .from('doctors')
                .insert({
                    user_id: authData.user.id,
                    specialty: additionalData.specialty || 'General Practice',
                    license_number: additionalData.licenseNumber || '',
                    availability_status: 'offline',
                    created_at: new Date().toISOString()
                });

            if (doctorError) {
                console.error('Doctor profile creation error:', doctorError);
            }
        } else if (role === 'patient') {
            const { error: patientError } = await client
                .from('patients')
                .insert({
                    user_id: authData.user.id,
                    blood_type: additionalData.bloodType || null,
                    address: additionalData.address || '',
                    medical_history: additionalData.medicalHistory || '',
                    created_at: new Date().toISOString()
                });

            if (patientError) {
                console.error('Patient profile creation error:', patientError);
            }
        }

        // Log registration activity
        try {
            await client
                .from('system_logs')
                .insert({
                    user_id: authData.user.id,
                    action: 'user_registered',
                    entity_type: 'users',
                    entity_id: authData.user.id,
                    details: JSON.stringify({ role: role, email: email }),
                    created_at: new Date().toISOString()
                });
        } catch (logError) {
            console.warn('Could not log registration activity:', logError);
        }

        return {
            success: true,
            user: {
                id: authData.user.id,
                email: email,
                role: role,
                fullName: fullName
            },
            message: 'Registration successful! Your account is pending admin approval.'
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// ================================================================
// LOGOUT
// ================================================================

/**
 * Logout current user
 * @returns {Promise<Object>} Logout result
 */
export async function logoutUser() {
    try {
        const client = await initSupabase();

        const { error } = await client.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }

        return {
            success: true,
            message: 'Logged out successfully'
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// ================================================================
// SESSION MANAGEMENT
// ================================================================

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user or null
 */
export async function getCurrentUser() {
    try {
        const client = await initSupabase();

        const { data: { user }, error } = await client.auth.getUser();

        if (error) {
            return null;
        }

        if (!user) {
            return null;
        }

        // Get user role and details
        try {
            const { data: userData } = await client
                .from('users')
                .select('role, status, full_name, phone')
                .eq('email', user.email)
                .single();

            return {
                id: user.id,
                email: user.email,
                role: userData?.role || null,
                status: userData?.status || null,
                fullName: userData?.full_name || null,
                phone: userData?.phone || null
            };
        } catch (profileError) {
            console.warn('Could not fetch user profile:', profileError);
            return {
                id: user.id,
                email: user.email
            };
        }
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isUserAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Verify user has specific role
 * @param {string} requiredRole - Role to check for
 * @returns {Promise<boolean>}
 */
export async function hasRole(requiredRole) {
    try {
        const user = await getCurrentUser();
        return user && user.role === requiredRole && user.status === 'approved';
    } catch (error) {
        console.error('Error checking role:', error);
        return false;
    }
}

// ================================================================
// PASSWORD RESET
// ================================================================

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Result
 */
export async function requestPasswordReset(email) {
    try {
        const client = await initSupabase();

        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/Login_Register/ResetPassword.html`
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Password reset request failed'
            };
        }

        return {
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        };
    } catch (error) {
        console.error('Password reset error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

/**
 * Update password with reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Result
 */
export async function updatePasswordWithToken(newPassword) {
    try {
        const client = await initSupabase();

        const { error } = await client.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return {
                success: false,
                error: error.message || 'Password update failed'
            };
        }

        return {
            success: true,
            message: 'Password updated successfully'
        };
    } catch (error) {
        console.error('Password update error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// ================================================================
// ROUTE GUARDS
// ================================================================

/**
 * Verify user access to protected pages
 * Redirects to login if not authenticated
 * @param {string} requiredRole - Role required to access page (optional)
 * @returns {Promise<Object>} User data or redirect
 */
export async function verifyPageAccess(requiredRole = null) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            // Redirect to login after 1 second
            setTimeout(() => {
                window.location.href = '../Login_Register/Login.html';
            }, 1000);
            return { success: false, error: 'Not authenticated' };
        }

        if (requiredRole && user.role !== requiredRole) {
            // Redirect to appropriate dashboard
            setTimeout(() => {
                let redirectPath = '../';
                switch (user.role) {
                    case 'admin':
                        redirectPath = '../Admin/Admin_Dashboard.html';
                        break;
                    case 'doctor':
                        redirectPath = '../Doctor/Dashboard.html';
                        break;
                    case 'patient':
                        redirectPath = '../Patient/index.html';
                        break;
                }
                window.location.href = redirectPath;
            }, 1000);
            return { success: false, error: 'Access denied' };
        }

        if (user.status !== 'approved') {
            setTimeout(() => {
                window.location.href = '../Login_Register/Login.html';
            }, 1000);
            return { success: false, error: 'Account not approved' };
        }

        return { success: true, user };
    } catch (error) {
        console.error('Page access verification error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    isUserAuthenticated,
    hasRole,
    requestPasswordReset,
    updatePasswordWithToken,
    verifyPageAccess,
    initSupabase
};
