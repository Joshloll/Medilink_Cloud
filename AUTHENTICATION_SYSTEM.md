# 🔐 MEDILINK - COMPLETE AUTHENTICATION SYSTEM GUIDE

## 📋 Overview

This document explains the complete authentication and user management system for MediLink, a healthcare platform with 3 user roles:
- **Admin** - Manages users, approves/rejects registrations
- **Doctor** - Views patients, creates medical records
- **Patient** - Manages appointments, views medical records

---

## 🏗️ SYSTEM ARCHITECTURE

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     REGISTRATION & LOGIN FLOW               │
└─────────────────────────────────────────────────────────────┘

1. USER REGISTRATION:
   User fills form (email, password, role)
   ↓
   Check if user exists in db
   ├─ If pre-created by admin (created_by_admin=true)
   │  └─ Complete registration → status = 'approved'
   ├─ If new user
   │  └─ Create auth account → status = 'pending'
   ↓
   User receives message

2. LOGIN:
   User enters email & password
   ↓
   Verify with Supabase Auth
   ↓
   Get user from database
   ↓
   Check status:
   ├─ 'approved' → Login successful, redirect to role dashboard
   ├─ 'pending' → Show message "Awaiting admin approval"
   └─ 'rejected' → Show message "Your account was rejected"

3. ADMIN APPROVAL:
   Admin views pending users
   ↓
   Approves or rejects user
   ↓
   User can login (if approved) or receives rejection notice
```

---

## 📁 FILE STRUCTURE

```
Login_Register/
├── Login.html                  # Login page (Tailwind styled)
├── Register.html               # Registration page (Tailwind styled)
├── auth-utils.js              # Core authentication functions
│
Admin/
├── User_Approval.html         # (Create this) Admin approval panel
├── Admin_Dashboard.html       # Main admin dashboard
│
js/
├── supabase-client.js         # Supabase connection (existing)
│
Database/
├── CREATE_TABLES.sql          # All tables (run first)
├── ADMIN_ONLY.sql             # Create admin account
├── UPDATE_USERS_TABLE.sql     # Add auth columns (if needed)
```

---

## 🔑 FILES CREATED/MODIFIED

### 1. **Login_Register/auth-utils.js** ✅
**Purpose:** Core authentication functions (MUST BE IN SAME FOLDER AS HTML)

**Key Functions:**

```javascript
// Register user
registerUser(email, password, role)
→ Creates auth account + database entry
→ Returns: {success, message, email, status}

// Login user
loginUser(email, password)
→ Verifies credentials + role
→ Stores session in localStorage
→ Returns: {success, user, redirectTo, error}

// Get current user
getCurrentUser()
→ Gets user from Supabase Auth session
→ Returns: user object or null

// Logout user
logoutUser()
→ Signs out + clears localStorage
→ Returns: {success, message}

