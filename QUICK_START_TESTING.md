# MediLink Cloud - Quick Start & Testing Guide

## 🎯 **Quick Setup (5 minutes)**

### **Prerequisites**
- Browser (Chrome, Firefox, Safari, Edge)
- Supabase account (free at supabase.com)
- Database already created with tables

### **Step 1: Execute Database SQL** (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Copy & paste entire content of **`CREATE_TABLES.sql`**
5. Click **"Run"**
6. Wait for completion (should see 7 tables created)

### **Step 2: Create Admin User** (1 minute)

In SQL Editor, copy & paste and run:

```sql
-- Create admin user in users table
INSERT INTO users (email, full_name, role, status, phone, created_at, approved_at)
VALUES ('admin@medilink.com', 'TestAdmin', 'admin', 'approved', NULL, NOW(), NOW());

-- Create doctor profile for admin
INSERT INTO doctors (user_id, specialty, license_number, availability_status, created_at)
SELECT id, 'Administrator', 'ADMIN-001', 'online', NOW()
FROM users WHERE email = 'admin@medilink.com'
LIMIT 1;
```

### **Step 3: Set Admin Password** (1 minute)

1. Go to Supabase **Authentication** → **Users**
2. Find `admin@medilink.com`
3. Click the user row
4. Click **"Reset Password"**
5. Check email for reset link
6. Set a new password (e.g., `Admin123!`)

### **Step 4: Start Dev Server** (1 minute)

```bash
cd /path/to/Medilink_Cloud
npm run dev
```

Browser should open to `http://localhost:5173`

---

## 🧪 **Testing Scenarios (Step-by-Step)**

### **Test 1: Admin Login & Dashboard** ⏱️ ~5 minutes

**Goal:** Verify admin can login and see dashboard

**Steps:**
1. Go to `http://localhost:5173/Login_Register/Login.html`
2. Enter:
   - Email: `admin@medilink.com`
   - Password: (the one you set in Step 3)
3. Click **"Secure Login"**
4. Should redirect to `/Admin/Admin_Dashboard.html`
5. **Verify you see:**
   - Welcome message with "TestAdmin"
   - 4 stat cards (TotalPatients, Appointments, PendingApprovals, CompletedMonth)
   - Doctor list (might be empty)
   - Pending users (should be empty initially)

**✅ Success Criteria:**
- Login successful
- Dashboard loads with stats
- No errors in console (F12 → Console tab)

---

### **Test 2: Register Patient & Get Approval** ⏱️ ~3 minutes

**Goal:** Create a patient account and have admin approve it

**Steps - Register as Patient:**
1. Go to `http://localhost:5173/Login_Register/Register.html`
2. Fill out:
   - Full Name: `John Patient`
   - Email: `patient@medilink.com`
   - Password: `Patient123!`
   - Confirm: `Patient123!`
   - Role: **SELECT "Patient"** (click the patient radio button)
3. Check terms checkbox
4. Click **"Create Account"**
5. Should see: "Registration successful! Your account is pending admin approval."
6. Redirects to Login page

**Steps - Admin Approves Patient:**
1. Stay logged in as admin OR Login again as admin
2. Go to `/Admin/Admin_Dashboard.html`
3. Look for **"Pending Users"** section
4. Should see `John Patient` with their email
5. Click the **✓ (checkmark) button** to approve
6. Should see success notification
7. User should disappear from pending list

**✅ Success Criteria:**
- Patient registration succeeds
- User appears in pending list
- Approval button works
- Patient disappears after approval

---

### **Test 3: Patient Login & Book Appointment** ⏱️ ~5 minutes

**Goal:** Patient logs in and books an appointment

**Steps - Patient Login:**
1. Go to `http://localhost:5173/Login_Register/Login.html`
2. Enter:
   - Email: `patient@medilink.com`
   - Password: `Patient123!`
3. Click **"Secure Login"**
4. Should redirect to `/Patient/index.html`
5. **Verify you see:**
   - Welcome: "Welcome, John Patient!"
   - 4 stat cards
   - Tab navigation (My Appointments, Find Doctors, etc.)

**Steps - Book Appointment:**
1. Click **"Book Appointment"** button (in header or appointments tab)
2. Modal dialog opens with form
3. **"Find Doctors"** tab first to see available doctors:
   - Click "Find Doctors" tab
   - Should see available doctors (might be empty initially)
   - If available, can click "Book Now"
4. **Actually booking** (use dropdown):
   - Modal should still be open
   - Select doctor from "Select Doctor" dropdown
     *(If dropdown is empty, no doctors available yet - skip to Test 5)*
   - Enter Date: `2026-04-15`
   - Enter Time: `10:00`
   - Enter Reason: `General Checkup`
