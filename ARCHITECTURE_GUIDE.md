# MediLink Cloud - Architecture Diagram & Code Patterns

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        index.html (DOM)                          │
│     ┌─────────────────────────────────────────────────────┐     │
│     │  <div id="app">                                     │     │
│     │    <aside id="sidebar">     <!-- Sidebar -->        │     │
│     │    <header id="topnav">     <!-- Top Bar -->        │     │
│     │    <main id="main-content"> <!-- Page Content -->   │     │
│     │  </div>                                             │     │
│     └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ↓                         ↓
    ┌──────────────────────┐   ┌──────────────────────┐
    │   app.js             │   │   Modules            │
    │ ─────────────────    │   │ ─────────────────    │
    │ • renderApp()        │   │ • auth.js            │
    │ • handleGlobalClick()│   │ • admin.js           │
    │ • handleNavigation() │   │ • doctor.js          │
    │ • showToast()        │   │ • patient.js         │
    │ • routing logic      │   │ • appointments.js    │
    └──────────────────────┘   └──────────────────────┘
                 │                       │
                 └───────────┬───────────┘
                             │
                   ┌─────────────────────┐
                   │   Made available    │
                   │   on ALL pages      │
                   └─────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
    ┌───────────────┐ ┌──────────────┐ ┌─────────────┐
    │  state.js     │ │   api.js     │ │ (Future)    │
    │ ─────────────│ │ ────────────│ │ ──────────│
    │ • Global     │ │ • Mock      │ │ • Supabase │
    │   state      │ │   backend   │ │   client   │
    │ • Users      │ │ • Simulate  │ │            │
    │ • Patients   │ │   async     │ │            │
    │ • Doctors    │ │ • CRUD ops  │ │            │
    │ • Appts      │ │ • Auth      │ │            │
    │ • Records    │ │ • Logs      │ │            │
    │ • Rx         │ │             │ │            │
    │ • Logs       │ │             │ │            │
    └───────────────┘ └──────────────┘ └─────────────┘
```

---

## 🔀 Event Flow Diagram

```
USER INTERACTION
    │
    ├─ Click Button
    ├─ Submit Form
    └─ Navigate Link
         │
         ↓
    GLOBAL EVENT LISTENER
    ├─ handleGlobalClick()
    └─ handleGlobalSubmit()
         │
         ├─ Extract data-action
         ├─ Extract data-id
         └─ Extract data-target
              │
              ↓
    ROUTE TO HANDLER
    ├─ if action === 'approve-user'
    │  └─ adminModule.handleApproveUser()
    ├─ if action === 'logout'
    │  └─ authModule.handleLogout()
    ├─ if action === 'navigate'
    │  └─ handleNavigation(target)
    └─ if action === 'book-appointment'
       └─ Submit form handler
            │
            ↓
    ASYNC API CALL
    ├─ api.auth.login()
    ├─ api.admin.approveUser()
    ├─ api.appointments.bookAppointment()
    └─ ... (simulates 300ms delay)
         │
         ↓
    STATE UPDATE
    ├─ Modify state.users
    ├─ Modify state.appointments
    ├─ Add to state.logs
    └─ Set state.currentUser
         │
         ↓
    NOTIFICATION
    ├─ showToast('Success!', 'success')
    └─ Display for 3 seconds
         │
         ↓
    RE-RENDER
    ├─ renderApp()
    ├─ adminModule.renderAdminDashboard()
    ├─ patientModule.renderPatientDashboard()
    └─ appointmentsModule.renderDoctorAppointments()
         │
         ↓
    DOM UPDATE
    ├─ container.innerHTML = newHTML
    └─ UI reflects new state
         │
         ↓
    USER SEES CHANGE
```

---

## 🎯 Module Interaction Map

```
┌─────────────────────────────────────────────────────┐
│                   index.html                         │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │ app.js  │───▶│ state.js │◀───│ api.js   │
    │ (Main   │    │          │    │ (Backend)│
    │  Router)│    │ (Single  │    │          │
    │         │    │  Truth)  │    │  Async   │
    └─────────┘    └──────────┘    │ Simulator│
        │               ▲           └──────────┘
        │               │
    ┌───────────────────┼─────────────────────┐
    │                   │                     │
    ↓                   ↓                     ↓
┌──────────┐      ┌──────────┐      ┌───────────────┐
│ auth.js  │      │ admin.js │      │ Shared        │
│          │      │          │      │ Modules       │
│ Login    │      │ Dashboard│      │               │
│ Register │      │ Approve  │      ├─ appointments│
│ Session  │      │ Users    │      ├─ records     │
│ Logout   │      │ Stats    │      ├─ prescriptions
└──────────┘      └──────────┘      └───────────────┘
    ▲                  ▲                    ▲
    │                  │                    │
    └──────────┬───────┼────────────────────┘
               │       │
         ┌─────┴───────┴─────┐
         │                   │
         ↓                   ↓
    ┌──────────┐      ┌──────────┐
    │ doctor.js│      │patient.js│
    │          │      │          │
    │Dashboard │      │Dashboard │
    │Patients  │      │Appts     │
    │Appt Mgmt │      │Records   │
    │Records   │      │Rx        │
    └──────────┘      └──────────┘