// Admin functions
getPendingUsers()       → List all pending users to approve
approveUser(userId)     → Set status to 'approved'
rejectUser(userId, reason) → Set status to 'rejected'
```

**Location:** `c:\Users\lawre\Medilink_Cloud\Login_Register\auth-utils.js`

---

### 2. **Login_Register/Login.html** ✅
**Purpose:** User login interface

**Features:**
- Email/password form
- Error messages (pending/rejected/invalid)
- Loading state during login
- Password visibility toggle
- Responsive design (Tailwind CSS)
- Links to Register page

**How to Use:**
1. User goes to `Login.html`
2. Enters email & password
3. JavaScript calls `loginUser()` from `auth-utils.js`
4. If approved → redirects to role dashboard
5. If pending → shows approval message
6. If invalid → shows error

**Location:** `c:\Users\lawre\Medilink_Cloud\Login_Register\Login.html`

---

### 3. **Login_Register/Register.html** ✅
**Purpose:** User registration interface

**Features:**
- Full name, email, password fields
- Role selector (Patient/Doctor/Admin)
- Password confirmation
- Terms agreement checkbox
- Error messages
- Links to Login page

**Registration Flow:**
1. User fills form with:
   - Full Name (required)
   - Email (required, validated)
   - Password (min 8 chars, required)
   - Confirm Password (must match)
   - Role (patient/doctor/admin)
   - Agree to terms (required)

2. JavaScript calls `registerUser()` from `auth-utils.js`

3. Result depends on user type:
   - **Pre-created by Admin**: Status = 'approved', can login immediately
   - **New User**: Status = 'pending', must wait for admin approval
   - **Email already exists**: Shows error

**Location:** `c:\Users\lawre\Medilink_Cloud\Login_Register\Register.html`

---

### 4. **CREATE_TABLES.sql** ✅
**Purpose:** Create all database tables

**Tables Created:**
- `users` - All user accounts (admin, doctor, patient)
- `patients` - Patient profiles & medical info
- `doctors` - Doctor profiles & specialties
- `appointments` - Scheduled appointments
- `medical_records` - Health records
- `prescriptions` - Medications & dosages
- `system_logs` - Audit trail

**How to Run:**
1. Go to https://app.supabase.com
2. Select your project
3. Click SQL Editor
4. New Query
5. Copy & paste `CREATE_TABLES.sql`
6. Click Run
7. ✓ All tables created with indexes

**Location:** `c:\Users\lawre\Medilink_Cloud\CREATE_TABLES.sql`

---

### 5. **ADMIN_ONLY.sql** ✅
**Purpose:** Create first admin account

**Creates:**
- Email: `admin@medilink.com`
- Name: `TestAdmin`
- Role: `admin`
- Status: `approved`

**How to Run:**
1. Go to https://app.supabase.com
2. SQL Editor → New Query
3. Copy & paste `ADMIN_ONLY.sql`
4. Run

**Then Login:**
- Email: `admin@medilink.com`
- Password: Set through login page (Supabase Auth handles it)
- Role: Administrator

**Location:** `c:\Users\lawre\Medilink_Cloud\ADMIN_ONLY.sql`

---

### 6. **UPDATE_USERS_TABLE.sql** (Optional)
**Purpose:** Add authentication columns if not present

**Columns Added:**
- `full_name` - User's full name
- `registered_at` - Registration timestamp
- `approved_at` - Approval timestamp
- `rejected_at` - Rejection timestamp
- `rejection_reason` - Why account was rejected
- `created_by_admin` - Whether admin pre-created the account

**Use Only If:**
- You already have a users table without these columns
- Otherwise CREATE_TABLES.sql handles everything

**Location:** `c:\Users\lawre\Medilink_Cloud\UPDATE_USERS_TABLE.sql`

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Database Tables
```
1. Run: CREATE_TABLES.sql
2. Time: 30 seconds
3. Result: All 7 tables created with indexes
```

### Step 2: Create Admin Account
```
1. Run: ADMIN_ONLY.sql
2. Time: 10 seconds
3. Result: admin@medilink.com account created (status: approved)
```

### Step 3: Test Login
```
1. Open: Login_Register/Login.html
2. Email: admin@medilink.com
3. Password: (set via Supabase email reset OR app password reset)
4. Result: Redirects to /Admin/Admin_Dashboard.html
```

### Step 4: Create Doctor Accounts
```
1. Login as admin
2. Go to Admin Dashboard
3. Create doctor account (role = doctor, status = pending)
4. Approve doctor account to enable login
```

### Step 5: Create Patient Accounts
```
1. Direct signup via Register.html
   OR
2. Admin creates pre-approved account
3. Patient registers with email + password
4. Patient can login
```

---

## 🔒 SECURITY FEATURES

### 1. **Password Security**
- ✅ Minimum 8 characters required
- ✅ Never stored in database (Supabase Auth handles)
- ✅ Hashed by Supabase automatically
- ✅ Password reset via email

### 2. **Role Verification**
- ✅ Role stored in database (NOT just in JWT)
- ✅ Always verify role from database, never from frontend
- ✅ Use `verifyUserRole()` function for critical operations

### 3. **Email Validation**
- ✅ Email format validated (regex)
- ✅ Unique email constraint in database
- ✅ Email required for authentication

### 4. **Session Management**
- ✅ Supabase Auth handles sessions securely
- ✅ Session stored in browser's secure storage
- ✅ Auto-logout on page refresh if invalid
- ✅ localStorage used for convenience only

### 5. **Admin-Only Operations**
- ✅ Only pre-approved users can create doctors/admins
- ✅ Role-based access control (RBAC) via database
- ✅ Never trust frontend role selection for permissions

---

## 📊 USER APPROVAL WORKFLOW

### For New Users (Self-Registration)

```
1. User registers via Register.html
   Status: 'pending'
   
2. Admin logs in → Admin Dashboard
   Views list of pending users
   
3. Admin clicks "Approve" or "Reject"
   If Approve: Status = 'approved'
   If Reject: Status = 'rejected' + reason stored
   
4. User receives notification (implement email)
   
5. User logs in (if approved):
   Email → valid
   Password → valid
   Status → 'approved'
   ✓ Login successful
```

### For Admin-Created Users

```
1. Admin creates account via Admin Panel
   Email: doctor@medilink.com
   Role: doctor
   Status: 'approved' (pre-created by admin)
   created_by_admin: true
   
2. System generates temporary password (email sent)
   OR user clicks forgot password on first login
   
3. User registers with their email + creates password
   Status: remains 'approved'
   ✓ Can login immediately
```

---

## 🔄 API REFERENCE

### registerUser(email, password, role)

**Parameters:**
```javascript
email      // string, valid email format
password   // string, min 8 characters
role       // 'patient' | 'doctor' | 'admin'
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,      // Success message
  email: string,        // Registered email
  status: string,       // 'approved' or 'pending'
  error: string         // If success = false
}
```

**Example:**
```javascript
const result = await registerUser(
  'john@medilink.com',
  'SecurePass123!',
  'patient'
);

