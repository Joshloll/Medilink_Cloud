/**
 * API Service Layer for MediLink Doctor Portal
 * Handles all data fetching and API calls
 * Clean template ready for Firebase or REST API integration
 */

// Clean mock data for development
const mockData = {
  user: {
    id: 'DOC-123456',
    firstName: '[First Name]',
    lastName: '[Last Name]',
    email: '[Email]',
    phone: '[Phone]',
    dateOfBirth: '[Date of Birth]',
    gender: '[Gender]',
    licenseNumber: '[License Number]',
    specialization: '[Specialization]',
    profileImage: '[Profile Image]',
    officeAddress: '[Office Address]',
    isPremium: false,
    memberSince: '[Member Since]'
  },

  appointments: [
    {
      id: '1',
      patientName: '[Patient Name]',
      patientId: '[Patient ID]',
      date: '[Date]',
      time: '[Time]',
      endTime: '[End Time]',
      type: '[Type]',
      location: '[Location]',
      status: 'upcoming',
      doctorId: 'DOC-123456',
      notes: '[Notes]',
      createdAt: '[Created At]'
    }
  ],

  patients: [
    {
      id: '[Patient ID]',
      firstName: '[First Name]',
      lastName: '[Last Name]',
      email: '[Email]',
      phone: '[Phone]',
      dateOfBirth: '[Date of Birth]',
      gender: '[Gender]',
      address: '[Address]',
      status: 'active',
      lastVisit: '[Last Visit]',
      doctorId: 'DOC-123456',
      createdAt: '[Created At]'
    }
  ],

  records: [
    {
      id: '1',
      patientId: '[Patient ID]',
      patientName: '[Patient Name]',
      recordType: '[Record Type]',
      date: '[Date]',
      time: '[Time]',
      description: '[Description]',
      doctorId: 'DOC-123456',
      status: 'completed',
      createdAt: '[Created At]'
    }
  ],

  notifications: [
    {
      id: '1',
      type: '[Type]',
      title: '[Title]',
      message: '[Message]',
      read: false,
      createdAt: '[Created At]'
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
      doctorId: stateManager?.getState()?.user?.id || 'DOC-123456',
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
      doctorId: stateManager?.getState()?.user?.id || 'DOC-123456',
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
      doctorId: stateManager?.getState()?.user?.id || 'DOC-123456',
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
      revenueThisMonth: 0,
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
    Object.assign(stateManager?.getState()?.settings || {}, settings);
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
