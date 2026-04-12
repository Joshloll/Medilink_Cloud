// Unified Form Handler System
// Handles all form submissions across the application with Supabase integration

import { showNotification, closeModal } from './global-event-handler.js';
import supabaseAuthService from '../auth/supabase-auth.js';

// ============================================================================
// FORM VALIDATOR
// ============================================================================

export function validateForm(formData, rules) {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    // Check required
    if (rule.required && (!value || value.trim() === '')) {
      errors.push(`${rule.label || field} is required`);
      continue;
    }
    
    // Check type
    if (value && rule.type) {
      if (rule.type === 'email' && !isValidEmail(value)) {
        errors.push('Invalid email address');
      } else if (rule.type === 'phone' && !isValidPhone(value)) {
        errors.push('Invalid phone number');
      } else if (rule.type === 'date' && !isValidDate(value)) {
        errors.push('Invalid date');
      } else if (rule.type === 'time' && !isValidTime(value)) {
        errors.push('Invalid time');
      }
    }
    
    // Check min length
    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
    }
    
    // Check max length
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${rule.label || field} must not exceed ${rule.maxLength} characters`);
    }
  }
  
  return errors;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

function isValidTime(time) {
  const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(time);
}

// ============================================================================
// MAIN FORM HANDLER
// ============================================================================

class FormHandler {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const action = form.dataset.action;
      
      if (action) {
        event.preventDefault();
        this.handleFormSubmit(action, form);
      }
    });
  }

  async handleFormSubmit(action, form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Processing...';
    }

    try {
      let result;
      
      switch (action) {
        case 'login':
          result = await this.handleLogin(data);
          break;
          
        case 'register':
          result = await this.handleRegister(data);
          break;
          
        case 'create-user':
          result = await this.handleCreateUser(data);
          break;
          
        case 'create-appointment':
          result = await this.handleCreateAppointment(data);
          break;
          
        case 'book-appointment':
          result = await this.handleBookAppointment(data);
          break;
          
        case 'book-appointment-submit':
          result = await this.handleBookAppointment(data);
          break;
          
        case 'create-medical-record':
          result = await this.handleCreateMedicalRecord(data, form);
          break;
          
        case 'create-prescription':
          result = await this.handleCreatePrescription(data, form);
          break;
          
        case 'reschedule-appointment':
          result = await this.handleRescheduleAppointment(data, form);
          break;
          
        case 'create-record-submit':
          result = await this.handleCreateMedicalRecord(data, form);
          break;
          
        case 'create-prescription-submit':
          result = await this.handleCreatePrescription(data, form);
          break;
          
        default:
          console.warn('Unknown form action:', action);
          return;
      }

      if (result.success) {
        showNotification(result.message || 'Operation successful!', 'success');
        
        // Reset form on success
        form.reset();
        
        // Close modal if in one
        const modal = form.closest('.modal') || form.closest('[id*="modal"]');
        if (modal) {
          modal.remove();
        }
        
        // Reload page or redirect if needed
        if (result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 1000);
        } else if (result.reload) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        showNotification(result.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification(error.message || 'An unexpected error occurred', 'error');
    } finally {
      // Restore button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  }

  async handleLogin(data) {
    const result = await supabaseAuthService.loginUser(data.email, data.password);
    
    if (result.success) {
      return {
        success: true,
        message: 'Login successful!',
        redirectUrl: result.redirectUrl
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  }

  async handleRegister(data) {
    // Validate registration data
    const errors = validateForm(data, {
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, minLength: 6, label: 'Password' },
      full_name: { required: true, minLength: 2, label: 'Full Name' },
      role: { required: true, label: 'Role' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    const result = await supabaseAuthService.registerUser(
      data.email,
      data.password,
      data.full_name,
      data.role,
      {
        phone_number: data.phone,
        ...(data.role === 'doctor' && {
          license_number: data.license_number,
          specialization: data.specialization
        }),
        ...(data.role === 'patient' && {
          date_of_birth: data.date_of_birth,
          blood_type: data.blood_type
        })
      }
    );
    
    return result;
  }

  async handleCreateUser(data) {
    // Validate user creation data
    const errors = validateForm(data, {
      email: { required: true, type: 'email', label: 'Email' },
      full_name: { required: true, minLength: 2, label: 'Full Name' },
      role: { required: true, label: 'Role' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    const result = await supabaseAuthService.createUserByAdmin(
      data.email,
      data.password || Math.random().toString(36).slice(-12), // Generate random password
      data.full_name,
      data.role,
      {
        phone_number: data.phone,
        ...(data.role === 'doctor' && {
          license_number: data.license_number,
          specialization: data.specialization
        }),
        ...(data.role === 'patient' && {
          date_of_birth: data.date_of_birth,
          blood_type: data.blood_type
        })
      }
    );
    
    return {
      ...result,
      reload: true
    };
  }

  async handleCreateAppointment(data) {
    const supabase = supabaseAuthService.getSupabaseClient();
    
    // Validate appointment data
    const errors = validateForm(data, {
      doctor_id: { required: true, label: 'Doctor' },
      patient_id: { required: true, label: 'Patient' },
      appointment_date: { required: true, type: 'date', label: 'Date' },
      appointment_time: { required: true, type: 'time', label: 'Time' },
      reason: { required: true, minLength: 5, label: 'Reason' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }
    
    try {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          reason_for_visit: data.reason,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Appointment created successfully',
        reload: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleBookAppointment(data) {
    const supabase = supabaseAuthService.getSupabaseClient();
    const currentUser = supabaseAuthService.getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        error: 'You must be logged in to book an appointment'
      };
    }

    // Validate booking data
    const errors = validateForm(data, {
      doctor_id: { required: true, label: 'Doctor' },
      appointment_date: { required: true, type: 'date', label: 'Date' },
      appointment_time: { required: true, type: 'time', label: 'Time' },
      reason: { required: true, minLength: 5, label: 'Reason' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    try {
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!patient) {
        return {
          success: false,
          error: 'Patient profile not found'
        };
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          doctor_id: data.doctor_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          reason_for_visit: data.reason,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Appointment booked successfully',
        reload: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleCreateMedicalRecord(data, form) {
    const supabase = supabaseAuthService.getSupabaseClient();
    const currentUser = supabaseAuthService.getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        error: 'You must be logged in to create medical records'
      };
    }

    // Get patient ID from form data or form attribute
    const patientId = data.patient_id || form.dataset.patientId;
    
    if (!patientId) {
      return {
        success: false,
        error: 'Patient ID is required'
      };
    }

    // Validate medical record data
    const errors = validateForm(data, {
      diagnosis: { required: true, minLength: 3, label: 'Diagnosis' },
      treatment: { required: true, minLength: 5, label: 'Treatment' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    try {
      // Get doctor ID
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!doctor) {
        return {
          success: false,
          error: 'Doctor profile not found'
        };
      }

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          doctor_id: doctor.id,
          diagnosis: data.diagnosis,
          treatment_plan: data.treatment,
          description: data.notes,
          record_type: 'diagnosis',
          is_visible_to_patient: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Medical record created successfully',
        reload: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleCreatePrescription(data, form) {
    const supabase = supabaseAuthService.getSupabaseClient();
    const currentUser = supabaseAuthService.getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        error: 'You must be logged in to create prescriptions'
      };
    }

    // Get patient ID from form data or form attribute
    const patientId = data.patient_id || form.dataset.patientId;
    
    if (!patientId) {
      return {
        success: false,
        error: 'Patient ID is required'
      };
    }

    // Validate prescription data
    const errors = validateForm(data, {
      medication_name: { required: true, minLength: 3, label: 'Medication' },
      dosage: { required: true, minLength: 2, label: 'Dosage' },
      frequency: { required: true, label: 'Frequency' },
      duration: { required: true, minLength: 2, label: 'Duration' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    try {
      // Get doctor ID
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!doctor) {
        return {
          success: false,
          error: 'Doctor profile not found'
        };
      }

      const { data: prescription, error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_id: doctor.id,
          medication_name: data.medication_name,
          dosage: data.dosage,
          frequency: data.frequency,
          duration: data.duration,
          instructions: data.instructions,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Prescription created successfully',
        reload: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleRescheduleAppointment(data, form) {
    const supabase = supabaseAuthService.getSupabaseClient();
    
    // Get appointment ID from form data or form attribute
    const appointmentId = data.appointment_id || form.dataset.apptId || form.dataset.appointmentId;
    
    if (!appointmentId) {
      return {
        success: false,
        error: 'Appointment ID is required'
      };
    }

    // Validate reschedule data
    const errors = validateForm(data, {
      new_date: { required: true, type: 'date', label: 'Date' },
      new_time: { required: true, type: 'time', label: 'Time' }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: data.new_date,
          appointment_time: data.new_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      return {
        success: true,
        message: 'Appointment rescheduled successfully',
        reload: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Initialize form handler
const formHandler = new FormHandler();

export default formHandler;
export { validateForm, isValidEmail, isValidPhone, isValidDate, isValidTime };
