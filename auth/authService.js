// Authentication Service - Role-based Authentication and Approval System
class AuthService {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        // Load any existing session
        this.loadSession();
    }

    // Load users from localStorage or initialize with mock data
    loadUsers() {
        const storedUsers = localStorage.getItem('medilink_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }

        // Initialize with some pre-registered users (createdByAdmin = true)
        const initialUsers = [
            {
                id: "1",
                email: "admin@medilink.com",
                role: "admin",
                status: "approved",
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                name: "System Administrator"
            },
            {
                id: "2", 
                email: "doctor1@medilink.com",
                role: "doctor",
                status: "approved",
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                name: "Dr. Sarah Johnson",
                specialty: "Cardiology"
            },
            {
                id: "3",
                email: "doctor2@medilink.com", 
                role: "doctor",
                status: "approved",
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                name: "Dr. Michael Chen",
                specialty: "Pediatrics"
            },
            {
                id: "4",
                email: "patient1@medilink.com",
                role: "patient", 
                status: "approved",
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                name: "John Doe"
            },
            {
                id: "5",
                email: "patient2@medilink.com",
                role: "patient",
                status: "approved", 
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                name: "Jane Smith"
            }
        ];

        this.saveUsers(initialUsers);
        return initialUsers;
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem('medilink_users', JSON.stringify(users));
        this.users = users;
    }

    // Registration Logic
    async registerUser(email, role, additionalData = {}) {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if email exists
            const existingUser = this.users.find(user => user.email.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                if (existingUser.createdByAdmin) {
                    // Pre-registered by admin - auto approve
                    existingUser.status = "approved";
                    existingUser.name = additionalData.name || existingUser.name;
                    existingUser.phone = additionalData.phone || existingUser.phone;
                    this.saveUsers(this.users);
                    
                    return {
                        success: true,
                        message: "Account activated successfully! You can now log in.",
                        user: existingUser
                    };
                } else {
                    // Already registered by user
                    return {
                        success: false,
                        message: "An account with this email already exists."
                    };
                }
            }

            // Create new user (pending approval)
            const newUser = {
                id: Date.now().toString(),
                email: email.toLowerCase(),
                role: role,
                status: "pending",
                createdByAdmin: false,
                createdAt: new Date().toISOString(),
                ...additionalData
            };

            this.users.push(newUser);
            this.saveUsers(this.users);

            return {
                success: true,
                message: "Registration successful! Your account is pending admin approval. You'll be notified when approved.",
                user: newUser
            };

        } catch (error) {
            return {
                success: false,
                message: "Registration failed. Please try again."
            };
        }
    }

    // Login Logic
    async loginUser(email, password = null) {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const user = this.users.find(user => user.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return {
                    success: false,
                    message: "User not found. Please check your email or register for an account."
                };
            }

            if (user.status === "pending") {
                return {
                    success: false,
                    message: "Your account is pending admin approval. Please wait for approval notification."
                };
            }

            if (user.status === "rejected") {
                return {
                    success: false,
                    message: "Your registration has been rejected. Please contact support."
                };
            }

            if (user.status === "approved") {
                // Set current user and session
                this.currentUser = user;
                this.saveSession(user);

                return {
                    success: true,
                    message: "Login successful!",
                    user: user,
                    redirectUrl: this.getRedirectUrl(user.role)
                };
            }

            return {
                success: false,
                message: "Account status unknown. Please contact support."
            };

        } catch (error) {
            return {
                success: false,
                message: "Login failed. Please try again."
            };
        }
    }

    // Admin Approval Functions
    async approveUser(userId) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            const user = this.users.find(user => user.id === userId);
            if (!user) {
                return { success: false, message: "User not found" };
            }

            user.status = "approved";
            user.approvedAt = new Date().toISOString();
            this.saveUsers(this.users);

            return { 
                success: true, 
                message: `User ${user.email} has been approved`,
                user: user 
            };

        } catch (error) {
            return { success: false, message: "Failed to approve user" };
        }
    }

    async rejectUser(userId) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                return { success: false, message: "User not found" };
            }

            const user = this.users[userIndex];
            
            // Option 1: Remove user completely
            this.users.splice(userIndex, 1);
            
            // Option 2: Mark as rejected (uncomment if you prefer this)
            // this.users[userIndex].status = "rejected";
            // this.users[userIndex].rejectedAt = new Date().toISOString();

            this.saveUsers(this.users);

            return { 
                success: true, 
                message: `User ${user.email} has been rejected`
            };

        } catch (error) {
            return { success: false, message: "Failed to reject user" };
        }
    }

    // Get pending users for admin
    getPendingUsers() {
        return this.users.filter(user => user.status === "pending");
    }

    // Get all users for admin
    getAllUsers() {
        return this.users;
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

    // Session Management
    saveSession(user) {
        const session = {
            user: user,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem('medilink_session', JSON.stringify(session));
    }

    loadSession() {
        const sessionData = localStorage.getItem('medilink_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                // Check if session is still valid
                if (new Date(session.expiresAt) > new Date()) {
                    this.currentUser = session.user;
                    return session.user;
                } else {
                    // Session expired
                    this.logout();
                }
            } catch (error) {
                console.error('Failed to load session:', error);
                this.logout();
            }
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('medilink_session');
        window.location.href = '../Login_Register/Login.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check user role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Check if user is doctor
    isDoctor() {
        return this.hasRole('doctor');
    }

    // Check if user is patient
    isPatient() {
        return this.hasRole('patient');
    }

    // Pre-register users (admin function)
    async preRegisterUser(email, role, additionalData = {}) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            // Check if user already exists
            const existingUser = this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                return { success: false, message: "User already exists" };
            }

            const newUser = {
                id: Date.now().toString(),
                email: email.toLowerCase(),
                role: role,
                status: "approved", // Pre-registered users are auto-approved
                createdByAdmin: true,
                createdAt: new Date().toISOString(),
                ...additionalData
            };

            this.users.push(newUser);
            this.saveUsers(this.users);

            return { 
                success: true, 
                message: `User ${email} has been pre-registered and approved`,
                user: newUser 
            };

        } catch (error) {
            return { success: false, message: "Failed to pre-register user" };
        }
    }

    // Get user statistics
    getUserStats() {
        const stats = {
            total: this.users.length,
            approved: this.users.filter(u => u.status === 'approved').length,
            pending: this.users.filter(u => u.status === 'pending').length,
            rejected: this.users.filter(u => u.status === 'rejected').length,
            byRole: {
                admin: this.users.filter(u => u.role === 'admin').length,
                doctor: this.users.filter(u => u.role === 'doctor').length,
                patient: this.users.filter(u => u.role === 'patient').length
            }
        };
        return stats;
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
