# Supabase Integration Guide for MediLink Healthcare System

## Overview

This guide walks you through integrating Supabase (PostgreSQL backend) with the MediLink Healthcare System, replacing the in-memory mock data with a real database.

---

## Step 1: Set Up Supabase Project

### 1.1 Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **Sign Up**
3. Create account using email or GitHub

### 1.2 Create a New Project
1. Click **New Project** in the Supabase Dashboard
2. Fill in project details:
   - **Name**: `medilink-healthcare`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to you
3. Click **Create New Project** (wait 5-10 minutes for initialization)

### 1.3 Get Your Credentials
Once project is ready:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: (`anon` key under `Your API keys`)

---

## Step 2: Set Up Database Schema

### 2.1 Run SQL Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase-schema.sql` (provided)
4. Paste into SQL editor
5. Click **Run**
6. Confirm all tables created successfully

### 2.2 Verify Tables
In Supabase Dashboard, go to **Table Editor** and verify these tables exist:
- ✅ `users`
- ✅ `doctors`
- ✅ `patients`
- ✅ `appointments`
- ✅ `medical_records`
- ✅ `prescriptions`
- ✅ `system_logs`

---

## Step 3: Update Your Application

### 3.1 Add Supabase to HTML
In your main `index.html` (or starting page), add this before the closing `</body>`:

```html
<!-- Supabase JS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- MediLink Scripts (in this order) -->
<script src="js/supabase-client.js"></script>
<script src="js/state.js"></script>
<script src="js/app.js"></script>
```

### 3.2 Update supabase-client.js with Credentials
1. Open `js/supabase-client.js`
2. Find lines 3-4:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

3. Replace with your actual credentials:
```javascript
const SUPABASE_URL = 'https://abc123def456.supabase.co';  // Your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';    // Your anon key
```

### 3.3 Initialize Supabase in app.js
At the top of `js/app.js`, add initialization:

```javascript
// At the very beginning of app.js
let currentUser = null;

// Initialize application
async function initializeApp() {
  // Initialize Supabase
  await window.initSupabase();
  
  // Try to restore session
  const user = await window.supabaseAuth.getCurrentUser();
  if (user) {
    currentUser = user;
    renderApp();
  } else {
    renderAuthScreen();
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## Step 4: Update Authentication Module

Replace `js/modules/auth.js` with:

```javascript
// Authentication Module - Using Supabase

async function handleLogin(email, password) {
  try {
    // Show loading state
    const loginBtn = event.target.closest('button');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    // Call Supabase login
    const result = await window.supabaseAuth.loginUser(email, password);

    if (!result.success) {
      showToast(result.error, 'error');
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
      return;
    }

    // Login successful
    currentUser = result.user;
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    showToast(`Welcome, ${result.user.full_name}!`, 'success');
    
    // Redirect based on role
    setTimeout(() => renderApp(), 500);
  } catch (error) {
    showToast('Login failed: ' + error.message, 'error');
  }
}

async function handleRegister(email, fullName, password, role) {
  try {
    const registerBtn = event.target.closest('button');
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';

    const result = await window.supabaseAuth.registerUser(email, fullName, role);

    if (!result.success) {
      showToast(result.error, 'error');
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create Account';
      return;
    }

    showToast('Account created! Awaiting admin approval.', 'success');
    renderAuthScreen();
  } catch (error) {
    showToast('Registration failed: ' + error.message, 'error');
  }
}

async function handleLogout() {
  const result = await window.supabaseAuth.logoutUser();
  
  if (result.success) {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    renderAuthScreen();
  }
}

function renderAuthScreen() {
  // Your existing auth HTML/CSS
  // Updated to call handleLogin(), handleRegister(), handleLogout()
  // with Supabase functions
}
```

---

## Step 5: Update Admin Module

Replace relevant parts of `js/modules/admin.js`:

```javascript
// Admin Module - Using Supabase

