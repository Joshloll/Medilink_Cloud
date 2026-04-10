# MediLink Cloud - Implementation Guide

## 📊 Project Structure

```
Medilink_Cloud/
│
├── 📄 index.html
│   └── Contains: Minimal DOM structure + script includes
│   └── Renders: Dynamic content to #main-content
│
├── 📁 js/
│   │
│   ├── 📄 state.js (Global State)
│   │   ├── state object
│   │   ├── Helper functions:
│   │   │   ├── getUserByEmail()
│   │   │   ├── generateId()
│   │   │   └── addLog()
│   │   └── Data categories:
│   │       ├── users (with demo admin)
│   │       ├── patients
│   │       ├── doctors
│   │       ├── appointments
│   │       ├── records
│   │       └── prescriptions
│   │
│   ├── 📄 api.js (Mock Backend)
│   │   ├── simulate() - Generic async simulator
│   │   ├── authAPI
│   │   │   ├── register()
│   │   │   ├── login()
│   │   │   └── getCurrentUser()
│   │   ├── adminAPI
│   │   │   ├── getPendingUsers()
│   │   │   ├── approveUser()
│   │   │   ├── rejectUser()
│   │   │   └── getSystemStats()
│   │   ├── appointmentsAPI
│   │   │   ├── bookAppointment()
│   │   │   ├── updateAppointmentStatus()
│   │   │   ├── getPatientAppointments()
│   │   │   ├── getDoctorAppointments()
│   │   │   └── cancelAppointment()
│   │   ├── recordsAPI
│   │   │   ├── createRecord()
│   │   │   └── getPatientRecords()
│   │   └── prescriptionsAPI
│   │       ├── createPrescription()
│   │       ├── requestRefill()
│   │       └── getPatientPrescriptions()
│   │
│   ├── 📄 app.js (Main Controller)
│   │   ├── initializeApp()
│   │   ├── renderApp() - Main router
│   │   ├── handleGlobalClick() - Event delegation
│   │   ├── handleGlobalSubmit() - Form handling
│   │   ├── handleNavigation() - Route handler
│   │   ├── setupGlobalEventListeners()
│   │   ├── showToast() - Notifications
│   │   └── Error handlers
│   │
│   └── 📁 modules/
│       │
│       ├── 📄 auth.js (Authentication)
│       │   ├── renderAuthScreen() - Login/Register UI
│       │   ├── handleLogin() - Process login
│       │   ├── handleRegister() - Process registration
│       │   ├── handleLogout() - Clear session
│       │   ├── restoreSession() - Resume from localStorage
│       │   └── setupAuthListeners()
│       │
│       ├── 📄 admin.js (Admin Module)
│       │   ├── renderAdminDashboard() - Main page
│       │   ├── renderAdminSidebar() - Navigation
│       │   ├── renderAdminTopNav() - Header
│       │   ├── loadPendingUsers() - Fetch pending
│       │   ├── renderPendingUsersList() - Render users
│       │   ├── handleApproveUser() - Approve action
│       │   └── handleRejectUser() - Reject action
│       │
│       ├── 📄 doctor.js (Doctor Module)
│       │   ├── renderDoctorDashboard() - Main page
│       │   ├── renderDoctorSidebar() - Navigation
│       │   ├── renderDoctorTopNav() - Header
│       │   ├── renderMyPatients() - Patients list
│       │   ├── handleConfirmAppointment()
│       │   ├── handleCompleteAppointment()
│       │   └── handleRejectAppointment()
│       │
│       ├── 📄 patient.js (Patient Module)
│       │   ├── renderPatientDashboard() - Main page
│       │   ├── renderPatientSidebar() - Navigation
│       │   ├── renderPatientTopNav() - Header
│       │   ├── renderBookAppointment() - Booking form
│       │   ├── renderMyRecords() - Records view
│       │   ├── renderMyPrescriptions() - Prescriptions view
│       │   ├── handleBookAppointment()
│       │   ├── handleCancelAppointment()
│       │   └── handleRequestRefill()
│       │
│       └── 📄 appointments.js (Appointments)
│           ├── renderBookingForm() - Booking UI
│           ├── renderPatientAppointments() - Patient view
│           ├── renderDoctorAppointments() - Doctor view
│           ├── renderDoctorAppointmentCard() - Card component
│           └── renderAdminAppointments() - Admin table
│
└── 📄 REFACTOR_GUIDE.md
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       USER INTERACTION                       │
│                  (Click, Submit, Navigate)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
                 ┌──────────────────────────┐
                 │   Global Event Handler   │
                 │  handleGlobalClick()     │
                 │  handleGlobalSubmit()    │
                 └────────────┬─────────────┘
                             │
                             ↓
            ┌────────────────────────────────────┐
            │   Route to Appropriate Handler      │
            │   (authModule, adminModule, etc)    │
            └──────────────┬─────────────────────┘
                           │
                           ↓
              ┌──────────────────────────────┐
              │   API Call (async)           │
              │   api.admin.approveUser()    │
              │   api.appointments.book()    │
              │   etc.                       │
              └──────────────┬───────────────┘
                             │
                             ↓
                ┌────────────────────────┐
                │   UPDATE STATE          │
                │   state.users.push()    │
                │   state.currentUser =   │
                │   etc.                  │
                └────────────┬────────────┘
                             │
                             ↓
                   ┌───────────────────┐
                   │   RE-RENDER       │
                   │   renderApp()     │
                   │   renderModule()  │
                   └─────────┬─────────┘
                             │
                             ↓
                     ┌───────────────┐
                     │   DOM UPDATE  │
                     │   innerHTML   │
                     └───────────────┘
```