```

---

## 📊 State Evolution

```
Initial Load
├─ state.currentUser = null
├─ state.users = [admin_user]
├─ state.patients = []
├─ state.doctors = []
├─ state.appointments = []
└─ state.logs = []

After User Registers (Doctor)
├─ state.users = [admin, doctor_pending]
├─ doctor_pending.status = "pending"
└─ Waiting for admin approval

After Admin Approves Doctor
├─ state.users[1].status = "approved"
├─ state.doctors = [new_doctor_profile]
├─ Doctor can now login
└─ toast: "User approved!"

After Doctor Logs In
├─ state.currentUser = doctor_user
├─ renderApp() → renderDoctorDashboard()
├─ Doctor sees dashboard
└─ Can manage appointments

After Patient Books Appointment
├─ state.appointments += [new_appointment]
├─ appointment.status = "pending"
├─ state.logs += [APPOINTMENT_BOOKED]
└─ Appears in doctor & admin dashboards

After Doctor Confirms Appointment
├─ state.appointments[apt].status = "confirmed"
├─ state.logs += [APPOINTMENT_CONFIRMED]
└─ Patient sees status change
```

---

## 💻 Code Pattern Examples

### Pattern 1: Simple Navigation

```javascript
<!-- HTML -->
<button data-action="navigate" data-target="book-appointment">
  Book
</button>

<!-- app.js - Global Handler -->
if (action === 'navigate') {
  await handleNavigation(targetNav);
}

<!-- app.js - Router -->
async function handleNavigation(target) {
  if (target === 'book-appointment') {
    await patientModule.renderBookAppointment();
  }
}

<!-- patient.js - Render Function -->
async renderBookAppointment() {
  const doctors = state.doctors;
  const html = `<form>...</form>`;
  document.getElementById('main-content').innerHTML = html;
}
```

---

### Pattern 2: Approval Action

```javascript
<!-- HTML -->
<button data-action="approve-user" data-id="user-123">
  Approve
</button>

<!-- app.js - Global Handler -->
if (action === 'approve-user') {
  await adminModule.handleApproveUser(id);
}

<!-- admin.js - Module Handler -->
async handleApproveUser(userId) {
  try {
    await api.admin.approveUser(userId);
    showToast('User approved!', 'success');
    adminModule.loadPendingUsers(); // Re-render
  } catch (error) {
    showToast(error.message, 'error');
  }
}

<!-- api.js - API Call -->
async approveUser(userId) {
  const user = getUserById(userId);
  user.status = 'approved';
  
  if (user.role === 'doctor') {
    state.doctors.push({...});
  }
  
  addLog('USER_APPROVED', {user_id: userId}, admin_id);
  return await simulate({ success: true });
}

<!-- state updates automatically -->
<!-- UI re-renders automatically -->
```

---

### Pattern 3: Form Submission

```javascript
<!-- HTML -->
<form id="booking-form">
  <select name="doctor_id" required>...</select>
  <input type="date" name="date" required>
  <input type="time" name="time" required>
  <textarea name="reason" required></textarea>
  <button type="submit" data-action="submit-booking-form">
    Book
  </button>
</form>

<!-- app.js - Submit Handler -->
function handleGlobalSubmit(e) {
  const form = e.target;
  if (form.id === 'booking-form') {
    e.preventDefault();
    const formData = new FormData(form);
    
    const appointment = {
      patient_id: patient.id,
      doctor_id: formData.get('doctor_id'),
      date: formData.get('date'),
      time: formData.get('time'),
      reason: formData.get('reason')
    };
    
    api.appointments.bookAppointment(appointment)
      .then(apt => {
        showToast('Booked!', 'success');
        patientModule.renderPatientDashboard();
      })
      .catch(err => showToast(err.message, 'error'));
  }
}
```

---

### Pattern 4: Conditional Rendering

```javascript
<!-- Render based on role -->
async function renderApp() {
  if (!state.currentUser) {
    authModule.renderAuthScreen();
    return;
  }
  
  switch(state.currentUser.role) {
    case 'admin':
      await adminModule.renderAdminDashboard();
      break;
    case 'doctor':
      await doctorModule.renderDoctorDashboard();
      break;
    case 'patient':
      await patientModule.renderPatientDashboard();
      break;
  }
}