5. Click **"Book Appointment"**
6. Should see success notification
7. Modal closes
8. Appointment should appear in "My Appointments" list

**✅ Success Criteria:**
- Patient can login
- Dashboard shows patient name
- Book appointment modal opens
- Appointment booking succeeds
- Appointment appears in list

---

### **Test 4: Register Doctor & Get Approval** ⏱️ ~3 minutes

**Goal:** Create a doctor account and have admin approve it

**Steps - Register as Doctor:**
1. In a new tab, go to `http://localhost:5173/Login_Register/Register.html`
2. Fill out:
   - Full Name: `Dr. Sarah Johnson`
   - Email: `doctor@medilink.com`
   - Password: `Doctor123!`
   - Confirm: `Doctor123!`
   - Role: **SELECT "Doctor"** (click the doctor radio button)
3. Check terms
4. Click **"Create Account"**
5. Should redirect to Login page

**Steps - Admin Approves Doctor:**
1. Login as admin again (or use existing tab if still logged in)
2. Go to Admin Dashboard
3. Find `Dr. Sarah Johnson` in Pending Users
4. Click **✓ button** to approve

**✅ Success Criteria:**
- Doctor registration succeeds
- Doctor appears in pending list
- Admin can approve doctor

---

### **Test 5: Doctor Login & View Dashboard** ⏱️ ~5 minutes

**Goal:** Doctor logs in and sees their dashboard

**Steps:**
1. Go to `http://localhost:5173/Login_Register/Login.html`
2. Enter:
   - Email: `doctor@medilink.com`
   - Password: `Doctor123!`
