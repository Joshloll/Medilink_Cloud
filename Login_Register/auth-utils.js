// ============================================================================
// MEDILINK - AUTHENTICATION UTILITIES
// ============================================================================
// Centralized auth functions for registration, login, logout, and approval
// Uses Supabase Auth + Database for secure authentication
// ============================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================

function getSupabaseCredentials() {
  // Try multiple credential sources in order of priority
  if (typeof import?.meta?.env?.VITE_SUPABASE_URL !== 'undefined') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  if (typeof process?.env?.VITE_SUPABASE_URL !== 'undefined') {
    return {
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY
    };
  }
  
  if (typeof window?.CONFIG !== 'undefined') {
    return {
      url: window.CONFIG.SUPABASE_URL,
      key: window.CONFIG.SUPABASE_ANON_KEY
    };
  }
  
  throw new Error('Supabase credentials not found. Check .env or configuration.');
}

const credentials = getSupabaseCredentials();
const supabase = createClient(credentials.url, credentials.key);

// ============================================================================
// REGISTRATION FUNCTION
// ============================================================================
/**
 * Register a new user
 * 
 * FLOW:
 * 1. Check if user exists with created_by_admin = true
 *    → If yes: Complete registration as approved user
 * 2. If NOT pre-created by admin:
 *    → Create auth account
 *    → Insert into users table with "pending" status
 * 3. Return result with status message
 */

export async function registerUser(email, password, role) {
  try {
    // Validate inputs
    if (!email || !password || !role) {
      return {
        success: false,
        error: 'Email, password, and role are required'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters'
      };
    }

    // Validate role
    const validRoles = ['admin', 'doctor', 'patient'];
    if (!validRoles.includes(role.toLowerCase())) {
      return {
        success: false,
        error: 'Invalid role selected'
      };
    }

    // Check if user already exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Case 1: User already exists
    if (existingUser) {
      if (existingUser.created_by_admin && !existingUser.registered_at) {
        // User was pre-created by admin - proceed with registration
        
        // Create auth account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: password
        });

        if (authError) {
          // If user already exists in Auth, that's okay for pre-created users
          if (authError.message.includes('already registered')) {
            // Update user as registered and approved
            const { error: updateError } = await supabase
              .from('users')
              .update({
                registered_at: new Date().toISOString(),
                status: 'approved'
              })
              .eq('email', email.toLowerCase());

            if (updateError) throw updateError;

            return {
              success: true,
              message: 'Registration successful! You can now login.',
              email: email
            };
          }
          throw authError;
        }

        // Update user as registered and approved
        const { error: updateError } = await supabase
          .from('users')
          .update({
            registered_at: new Date().toISOString(),
            status: 'approved'
          })
          .eq('email', email.toLowerCase());

        if (updateError) throw updateError;

        return {
          success: true,
          message: 'Registration successful! You can now login.',
          email: email
        };
      } else {
        // User already registered
        return {
          success: false,
          error: 'Account with this email already exists'
        };
      }
    }

    // Case 2: User doesn't exist - create new account
    
    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password
    });

    if (authError) {
      throw authError;
    }

    // Insert into users table with pending status
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        role: role.toLowerCase(),
        status: 'pending',
        created_by_admin: false,
        registered_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    return {
      success: true,
      message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
      email: email,
      status: 'pending'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
}

// ============================================================================
// LOGIN FUNCTION
// ============================================================================
/**
 * Login user with email and password
 * 
 * FLOW:
 * 1. Authenticate with email/password
 * 2. Fetch user from database
 * 3. Check approval status:
 *    - pending: reject login
 *    - approved: allow login and return role
 * 4. Store session
 */

export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Fetch user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError) {
      // Sign out the user
      await supabase.auth.signOut();
      throw userError;
    }

    // Check approval status
    if (userData.status === 'pending') {
      // Sign out the user
      await supabase.auth.signOut();
      return {
        success: false,
        status: 'pending',
        error: 'Your account is pending admin approval. You will be notified once approved.'
      };
    }

    if (userData.status === 'rejected') {
      // Sign out the user
      await supabase.auth.signOut();
      return {
        success: false,
        status: 'rejected',
        error: 'Your account registration was rejected by the administrator.'
      };
    }

    // Login successful
    // Store user info in localStorage
    localStorage.setItem('medilink_user', JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      role: userData.role,
      status: userData.status
    }));

    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role,
        status: userData.status
      },
      redirectTo: getDashboardUrl(userData.role)
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

export async function getCurrentUser() {
  try {
    // Get session from Supabase Auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    // Fetch user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ============================================================================
// LOGOUT FUNCTION
// ============================================================================

export async function logoutUser() {
  try {
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    // Clear local storage
    localStorage.removeItem('medilink_user');
    localStorage.removeItem('medilink_session');

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message || 'Logout failed'
    };
  }
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get pending users (admin only)
 */
export async function getPendingUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      users: data || []
    };
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return {
      success: false,
      error: error.message,
      users: []
    };
  }
}

/**
 * Approve user (admin only)
 */
export async function approveUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'User approved successfully'
    };
  } catch (error) {
    console.error('Error approving user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reject user (admin only)
 */
export async function rejectUser(userId, reason = '') {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'User rejected successfully'
    };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get dashboard URL based on user role
 */
export function getDashboardUrl(role) {
  const roleMap = {
    admin: '/Admin/Admin_Dashboard.html',
    doctor: '/Doctor/Dashboard.html',
    patient: '/Patient/Patient%20Dashboard.html'
  };

  return roleMap[role.toLowerCase()] || '/';
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get user session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Verify user role from database (never trust frontend role)
 */
export async function verifyUserRole(email, expectedRole) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === expectedRole.toLowerCase();
  } catch (error) {
    console.error('Error verifying user role:', error);
    return false;
  }
}

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  getDashboardUrl,
  isAuthenticated,
  getSession,
  verifyUserRole
};
