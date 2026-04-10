# MEDILINK CLICKABLE ELEMENTS - DEVELOPER QUICK REFERENCE

> **Quick Start Guide for Implementing Clickable Elements**

---

## 🎯 HOW IT WORKS

All clickable elements in MediLink use a **global event handler system** that intercepts clicks and executes actions based on `data-action` attributes.

### Basic Pattern

```html
<!-- Simple action button -->
<button data-action="approve-user" data-id="user-123">
  <span class="material-symbols-outlined">check_circle</span>
  Approve
</button>

<!-- Button that opens form -->
<button data-action="create-appointment">
  <span class="material-symbols-outlined">add</span>
  New Appointment
</button>

<!-- Link-style button -->
<a href="#" data-action="view-patient-details" data-id="patient-456">
  View Patient
</a>
```

---

## 📋 ACTION TYPES BY MODULE

### ADMIN ACTIONS

| Action | Data Attribute | Opens | Database | Confirm |
|--------|---|---|---|---|
| Approve User | `data-action="approve-user"` | — | updates users | Yes |
| Reject User | `data-action="reject-user"` | — | updates users | Yes |
| Delete User | `data-action="delete-user"` | — | deletes users | Yes |
| Edit User | `data-action="edit-user"` | Modal Form | updates users | No |
| View User Details | `data-action="view-user-details"` | Modal Info | queries users | — |
| Create User | `data-action="create-user"` | Modal Form | inserts users | No |
| Create Appointment | `data-action="create-appointment"` | Modal Form | inserts appointments | No |
| Delete Appointment | `data-action="delete-appointment"` | — | deletes appointments | Yes |
| View Appointment | `data-action="view-appointment"` | Modal Info | queries appointments | — |

### DOCTOR ACTIONS

| Action | Data Attribute | Opens | Database | Confirm |
|--------|---|---|---|---|
| Complete Appointment | `data-action="mark-appointment-complete"` | — | updates appointments | Yes |
| Cancel Appointment | `data-action="cancel-appointment-doctor"` | — | updates appointments | Yes |
| Reschedule | `data-action="reschedule-appointment"` | Modal Form | updates appointments | No |
| Create Medical Record | `data-action="create-medical-record"` | Modal Form | inserts medical_records | No |
| Create Prescription | `data-action="create-prescription"` | Modal Form | inserts prescriptions | No |
| View Patient | `data-action="view-patient-details"` | Modal Info | queries patients | — |
| Approve Refill | `data-action="approve-prescription-refill"` | — | updates prescriptions | No |

### PATIENT ACTIONS

| Action | Data Attribute | Opens | Database | Confirm |
|--------|---|---|---|---|
| Book Appointment | `data-action="book-appointment"` | Modal Form | inserts appointments | No |
| Cancel Appointment | `data-action="cancel-appointment"` | — | updates appointments | Yes |
| Request Refill | `data-action="request-prescription-refill"` | — | updates prescriptions | No |
| View Record | `data-action="view-medical-record"` | Modal Info | queries records | — |
| View Prescription | `data-action="view-prescription"` | Modal Info | queries prescriptions | — |
| Find Doctors | `data-action="find-doctors"` | Modal List | queries doctors | — |
| Book with Doctor | `data-action="book-with-doctor"` | Modal Form | inserts appointments | No |

### COMMON ACTIONS

| Action | Data Attribute |
|--------|---|
| Logout | `data-action="logout"` |
| Toggle Dark Mode | `data-action="toggle-dark-mode"` |
| Toggle Sidebar | `data-action="toggle-sidebar"` |
| View Notifications | `data-action="view-notifications"` |

---

## 💻 CODE EXAMPLES

### Example 1: Simple Action Button

```html
<button data-action="approve-user" data-id="u_12345">
  Approve User
</button>
```