3. Click **"Secure Login"**
4. Should redirect to `/Doctor/Dashboard.html`
5. **Verify you see:**
   - Welcome: "Welcome back, Dr. Sarah Johnson!"
   - 4 stat cards (Today's Appointments, Total Patients, Pending Prescriptions, Completed)
   - Tab navigation (Appointments, Patients, Medical Records)
   - All four tabs accessible

**Explore Tabs:**
- **Appointments:** Should be empty (no appointments scheduled yet) or show bookings
- **Patients:** Should be empty initially (no completed appointments yet)
- **Medical Records:** Form to create records for patients

**✅ Success Criteria:**
- Doctor can login
- Dashboard loads with correct data
- All tabs accessible
- No errors in console

---

### **Test 6: Complete Appointment Flow** ⏱️ ~5 minutes

**Goal:** Full appointment lifecycle (book → view → complete → see result)

**Prerequisites:** Patient and Doctor must exist and be approved

**Steps:**

1. **Patient Books Appointment with Doctor:**
   - Login as patient
   - Go to "Find Doctors" tab
   - Find "Dr. Sarah Johnson"
   - Click "Book Now"
   - Fill: Date, Time, Reason
   - Click "Book Appointment"
   - ✅ See success notification

2. **Doctor Views Appointment:**
   - Login as doctor
   - Go to Appointments tab
   - Should see: Patient name, date, time, reason
   - Each appointment has:
     - Status badge (blue = "scheduled")
     - ✓ Check button (to mark complete)

3. **Doctor Marks Appointment Complete:**
   - Click the green ✓ button
   - Should see: "Appointment marked as completed"
   - Refresh page
   - Status should change to "completed" (green badge)

4. **Patient Sees Updated Appointment:**
   - Login as patient
   - Go to Appointments tab
   - Appointment should show status "completed" (green badge)
   - No cancel button (already completed)

5. **Admin Sees All Appointments:**
   - Login as admin
   - Check stats: "Total Appointments" count increased

**✅ Success Criteria:**
- All users can see appointment data
- Status updates correctly
- Notifications work
- Data persists after refresh

---

### **Test 7: Medical Records** ⏱️ ~3 minutes

**Goal:** Doctor creates medical record, patient views it

**Steps - Doctor Creates Record:**
1. Login as doctor
2. Go to "Medical Records" tab
3. Select patient from dropdown (e.g., "John Patient")
4. Enter:
   - Diagnosis: `Hypertension Stage 1`
   - Treatment: `Prescribed Lisinopril 10mg daily, lifestyle modifications`
5. Click **"Create Record"**
6. Should see: "Medical record created"

**Steps - Patient Views Record:**
1. Login as patient
2. Go to "Medical Records" tab
3. Should see the record with:
   - Diagnosis
   - Treatment
   - Doctor name
   - Date created

**✅ Success Criteria:**
- Doctor can create record
- Patient can see record
- Data displays correctly

---

### **Test 8: Error Handling** ⏱️ ~2 minutes

**Goal:** Verify error messages work

**Test Cases:**
1. **Wrong Password:** Login with wrong password → Should see error
2. **Unregistered Email:** Try to login with email that doesn't exist → Should see error
3. **Missing Fields:** Try to register without full name → Should see validation error
4. **Book without selecting doctor:** Click book without selecting doctor → Should see "Please select a doctor"
5. **Access Protected Page:** Try to access `/Doctor/Dashboard.html` while logged in as patient → Should redirect

**✅ Success Criteria:**
- Error messages are clear
- System redirects appropriately
- No crashes or blank screens

---

## 📋 **Test Checklist**

Print or copy this checklist and mark off as you test:

```
TEST SUITE: MediLink Cloud System Validation

[ ] Test 1: Admin Login & Dashboard
    [ ] Admin can login
    [ ] Dashboard displays stats
    [ ] No console errors

[ ] Test 2: Patient Registration & Approval
    [ ] Patient can register
    [ ] Appears in pending list
    [ ] Admin can approve

[ ] Test 3: Patient Login & Booking
    [ ] Patient can login
    [ ] Sees correct name
    [ ] Can book appointment

[ ] Test 4: Doctor Registration & Approval
    [ ] Doctor can register
    [ ] Admin can approve
    [ ] Doctor appears in system

[ ] Test 5: Doctor Dashboard
    [ ] Doctor can login
    [ ] Dashboard shows stats
    [ ] All tabs accessible

[ ] Test 6: Complete Appointment Flow
    [ ] Patient books appointment
    [ ] Doctor sees appointment
    [ ] Doctor marks complete
    [ ] Status updates
    [ ] Patient sees updated status

[ ] Test 7: Medical Records
    [ ] Doctor can create record
    [ ] Patient can view record
    [ ] Data displays correctly

[ ] Test 8: Error Handling
    [ ] Wrong password shows error
    [ ] Missing fields validated
    [ ] Inappropriate access redirected

[ ] SYSTEM VERIFICATION:
    [ ] No console errors (F12)
    [ ] All buttons responsive
    [ ] Data persists on refresh
    [ ] Dark mode works
    [ ] Mobile responsive
```

---

## 🐛 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| "Access Denied" on login | Make sure tables are created (Step 1) |
| "Account Pending" message | Admin hasn't approved yet - use admin dashboard |
| Button doesn't work | Check console (F12 → Console) for errors |
| No doctors in list | Register a doctor and get admin approval first |
| Data not updating | Refresh page (Ctrl+R) or close/open dashboard |
| Can't find email in Auth | Make sure registration completed; might need 2-3 seconds |
| Modal won't close | Try clicking Cancel button or refreshing |

---

## 🎓 **Understanding the System**

### **File Structure:**
```
Medilink_Cloud/
├── Login_Register/
│   ├── Login.html (Entry point)
│   └── Register.html (User creation)
├── Admin/
│   ├── Admin_Dashboard.html (Admin UI)
│   └── admin-service.js (Admin backend)
├── Doctor/
│   ├── Dashboard.html (Doctor UI)
│   └── services/doctor-service.js (Doctor backend)
├── Patient/
│   ├── index.html (Patient UI)
│   └── services/patient-service.js (Patient backend)
└── auth/
    └── auth-utils.js (Authentication)
```

### **How Data Flows:**
```
User Action in UI
    ↓
JavaScript Function (e.g., bookAppointment)
    ↓
Service Module Function (e.g., patient-service.js)
    ↓
Supabase Database Update
    ↓
Response Returned
    ↓
UI Updated with Result
    ↓
Success/Error Notification
```

---

## ✨ **What's Working**

- ✅ Multi-role authentication (Admin/Doctor/Patient)
- ✅ Real-time Supabase integration
- ✅ Appointment booking system
- ✅ Medical records management
- ✅ Prescription tracking
- ✅ User approval workflow
- ✅ Dashboard statistics
- ✅ Activity logging
- ✅ Error handling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Mobile friendly

---

## 🚀 **Next Steps After Testing**

1. **Verify all tests pass**
2. **Create multiple test accounts** (different roles)
3. **Test edge cases** (cancel appointments, etc.)
4. **Check mobile responsiveness**
5. **Review console for warnings** (F12 → Console)
6. **Prepare for production deployment**

---

## 📞 **Need Help?**

- Check `DEPLOYMENT_GUIDE.md` for setup issues
- Check `SYSTEM_IMPLEMENTATION_SUMMARY.md` for architecture
- Check browser console (F12) for specific errors
- Review service files for function documentation

---

**🎉 Your system is ready to test! Follow these scenarios to validate everything works correctly.**
