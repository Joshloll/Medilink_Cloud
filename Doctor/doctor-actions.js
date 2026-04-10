// ============================================================================
// DOCTOR MODULE ACTION HANDLERS
// ============================================================================
// Handles all doctor-specific actions for appointments, records, prescriptions
// ============================================================================

import { supabase, showNotification, closeModal } from '../js/global-event-handler.js';

// ============================================================================
// APPOINTMENT MANAGEMENT
// ============================================================================

export async function handleCompleteAppointment(appointmentId) {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('✓ Appointment marked as completed', 'success');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error completing appointment:', error);
    showNotification(error.message || 'Failed to complete appointment', 'error');
  }
}

export async function handleCancelAppointment(appointmentId, reason = '') {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('Appointment cancelled', 'info');
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    showNotification(error.message || 'Failed to cancel appointment', 'error');
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
    
    showNotification('✓ Appointment rescheduled', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error rescheduling:', error);
    showNotification(error.message || 'Failed to reschedule', 'error');
  }
}

export async function handleAddNoteToAppointment(appointmentId, note) {
  try {
    if (!note || note.trim().length === 0) {
      throw new Error('Please enter a note');
    }
    
    // Get current notes
    const { data: appointment } = await supabase
      .from('appointments')
      .select('notes')
      .eq('id', appointmentId)
      .single();
    
    const notes = appointment?.notes || [];
    notes.push({
      timestamp: new Date().toISOString(),
      text: note,
      by: 'doctor'
    });
    
    const { error } = await supabase
      .from('appointments')
      .update({ notes })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('✓ Note added to appointment', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error adding note:', error);
    showNotification(error.message || 'Failed to add note', 'error');
  }
}

// ============================================================================
// MEDICAL RECORDS
// ============================================================================

export async function handleCreateMedicalRecord(patientId, formData) {
  try {
    // Get current user (doctor)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get doctor ID
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!doctor) throw new Error('Doctor profile not found');
    
    const { error } = await supabase
      .from('medical_records')
      .insert([{
        patient_id: patientId,
        doctor_id: doctor.id,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Medical record created', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error creating record:', error);
    showNotification(error.message || 'Failed to create record', 'error');
  }
}

export async function handleUpdateMedicalRecord(recordId, formData) {
  try {
    const { error } = await supabase
      .from('medical_records')
      .update({
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId);
    
    if (error) throw error;
    
    showNotification('✓ Medical record updated', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error updating record:', error);
    showNotification(error.message || 'Failed to update record', 'error');
  }
}

export async function handleDeleteMedicalRecord(recordId) {
  if (!confirm('Are you sure you want to delete this medical record?')) return;
  
  try {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
    
    showNotification('Record deleted', 'info');
    window.location.reload();
  } catch (error) {
    console.error('Error deleting record:', error);
    showNotification(error.message || 'Failed to delete record', 'error');
  }
}

// ============================================================================
// PRESCRIPTIONS
// ============================================================================

export async function handleCreatePrescription(patientId, formData) {
  try {
    // Get current user (doctor)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get doctor ID
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!doctor) throw new Error('Doctor profile not found');
    
    const { error } = await supabase
      .from('prescriptions')
      .insert([{
        patient_id: patientId,
        doctor_id: doctor.id,
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions,
        status: 'active',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Prescription created', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error creating prescription:', error);
    showNotification(error.message || 'Failed to create prescription', 'error');
  }
}

export async function handleApprovePrescriptionRefill(prescriptionId) {
  try {
    const { error } = await supabase
      .from('prescriptions')
      .update({
        refill_requested: false,
        refill_approved_at: new Date().toISOString()
      })
      .eq('id', prescriptionId);
    
    if (error) throw error;
    
    showNotification('✓ Refill approved', 'success');
    window.location.reload();
  } catch (error) {
    console.error('Error approving refill:', error);
    showNotification(error.message || 'Failed to approve refill', 'error');
  }
}

export async function handleRejectPrescriptionRefill(prescriptionId, reason = '') {
  try {
    const { error } = await supabase
      .from('prescriptions')
      .update({
        refill_requested: false,
        refill_rejected_reason: reason,
        refill_rejected_at: new Date().toISOString()
      })
      .eq('id', prescriptionId);
    
    if (error) throw error;
    
    showNotification('Refill request denied', 'info');
    window.location.reload();
  } catch (error) {
    console.error('Error rejecting refill:', error);
    showNotification(error.message || 'Failed to reject refill', 'error');
  }
}

export async function handleExpirePrescription(prescriptionId) {
  try {
    const { error } = await supabase
      .from('prescriptions')
      .update({
        status: 'expired',
        expired_at: new Date().toISOString()
      })
      .eq('id', prescriptionId);
    
    if (error) throw error;
    
    showNotification('Prescription marked as expired', 'info');
    window.location.reload();
  } catch (error) {
    console.error('Error expiring prescription:', error);
    showNotification(error.message || 'Failed to expire prescription', 'error');
  }
}

// ============================================================================
// PATIENT MANAGEMENT
// ============================================================================

export async function handleGetPatientHistory(patientId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    showNotification('Failed to fetch patient history', 'error');
    return [];
  }
}

export async function handleAddPatientNote(patientId, note) {
  try {
    if (!note || note.trim().length === 0) {
      throw new Error('Please enter a note');
    }
    
    const { error } = await supabase
      .from('patients')
      .insert([{
        patient_id: patientId,
        note,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Note added to patient profile', 'success');
    closeModal();
  } catch (error) {
    console.error('Error adding patient note:', error);
    showNotification(error.message || 'Failed to add note', 'error');
  }
}

// ============================================================================
// DOCTOR PROFILE MANAGEMENT
// ============================================================================

export async function handleUpdateDoctorProfile(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Update user table
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (userError) throw userError;
    
    // Update doctor table
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (doctor) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          specialty: formData.specialty,
          license_number: formData.license_number,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', doctor.id);
      
      if (doctorError) throw doctorError;
    }
    
    showNotification('✓ Profile updated successfully', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification(error.message || 'Failed to update profile', 'error');
  }
}

export async function handleUpdateAvailability(status) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!doctor) throw new Error('Doctor profile not found');
    
    const { error } = await supabase
      .from('doctors')
      .update({
        availability_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctor.id);
    
    if (error) throw error;
    
    showNotification(`✓ Status updated to ${status}`, 'success');
    window.location.reload();
  } catch (error) {
    console.error('Error updating availability:', error);
    showNotification(error.message || 'Failed to update availability', 'error');
  }
}

// ============================================================================
// PATIENT COMMUNICATIONS
// ============================================================================

export async function handleSendMessageToPatient(patientId, message) {
  try {
    if (!message || message.trim().length === 0) {
      throw new Error('Please enter a message');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        from_user_id: user.id,
        to_user_id: patientId,
        message,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Message sent to patient', 'success');
    closeModal();
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.message || 'Failed to send message', 'error');
  }
}

export { 
  handleCompleteAppointment,
  handleCancelAppointment,
  handleCreateMedicalRecord,
  handleCreatePrescription,
  handleUpdateDoctorProfile
};
