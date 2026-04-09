/**
 * API Service Layer for MediLink Doctor Portal
 * Handles all data fetching and API calls
 * Currently uses mock data, ready for Firebase or REST API integration
 */

// Mock data for development
const mockData = {
  user: {
    id: 'DOC-123456',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@medilink.com',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    licenseNumber: 'MD-123456',
    specialization: 'General Practice',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA24MAFa8RcTDxqdV0mQvAZwEypWuwj9NMwUFl7aGsIk35mf6bBezsDe8mp-WP2GuvTlj2R1-l_cddJgAzZfGN7bTwuuWsRzJS0YAXTxJgt2XR7Wakd_4ILLXheodY8ZcITJ6LGxpOTEURb5G7zdG2y3swCtdISVx53_TBd3eEQ5jlEderwj_-V5dI3AFSdbYG19cEMXiSqYTdE6okZYNG6u3EXeyUqwlIxBLHV-s8cZCrC6hfpa5GFymFiA6mftaj8dd80yb25Qy-B',
    officeAddress: '123 Medical Center Drive, Suite 101, New York, NY 10001',
    isPremium: true,
    memberSince: '2023-01-15'
  },

  appointments: [
    {
      id: '1',
      patientName: 'John Doe',
      patientId: 'P-001',
      date: '2023-10-25',
      time: '10:00 AM',
      endTime: '10:30 AM',
      type: 'Video Consultation',
      location: 'Virtual',
      status: 'upcoming',
      doctorId: 'DOC-123456',
      notes: 'Follow-up for hypertension management',
      createdAt: '2023-10-20T10:00:00Z'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      patientId: 'P-002',
      date: '2023-10-25',
      time: '2:00 PM',
      endTime: '2:30 PM',
      type: 'In-Person',
      location: 'Office',
      status: 'upcoming',
      doctorId: 'DOC-123456',
      notes: 'Annual physical examination',
      createdAt: '2023-10-20T14:00:00Z'
    }
  ],

  patients: [
    {
      id: 'P-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1980-05-15',
      gender: 'Male',
      address: '456 Patient Street, Apt 7B, New York, NY 10002',
      status: 'active',
      lastVisit: '2023-10-20',
      doctorId: 'DOC-123456',
      createdAt: '2023-01-15T00:00:00Z'
    },
    {
      id: 'P-002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      dateOfBirth: '1985-08-22',
      gender: 'Female',
      address: '789 Medical Lane, Suite 3C, New York, NY 10003',
      status: 'active',
      lastVisit: '2023-10-18',
      doctorId: 'DOC-123456',
      createdAt: '2023-02-20T00:00:00Z'
    },
    {
      id: 'P-003',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@email.com',
      phone: '+1 (555) 456-7890',
      dateOfBirth: '1975-12-10',
      gender: 'Male',
      address: '321 Health Ave, Apt 2A, New York, NY 10004',
      status: 'inactive',
      lastVisit: '2023-09-15',
      doctorId: 'DOC-123456',
      createdAt: '2023-03-10T00:00:00Z'
    }
  ],

  records: [
    {
      id: '1',
      patientId: 'P-001',
      patientName: 'John Doe',
      recordType: 'Clinical Notes',
      date: '2023-10-20',
      time: '10:30 AM',
      description: 'Patient reports improved blood pressure readings. Current medication regimen appears effective. Continue current treatment plan.',
      doctorId: 'DOC-123456',
      status: 'completed',
      createdAt: '2023-10-20T10:30:00Z'
    },
    {
      id: '2',
      patientId: 'P-002',
      patientName: 'Jane Smith',
      recordType: 'Lab Results',
      date: '2023-10-18',
      time: '11:00 AM',
      description: 'Complete blood count shows normal ranges. Lipid panel shows slight elevation in cholesterol - recommend dietary changes and follow-up in 3 months.',
      doctorId: 'DOC-123456',
      status: 'pending_review',
      createdAt: '2023-10-18T11:00:00Z'
    },
    {
      id: '3',
      patientId: 'P-001',
      patientName: 'John Doe',
      recordType: 'Prescription',
      date: '2023-10-15',
      time: '2:00 PM',
      description: 'Lisinopril 10mg daily for hypertension management. 30-day supply.',
      doctorId: 'DOC-123456',
      status: 'completed',
      createdAt: '2023-10-15T14:00:00Z'
    }
  ],

  notifications: [
    {
      id: '1',
      type: 'appointment',
      title: 'New appointment request',
      message: 'John Doe requested an appointment for tomorrow at 10:00 AM',
      read: false,
      createdAt: '2023-10-24T15:30:00Z'
    },
    {
      id: '2',
      type: 'lab_result',
      title: 'Lab results ready',
      message: 'Jane Smith lab results are ready for review',
      read: false,
      createdAt: '2023-10-24T09:15:00Z'
    }
  ]
};

/**
 * API Service - Simulates backend calls
 * Ready to be replaced with Firebase or REST API calls
 */
