/**
 * ============================================================================
 * IMPROVED FORM HANDLER WITH VALIDATION & UX
 * ============================================================================
 * Centralized form validation, submission handling, and error display
 * ============================================================================
 */

import { showError, showSuccess, addButtonSpinner, removeButtonSpinner } from './api-utils.js';

/**
 * Validation rules for common fields
 */
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]{10,}$/,
    message: 'Please enter a valid phone number'
  },
  date: {
    required: true,
    type: 'date',
    message: 'Please select a valid date'
  },
  time: {
    required: true,
    type: 'time',
    message: 'Please select a valid time'
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters'
  },
  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid ZIP code'
  }
};

/**
 * Validate a single field
 */
export function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name || field.id;
  const rules = validationRules[fieldName] || {};

  // Check required
  if (rules.required && !value) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  // Check min length
  if (rules.minLength && value.length < rules.minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${rules.minLength} characters`
    };
  }

  // Check pattern
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return {
      valid: false,
      error: rules.message || `${fieldName} is invalid`
    };
  }

  // Check type
  if (rules.type === 'date' && value) {
    if (new Date(value) < new Date()) {
      return {
        valid: false,
        error: 'Date cannot be in the past'
      };
    }
  }

  return { valid: true };
}

/**
 * Validate entire form
 */
export function validateForm(formElement) {
  const fields = formElement.querySelectorAll('input, textarea, select');
  const errors = {};
  let isValid = true;

  fields.forEach(field => {
    const validation = validateField(field);
    if (!validation.valid) {
      errors[field.name || field.id] = validation.error;
      isValid = false;
    }
  });

  return { valid: isValid, errors };
}

/**
 * Display field-level errors
 */
export function displayFieldError(field, errorMessage) {
  // Remove existing error
  clearFieldError(field);

  // Create error element
  const errorEl = document.createElement('div');
  errorEl.className = 'field-error text-red-500 dark:text-red-400 text-sm mt-1';
  errorEl.textContent = errorMessage;

  // Add red border to field
  field.classList.add('border-red-500', 'dark:border-red-500');

  // Insert error message after field
  field.parentElement.insertBefore(errorEl, field.nextSibling);
}

/**
 * Clear field-level errors
 */
export function clearFieldError(field) {
  field.classList.remove('border-red-500', 'dark:border-red-500');
  
  const errorEl = field.nextElementSibling;
  if (errorEl?.classList.contains('field-error')) {
    errorEl.remove();
  }
}

/**
 * Clear all form errors
 */
export function clearFormErrors(formElement) {
  const fields = formElement.querySelectorAll('input, textarea, select');
  fields.forEach(field => clearFieldError(field));
}

/**
 * Enable/disable form submission button
 */
export function disableFormButton(formElement, disabled = true) {
  const submitBtn = formElement.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = disabled;
    if (disabled) {
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * Real-time field validation on input
 */
export function setupFieldValidation(formElement) {
  const fields = formElement.querySelectorAll('input, textarea, select');

  fields.forEach(field => {
    // Clear error on input
    field.addEventListener('input', () => {
      clearFieldError(field);
    });

    // Validate on blur
    field.addEventListener('blur', () => {
      const validation = validateField(field);
      if (!validation.valid) {
        displayFieldError(field, validation.error);
      }
    });
  });
}

/**
 * Handle form submission with full validation
 */
export async function handleFormSubmissionImproved(formElement, submitHandler) {
  // Clear previous errors
  clearFormErrors(formElement);

  // Validate entire form
  const validation = validateForm(formElement);
  if (!validation.valid) {
    // Display all errors
    Object.entries(validation.errors).forEach(([fieldName, error]) => {
      const field = formElement.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`);
      if (field) displayFieldError(field, error);
    });

    showError('Please fix the errors above');
    return false;
  }

  try {
    // Get form data
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);

    // Get and disable submit button
    const submitBtn = formElement.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    addButtonSpinner(submitBtn);

    // Call handler
    const result = await submitHandler(data);

    if (result.success) {
      formElement.reset();
      showSuccess(result.message || 'Form submitted successfully!');
      clearFormErrors(formElement);
      return true;
    } else {
      showError(result.error || 'Submission failed');
      return false;
    }
  } catch (error) {
    showError(`Error: ${error.message}`);
    return false;
  } finally {
    const submitBtn = formElement.querySelector('button[type="submit"]');
    removeButtonSpinner(submitBtn);
  }
}

/**
 * Setup form auto-submission prevention
 */
export function preventDoubleSubmit(formElement) {
  let isSubmitting = false;

  formElement.addEventListener('submit', (e) => {
    if (isSubmitting) {
      e.preventDefault();
      return false;
    }

    isSubmitting = true;

    // Reset after request completes
    setTimeout(() => {
      isSubmitting = false;
    }, 3000);
  });
}

/**
 * Setup complete form with validation and submission
 */
export function setupFormComplete(formSelector, submitHandler) {
  const formElement = document.querySelector(formSelector);
  if (!formElement) return;

  // Setup real-time validation
  setupFieldValidation(formElement);

  // Prevent double submit
  preventDoubleSubmit(formElement);

  // Handle form submission
  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmissionImproved(formElement, submitHandler);
  });
}

/**
 * Auto-populate form with data
 */
export function populateForm(formElement, data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = formElement.querySelector(`[name="${key}"]`);
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value;
      } else if (field.type === 'radio') {
        formElement.querySelector(`[name="${key}"][value="${value}"]`).checked = true;
      } else {
        field.value = value;
      }
    }
  });
}

/**
 * Get form data as object
 */
export function getFormData(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData);
}

/**
 * Clear form completely
 */
export function clearForm(formElement) {
  formElement.reset();
  clearFormErrors(formElement);
}

/**
 * Add custom validation rule
 */
export function addValidationRule(fieldName, rule) {
  validationRules[fieldName] = {
    ...validationRules[fieldName],
    ...rule
  };
}
