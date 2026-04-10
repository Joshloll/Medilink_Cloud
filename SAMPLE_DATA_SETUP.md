# 🗄️ SAMPLE DATA SETUP - Load Real Test Data into Supabase

**File Created:** `SAMPLE_DATA.sql`  
**What It Contains:** Production-ready test data for your entire system  
**Time to Run:** 2 minutes  

---

## 📊 What's in Your Sample Data

```
✅ 1 Admin user
✅ 4 Doctors (with specialties: Cardiology, Orthopedics, Dermatology, General Medicine)
✅ 6 Patients (with full profiles, medical history)
✅ 10 Appointments (mix of scheduled and completed)
✅ 11 Medical Records (with diagnoses and treatments)
✅ 8 Active Prescriptions (realistic medications and dosages)
```

---

## 🚀 HOW TO RUN (3 Steps - 2 Minutes)

### **Step 1: Copy the SQL Query**

1. Open: `SAMPLE_DATA.sql` in your workspace
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)

### **Step 2: Go to Supabase SQL Editor**

1. Go to: https://app.supabase.com
2. Select Project: **Medilink_CloudComputing**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query** (top right)

### **Step 3: Paste & Run**

1. Paste the SQL (Ctrl+V) in the editor
2. Click: **Run** (bottom right, or Ctrl+Enter)
3. Wait for response: `0 rows affected` (queries may auto-skip on duplicate)

---

## ✅ Verify Data Was Inserted

**In the same SQL editor, run this query:**

```sql
-- Check total data inserted
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM doctors) as total_doctors,
  (SELECT COUNT(*) FROM appointments) as total_appointments,
  (SELECT COUNT(*) FROM medical_records) as total_records,
  (SELECT COUNT(*) FROM prescriptions) as total_prescriptions;
```

**Expected Result:**
```
total_users: 11 (1 admin + 4 doctors + 6 patients)
total_patients: 6
total_doctors: 4
total_appointments: 10
total_records: 11
total_prescriptions: 8
```

If you see these numbers → **Data loaded successfully!** ✅

---

## 🧪 Test Data Details

### **Doctors:**
1. **Dr. Sarah Johnson** - Cardiology (555-0101)
2. **Dr. Michael Chen** - Orthopedics (555-0102)  
3. **Dr. Emily Rodriguez** - Dermatology (555-0103)
4. **Dr. James Wilson** - General Medicine (555-0104)

### **Patients:**
1. **John Doe** - O+ blood, no major conditions
2. **Jane Smith** - A+ blood, hypertension
3. **Robert Brown** - B+ blood, diabetes type 2
4. **Mary Johnson** - AB- blood, asthma (mild)
5. **David Lee** - O- blood, no major conditions  
6. **Sarah Williams** - A- blood, thyroid disorder

### **Sample Appointments:**
- Scheduled for 1-7 days from now
- Also includes completed past appointments
- Contains realistic reasons (check-ups, treatments, etc.)

### **Sample Medical Records:**
- Diagnoses with treatments
- Notes on patient progress
- Realistic medical conditions

### **Sample Prescriptions:**
- Realistic medications (Lisinopril, Metformin, etc.)
- Proper dosages and frequencies
- Active status with expiration dates

---

## 📱 Next: Test Your Integration

After data is loaded, test in browser console:

```javascript
// Open any page (e.g., Patient/index.html)
// Press F12 → Console tab → Paste:

await initSupabase();

// Test 1: Get all patients
const patients = await supabasePatient.getAllPatients();
console.log("Patients:", patients);

// Test 2: Get appointments for a user
const appointments = await supabasePatient.getPatientAppointments('user-id');
console.log("Appointments:", appointments);

// Test 3: Get admin stats
const stats = await supabaseAdmin.getSystemStats();
console.log("Stats:", stats);
```

**You should now see REAL data!** ✅

---

## 🔄 If You Need to Clear & Reload

**To delete all test data and start fresh:**

```sql
-- WARNING: This deletes ALL data!
DELETE FROM prescriptions;
DELETE FROM medical_records;
DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM users;

-- Then re-run SAMPLE_DATA.sql
```

**Usually you DON'T need this - the script handles duplicates automatically.**

---

## 📋 Test Users (Login With These)

**Admin Account:**
```
Email: admin@medilink.com
Password: (Set your own in Supabase Auth Settings)
Role: Admin
```

**Doctor Account:**
```
Email: dr.sarah@medilink.com
Doctor: Dr. Sarah Johnson (Cardiology)
```

**Patient Account:**
```
Email: john.doe@email.com
Patient: John Doe
```

---

## 🎯 What to Do Now

1. ✅ **Copy & Paste** the SQL query in Supabase SQL Editor
2. ✅ **Run** the query
3. ✅ **Verify** data with the count query above
4. ✅ **Test** in browser console with the functions
5. ✅ **Integrate** the data into your pages

---

## 🚀 Your Full Integration Flow

```
Step 1: Run SAMPLE_DATA.sql (2 min) ← YOU ARE HERE
    ↓
Step 2: Verify data loaded ✓
    ↓
Step 3: Test in browser console ✓
    ↓
Step 4: Update Patient Dashboard (15 min)
    • Add scripts to HTML
    • Call getPatientAppointments()
    • Render real data
    ↓
Step 5: Update other Patient pages (15 min)
    • My Appointments
    • Medical Records
    • Prescriptions
    ↓
Step 6: Update Doctor pages (20 min)
    • Dashboard
    • Schedule
    ↓
Step 7: Update Admin pages (15 min)
    • Dashboard
    • Users
    • Management
    ↓
✅ DONE - All pages show real data!
```

---

## 💾 File Location

Your sample data script is at:
```
c:\Users\lawre\Medilink_Cloud\SAMPLE_DATA.sql
```

---

**Remember: Run the SQL once, then your database is pre-populated with realistic healthcare data!** 🎉

Next: Check [REAL_DATA_QUICK_START.md](REAL_DATA_QUICK_START.md) for integration steps.