<!-- Render based on data availability -->
renderAppointmentsList(appointments) {
  if (appointments.length === 0) {
    return `<div>No appointments</div>`;
  }
  
  return appointments
    .map(apt => `<div>${apt.title}</div>`)
    .join('');
}
```

---

### Pattern 5: Async Loading with Try-Catch

```javascript
async function loadData() {
  try {
    // Show loading state
    showLoading(true);
    
    // Async call
    const data = await api.fetchData();
    
    // Update state
    state.data = data;
    
    // Show success
    showToast('Data loaded!', 'success');
    
  } catch (error) {
    // Handle error
    console.error(error);
    showToast(error.message, 'error');
    
  } finally {
    // Cleanup
    showLoading(false);
  }
}
```

---

### Pattern 6: Event Filtering

```javascript
<!-- Many buttons, one listener -->
<button data-action="approve-user" data-id="1">Approve 1</button>
<button data-action="approve-user" data-id="2">Approve 2</button>
<button data-action="reject-user" data-id="1">Reject 1</button>

<!-- One handler catches all -->
document.addEventListener('click', handleGlobalClick);

function handleGlobalClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return; // Not a clickable element
  
  const { action, id } = target.dataset;
  
  if (action === 'approve-user') {
    handleApprove(id);
  } else if (action === 'reject-user') {
    handleReject(id);
  }
}
```

---

## 🔄 Common Workflows

### Workflow 1: Login & See Dashboard

```
1. User enters email & password
2. Clicks "Sign In"
   ├─ handleGlobalClick() triggered
   ├─ Extracts form data
   ├─ authModule.handleLogin() called
   │  ├─ api.auth.login() validates
   │  ├─ state.currentUser = user
   │  ├─ localStorage.setItem('currentUser', user)
   │  ├─ showToast('Login successful!')
   │  └─ renderApp() called
   ├─ renderApp() detects user role
   ├─ Loads appropriate module
   │  └─ adminModule.renderAdminDashboard()
   │  └─ doctorModule.renderDoctorDashboard()
   │  └─ patientModule.renderPatientDashboard()
   └─ User sees dashboard

On page refresh:
1. initializeApp() runs
2. authModule.restoreSession()
   ├─ localStorage.getItem('currentUser')
   ├─ state.currentUser = saved user
   ├─ renderApp() shows dashboard
   └─ No login needed!

On logout:
1. authModule.handleLogout()
   ├─ state.currentUser = null
   ├─ localStorage.removeItem('currentUser')
   ├─ renderApp()
   └─ Shows login screen
```

---

### Workflow 2: Create → Render → Display

```
User Action
   │
   ├─ Click button
   │  data-action="book-appointment"
   │
   ├─ handleGlobalClick()
   │  └─ Extracts form data
   │
   ├─ Handle form submission
   │  ├─ Validate input
   │  ├─ Prepare data object
   │  └─ Call API
   │
   ├─ api.bookAppointment(data)
   │  ├─ Generate ID
   │  ├─ Push to state.appointments
   │  ├─ Add to state.logs
   │  └─ Simulate 300ms delay
   │
   ├─ showToast('Appointment booked!', 'success')
   │
   ├─ Trigger re-render
   │  ├─ patientModule.renderPatientDashboard()
   │  │  └─ Calls appointmentsModule.renderPatientAppointments()
   │  │     └─ Renders new appointment in list
   │  ├─ doctorModule.renderDoctorDashboard()
   │  │  └─ New appointment appears
   │  └─ adminModule updates stats
   │
   └─ UI Updated - User sees appointment
       ├─ In patient dashboard
       ├─ In doctor's pending list
       └─ In admin stats
```

---

## 🎯 File Responsibilities

```
index.html
├─ DOM structure only
├─ Script imports in order
└─ No interactive HTML

state.js
├─ Initialize state object
├─ Helper functions
└─ NO api calls, NO rendering

api.js
├─ Simulate backend
├─ CRUD operations
├─ Mock delays (300ms)
└─ NO rendering, NO event handling

app.js
├─ Entry point (initializeApp)
├─ Main router (renderApp)
├─ Global event delegation
├─ Navigation handler
├─ Toast system
└─ Error handling

admin.js
├─ Admin dashboard
├─ Sidebar & top nav
├─ User approval handlers
└─ Stats rendering

doctor.js
├─ Doctor dashboard
├─ Patient list
├─ Appointment handlers
└─ Record management

patient.js
├─ Patient dashboard
├─ Book appointment
├─ View records/prescriptions
└─ Refill requests

appointments.js
├─ Appointment forms
├─ Rendering functions
├─ Shared across roles
└─ Cards & tables
```

---

## ✅ Best Practices Applied

✅ **Single Responsibility** - Each module has one job  
✅ **Separation of Concerns** - API, state, rendering separate  
✅ **DRY Code** - No duplication (shared modules)  
✅ **Event Delegation** - One listener, many handlers  
✅ **Error Handling** - Try-catch everywhere  
✅ **Async/Await** - Clean promise handling  
✅ **Documentation** - Code is self-documenting  
✅ **Maintainability** - Easy to understand flow  
✅ **Scalability** - Ready for growth  
✅ **Performance** - No memory leaks  

---

This architecture enables:
- ✅ Clean, readable code
- ✅ Easy maintenance
- ✅ Quick feature additions
- ✅ Painless Supabase integration
- ✅ Future developer onboarding
- ✅ Production deployment
