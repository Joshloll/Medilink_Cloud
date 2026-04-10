/**
 * ============================================================================
 * MEDILINK AUTHENTICATION SERVICE
 * ============================================================================
 * Complete authentication flow with role-based access control
 * Integrates with Supabase for secure user management
 * ============================================================================
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================================================
// SUPABASE INITIALIZATION
// ============================================================================

function getSupabaseCredentials() {
  if (!window.CONFIG || !window.CONFIG.SUPABASE_URL) {
    throw new Error('❌ Supabase credentials not found. Add config.js with your credentials.');
  }
  return {
    url: window.CONFIG.SUPABASE_URL,
    key: window.CONFIG.SUPABASE_ANON_KEY
  };
}

const creds = getSupabaseCredentials();
export const supabase = createClient(creds.url, creds.key);

// ============================================================================
// AUTH STATE MANAGEMENT
// ============================================================================

export const authState = {
  user: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
};

// ============================================================================
// REGISTER USER
// ============================================================================
/**
 * Register a new user with Supabase Auth
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} role - 'patient', 'doctor', or 'admin'
 * @param {object} userData - Additional user data (firstName, lastName, etc.)
 * @returns {object} {success, user, error}
 */
export async function registerUser(email, password, role, userData = {}) {
  try {
    authState.isLoading = true;

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role } // Store role in auth metadata
      }
    });

    if (authError) throw authError;

    const { user } = authData;

    // Step 2: Create user profile in database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email,
        role,
        status: 'pending', // Admin must approve
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        avatar: userData.avatar || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;

    authState.isLoading = false;
    return {
      success: true,
      user,
      message: 'Registration successful! Waiting for admin approval.'
    };
  } catch (error) {
    authState.isLoading = false;
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
}

// ============================================================================
// LOGIN USER
// ============================================================================
/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} {success, user, profile, role, error}
 */
export async function loginUser(email, password) {
  try {
    authState.isLoading = true;

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    const { user } = authData;

    // Step 2: Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Step 3: Check if user is approved
    if (profile.status === 'pending') {
      authState.isLoading = false;
      throw new Error('Your account is pending admin approval');
    }

    if (profile.status === 'rejected') {
      authState.isLoading = false;
      throw new Error('Your account has been rejected');
    }

    // Step 4: Update auth state
    authState.user = user;
    authState.profile = profile;
    authState.role = profile.role;
    authState.isAuthenticated = true;

    // Step 5: Store session info
    sessionStorage.setItem('medilink_user', JSON.stringify(user));
    sessionStorage.setItem('medilink_role', profile.role);

    authState.isLoading = false;

    return {
      success: true,
      user,
      profile,
      role: profile.role
    };
  } catch (error) {
    authState.isLoading = false;
    return {
      success: false,
      error: error.message || 'Login failed'
    };
  }
}

// ============================================================================
// LOGOUT USER
// ============================================================================

export async function logoutUser() {
  try {
    authState.isLoading = true;

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear auth state
    authState.user = null;
    authState.profile = null;
    authState.role = null;
    authState.isAuthenticated = false;

    // Clear session storage
    sessionStorage.removeItem('medilink_user');
    sessionStorage.removeItem('medilink_role');

    authState.isLoading = false;

    return { success: true };
  } catch (error) {
    authState.isLoading = false;
    return {
      success: false,
      error: error.message || 'Logout failed'
    };
  }
}

// ============================================================================
// RESTORE SESSION
// ============================================================================
/**
 * Restore user session from Supabase Auth
 */
export async function restoreSession() {
  try {
    authState.isLoading = true;

    // Check if user is logged in
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!session) {
      authState.isLoading = false;
      return { success: false, authenticated: false };
    }

    const { user } = session;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Update auth state
    authState.user = user;
    authState.profile = profile;
    authState.role = profile.role;
    authState.isAuthenticated = true;

    authState.isLoading = false;

    return {
      success: true,
      authenticated: true,
      user,
      role: profile.role
    };
  } catch (error) {
    authState.isLoading = false;
    return {
      success: false,
      authenticated: false,
      error: error.message
    };
  }
}

// ============================================================================
// ADMIN: APPROVE USER
// ============================================================================

export async function approveUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (error) throw error;

    return { success: true, message: 'User approved' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ADMIN: REJECT USER
// ============================================================================

export async function rejectUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'rejected' })
      .eq('id', userId);

    if (error) throw error;

    return { success: true, message: 'User rejected' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// FETCH PENDING USERS (for Admin)
// ============================================================================

export async function getPendingUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, users: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// FETCH ALL USERS (for Admin)
// ============================================================================

export async function getAllUsers(role = null) {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, users: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CHECK AUTHENTICATION STATUS
// ============================================================================

export function isAuthenticated() {
  return authState.isAuthenticated;
}

export function getCurrentUser() {
  return authState.user;
}

export function getCurrentRole() {
  return authState.role;
}

export function getCurrentProfile() {
  return authState.profile;
}