**What Happens:**
1. User clicks button
2. Global handler catches click
3. Calls `approveUser('u_12345')`
4. Updates database
5. Shows "✓ User approved" notification
6. Page reloads in 500ms

---

### Example 2: Button That Opens Modal Form

```html
<button data-action="create-user">
  Create New User
</button>
```

**What Happens:**
1. User clicks button
2. Global handler catches click
3. Calls `showCreateUserModal()`
4. Modal appears with form
5. User fills and submits form
6. Form validation runs
7. Data saved to database
8. Modal closes, page reloads

---

### Example 3: Button With Data ID

```html
<button data-action="view-patient-details" data-id="pat_abc123">
  View Details
</button>
```

**What Happens:**
1. User clicks button
2. Handler extracts `data-id="pat_abc123"`
3. Calls `viewPatientDetails('pat_abc123')`
4. Info modal displays
5. Shows patient data from database

---

### Example 4: Inline Action in Table Row

```html
<tr data-id="appointment_456">
  <td>Dr. Smith</td>
  <td>2026-04-15</td>
  <td>2:30 PM</td>
  <td>
    <button data-action="mark-appointment-complete" data-id="appointment_456">
      <span class="material-symbols-outlined">check</span>
    </button>
    <button data-action="cancel-appointment-doctor" data-id="appointment_456">
      <span class="material-symbols-outlined">close</span>
    </button>
  </td>
</tr>
```

---

## 🎓 STEP-BY-STEP: Add a New Action

### Step 1: Add HTML Element

```html
<!-- In your HTML page -->
<button data-action="my-new-action" data-id="resource-123">
  Click Me
</button>
```

### Step 2: Add Handler to Global Event Handler

```javascript
// In global-event-handler.js, in the switch statement:

case "my-new-action":
  await handleMyNewAction(id);
  break;
```

### Step 3: Create Action Function

```javascript
// At the bottom of global-event-handler.js

async function handleMyNewAction(id) {
  try {
    // Do something with the database
    const { data, error } = await supabase
      .from('table_name')
      .update({ field: 'new_value' })
      .eq('id', id);
    
    if (error) throw error;
    
    showNotification('✓ Action completed!', 'success');
    window.location.reload(); // Refresh if needed
  } catch (error) {
    console.error('Error:', error);
    showNotification(error.message, 'error');
  }
}
```

### Step 4: Test in Browser

1. Open page in browser
2. Click the button
3. Check browser console for errors
4. Verify action completed in database

---

## 🔍 DEBUGGING

### Check Browser Console

```
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for errors
4. Test actions manually
```

### Common Issues

**Issue:** Button doesn't respond to click
- ✅ Check that `data-action` is spelled correctly
- ✅ Verify Supabase is initialized
- ✅ Check browser console for JS errors

**Issue:** Modal doesn't appear
- ✅ Check that action is in the switch statement
- ✅ Verify `showModal()` is called
- ✅ Check dark mode styles are loaded

**Issue:** Database not updating
- ✅ Check Supabase credentials in config
- ✅ Verify table name and column names
- ✅ Check user has database permissions

**Issue:** Notification doesn't show
- ✅ Check `css/global-styles.css` is linked
- ✅ Verify notification container is created
- ✅ Check z-index in CSS

---

## 📝 IMPLEMENTATION NOTES

### Data Attributes Required

```html
<!-- Always include these in your HTML: -->
<button 
  data-action="action-name"           <!-- What to do -->
  data-id="entity-id"                 <!-- Optional: which entity -->
  data-value="some-value"             <!-- Optional: extra data -->
>
```

### Database Operations

All actions use **async/await** with Supabase:

```javascript
// Always wrap in try-catch
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id);
  
  if (error) throw error; // Important!
  
  // Use data here
  return data;
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### Modal Forms

Always wrap form data:

```javascript
// Get form data
const form = document.getElementById('my-form');
const formData = new FormData(form);
const data = Object.fromEntries(formData);

// Validate
if (!data.field) throw new Error('Field required');

