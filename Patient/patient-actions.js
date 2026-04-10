// ============================================================================
// PATIENT MODULE ACTION HANDLERS  
// ============================================================================
// Handles all patient-specific actions for bookings, records, prescriptions
// ============================================================================

import { supabase, showNotification, closeModal } from '../js/global-event-handler.js';

// ============================================================================
// APPOINTMENT MANAGEMENT
// ============================================================================

export async function handleBookAppointment(doctorId, formData) {
  try {
    // Validate form data
    if (!doctorId || !formData.appointment_date || !formData.appointment_time || !formData.reason) {
      throw new Error('Please fill in all required fields');
    }
    
    // Get current patient
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get patient ID
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!patient) throw new Error('Patient profile not found');
    
    // Create appointment
    const { error } = await supabase
      .from('appointments')
      .insert([{
        doctor_id: doctorId,
        patient_id: patient.id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Appointment booked successfully!', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error('Error booking appointment:', error);
    showNotification(error.message || 'Failed to book appointment', 'error');
  }
}

export async function handleCancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('✓ Appointment cancelled', 'info');
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
      .select('patient_notes')
      .eq('id', appointmentId)
      .single();
    
    const notes = appointment?.patient_notes || [];
    notes.push({
      timestamp: new Date().toISOString(),
      text: note
    });
    
    const { error } = await supabase
      .from('appointments')
      .update({ patient_notes: notes })
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    showNotification('✓ Note added', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error adding note:', error);
    showNotification(error.message || 'Failed to add note', 'error');
  }
}

// ============================================================================
// PRESCRIPTION MANAGEMENT
// ============================================================================

export async function handleRequestPrescriptionRefill(prescriptionId) {
  try {
    const { error } = await supabase
      .from('prescriptions')
      .update({
        refill_requested: true,
        refill_requested_at: new Date().toISOString()
      })
      .eq('id', prescriptionId);
    
    if (error) throw error;
    
    showNotification('✓ Refill request submitted. Your doctor will review it shortly.', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error('Error requesting refill:', error);
    showNotification(error.message || 'Failed to request refill', 'error');
  }
}

export async function handleDownloadPrescription(prescriptionId) {
  try {
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(user:users(full_name))
      `)
      .eq('id', prescriptionId)
      .single();
    
    if (error) throw error;
    
    // Create a text document
    const content = `
PRESCRIPTION
================================
Medication: ${prescription.medication_name}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency}
Duration: ${prescription.duration}
Doctor: ${prescription.doctor.user.full_name}
Date: ${new Date(prescription.created_at).toLocaleDateString()}
${prescription.instructions ? `\nInstructions: ${prescription.instructions}` : ''}
    `.trim();
    
    // Download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${prescriptionId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('✓ Prescription downloaded', 'success');
  } catch (error) {
    console.error('Error downloading prescription:', error);
    showNotification(error.message || 'Failed to download prescription', 'error');
  }
}

// ============================================================================
// MEDICAL RECORDS
// ============================================================================

export async function handleDownloadMedicalRecord(recordId) {
  try {
    const { data: record, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        doctor:doctors(user:users(full_name))
      `)
      .eq('id', recordId)
      .single();
    
    if (error) throw error;
    
    // Create a text document
    const content = `
MEDICAL RECORD
================================
Diagnosis: ${record.diagnosis}
Treatment: ${record.treatment}
Doctor: ${record.doctor.user.full_name}
Date: ${new Date(record.created_at).toLocaleDateString()}
${record.notes ? `\nNotes: ${record.notes}` : ''}
    `.trim();
    
    // Download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_record_${recordId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('✓ Record downloaded', 'success');
  } catch (error) {
    console.error('Error downloading record:', error);
    showNotification(error.message || 'Failed to download record', 'error');
  }
}

export async function handleRequestCopyOfRecords() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Create a request
    const { error } = await supabase
      .from('record_requests')
      .insert([{
        user_id: user.id,
        request_type: 'copy_of_records',
        status: 'pending',
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Request submitted. You will receive your records within 5-7 business days.', 'success');
  } catch (error) {
    console.error('Error requesting records:', error);
    showNotification(error.message || 'Failed to submit request', 'error');
  }
}

// ============================================================================
// PATIENT PROFILE  
// ============================================================================

export async function handleUpdatePatientProfile(formData) {
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
    
    // Update patient table
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (patient) {
      const { error: patientError } = await supabase
        .from('patients')
        .update({
          blood_type: formData.blood_type,
          allergies: formData.allergies,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id);
      
      if (patientError) throw patientError;
    }
    
    showNotification('✓ Profile updated successfully', 'success');
    closeModal();
    setTimeout(() => window.location.reload(), 500);
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification(error.message || 'Failed to update profile', 'error');
  }
}

// ============================================================================
// COMMUNICATIONS
// ============================================================================

export async function handleSendMessageToDoctor(doctorId, message) {
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
        to_user_id: doctorId,
        message,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    
    showNotification('✓ Message sent to doctor', 'success');
    closeModal();
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification(error.message || 'Failed to send message', 'error');
  }
}

// ============================================================================
// DOCUMENT UPLOAD
// ============================================================================

export async function handleUploadDocumentToRecord(recordId, file) {
  try {
    if (!file) throw new Error('Please select a file');
    
    // Upload to Supabase Storage
    const fileName = `${recordId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('medical_documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('medical_documents')
      .getPublicUrl(fileName);
    
    // Add to database
    const { error: dbError } = await supabase
      .from('medical_record_documents')
      .insert([{
        record_id: recordId,
        file_name: file.name,
        file_url: data.publicUrl,
        file_size: file.size,
        created_at: new Date().toISOString()
      }]);
    
    if (dbError) throw dbError;
    
    showNotification('✓ Document uploaded successfully', 'success');
    closeModal();
    window.location.reload();
  } catch (error) {
    console.error('Error uploading document:', error);
    showNotification(error.message || 'Failed to upload document', 'error');
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export async function handleExportHealthData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!patient) throw new Error('Patient profile not found');
    
    // Fetch all data
    const [appointments, records, prescriptions] = await Promise.all([
      supabase.from('appointments').select('*').eq('patient_id', patient.id),
      supabase.from('medical_records').select('*').eq('patient_id', patient.id),
      supabase.from('prescriptions').select('*').eq('patient_id', patient.id)
    ]);
    
    // Create JSON export
    const exportData = {
      exported_at: new Date().toISOString(),
      appointments: appointments.data,
      medical_records: records.data,
      prescriptions: prescriptions.data
    };
    
    // Download
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('✓ Health data exported', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showNotification(error.message || 'Failed to export data', 'error');
  }
}

export {
  handleBookAppointment,
  handleCancelAppointment,
  handleRequestPrescriptionRefill,
  handleUpdatePatientProfile
};