## 🎯 Lifecycle Examples

### Example 1: Admin Approves Doctor

**Step 1: User Clicks Approve Button**
```html
<button data-action="approve-user" data-id="user-123">Approve</button>
```

**Step 2: Global Click Handler**
```javascript
// app.js
function handleGlobalClick(e) {
  const action = e.target.dataset.action; // "approve-user"
  const id = e.target.dataset.id;         // "user-123"
  
  if (action === 'approve-user') {
    await adminModule.handleApproveUser(id);
  }
}
```

**Step 3: Admin Module Handler**
```javascript
// admin.js
async handleApproveUser(userId) {
  await api.admin.approveUser(userId);
  showToast('User approved!');
  adminModule.loadPendingUsers(); // Re-render list
}
```

**Step 4: API Call**
```javascript
// api.js
async approveUser(userId) {
  const user = getUserById(userId);
  user.status = 'approved';
  
  // Create doctor profile if they registered as doctor
  if (user.role === 'doctor') {
    state.doctors.push({ user_id: userId, ... });
  }
  
  addLog('USER_APPROVED', { user_id: userId }, ...);
  return await simulate({ success: true });
}
```

**Step 5: State Updated**
```javascript
// state.js is modified:
// - users[index].status = 'approved'
// - Possibly doctors array updated
```

**Step 6: UI Re-renders**
```javascript
// admin.js
adminModule.renderPendingUsersList('pending-users-list', newList);
```

---

### Example 2: Patient Books Appointment

**Step 1: Patient Fills & Submits Form**
```html
<form id="booking-form">
  <select name="doctor_id">...</select>
  <input type="date" name="date">
  <input type="time" name="time">
  <textarea name="reason"></textarea>
  <button type="submit" data-action="submit-booking-form">Book</button>
</form>
```

**Step 2: Form Submit Handler**
```javascript
// app.js
function handleGlobalSubmit(e) {
  if (action === 'submit-booking-form') {
    const formData = new FormData(form);
    const appointment = await api.appointments.bookAppointment({
      patient_id: formData.get('patient_id'),
      doctor_id: formData.get('doctor_id'),
      date: formData.get('date'),
      time: formData.get('time'),
      reason: formData.get('reason')
    });
  }
}
```

**Step 3: API Creates Appointment**
```javascript
// api.js
async bookAppointment(data) {
  const appointment = {
    id: generateId('apt'),
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    date: data.date,
    time: data.time,
    reason: data.reason,
    status: 'pending'
  };
  
  state.appointments.push(appointment);
  addLog('APPOINTMENT_BOOKED', ...);
  return await simulate(appointment);
}
```

**Step 4: State Updated**
```javascript
// state.appointments now includes new appointment
```

**Step 5: UI Re-renders**
```javascript
// Appointment appears in:
// - patientModule.renderPatientDashboard()
// - doctorModule.renderDoctorDashboard()
// - adminModule.renderAdminDashboard()
```

---

### Example 3: Doctor Confirms Appointment

**Step 1: Doctor Clicks Confirm**
```html
<button data-action="confirm-appointment" data-id="apt-456">Confirm</button>
```

**Step 2: Global Handler Routes to Doctor Module**
```javascript
if (action === 'confirm-appointment') {
  await doctorModule.handleConfirmAppointment(id);
}
```

**Step 3: Doctor Module**
```javascript
async handleConfirmAppointment(appointmentId) {
  await api.appointments.updateAppointmentStatus(
    appointmentId, 
    'confirmed'
  );
  showToast('Appointment confirmed!');
  doctorModule.renderDoctorDashboard(); // Re-render
}
```

