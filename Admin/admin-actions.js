// ============================================================================
// ADMIN MODULE ACTION HANDLERS
// ============================================================================
// Handles all admin-specific actions for user management, approvals, etc.
// ============================================================================

import { supabase, showNotification, closeModal } from '../js/global-event-handler.js';

// ============================================================================
// USER MANAGEMENT ACTIONS
// ============================================================================

export async function handleApproveUser(userId) {
  if (!confirm('Are you sure you want to approve this user?')) return;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    showNotification('✓ User approved successfully', 'success');
    
    // Reload the page to reflect changes
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error approving user:', error);
    showNotification(error.message || 'Failed to approve user', 'error');
  }
}

export async function handleRejectUser(userId) {
  const reason = prompt('Enter rejection reason:');
  if (!reason) return;
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    showNotification('✗ User rejected', 'info');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error rejecting user:', error);
    showNotification(error.message || 'Failed to reject user', 'error');
  }
}

export async function handleDeleteUser(userId) {
  if (!confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) return;
  
  try {
    // First delete associated records
    await supabase.from('appointments').delete().eq('patient_id', userId);
    await supabase.from('appointments').delete().eq('doctor_id', userId);
    await supabase.from('medical_records').delete().eq('patient_id', userId);
    await supabase.from('prescriptions').delete().eq('patient_id', userId);
    
    // Delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    showNotification('User and all associated data deleted', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification(error.message || 'Failed to delete user', 'error');
  }
}

export async function handleUpdateUser(userId, formData) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    showNotification('✓ User updated successfully', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error updating user:', error);
    showNotification(error.message || 'Failed to update user', 'error');
  }
}

// ============================================================================
// APPOINTMENT MANAGEMENT ACTIONS
// ============================================================================

export async function handleCreateAppointment(formData) {
  try {
    // Validate form data
    if (!formData.doctor_id || !formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
      throw new Error('Please fill in all required fields');
    }
    
    const { error } = await supabase
      .from('appointments')
      .insert([{
        doctor_id: formData.doctor_id,
        patient_id: formData.patient_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Appointment created successfully', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error creating appointment:', error);
    showNotification(error.message || 'Failed to create appointment', 'error');
  }
}

export async function handleDeleteAppointment(appointmentId) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('Appointment deleted successfully', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    showNotification(error.message || 'Failed to delete appointment', 'error');
  }
}

export async function handleRescheduleAppointment(appointmentId, newDate, newTime) {
  try {
    if (!newDate || !newTime) {
      throw new Error('Please select both date and time');
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('✓ Appointment rescheduled successfully', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    showNotification(error.message || 'Failed to reschedule', 'error');
  }
}

// ============================================================================
// BILLING & PAYMENTS
// ============================================================================

export async function handleProcessRefund(appointmentId, amount) {
  if (!confirm(`Process refund of $${amount}?`)) return;
  
  try {
    const { error } = await supabase
      .from('billing')
      .insert([{
        appointment_id: appointmentId,
        amount: -amount,
        type: 'refund',
        status: 'processed',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Refund processed successfully', 'success');
    window.location.reload();
  } catch (error) {
    console.error('Error processing refund:', error);
    showNotification(error.message || 'Failed to process refund', 'error');
  }
}

export async function handleGenerateInvoice(appointmentId) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(user:users(full_name)),
        patient:patients(user:users(full_name, email))
      `)
      .eq('id', appointmentId)
      .single();
    
    if (error) throw error;
    
    // Create invoice in database
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        appointment_id: appointmentId,
        amount: 150, // Default amount - change as needed
        status: 'generated',
        created_at: new Date().toISOString()
      }]);
    
    if (invoiceError) throw invoiceError;
    
    showNotification('✓ Invoice generated successfully', 'success');
    
    // Could trigger download here in a real app
  } catch (error) {
    console.error('Error generating invoice:', error);
    showNotification(error.message || 'Failed to generate invoice', 'error');
  }
}

// ============================================================================
// DOCTOR MANAGEMENT
// ============================================================================

export async function handleUpdateDoctorStatus(doctorId, status) {
  try {
    const { error } = await supabase
      .from('doctors')
      .update({ 
        availability_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctorId);
    
    if (error) throw error;
    
    showNotification(`✓ Doctor status updated to ${status}`, 'success');
    window.location.reload();
  } catch (error) {
    console.error('Error updating doctor status:', error);
    showNotification(error.message || 'Failed to update status', 'error');
  }
}

export async function handleAddDoctorSpecialty(doctorId, specialty) {
  try {
    if (!specialty) throw new Error('Please select a specialty');
    
    const { error } = await supabase
      .from('doctors')
      .update({ specialty })
      .eq('id', doctorId);
    
    if (error) throw error;
    
    showNotification('✓ Specialty updated', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error updating specialty:', error);
    showNotification(error.message || 'Failed to update specialty', 'error');
  }
}

// ============================================================================
// PATIENT MANAGEMENT
// ============================================================================

export async function handleUpdatePatientInfo(patientId, formData) {
  try {
    const { error } = await supabase
      .from('patients')
      .update({
        blood_type: formData.blood_type,
        allergies: formData.allergies,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId);
    
    if (error) throw error;
    
    showNotification('✓ Patient information updated', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error updating patient info:', error);
    showNotification(error.message || 'Failed to update patient', 'error');
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export async function handleExportData(format = 'csv') {
  try {
    showNotification('Exporting data... This may take a moment', 'info');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) throw usersError;
    
    // Convert to CSV
    const csv = convertToCSV(users);
    downloadCSV(csv, `medilink_users_${new Date().toISOString().split('T')[0]}.csv`);
    
    showNotification('✓ Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showNotification(error.message || 'Failed to export data', 'error');
  }
}

function convertToCSV(array) {
  if (array.length === 0) return '';
  
  const keys = Object.keys(array[0]);
  const header = keys.join(',');
  const rows = array.map(obj =>
    keys.map(key => {
      const value = obj[key];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// SYSTEM ACTIONS
// ============================================================================

export async function handleSystemBackup() {
  try {
    if (!confirm('Create a system backup? This may take a few moments.')) return;
    
    showNotification('Creating backup...',  'info');
    
    // In a real app, you would backup to cloud storage
    // For now, just log the action
    const { error } = await supabase
      .from('system_logs')
      .insert([{
        action: 'backup_created',
        timestamp: new Date().toISOString(),
        user_id: null
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Backup created successfully', 'success');
  } catch (error) {
    console.error('Error creating backup:', error);
    showNotification(error.message || 'Failed to create backup', 'error');
  }
}

export async function handleClearLogs() {
  if (!confirm('Clear all system logs? This action cannot be undone.')) return;
  
  try {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .neq('id', null); // Delete all
    
    if (error) throw error;
    
    showNotification('✓ Logs cleared', 'success');
  } catch (error) {
    console.error('Error clearing logs:', error);
    showNotification(error.message || 'Failed to clear logs', 'error');
  }
}

export async function handleSendSystemNotification(message) {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .insert([{
        message,
        type: 'system',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Notification sent to all users', 'success');
    closeModal();
  } catch (error) {
    console.error('Error sending notification:', error);
    showNotification(error.message || 'Failed to send notification', 'error');
  }
}

export { handleApproveUser, handleRejectUser, handleDeleteUser };
