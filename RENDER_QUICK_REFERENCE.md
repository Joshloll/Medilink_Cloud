# MediLink - Render System Quick Reference

## Overview

All mock data has been removed. The system is now **100% dynamic** and ready for Supabase integration.

Use the `renderHelpers.js` module to populate all UI dynamically.

---

## Quick Start (3 Steps)

### 1. Include the Scripts
```html
<!-- In your HTML file -->
<script src="utils/renderHelpers.js"></script>
<script src="js/supabase-client.js"></script>
```

### 2. Fetch Data from Supabase
```javascript
// In your page's JavaScript
const appointments = await window.supabaseAppointments.getAllAppointments();
```

### 3. Render the Data
```javascript
// Render with real data
renderAppointments(appointments.data, 'appointmentsList');
```

---

## Common Patterns

### Pattern 1: Show Empty State by Default
```javascript
const containerId = 'appointmentsList';
renderAppointments([], containerId);  // Shows "No appointments available"
```

### Pattern 2: Load Data with Loading State
```javascript
async function loadAppointments() {
    const container = 'appointmentsList';
    
    // Show loading
    showLoadingState(container);
    
    // Fetch data
    const result = await window.supabaseAppointments.getAllAppointments();
    
    // Show error or data
    if (!result.success) {
        showErrorState(container, 'Failed to load appointments');
    } else {
        renderAppointments(result.data, container);
    }
}

// Call on page load
loadAppointments();
```

### Pattern 3: Render Multiple Data Types
```javascript
async function initializeDashboard() {
    // Load all data in parallel
    const [appointments, patients, doctors] = await Promise.all([
        window.supabaseAppointments.getAllAppointments(),
        window.supabaseAdmin.getAllPatients(),
        window.supabaseAdmin.getAllDoctors()
    ]);
    
    // Render all sections
    if (appointments.success) renderAppointments(appointments.data);
    if (patients.success) renderPatients(patients.data);
    if (doctors.success) renderDoctors(doctors.data);
}
```

---

## Container IDs Reference

### Admin Module

| ID | Purpose | Empty State |
|----|---------|------------|
| `appointmentsList` | Admin appointments | "No appointments available" |
| `patientsList` | Patient directory | "No patients found" |
| `doctorsList` | Doctor directory | "No doctors found" |
| `documentsList` | Uploaded documents | "No files uploaded" |
| `doctorFilter` | Doctor dropdown filter | Drop-down only (no hardcoded options) |

### Doctor Module

| ID | Purpose | Default |
|----|---------|---------|
| `scheduleEventsContainer` | Calendar events | Empty calendar grid |
| `doctorName` | Dynamic doctor name | "—" |
| `doctorSpecialty` | Dynamic specialty | "—" |
| `currentDateDisplay` | Current date | "—" |

### Patient Module

| ID | Purpose | Empty State |
|----|---------|------------|
| `appointmentsList` | My appointments | "No appointments available" |
| `recordsList` | Medical records | "No records available" |
| `prescriptionsList` | Prescriptions | "No prescriptions available" |

---

## Render Functions Cheat Sheet

### Empty States
```javascript
// Create a custom empty state
createEmptyState('calendar_month', 'No data', 'Try adding something');

// Result:
// <div class="text-center py-12 px-4">
//   <span class="material-symbols-outlined text-5xl text-slate-300">calendar_month</span>
//   <p class="text-slate-600 dark:text-slate-400 mt-2 font-medium">No data</p>
//   <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Try adding something</p>
// </div>
```

### Appointments
```javascript
// Render appointment list
renderAppointments(
    [
        { patient: 'John Doe', doctor: 'Dr. Smith', date: '2026-04-15', time: '10:00 AM', status: 'confirmed' },
        { patient: 'Jane Smith', doctor: 'Dr. Jones', date: '2026-04-16', time: '2:00 PM', status: 'scheduled' }
    ],
    'appointmentsList'
);

// Get a status badge (standalone)
getStatusBadge('confirmed');  // Returns html badge span
```

### Patients
```javascript
// Render patient list
renderPatients(
    [
        { id: 'ML-001', full_name: 'Alice Johnson', date_of_birth: '1990-01-15' },
        { id: 'ML-002', full_name: 'Bob Wilson', date_of_birth: '1985-06-20' }
    ],
    'patientsList'
);
```

### Doctors
```javascript
// Render doctor list
renderDoctors(
    [
        { id: 'DOC-001', full_name: 'Sarah Mitchell', specialization: 'General Practice', license_number: 'MD123456' },
        { id: 'DOC-002', full_name: 'John Smith', specialization: 'Cardiology', license_number: 'MD789012' }
    ],
    'doctorsList'
);
```

### Medical Records
```javascript
// Render medical records
renderRecords(
    [
        { record_type: 'Lab Results', doctor_name: 'Smith', created_at: '2026-04-01' },
        { record_type: 'X-Ray', doctor_name: 'Jones', created_at: '2026-04-05' }
    ],
    'recordsList'
);
```

### Prescriptions
```javascript
// Render prescriptions
renderPrescriptions(
    [
        { medication: 'Aspirin', dosage: '500mg', frequency: 'Twice daily', status: 'Active' },
        { medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', status: 'Active' }
    ],
    'prescriptionsList'
);
```

