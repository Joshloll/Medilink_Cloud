# MEDILINK REFACTORING - COMPLETE CODE EXAMPLES & INTEGRATION GUIDE

> **Ready-to-Use Code Snippets for Immediate Integration**

---

## 📖 TABLE OF CONTENTS

1. [HTML Integration](#html-integration)
2. [Script Linking](#script-linking) 
3. [Clickable Element Examples](#clickable-element-examples)
4. [Complete Page Template](#complete-page-template)
5. [Common Workflows](#common-workflows)
6. [Troubleshooting](#troubleshooting)

---

## HTML INTEGRATION

### Step 1: Link Global Scripts

In the `<head>` of your HTML pages, add **BEFORE</head>**:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... existing head content ... -->
  
  <!-- ⭐ ADD THESE LINES ⭐ -->
  <!-- Global Styles & Animations -->
  <link rel="stylesheet" href="../css/global-styles.css">
  
  <!-- Global Event Handler (ES6 Module) -->
  <script type="module" src="../js/global-event-handler.js"></script>
  
  <!-- Universal Form Handler -->
  <script type="module" src="../js/form-handler.js"></script>
  
  <!-- ⭐ END NEW ADDITIONS ⭐ -->
</head>
<body>
  <!-- ... your page content ... -->
</body>
</html>
```

### Step 2: Add Data Attributes to Buttons

```html
<!-- Example 1: Simple Action Button -->
<button data-action="approve-user" data-id="user_123">
  Approve
</button>

<!-- Example 2: Button with Icon -->
<button data-action="logout" class="btn btn-primary">
  <span class="material-symbols-outlined">logout</span>
  Sign Out
</button>

<!-- Example 3: Danger Button (async) -->
<button data-action="delete-user" data-id="user_456" class="btn btn-danger">
  Delete User
</button>

<!-- Example 4: Icon-only Button -->
<button data-action="view-notifications" title="Notifications">
  <span class="material-symbols-outlined">notifications</span>
</button>
```

---

## SCRIPT LINKING

### For Admin Module

```html
<head>
  <!-- ... other scripts ... -->
  <link rel="stylesheet" href="../css/global-styles.css">
  <script type="module" src="../js/global-event-handler.js"></script>
  <script type="module" src="../js/form-handler.js"></script>
  <script type="module" src="./admin-actions.js"></script>
</head>
```

### For Doctor Module  

```html
<head>
  <!-- ... other scripts ... -->
  <link rel="stylesheet" href="../css/global-styles.css">
  <script type="module" src="../js/global-event-handler.js"></script>
  <script type="module" src="../js/form-handler.js"></script>
  <script type="module" src="./doctor-actions.js"></script>
</head>
```

### For Patient Module

```html
<head>
  <!-- ... other scripts ... -->
  <link rel="stylesheet" href="../css/global-styles.css">
  <script type="module" src="../js/global-event-handler.js"></script>
  <script type="module" src="../js/form-handler.js"></script>
  <script type="module" src="./patient-actions.js"></script>
</head>
```

---

## CLICKABLE ELEMENT EXAMPLES

### Admin Module - Common Buttons

```html
<!-- ADMIN PANEL - Pending Users -->
<div class="pending-users-widget">
  <div class="user-card">
    <h4>John Patient</h4>
    <p>john@example.com</p>
    <div class="actions">
      <!-- ✅ Approve User -->
      <button data-action="approve-user" data-id="user_john_001" class="btn-success">
        <span class="material-symbols-outlined">check_circle</span>
        Approve
      </button>
      
      <!-- ✅ Reject User -->
      <button data-action="reject-user" data-id="user_john_001" class="btn-danger">
        <span class="material-symbols-outlined">cancel</span>
        Reject
      </button>
      
      <!-- ✅ View Details -->
      <button data-action="view-user-details" data-id="user_john_001" class="btn-secondary">
        <span class="material-symbols-outlined">info</span>
      </button>
    </div>
  </div>
</div>

<!-- ADMIN PANEL - Action Buttons -->
<div class="admin-actions">
  <!-- ✅ Create User -->
  <button data-action="create-user" class="btn-primary">
    <span class="material-symbols-outlined">person_add</span>
    Create User
  </button>
  
  <!-- ✅ Create Appointment -->
  <button data-action="create-appointment" class="btn-primary">
    <span class="material-symbols-outlined">add_event</span>
    New Appointment
  </button>
  
  <!-- ✅ Toggle Dark Mode -->
  <button data-action="toggle-dark-mode" class="btn-secondary">
    <span class="material-symbols-outlined">dark_mode</span>
  </button>
  
  <!-- ✅ Logout -->
  <button data-action="logout" class="btn-danger">
    <span class="material-symbols-outlined">logout</span>
    Sign Out
  </button>
</div>
```

### Doctor Module - Appointment Actions

```html
<!-- DOCTOR PANEL - Appointments List -->
<table class="appointments-list">
  <thead>
    <tr>
      <th>Patient</th>
      <th>Date</th>
      <th>Time</th>
      <th>Reason</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jane Smith</td>
      <td>2026-04-15</td>
      <td>10:30 AM</td>
      <td>Regular Checkup</td>
      <td>
        <!-- ✅ Mark Complete -->
        <button data-action="mark-appointment-complete" data-id="apt_001" 
                class="btn-success" title="Complete Appointment">
          <span class="material-symbols-outlined">check</span>
        </button>
        
        <!-- ✅ Reschedule -->
        <button data-action="reschedule-appointment" data-id="apt_001" 
                class="btn-secondary" title="Reschedule">
          <span class="material-symbols-outlined">edit_calendar</span>
        </button>
        
        <!-- ✅ Cancel -->
        <button data-action="cancel-appointment-doctor" data-id="apt_001" 
                class="btn-danger" title="Cancel">
          <span class="material-symbols-outlined">close</span>
        </button>
      </td>
    </tr>
  </tbody>
</table>

<!-- DOCTOR PANEL - Patient Actions -->
<div class="patient-actions" data-patient-id="patient_001">
  <!-- ✅ Create Medical Record -->
  <button data-action="create-medical-record" data-id="patient_001" class="btn-primary">
    <span class="material-symbols-outlined">add_notes</span>
    Add Medical Record
  </button>
  
  <!-- ✅ Create Prescription -->
  <button data-action="create-prescription" data-id="patient_001" class="btn-primary">
    <span class="material-symbols-outlined">prescription</span>
    Create Prescription
  </button>
  
  <!-- ✅ View Patient Details -->
  <button data-action="view-patient-details" data-id="patient_001" class="btn-secondary">
    <span class="material-symbols-outlined">person</span>
    View Patient
  </button>
</div>
```

### Patient Module - Appointment Booking

```html
<!-- PATIENT PANEL - My Appointments -->
<div class="appointments-container">
  <div class="section-header">
    <h3>My Appointments</h3>
    <!-- ✅ Book Appointment -->
    <button data-action="book-appointment" class="btn-primary">
      <span class="material-symbols-outlined">add_event</span>
      Book Appointment
    </button>
  </div>
  
  <!-- Appointment Card -->
  <div class="appointment-card" data-id="apt_patient_001">
    <div class="appointment-info">
      <h4>Dr. Smith - Cardiology</h4>
      <p>📅 April 15, 2026 @ 2:30 PM</p>
      <p>Reason: General Checkup</p>
    </div>
    <div class="appointment-actions">
      <!-- ✅ View Details -->
      <button data-action="view-appointment-patient" data-id="apt_patient_001" 
              class="btn-secondary">
        <span class="material-symbols-outlined">info</span>
        Details
      </button>
      
      <!-- ✅ Cancel -->
      <button data-action="cancel-appointment" data-id="apt_patient_001" 
              class="btn-danger">
        <span class="material-symbols-outlined">close</span>
        Cancel
      </button>
    </div>
  </div>
</div>

<!-- PATIENT PANEL - Find Doctors -->
<div class="doctors-section">
  <h3>Find Doctors</h3>
  <!-- ✅ Search Doctors -->
  <button data-action="find-doctors" class="btn-primary">
    <span class="material-symbols-outlined">search</span>
    Search Available Doctors
  </button>
</div>

<!-- PATIENT PANEL - Prescriptions -->
<div class="prescriptions-section">
  <h3>My Prescriptions</h3>
  <div class="prescription-card" data-id="rx_patient_001">
    <div class="rx-info">
      <h4>Lisinopril 10mg</h4>
      <p>Twice daily for 30 days</p>
    </div>
    <div class="rx-actions">
      <!-- ✅ View Prescription -->
      <button data-action="view-prescription" data-id="rx_patient_001" 
              class="btn-secondary">
        <span class="material-symbols-outlined">description</span>
        View
      </button>
      
      <!-- ✅ Request Refill -->
      <button data-action="request-prescription-refill" data-id="rx_patient_001" 
              class="btn-primary">
        <span class="material-symbols-outlined">refresh</span>
        Request Refill
      </button>
    </div>
  </div>
</div>
```

---

## COMPLETE PAGE TEMPLATE

### Admin Dashboard Template

```html
<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - MediLink</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  
  <!-- Material Icons -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  
  <!-- ⭐ GLOBAL STYLES ⭐ -->
  <link rel="stylesheet" href="../css/global-styles.css">
  
  <!-- ⭐ GLOBAL EVENT HANDLER ⭐ -->
  <script type="module" src="../js/global-event-handler.js"></script>
  <script type="module" src="../js/form-handler.js"></script>
</head>
<body class="bg-background-light dark:bg-background-dark">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold">MediLink Dashboard</h1>
    <div class="flex gap-2">
      <button data-action="toggle-dark-mode" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
        <span class="material-symbols-outlined">dark_mode</span>
      </button>
      <button data-action="logout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Sign Out
      </button>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="p-8">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-4">Welcome, Admin</h2>
      <button data-action="create-user" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Create User
      </button>
    </div>
    
    <!-- Pending Users -->
    <div class="bg-white dark:bg-slate-800 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-bold mb-4">Pending User Approvals</h3>
      <div id="pending-users" class="space-y-2">
        <!-- Pending users will be populated here -->
      </div>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
        <p class="text-3xl font-bold" id="stat-users">0</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400 text-sm">Total Doctors</p>
        <p class="text-3xl font-bold" id="stat-doctors">0</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400 text-sm">Total Patients</p>
        <p class="text-3xl font-bold" id="stat-patients">0</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400 text-sm">Today's Appointments</p>
        <p class="text-3xl font-bold" id="stat-appointments">0</p>
      </div>
    </div>
  </main>
  
  <!-- Notification Container (Auto-created by global handler) -->
  <!-- The global event handler will create #notification-container automatically -->
  
  <!-- Your existing scripts -->
  <script type="module" src="./admin-actions.js"></script>
</body>
</html>
```

---

## COMMON WORKFLOWS

### Workflow 1: Approve a User

```javascript
// HTML
<button data-action="approve-user" data-id="user_12345">
  Approve
</button>

// What happens automatically:
// 1. Click detected by global listener
// 2. Data extracted: action="approve-user", id="user_12345"
// 3. Global handler calls: handleAction("approve-user", "user_12345")
// 4. Function executed: approveUser("user_12345")
// 5. Supabase updated: UPDATE users SET status='approved'
// 6. Toast shown: "✓ User approved successfully"
// 7. Page reloads in 500ms to show updated data
```

### Workflow 2: Book Appointment (with Form)

```html
<!-- Patient clicks button -->
<button data-action="book-appointment">
  Book Appointment
</button>

<!-- Modal form appears with fields:
  - doctor_id (select dropdown)
  - appointment_date (date input)
  - appointment_time (time input)
  - reason (textarea)
-->

<!-- Form submitted automatically by form-handler.js -->
<!-- Validation checks all fields -->
<!-- Supabase INSERT to appointments table -->
<!-- Toast notification shows success/error -->
<!-- Modal closes, page reloads -->
```

### Workflow 3: View Details (Modal Info)

```javascript
// HTML
<button data-action="view-patient-details" data-id="patient_456">
  View Details
</button>

// What happens:
// 1. Global handler intercepts click
// 2. Calls: viewPatientDetails("patient_456")
// 3. Queries Supabase: SELECT * FROM patients WHERE id='patient_456'
// 4. Creates modal with patient info (name, email, phone, allergies, etc.)
// 5. Modal shows with close button
// 6. Date remains unchanged
```

---

## TROUBLESHOOTING

### Issue: Button doesn't work (nothing happens on click)

**Checklist:**
```
❌ data-action attribute missing?      → Add it
❌ Global event handler not linked?    → Add <script> tag
❌ Console errors?                     → Check F12 Console
❌ Button is inside form?              → May need form="button"
❌ z-index issue?                      → Check CSS
```

**Debug:**
```javascript
// Open browser console (F12)
// Add this to test:
document.addEventListener('click', (e) => {
  console.log('Clicked:', e.target);
  console.log('Data action:', e.target.dataset.action);
  console.log('Data id:', e.target.dataset.id);
});
```

### Issue: Form doesn't appear

**Checklist:**
```
❌ Global event handler linked?        → Check <script> tags
❌ css/global-styles.css linked?       → Check <link> tag
❌ Modal CSS z-index too low?          → Check CSS
❌ Body has overflow:hidden?           → Remove it
```

### Issue: Database not updating

**Checklist:**
```
❌ Supabase credentials configured?    → Check window.CONFIG
❌ Table name correct?                 → Check database
❌ Column names correct?               → Check database schema
❌ RLS policies enabled?               → Check Supabase dashboard
❌ User has permissions?               → Check user role
```

### Issue: Notification not showing

**Checklist:**
```
❌ global-styles.css linked?           → Check <link> tag
❌ Notification container created?     → Check HTML or auto-create
❌ Z-index issue?                      → Increase in CSS
❌ CSS animation disabled?             → Check prefers-reduced-motion
```

---

## 🚀 QUICK START

### 1. Add to Your Page Head

```html
<link rel="stylesheet" href="../css/global-styles.css">
<script type="module" src="../js/global-event-handler.js"></script>
<script type="module" src="../js/form-handler.js"></script>
```

### 2. Add data-action to Buttons

```html
<button data-action="approve-user" data-id="user_123">
  Approve
</button>
```

### 3. Test in Browser

```
1. Open page in browser
2. Click button
3. Check for notification (toast)
4. Check browser console (F12)
```

### 4. Verify Database

```
1. Open Supabase dashboard
2. Check table for updated data
3. Confirm timestamp and values
```

---

## ✅ VALIDATION CHECKLIST

Before deploying, verify:

- [ ] All script tags linked (3 scripts minimum)
- [ ] All CSS linked (1 stylesheet)
- [ ] data-action attributes added to all buttons
- [ ] data-id attributes present where needed
- [ ] No console errors (F12)
- [ ] Buttons respond to clicks
- [ ] Notifications appear
- [ ] Database updates happen
- [ ] Forms validate input
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Supabase credentials configured

---

## 📞 SUPPORT

### Common Questions

**Q: Do I need to modify the global event handler?**
A: Rarely. 95% of use cases are covered. Only add if you need new action types.

**Q: Can I use this with React/Vue?**
A: Yes! Use data-action to integrate with React state management.

**Q: How do I add new actions?**
A: See DEVELOPER_QUICK_REFERENCE.md for step-by-step guide.

**Q: What if my database schema is different?**
A: Modify the Supabase queries in the action functions to match your tables.

---

**Ready to get started? Copy the code examples above and start adding clickable elements to your pages!**