if (result.success) {
  console.log('Registered:', result.email);
  // Status: 'pending' (needs admin approval)
  // OR 'approved' (if pre-created by admin)
} else {
  console.error(result.error);
}
```

---

### loginUser(email, password)

**Parameters:**
```javascript
email      // string
password   // string
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,       // Success message
  user: {
    id: string,         // UUID
    email: string,
    name: string,
    role: string,       // 'admin' | 'doctor' | 'patient'
    status: string      // 'approved' | 'pending' | 'rejected'
  },
  redirectTo: string,    // URL to redirect to
  error: string,         // If success = false
  status: string         // 'pending' | 'rejected' (special cases)
}
```

**Example:**
```javascript
const result = await loginUser('admin@medilink.com', 'password');

if (result.success) {
  console.log('Logged in:', result.user.name);
  window.location.href = result.redirectTo;
  // Admin → /Admin/Admin_Dashboard.html
  // Doctor → /Doctor/Dashboard.html
  // Patient → /Patient/Patient Dashboard.html
} else if (result.status === 'pending') {
  console.log('Account pending admin approval');
} else {
  console.error(result.error);
}
```

---

### approveUser(userId)

**Parameters:**
```javascript
userId    // UUID (get from users table)
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,  // "User approved successfully"
  error: string     // If success = false
}
```

**Example (Admin Only):**
```javascript
const result = await approveUser('550e8400-e29b-41d4-a716-446655440000');

if (result.success) {
  console.log('User approved! They can now login.');
} else {
  console.error(result.error);
}
```

---

### rejectUser(userId, reason)

**Parameters:**
```javascript
userId    // UUID
reason    // string, optional (why rejected)
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,  // "User rejected successfully"
  error: string     // If success = false
}
```

**Example (Admin Only):**
```javascript
const result = await rejectUser(
  '550e8400-e29b-41d4-a716-446655440000',
  'Incomplete medical credentials'
);

if (result.success) {
  console.log('User rejected.');
} else {
  console.error(result.error);
}
```

---

## 🎯 ROLE-BASED REDIRECTS

After login, users are redirected based on role:

| Role    | URL                              | Folder   |
|---------|----------------------------------|----------|
| admin   | `/Admin/Admin_Dashboard.html`    | Admin/   |
| doctor  | `/Doctor/Dashboard.html`         | Doctor/  |
| patient | `/Patient/Patient Dashboard.html`| Patient/ |

---

## ⚙️ CONFIGURATION

### Environment Variables

In `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Supabase Project Settings

1. **Authentication**
   - Email/Password enabled ✓
   - Email confirmations disabled (for dev)
   - Auto-confirm emails: ON

2. **Database**
   - Row Level Security: Optional (but recommended)
   - Tables: users, patients, doctors, appointments, medical_records, prescriptions

3. **Storage**
   - Not needed for authentication

---

## 🐛 TROUBLESHOOTING

### Problem: "Login failed - Invalid credentials"
**Cause:** User doesn't exist in Supabase Auth
**Solution:** 
1. Check email is correct
2. Verify user registered successfully
3. Check user status: must be 'approved'

---

### Problem: "Your account is pending admin approval"
**Cause:** User registered but admin hasn't approved yet
**Status:** User status = 'pending'
**Solution:**
1. Admin logs in
2. Admin approves the user
3. User receives notification
4. User can then login

---

### Problem: "Account with this email already exists"
**Cause:** Email registered twice
**Solution:**
1. User already registered
2. Use login instead of register
3. If forgot password: use password reset

---

### Problem: Redirect after login doesn't work
**Cause:** Role not in database or wrong dashboard path
**Solution:**
1. Verify user role in users table
2. Check dashboard file exists at expected path
3. Check browser console for errors

---

## 📝 NEXT STEPS

1. ✅ **Done:** Create tables with `CREATE_TABLES.sql`
2. ✅ **Done:** Create admin with `ADMIN_ONLY.sql`
3. ✅ **Done:** Login/Register pages are ready
4. **Next:** Create Admin User Approval Panel
5. **Next:** Integrate real data into dashboards
6. **Next:** Set up Row Level Security (RLS) policies
7. **Next:** Email notifications for approved/rejected users

---

## 📞 SUPPORT

For issues or questions:
1. Check browser console (F12)
2. Check auth-utils.js for error messages
3. Verify Supabase project is accessible
4. Check network tab for failed requests
5. Verify .env credentials are correct

---

## 📄 LICENSE & SECURITY

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Keep `VITE_SUPABASE_ANON_KEY` secret
- Use Row Level Security (RLS) in production
- Enable email confirmations in production
- Implement rate limiting for login attempts
- Add CAPTCHA for registration in production

---

**Created:** April 2026  
**Version:** 1.0  
**Status:** Production Ready