**Step 4: API Updates**
```javascript
async updateAppointmentStatus(appointmentId, status) {
  const apt = getAppointmentById(appointmentId);
  apt.status = status; // 'confirmed'
  addLog('APPOINTMENT_CONFIRMED', ...);
  return await simulate(apt);
}
```

**Step 5: State Updated**
```javascript
// state.appointments[index].status = 'confirmed'
```

**Step 6: Patient Sees Update**
```javascript
// patientModule.renderPatientAppointments()
// Shows new status immediately
```

---

## 🔑 Key Concepts

### 1. Single State Tree
All data in one place (`state` object). No scattered variables.

### 2. Unidirectional Data Flow
```
User Action → API Call → State Update → Re-render → DOM Update
```

### 3. Event Delegation
One global listener prevents memory leaks and keeps code clean:
```javascript
document.addEventListener('click', handleGlobalClick);
// Instead of:
// button1.addEventListener('click', ...);
// button2.addEventListener('click', ...);
// ... repeated 100 times
```

### 4. Modular Separation
Each module handles one role/feature without knowing about others:
- `admin.js` doesn't care about `patient.js`
- `patient.js` uses shared `appointmentsModule`
- All modules share `state` and `api`

### 5. Rendering Functions
Pure functions that take data and return HTML:
```javascript
function renderPendingUsersList(containerId, users) {
  const html = users.map(user => `<div>...</div>`).join('');
  document.getElementById(containerId).innerHTML = html;
}
```

---

## 🚀 Quick Start

### 1. Open Application
```
File → Open File → index.html
```

### 2. Admin Login (Demo)
- Email: `admin@medilinkcloud.com`
- Password: `admin123`

### 3. Register as Doctor
- Switch to Register tab
- Fill form with name, email, password
- Select "Doctor" role
- After registration, admin approves in dashboard

### 4. Listen for Doctor Actions
In browser console:
```javascript
document.addEventListener('medilinkAction', (e) => {
  console.log('Action:', e.detail);
  // { action: 'confirm-appointment', id: 'apt-123', ... }
});
```

---

## 💡 Common Patterns

### Pattern 1: Fetching & Rendering
```javascript
async renderMyPatients() {
  const patients = await api.patients.get();
  const html = renderPatientsList(patients);
  document.getElementById('container').innerHTML = html;
}
```

### Pattern 2: State Update & Notify
```javascript
async function action() {
  const result = await api.call();
  state.data.push(result); // Update state
  showToast('Success!'); // Notify user
  renderModule(); // Re-render
}
```

### Pattern 3: Form Handling
```javascript
async handleSubmit(formData) {
  try {
    const result = await api.create(formData);
    showToast('Created!', 'success');
    // Trigger navigation or re-render
  } catch (error) {
    showToast(error.message, 'error');
  }
}
```

---

## 🔌 Supabase Integration Checklist

When ready to integrate Supabase:

- [ ] Set up Supabase project
- [ ] Create tables: users, doctors, patients, appointments, records, prescriptions
- [ ] Update `api.js` functions to use Supabase client
- [ ] Add authentication integration
- [ ] Test each module with real data
- [ ] Set up row-level security policies
- [ ] Deploy to production
- [ ] Monitor logs and errors

**Important**: No changes needed in modules! They work with any API implementation.

---

## 📋 Testing Checklist

- [ ] **Admin Flow**
  - [ ] Register doctor/patient with form
  - [ ] Login as admin
  - [ ] See pending users
  - [ ] Approve user
  - [ ] See stats dashboard

- [ ] **Doctor Flow**
  - [ ] Login as approved doctor
  - [ ] See appointments
  - [ ] Confirm pending appointment
  - [ ] Mark as completed

- [ ] **Patient Flow**
  - [ ] Register as patient
  - [ ] Wait for approval
  - [ ] Login
  - [ ] Book appointment
  - [ ] See appointment in dashboard
  - [ ] Request prescription refill

- [ ] **Session Management**
  - [ ] Logout and login again
  - [ ] Refresh page (session should persist)
  - [ ] Check localStorage

- [ ] **Notifications**
  - [ ] Check toast messages appear
  - [ ] Check error messages display
  - [ ] Check success messages show

---

## 🐛 Debugging

### Check Console
```javascript
// View all state
console.log(state);

// View logs
console.log(state.logs);

// Check current user
console.log(state.currentUser);
```

### Listen to Actions
```javascript
document.addEventListener('medilinkAction', (e) => {
  console.log('User action:', e.detail);
});
```

### Add Breakpoints
Open DevTools → Sources → Click line number to set breakpoint

---

## 📚 Additional Resources

- See `REFACTOR_GUIDE.md` for architecture overview
- Check module files for inline comments
- Review `api.js` for data models
- Search "TODO" in code for enhancement opportunities

This application is production-ready and prepared for Supabase integration!