### Documents
```javascript
// Render documents/files
renderDocuments(
    [
        { file_name: 'Medical_Report_2026.pdf', created_at: '2026-04-01' },
        { file_name: 'Lab_Results.pdf', created_at: '2026-04-05' }
    ],
    'documentsList'
);
```

### Loading & Error States
```javascript
// Show loading spinner
showLoadingState('appointmentsList');

// Show error message
showErrorState('appointmentsList', 'Failed to load - please try again');
```

---

## Data Object Structures

### Appointment Object
```javascript
{
    id: number,
    patient: string,
    patientId: string,
    doctor: string,
    date: string,          // YYYY-MM-DD
    time: string,          // HH:MM AM/PM
    type: string,
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending',
    notes?: string
}
```

### Patient Object
```javascript
{
    id: string,
    full_name: string,
    date_of_birth: string, // YYYY-MM-DD
    phone?: string,
    address?: string,
    insurance_provider?: string,
    blood_type?: string,
    allergies?: string[]
}
```

### Doctor Object
```javascript
{
    id: string,
    full_name: string,
    specialization: string,
    license_number: string,
    department?: string,
    experience?: number,    // Years
    availability?: string[]
}
```

### Medical Record Object
```javascript
{
    id: string,
    patient_id: string,
    doctor_id: string,
    record_type: string,    // 'Lab', 'X-Ray', 'Prescription', etc
    file_url?: string,
    diagnosis?: string,
    treatment_plan?: string,
    created_at: string      // ISO datetime
}
```

### Prescription Object
```javascript
{
    id: string,
    patient_id: string,
    medication: string,
    dosage: string,         // e.g., "500mg"
    frequency: string,      // e.g., "Twice daily"
    duration?: string,
    refills?: number,
    status: 'active' | 'inactive' | 'refill-requested',
    created_at?: string
}
```

---

## Common Tasks

### Task 1: Populate Doctor Dropdown
```javascript
async function populateDoctorDropdown(selectElementId = 'doctorFilter') {
    const result = await window.supabaseAdmin.getAllDoctors();
    const select = document.getElementById(selectElementId);
    
    result.data.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `Dr. ${doctor.full_name} - ${doctor.specialization}`;
        select.appendChild(option);
    });
}
```

### Task 2: Render Dashboard Stats
```javascript
async function updateDashboardStats() {
    const stats = await window.supabaseAdmin.getSystemStats();
    
    if (stats.success) {
        renderAdminStats({
            totalPatients: stats.stats.totalPatients,
            totalDoctors: stats.stats.totalDoctors,
            totalAppointments: stats.stats.totalAppointments,
            pendingApprovals: stats.stats.pendingApprovals
        });
    }
}
```

### Task 3: Filter Appointments by Status
```javascript
// Fetch appointments
const result = await window.supabaseAppointments.getAllAppointments();
const appointments = result.data;

// Filter locally (or use Supabase filters)
const confirmed = appointments.filter(apt => apt.status === 'confirmed');

// Render
renderAppointments(confirmed, 'appointmentsList');
```

### Task 4: Show Loading While Fetching
```javascript
async function loadAndRenderAppointments(containerId) {
    showLoadingState(containerId);
    
    try {
        await new Promise(r => setTimeout(r, 500)); // Simulate network delay
        const result = await window.supabaseAppointments.getAllAppointments();
        
        if (result.success) {
            renderAppointments(result.data, containerId);
        } else {
            showErrorState(containerId, 'Failed to load');
        }
    } catch (error) {
        showErrorState(containerId, error.message);
    }
}
```

---

## Status Badge Options

Available status values:
- `scheduled` - Blue badge
- `confirmed` - Green badge
- `completed` - Green badge
- `cancelled` - Red badge
- `pending` - Amber badge

```javascript
// Each calls getStatusBadge() internally
// You can also call it directly:
const badge = getStatusBadge('confirmed');
console.log(badge);  // Returns HTML string for the badge
```

---

## Error Handling Pattern

```javascript
async function safeRender(asyncFunction, containerId, fallbackMessage) {
    try {
        showLoadingState(containerId);
        const result = await asyncFunction();
        
        if (!result.success) {
            throw new Error(result.error || 'Operation failed');
        }
        
        return result.data;
    } catch (error) {
        showErrorState(containerId, fallbackMessage || error.message);
        return null;
    }
}

// Usage:
const data = await safeRender(
    () => window.supabaseAppointments.getAllAppointments(),
    'appointmentsList',
    'Could not load appointments'
);

if (data) {
    renderAppointments(data);
}
```

---

## Pro Tips

1. **Always check `result.success`** before using `result.data`
2. **Use `showLoadingState()` for better UX** while fetching
3. **Call render functions with empty array** to show empty states
4. **Combine with Supabase real-time** for live updates
5. **Keep container IDs consistent** across files for easy maintenance

---

## Status: ✅ PRODUCTION READY

All components are clean, documented, and ready for integration with Supabase real database.

For more details, see `CLEANUP_REPORT.md`
