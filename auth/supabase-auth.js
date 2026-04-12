// Unified Supabase Authentication System
// This replaces the localStorage-based authService.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Get Supabase Configuration
function getSupabaseConfig() {
    // Method 1: Window CONFIG object
    if (typeof window !== 'undefined' && window.CONFIG) {
        return {
            url: window.CONFIG.SUPABASE_URL,
            key: window.CONFIG.SUPABASE_ANON_KEY
        };
    }
    
    // Method 2: Import meta env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (url && key) return { url, key };
    }
    
    // Fallback
    return {
        url: 'https://your-project.supabase.co',
        key: 'your-anon-key'
    };
}

const config = getSupabaseConfig();
const SUPABASE_URL = config.url;
const SUPABASE_ANON_KEY = config.key;

class SupabaseAuthService {
    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check for existing session
        await this.checkExistingSession();
        
        // Set up auth state listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.handleAuthChange(session);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
    }

    async checkExistingSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (session) {
                await this.handleAuthChange({ session });
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }

    async handleAuthChange(authData) {
        if (!authData?.session?.user) {
            this.currentUser = null;
            return;
        }

        try {
            // Get user profile from database
            const { data: userProfile, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', authData.session.user.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                this.currentUser = null;
                return;
            }

            this.currentUser = userProfile;
            
            // Redirect if on login/register page
            if (window.location.pathname.includes('Login.html') || 
                window.location.pathname.includes('Register.html')) {
                const redirectUrl = this.getRedirectUrl(userProfile.role);
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error('Error handling auth change:', error);
        }
    }

    handleSignOut() {
        this.currentUser = null;
        if (!window.location.pathname.includes('Login.html')) {
            window.location.href = '../Login_Register/Login.html';
        }
    }

    // Registration
    async registerUser(email, password, fullName, role = 'patient', additionalData = {}) {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, role }
                }
            });

            if (authError) throw authError;

            // 2. Create user profile in database
            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    role,
                    status: role === 'admin' ? 'approved' : 'pending',
                    created_by_admin: false,
                    ...additionalData
                })
                .select()
                .single();

            if (userError) throw userError;

            // 3. Create role-specific profile
            if (role === 'doctor') {
                await this.supabase
                    .from('doctors')
                    .insert({
                        user_id: authData.user.id,
                        license_number: additionalData.license_number || '',
                        specialization: additionalData.specialization || '',
                        ...additionalData
                    });
            } else if (role === 'patient') {
                await this.supabase
                    .from('patients')
                    .insert({
                        user_id: authData.user.id,
                        ...additionalData
                    });
            }

            return { 
                success: true, 
                user: userData, 
                message: role === 'admin' ? 
                    'Registration successful! You can now log in.' :
                    'Registration successful! Your account is pending admin approval.' 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Login
    async loginUser(email, password) {
        try {
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // Get user profile to check status
            const { data: userProfile, error: userError } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (userError) throw userError;

            // Check approval status
            if (userProfile.status === 'pending') {
                await this.supabase.auth.signOut();
                return { success: false, error: 'Your account is pending admin approval.' };
            }

            if (userProfile.status === 'rejected') {
                await this.supabase.auth.signOut();
                return { success: false, error: 'Your registration has been rejected.' };
            }

            this.currentUser = userProfile;

            return { 
                success: true, 
                user: userProfile,
                redirectUrl: this.getRedirectUrl(userProfile.role)
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            window.location.href = '../Login_Register/Login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Role checks
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isDoctor() {
        return this.hasRole('doctor');
    }

    isPatient() {
        return this.hasRole('patient');
    }

    // Get redirect URL based on role
    getRedirectUrl(role) {
        const redirectUrls = {
            admin: '../Admin/Admin_Dashboard.html',
            doctor: '../Doctor/Dashboard.html',
            patient: '../Patient/index.html'
        };
        return redirectUrls[role] || '../Login_Register/Login.html';
    }

    // Admin functions
    async approveUser(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({ 
                    status: 'approved', 
                    approved_at: new Date().toISOString() 
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, user: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async rejectUser(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({ status: 'rejected' })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, user: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPendingUsers() {
        try {
            const { data, error } = await this.supabase
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

    async getAllUsers() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, users: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create user by admin
    async createUserByAdmin(email, password, fullName, role, additionalData = {}) {
        try {
            const result = await this.registerUser(email, password, fullName, role, {
                ...additionalData,
                created_by_admin: true
            });

            if (result.success && role !== 'admin') {
                // Auto-approve if created by admin
                await this.approveUser(result.user.id);
            }

            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get Supabase client for other operations
    getSupabaseClient() {
        return this.supabase;
    }
}

// Create and export singleton
const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;

// Make available globally
window.supabaseAuthService = supabaseAuthService;
