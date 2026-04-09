/**
 * API Service Layer for MediLink Patient Portal
 * Handles all data fetching and API calls
 * Clean template ready for Firebase or REST API integration
 */

// Clean mock data for development
const mockData = {
  user: {
    id: 'PAT-001',
    firstName: '[First Name]',
    lastName: '[Last Name]',
    email: '[Email]',
    phone: '[Phone]',
    dateOfBirth: '[Date of Birth]',
    gender: '[Gender]',
    address: '[Address]',
    profileImage: '[Profile Image]',
    isPremium: false,
    memberSince: '[Member Since]'
  },

  appointments: [
    {
      id: '1',
      doctorName: '[Doctor Name]',
      specialty: '[Specialty]',
      date: '[Date]',
      time: '[Time]',
      endTime: '[End Time]',
      type: '[Type]',
      location: '[Location]',
      status: 'upcoming',
      doctorImage: '[Doctor Image]'
    }
  ],

  records: [
    {
      id: '1',
      recordType: '[Record Type]',
      date: '[Date]',
      time: '[Time]',
      description: '[Description]',
      doctorName: '[Doctor Name]',
      status: 'completed'
    }
  ],

  prescriptions: [
    {
      id: '1',
      medicationName: '[Medication Name]',
      dosage: '[Dosage]',
      frequency: '[Frequency]',
      startDate: '[Start Date]',
      endDate: '[End Date]',
      doctorName: '[Doctor Name]',
      status: 'active',
      refillsRemaining: 0
    }
  ],

  vitals: [
    {
      id: '1',
      type: '[Vital Type]',
      value: '[Value]',
      unit: '[Unit]',
      date: '[Date]',
      time: '[Time]',
      doctorName: '[Doctor Name]'
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
   * Fetch medical records
   */
  async fetchRecords() {
    await this.delay(700);
    return [...mockData.records];
  },

  /**
   * Fetch prescriptions
   */
  async fetchPrescriptions() {
    await this.delay(600);
    return [...mockData.prescriptions];
  },

  /**
   * Fetch vitals
   */
  async fetchVitals() {
    await this.delay(500);
    return [...mockData.vitals];
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
   * Reschedule appointment
   */
  async rescheduleAppointment(id, newDate, newTime) {
    await this.delay(800);
    const appointment = mockData.appointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.date = newDate;
      appointment.time = newTime;
      appointment.status = 'upcoming';
      appointment.rescheduledAt = new Date().toISOString();
      return appointment;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Request prescription refill
   */
  async requestRefill(prescriptionId) {
    await this.delay(1000);
    const prescription = mockData.prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      prescription.status = 'refill_requested';
      prescription.refillRequestedAt = new Date().toISOString();
      return prescription;
    }
    throw new Error('Prescription not found');
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
    // In a real app, this would update user settings in the database
    return { ...settings };
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    await this.delay(600);
    const appointments = mockData.appointments;
    const records = mockData.records;
    const prescriptions = mockData.prescriptions;
    const vitals = mockData.vitals;
    
    return {
      upcomingAppointments: appointments.filter(apt => apt.status === 'upcoming').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      totalRecords: records.length,
      activePrescriptions: prescriptions.filter(p => p.status === 'active').length,
      recentVitals: vitals.length,
      lastAppointment: appointments.length > 0 ? appointments[0].date : null
    };
  },

  /**
   * Search appointments
   */
  async searchAppointments(query) {
    await this.delay(400);
    const appointments = mockData.appointments;
    const lowerQuery = query.toLowerCase();
    
    return appointments.filter(apt => 
      apt.doctorName.toLowerCase().includes(lowerQuery) ||
      apt.specialty.toLowerCase().includes(lowerQuery) ||
      apt.type.toLowerCase().includes(lowerQuery) ||
      apt.location.toLowerCase().includes(lowerQuery)
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
      record.recordType.toLowerCase().includes(lowerQuery) ||
      record.description.toLowerCase().includes(lowerQuery) ||
      record.doctorName.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Search prescriptions
   */
  async searchPrescriptions(query) {
    await this.delay(400);
    const prescriptions = mockData.prescriptions;
    const lowerQuery = query.toLowerCase();
    
    return prescriptions.filter(prescription => 
      prescription.medicationName.toLowerCase().includes(lowerQuery) ||
      prescription.dosage.toLowerCase().includes(lowerQuery) ||
      prescription.doctorName.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get appointments by date
   */
  async getAppointmentsByDate(date) {
    await this.delay(400);
    const appointments = mockData.appointments;
    
    return appointments.filter(apt => 
      new Date(apt.date).toDateString() === new Date(date).toDateString()
    );
  },

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(startDate, endDate) {
    await this.delay(600);
    const records = mockData.records;
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  },

  /**
   * Get vitals by date range
   */
  async getVitalsByDateRange(startDate, endDate) {
    await this.delay(600);
    const vitals = mockData.vitals;
    
    return vitals.filter(vital => {
      const vitalDate = new Date(vital.date);
      return vitalDate >= new Date(startDate) && vitalDate <= new Date(endDate);
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiService, mockData };
}