async function renderPendingUsersList() {
  try {
    const result = await window.supabaseAdmin.getPendingUsers();
    
    if (!result.success) {
      showToast('Failed to load pending users', 'error');
      return;
    }

    const container = document.getElementById('pendingUsersList');
    container.innerHTML = '';

    if (result.users.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <span class="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
          <p class="text-slate-600 dark:text-slate-400 mt-2">No pending approvals</p>
        </div>
      `;
      return;
    }

    result.users.forEach(user => {
      const userCard = createPendingUserCard(user);
      container.appendChild(userCard);
    });
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

function createPendingUserCard(user) {
  const div = document.createElement('div');
  div.className = 'bg-white dark:bg-[#1a2632] p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between';
  div.innerHTML = `
    <div>
      <p class="font-semibold text-slate-900 dark:text-white">${user.full_name}</p>
      <p class="text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
      <span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        ${user.role}
      </span>
    </div>
    <div class="flex gap-2">
      <button onclick="approveUserAdmin('${user.id}')" class="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
        Approve
      </button>
      <button onclick="rejectUserAdmin('${user.id}')" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
        Reject
      </button>
    </div>
  `;
  return div;
}

async function approveUserAdmin(userId) {
  try {
    const result = await window.supabaseAdmin.approveUser(userId);
    
    if (result.success) {
      showToast('User approved successfully', 'success');
      renderPendingUsersList();
      loadSystemStats();
    } else {
      showToast('Failed to approve user', 'error');
    }
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

async function rejectUserAdmin(userId) {
  try {
    const result = await window.supabaseAdmin.rejectUser(userId);
    
    if (result.success) {
      showToast('User rejected', 'success');
      renderPendingUsersList();
      loadSystemStats();
    } else {
      showToast('Failed to reject user', 'error');
    }
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

async function loadSystemStats() {
  try {
    const result = await window.supabaseAdmin.getSystemStats();
    
    if (!result.success) {
      showToast('Failed to load statistics', 'error');
      return;
    }

    // Update UI with real data
    document.getElementById('totalPatients').textContent = result.stats.totalPatients;
    document.getElementById('totalDoctors').textContent = result.stats.totalDoctors;
    document.getElementById('totalAppointments').textContent = result.stats.totalAppointments;
    document.getElementById('pendingApprovals').textContent = result.stats.pendingApprovals;
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}
```

---

## Step 6: Update Patient & Doctor Modules

### Patient Module Example:
```javascript
// js/modules/patient.js

async function loadPatientAppointments() {
  try {
    const result = await window.supabasePatient.getPatientAppointments(currentUser.id);
    
    if (!result.success) {
      showToast('Failed to load appointments', 'error');
      return;
    }

    const container = document.getElementById('appointmentsList');
    container.innerHTML = '';

    if (result.appointments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <span class="material-symbols-outlined text-4xl text-slate-300">calendar</span>
          <p class="text-slate-600 dark:text-slate-400 mt-2">No appointments</p>
        </div>
      `;
      return;
    }

    result.appointments.forEach(apt => {
      const card = createAppointmentCard(apt);
      container.appendChild(card);
    });
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

async function bookAppointment(doctorId, date, time, type, notes) {
  try {
    const appointmentData = {
      appointment_date: date,
      appointment_time: time,
      appointment_type: type,
      notes: notes
    };

    const result = await window.supabasePatient.bookAppointment(
      currentUser.id,
      doctorId,
      appointmentData
    );

    if (result.success) {
      showToast('Appointment booked successfully!', 'success');
      loadPatientAppointments();
    } else {
      showToast('Failed to book appointment: ' + result.error, 'error');
    }
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}
```

### Doctor Module Example:
```javascript
// js/modules/doctor.js

async function loadDoctorAppointments() {
  try {
    const result = await window.supabaseDoctor.getDoctorAppointments(currentUser.id);
    
    if (!result.success) {
      showToast('Failed to load appointments', 'error');
      return;
    }

    const container = document.getElementById('appointmentsList');
    renderAppointmentsList(result.appointments, container);
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    const result = await window.supabaseDoctor.updateAppointmentStatus(
      appointmentId,
      newStatus
    );

    if (result.success) {
      showToast(`Appointment marked as ${newStatus}`, 'success');
      loadDoctorAppointments();
    } else {
      showToast('Failed to update appointment', 'error');
    }
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}
```

---

## Step 7: Enable Row Level Security (RLS) Policies

In Supabase **SQL Editor**, run:

```sql
-- Set up RLS policies for data security

-- Patients can only see their own appointments
CREATE POLICY "Users can only see own data"
ON appointments FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
  OR
  doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  )
);

-- Update similar policies for other tables
-- This ensures data privacy by role
```

---

## Step 8: Test the Integration

### 8.1 Test Authentication
1. Open your application
2. Try **Register** → Fill details → Submit
3. Go to Supabase dashboard → view `users` table
4. Should see new user with `status: 'pending'`
5. As admin, **Approve** the user
6. Try **Login** with new credentials
7. Should redirect to appropriate dashboard

### 8.2 Test Data Operations
1. As admin: Create appointments, users
2. As doctor: View appointments, update status
3. As patient: Book appointments, view records
4. Check Supabase tables to verify data was created

### 8.3 Monitor Database
In Supabase:
- Go **Database** → select table
- Click **Realtime** to see live changes
- Click **Logs** to see all queries

---

## Step 9: Set Environment Variables (Optional but Recommended)

Create `.env` file in project root:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Update `supabase-client.js` to read from env:
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';
```

---

## Troubleshooting

### Issue: "Supabase library not loaded"
**Solution**: Add CDN script to HTML before supabase-client.js

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Issue: "Invalid credentials"
**Solution**: 
- Copy URL and key exactly from Supabase API settings
- No extra spaces or characters
- Use the **anon** key, not the **service_role** key

### Issue: "User not found after login"
**Solution**:
- Check `users` table in Supabase
- Verify user `status` is 'approved' or 'pending' (not 'rejected')
- Ensure `created_by_admin` is correctly set

### Issue: Row Level Security (RLS) blocking queries
**Solution**:
- Go to Supabase → Authentication → Users & Roles
- Set `anon` role to have SELECT/INSERT/UPDATE on tables
- Or adjust RLS policies

### Issue: "CORS blocked"
**Solution**:
- Supabase automatically handles CORS
- If blocked, go to Supabase Settings → API → CORS configuration
- Add your domain

---

## Next Steps

1. ✅ **Implement Real-time Updates** - Use Supabase subscriptions for live data
2. ✅ **Add File Storage** - Use Supabase Storage for patient documents
3. ✅ **Email Notifications** - Set up Supabase Functions for appointment reminders
4. ✅ **Analytics** - Track user behavior in Supabase dashboards
5. ✅ **Backup Strategy** - Enable automated backups in Supabase

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## Support

For issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console errors (F12)
3. Review RLS policies in Supabase
4. Verify credentials are correct

Good luck with your MediLink deployment! 🚀
