# 🔌 DATABASE INTEGRATION SETUP - Step-by-Step

**Date:** April 10, 2026  
**Status:** Ready to integrate real data  
**Your Database:** Medilink_CloudComputing (Supabase)  

---

## ✅ BEFORE YOU START

- ✅ `.env` file has your Supabase credentials
- ✅ Supabase database is running
- ✅ You have `supabase-client.js` with all functions
- ✅ You have render functions ready

---

## 🚀 QUICK START (5 Minutes)

### **Step 1: Test Database Connection** (2 min)

Open any HTML page (e.g., `Patient/index.html`) in your browser:

1. Press `F12` (Developer Tools)
2. Go to **Console** tab
3. Paste this and run:

```javascript
// Test 1: Initialize Supabase
await initSupabase();

// Test 2: Try to get all patients (if any exist)
const result = await supabasePatient.getAllPatients();
console.log("Patients:", result);
```

**Expected Output:**
```
✓ Supabase client initialized successfully
Patients: { success: true, patients: [...] }
```

If you see this → Database is connected! ✅  
If not → Check [Troubleshooting](#troubleshooting) section

### **Step 2: Add Sample Data** (2 min)

Your database is empty. Add test data first:

Search for `SAMPLE_DATA.sql` in workspace or go to:
https://app.supabase.com → SQL Editor → Run the sample insert queries

OR manually add test data via Supabase dashboard.

### **Step 3: Verify Data Loads** (1 min)

Run the test again from Step 1 - you should now see real data:

```javascript
const result = await supabasePatient.getAllPatients();
console.log(result.patients); // Should show your test data!
```

---

## 📋 Integration Checklist (By Page)

### **Patient Module**

#### `Patient/index.html` (Dashboard)
- [ ] Add Supabase library in `<head>`
- [ ] Add `<script src="../js/supabase-client.js"></script>`
- [ ] Add `<script src="./dashboard-real-data-example.js"></script>` (or your own script)
- [ ] Update HTML IDs to match: `id="dashboard-stats"`, `id="appointments-list"`, etc.
- [ ] Test: Open page → Check F12 console for "Dashboard loaded successfully"

#### `Patient/My Appointments.html`
- [ ] Add Supabase library + client.js
- [ ] Call `getCurrentUser()` to get user ID
- [ ] Call `supabasePatient.getPatientAppointments(userId)`
- [ ] Render results with render functions
- [ ] Test with real appointments data

#### `Patient/Medical Records.html`
- [ ] Add Supabase library + client.js
- [ ] Call `supabasePatient.getPatientMedicalRecords(userId)`
- [ ] Render results
- [ ] Add ability to view full record details

#### `Patient/Prescriptions.html`
- [ ] Add Supabase library + client.js
- [ ] Call `supabasePatient.getPatientPrescriptions(userId)`
- [ ] Render results
- [ ] Filter by active/inactive

### **Doctor Module**

#### `Doctor/Dashboard.html`
- [ ] Add Supabase library + client.js
- [ ] Get current doctor user
- [ ] Call `supabaseDoctor.getDoctorAppointments(userId)`
- [ ] Display appointment stats
- [ ] Show recent appointments

#### `Doctor/Schedule.html`
- [ ] Load appointments with `supabaseDoctor.getDoctorAppointments()`
- [ ] Display in calendar/list view
- [ ] Add ability to update status
- [ ] Show patient details

#### `Doctor/Patients.html`
- [ ] Get doctor's patients
- [ ] Display as list
- [ ] Add filter by specialty

### **Admin Module**

#### `Admin/Admin_Dashboard.html`
- [ ] Add Supabase library + client.js
- [ ] Call `supabaseAdmin.getSystemStats()`
- [ ] Display: Total patients, doctors, appointments, pending users

#### `Admin/Admin_Users.html`
- [ ] Get pending users: `supabaseAdmin.getPendingUsers()`
- [ ] Show approval/rejection buttons
- [ ] Call `approveUser()` or `rejectUser()` on button click

#### `Admin/Admin_Patients.html`
- [ ] List all patients
- [ ] Add search/filter by name
- [ ] Show last appointment date

#### `Admin/Admin_Doctors.html`
- [ ] List all doctors
- [ ] Show specialty
- [ ] Show number of patients

---

## 💾 Sample Data Creation

### **Option 1: Add via Supabase Dashboard**

1. Go to https://app.supabase.com
2. Select your project: **Medilink_CloudComputing**
3. Go to: **Table Editor**
4. Select **users** table
5. Click **Insert Row**
6. Fill in:
   - email: test@example.com
   - full_name: Dr. John Smith
   - role: doctor
   - status: approved
7. Click **Save**

### **Option 2: Add via SQL Query**

In Supabase SQL Editor, run:

```sql
-- Add test user
INSERT INTO users (email, full_name, role, status, created_at)
VALUES 
  ('patient@example.com', 'John Patient', 'patient', 'approved', NOW()),
  ('doctor@example.com', 'Dr. Sarah Doctor', 'doctor', 'approved', NOW());

-- View inserted data
SELECT * FROM users;
```

---

## 🧪 Testing Each Function

### **Test Patient Functions**

```javascript
await initSupabase();

// Get all patients
const allPatients = await supabasePatient.getAllPatients();
console.log("All patients:", allPatients);

// Get specific patient
const patient = await supabasePatient.getPatientProfile("user-id-here");
console.log("Patient profile:", patient);

// Get appointments
const appointments = await supabasePatient.getPatientAppointments("user-id");
console.log("Appointments:", appointments);

// Get medical records
const records = await supabasePatient.getPatientMedicalRecords("user-id");
console.log("Records:", records);

// Get prescriptions
const prescriptions = await supabasePatient.getPatientPrescriptions("user-id");
console.log("Prescriptions:", prescriptions);
```

### **Test Doctor Functions**

```javascript
await initSupabase();

// Get doctor profile
const doctor = await supabaseDoctor.getDoctorProfile("user-id");
console.log("Doctor:", doctor);

// Get doctor appointments
const appointments = await supabaseDoctor.getDoctorAppointments("user-id");
console.log("Doctor appointments:", appointments);

// Create prescription
const rx = await supabaseDoctor.createPrescription("patient-id", "doctor-id", {
  medication: "Aspirin",
  dosage: "500mg",
  frequency: "2 times daily"
});
console.log("Created prescription:", rx);
```

### **Test Admin Functions**

```javascript
await initSupabase();

// Get stats
const stats = await supabaseAdmin.getSystemStats();
console.log("System stats:", stats);

// Get pending users
const pending = await supabaseAdmin.getPendingUsers();
console.log("Pending users:", pending);

// Approve user
const approved = await supabaseAdmin.approveUser("user-id");
console.log("Approved:", approved);
```

---

## 🐛 TROUBLESHOOTING

### Problem: "initSupabase is not defined"

**Solution:**
- Verify `<script src="../js/supabase-client.js"></script>` is in HTML
- Make sure it's BEFORE your page script
- Hard refresh browser: `Ctrl+Shift+R`

### Problem: "SUPABASE CONFIGURATION ERROR"

**Solution:**
- Check `.env` file exists
- Check it has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check values are correct (not placeholder text)
- Hard refresh browser

### Problem: "Fetch failed" or network error

**Solution:**
- Check internet connection
- Verify Supabase is online: https://status.supabase.com
- Check if your URL is correct in .env

### Problem: "Row-level security policy violated"

**Solution:**
- This is EXPECTED during initial testing
- You need to set up Row Level Security (RLS) policies
- See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) → Row Level Security section