const apiService = {
  /**
   * Simulate API delay
   */
  delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Fetch user data
   */
  async fetchUser() {
    await this.delay(500);
    return { ...mockData.user };
  },

  /**
   * Fetch appointments
   */
  async fetchAppointments() {
    await this.delay(800);
    return [...mockData.appointments];
  },

  /**
   * Fetch patients
   */
  async fetchPatients() {
    await this.delay(600);
    return [...mockData.patients];
  },

  /**
   * Fetch medical records
   */
  async fetchRecords() {
    await this.delay(700);
    return [...mockData.records];
  },

  /**
   * Fetch notifications
   */
  async fetchNotifications() {
    await this.delay(400);
    return [...mockData.notifications];
  },

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData) {
    await this.delay(1000);
    const newAppointment = {
      id: Date.now().toString(),
      ...appointmentData,
      status: 'upcoming',
      doctorId: stateManager.getState().user?.id || 'DOC-123456',
      createdAt: new Date().toISOString()
    };
    mockData.appointments.push(newAppointment);
    return newAppointment;
  },

  /**
   * Update appointment
   */
  async updateAppointment(id, updates) {
    await this.delay(800);
    const appointment = mockData.appointments.find(apt => apt.id === id);
    if (appointment) {
      Object.assign(appointment, updates);
      return appointment;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id) {
    await this.delay(800);
    const appointment = mockData.appointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.status = 'cancelled';
      appointment.cancelledAt = new Date().toISOString();
      return appointment;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Create new patient
   */
  async createPatient(patientData) {
    await this.delay(1000);
    const newPatient = {
      id: `P-${Date.now().toString()}`,
      ...patientData,
      status: 'active',
      doctorId: stateManager.getState().user?.id || 'DOC-123456',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString()
    };
    mockData.patients.push(newPatient);
    return newPatient;
  },

  /**
   * Update patient
   */
  async updatePatient(id, updates) {
    await this.delay(800);
    const patient = mockData.patients.find(p => p.id === id);
    if (patient) {
      Object.assign(patient, updates);
      return patient;
    }
    throw new Error('Patient not found');
  },

  /**
   * Create medical record
   */
  async createRecord(recordData) {
    await this.delay(1000);
    const newRecord = {
      id: Date.now().toString(),
      ...recordData,
      doctorId: stateManager.getState().user?.id || 'DOC-123456',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    mockData.records.push(newRecord);
    return newRecord;
  },

  /**
   * Update medical record
   */
  async updateRecord(id, updates) {
    await this.delay(800);
    const record = mockData.records.find(r => r.id === id);
    if (record) {
      Object.assign(record, updates);
      return record;
    }
    throw new Error('Record not found');
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(id) {
    await this.delay(300);
    const notification = mockData.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return notification;
    }
    throw new Error('Notification not found');
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    await this.delay(600);
    const appointments = mockData.appointments;
    const patients = mockData.patients;
    const records = mockData.records;
    const notifications = mockData.notifications;
    
    return {
      totalPatients: patients.length,
      appointmentsToday: appointments.filter(apt => 
        new Date(apt.date).toDateString() === new Date().toDateString()
      ).length,
      pendingRequests: notifications.filter(n => !n.read).length,
      revenueThisMonth: 0, // Would calculate from actual billing data
      activePatients: patients.filter(p => p.status === 'active').length,
      newThisMonth: patients.filter(p => 
        new Date(p.createdAt).getMonth() === new Date().getMonth()
      ).length,
      criticalCases: patients.filter(p => p.status === 'critical').length,
      totalRecords: records.length,
      labResults: records.filter(r => r.recordType === 'Lab Results').length,
      imagingReports: records.filter(r => r.recordType === 'Imaging').length,
      prescriptions: records.filter(r => r.recordType === 'Prescription').length
    };
  },

  /**
   * Search patients
   */
  async searchPatients(query) {
    await this.delay(400);
    const patients = mockData.patients;
    const lowerQuery = query.toLowerCase();
    
    return patients.filter(patient => 
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.email.toLowerCase().includes(lowerQuery) ||
      patient.phone.includes(query)
    );
  },

  /**
   * Search records
   */
  async searchRecords(query) {
    await this.delay(400);
    const records = mockData.records;
    const lowerQuery = query.toLowerCase();
    
    return records.filter(record => 
      record.patientName.toLowerCase().includes(lowerQuery) ||
      record.recordType.toLowerCase().includes(lowerQuery) ||
      record.description.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userData) {
    await this.delay(1000);
    Object.assign(mockData.user, userData);
    return { ...mockData.user };
  },

  /**
   * Update settings
   */
  async updateSettings(settings) {
    await this.delay(500);
    Object.assign(stateManager.getState().settings, settings);
    return { ...settings };
  },

  /**
   * Get appointments for date range
   */
  async getAppointmentsByDateRange(startDate, endDate) {
    await this.delay(600);
    const appointments = mockData.appointments;
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= new Date(startDate) && aptDate <= new Date(endDate);
    });
  },

  /**
   * Get appointments for specific date
   */
  async getAppointmentsByDate(date) {
    await this.delay(400);
    const appointments = mockData.appointments;
    
    return appointments.filter(apt => 
      new Date(apt.date).toDateString() === new Date(date).toDateString()
    );
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiService, mockData };
}