// Save
await supabase.from('table').insert([data]);
```

### Notifications

Always show user feedback:

```javascript
// Success
showNotification('✓ Operation completed', 'success');

// Error
showNotification('Failed to complete operation', 'error');

// Info
showNotification('Please wait...', 'info');

// Warning
showNotification('Last chance!', 'warning');
```

---

## 🎨 STYLING CLICKABLE ELEMENTS

### Default Button Style

```html
<button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors" 
        data-action="my-action">
  Click Me
</button>
```

### Danger Button (Delete)

```html
<button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" 
        data-action="delete-user" 
        data-id="user-123">
  Delete
</button>
```

### Icon-Only Button

```html
<button class="p-2 rounded-full hover:bg-slate-100" 
        data-action="logout"
        title="Sign Out">
  <span class="material-symbols-outlined">logout</span>
</button>
```

### Disabled State

```html
<button disabled 
        class="opacity-50 cursor-not-allowed"
        data-action="my-action">
  Processing...
</button>
```

---

## ✅ TESTING CHECKLIST

Before deploying, test each action:

- [ ] Button is clickable (CSS `pointer-events` not none)
- [ ] Click shows loading spinner (animated icon)
- [ ] Database operation completes
- [ ] Toast notification appears
- [ ] Data updates correctly in database
- [ ] Page reloads if needed
- [ ] Error handling works (try disabling internet)
- [ ] Dark mode works with button styling
- [ ] Mobile responsive (button size)
- [ ] Touch reader compatible

---

## 🚀 DEPLOYMENT

Before going live:

1. **Test all 50+ actions** in browser
2. **Check console for errors** - should be 0
3. **Verify database connections**
4. **Test error cases** - intentionally break things
5. **Check mobile responsiveness**
6. **Verify animations and transitions**
7. **Test with different user roles**

---

## 📚 FILE STRUCTURE

```
Medilink_Cloud/
├── js/
│   ├── global-event-handler.js    ← All main actions & dispatcher
│   ├── form-handler.js             ← Form validation & submission
│   └── ...
├── css/
│   ├── global-styles.css           ← Animations & styles
│   └── ...
├── Admin/
│   ├── admin-service.js            ← Database functions
│   ├── admin-actions.js            ← Admin-specific actions
│   └── Admin_Dashboard.html        ← Uses data-action
├── Doctor/
│   ├── doctor-actions.js           ← Doctor-specific actions
│   └── Dashboard.html              ← Uses data-action
├── Patient/
│   ├── patient-actions.js          ← Patient-specific actions
│   └── index.html                  ← Uses data-action
└── ...
```

---

## 💡 PRO TIPS

1. **Centralize Logic:** Put all action logic in `global-event-handler.js` for easier maintenance
2. **Use Data Attributes:** Makes HTML cleaner and JavaScript simpler
3. **Test Incrementally:** Add one action, test it, move to next
4. **Error Messages:** Always tell users what went wrong
5. **Feedback is Key:** Always show success/error notifications
6. **Async/Await:** Use async functions for database operations
7. **Validate Input:** Always validate form data before saving
8. **Log Errors:** Console.error() for debugging

---

## 🔗 RELATED FILES

- [REFACTORING_IMPLEMENTATION_CHECKLIST.md](REFACTORING_IMPLEMENTATION_CHECKLIST.md) - Full status of all elements
- [Global Event Handler](js/global-event-handler.js) - Main dispatcher
- [Form Handler](js/form-handler.js) - Form validation
- [Admin Actions](Admin/admin-actions.js) - Admin functions
- [Doctor Actions](Doctor/doctor-actions.js) - Doctor functions
- [Patient Actions](Patient/patient-actions.js) - Patient functions

---

**Version:** 1.0  
**Last Updated:** April 10, 2026  
**Maintainer:** Full-Stack Engineering Team  
**Status:** PRODUCTION READY