### Problem: "No data returns" (empty results)

**Solution:**
- Add sample data first (see above)
- Verify data exists in Supabase dashboard
- Check if user ID matches

### Problem: Data loads but HTML doesn't update

**Solution:**
- Check console for JavaScript errors
- Verify HTML element IDs match your code
- Example: If code looks for `id="dashboard-stats"`, HTML must have that ID

```html
<!-- ✅ Correct -->
<div id="dashboard-stats"></div>

<!-- ❌ Wrong -->
<div id="stats"></div> <!-- Code won't find this -->
```

---

## 🎯 Integration Priority Order

**Week 1 (Quick wins - Frontend only):**
1. Patient Dashboard (simple, shows stats)
2. Patient Appointments (shows real appointments)
3. Patient Medical Records (display only)

**Week 2 (More complex):**
4. Doctor Dashboard
5. Doctor Appointments (with update status)
6. Doctor Add Records

**Week 3 (Admin functions):**
7. Admin Dashboard (show stats)
8. Admin Pending Users (approve/reject)
9. Admin View All Data

---

## 📊 Example: Patient Dashboard Integration

### **HTML Changes Needed:**

```html
<!-- Add Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>

<!-- Your container divs with specific IDs -->
<div id="dashboard-stats"></div>
<div id="appointments-list"></div>
<div id="medical-records"></div>
<div id="prescriptions-list"></div>

<!-- Your page script -->
<script src="./dashboard-real-data-example.js"></script>
```

### **JavaScript (Using provided example):**

Just use `dashboard-real-data-example.js` as-is or modify it for your HTML.

### **Test:**

1. Open `Patient/index.html` in browser
2. Press F12 → Console
3. Should see: `✓ Supabase client initialized successfully`
4. Dashboard should auto-fill with real data

---

## ✅ Success Indicators

- ✅ Console shows "Supabase client initialized successfully"
- ✅ No "Configuration Error" messages
- ✅ HTML divs populate with real data
- ✅ Data refreshes when you click refresh button
- ✅ No JavaScript errors in console
- ✅ Different data shows for different users

---

## 🚀 Next Phase: After Data Integration

Once all pages show real data:

1. **Set up Row Level Security (RLS)**
   - Ensures users only see their own data
   - See [SECURITY_GUIDE.md](SECURITY_GUIDE.md)

2. **Add CRUD Operations** (Create, Read, Update, Delete)
   - Users can create appointments
   - Doctors can update records
   - Admins can manage users

3. **Deploy to Production**
   - Push to Vercel/Netlify
   - Set environment variables
   - Monitor in production

---

**Ready to start? Open any Patient page and follow the integration checklist!** 🚀

For detailed example, see: `Patient/dashboard-real-data-example.js`
