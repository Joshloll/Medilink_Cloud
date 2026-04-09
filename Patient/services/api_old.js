/**
 * API Service Layer for MediLink
 * Handles all data fetching and API calls
 * Currently uses mock data, ready for Firebase integration
 */

// Mock data for development
const mockData = {
  user: {
    id: '88392',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7EVV5ypCihmYTSLn_G46OXG5ANaHMBRiwg5jjL07ySsqqpdonXwP9X7D_EVXqAHezuQLakGuBna0qhRsYHEQNBytapacC0kHXKbVQUBxmnrpM0Ok_Nald063RJcdBmpjc68W1Uypp8PA73IlgaetT7ApK9eDjULbNuc1FwR1RwGOJpCSpccRMIOqJpQUK_yrHkmaBb7MIUhHs-3opqyWFHnBN-X7Nu1TdjcOO2AXQVjf2WKonS1prMOvWbNOa46WJxFhJ9MzXA8Vq',
    isPremium: true,
    memberSince: '2023-01-15'
  },

  appointments: [
    {
      id: '1',
      doctorName: 'Dr. Emily Chen',
      specialty: 'Cardiology Specialist',
      date: '2023-10-25',
      time: '10:00 AM',
      endTime: '10:30 AM',
      type: 'Video Consultation',
      location: 'Medical Center, Room 302',
      status: 'upcoming',
      doctorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBybefGYcjWRcP-pgEKVf8mF3bayPGfaAslRew-lLOH85dzPqUrKM1kMhjevhmE9zXxhxvqkg23Uv8IS8GpQklu18bzUmu4Q14XBP8BEskU4_H_MM4UkWyA0CEcBooKE_aYdDFIODwwvsmcQy6dAJ7a5INv40hEMzG74AboWjuhMYiZPSnuIdTajYbXAIbk8mxRUZcpWhOvOczvekd3XtvismXgpiEnAtmOk2DdESbvuSQRbPGepw3DofxGOEViL0DMd9PLB9Nw-osE'
    },
    {
      id: '2',
      doctorName: 'Dr. Sarah Miller',
      specialty: 'General Practice',
      date: '2023-10-10',
      time: '2:00 PM',
      endTime: '3:00 PM',
      type: 'In-Person',
      location: 'Main Clinic, Room 105',
      status: 'completed',
      doctorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWgdUZzZ5mii_Y3meJFIZcwo9E_EcNESlqBbDQb5N6pHif8KM2Bu81WbQCiDXp9rf3mS7fY_-Q2s4XkPD191HFkK7m4mU2ux8vntnjbyWXh6r4bfOfpZANR6xRHR5o6I48RpcM8VUixn3IwovPmMYc25c64ECaO4hswoz7yRAbn7ymlKs66vY9X-6HWkUn7XHYSSGvjIVHsre51NHWOgTwg8EHeJ_ImdGJ5B2JxLX53NNWfkYiUsbnkm2tLzl6zYi31fK1OMC-QwHK'
    },
    {
      id: '3',
      doctorName: 'Dr. James Wilson',
      specialty: 'Dermatology',
      date: '2023-09-28',
      time: '11:00 AM',
      endTime: '12:00 PM',
      type: 'In-Person',
      location: 'Dermatology Wing, Room 203',
      status: 'completed',
      doctorImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYm61NGkBF2Q-XbsU-R9la5iZ9z4_FOY7ZnhOjPoyxTxQPB752j_vQbRCjsIHMMhhaB-G5aG9P9bR6dzijFw9KxxJr_ahvU1VxNSHkj_i0GewF-ZCCKC6o-vh6nzOZPPXyQp1OGERXAgpJ3jTvtYfwd4I5pA10u0fV2p0Ba9R3DaYlZxJDc0pnxUNg9s4x1uQe1OOcEyFIOSUnTwunkh8W4MLdIN4R8f_65_fWhHJrSBuSG5-Q8tDROY-ww0ygvByRKfU70CTCA3d1'
    }
  ],

  records: [
    {
      id: '1',
      date: '2023-10-10',
      type: 'Visit Summary',
      description: 'Annual Checkup',
      doctor: 'Dr. Sarah Miller',
      status: 'available',
      category: 'visit'
    },
    {
      id: '2',
      date: '2023-09-25',
      type: 'Lab Result',
      description: 'Blood Test Panel',
      doctor: 'City Labs',
      status: 'available',
      category: 'lab'
    },
    {
      id: '3',
      date: '2023-09-15',
      type: 'Imaging',
      description: 'Chest X-Ray',
      doctor: 'Dr. James Wilson',
      status: 'available',
      category: 'imaging'
    },
    {
      id: '4',
      date: '2023-08-28',
      type: 'Visit Summary',
      description: 'Cardiology Consultation',
      doctor: 'Dr. Emily Chen',
      status: 'processing',
      category: 'visit'
    }
  ],

  prescriptions: [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      doctor: 'Dr. Emily Chen',
      startDate: '2023-09-15',
      pharmacy: 'City Pharmacy',
      refillsRemaining: 2,
      totalRefills: 5,
      nextRefillDate: '2023-11-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      doctor: 'Dr. Sarah Miller',
      startDate: '2023-08-01',
      pharmacy: 'MediCare Pharmacy',
      refillsRemaining: 0,
      totalRefills: 6,
      nextRefillDate: null,
      status: 'refill_needed'
    }
  ],

  vitals: [
    {
      type: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'normal',
      icon: 'favorite',
      color: 'red',
      lastUpdated: '2023-10-10'
    },
    {
      type: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'optimal',
      icon: 'blood_pressure',
      color: 'blue',
      lastUpdated: '2023-10-10'
    },
    {
      type: 'Weight',
      value: 68,
      unit: 'kg',
      status: 'decreased',
      icon: 'monitor_weight',
      color: 'orange',
      lastUpdated: '2023-10-10',
      change: -1
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
    await this.delay(600);
    return [...mockData.records];
  },

  /**
   * Fetch prescriptions
   */
  async fetchPrescriptions() {
    await this.delay(700);
    return [...mockData.prescriptions];
  },

  /**
   * Fetch vitals
   */
  async fetchVitals() {
    await this.delay(400);
    return [...mockData.vitals];
  },

  /**
   * Add new appointment
   */
  async addAppointment(appointmentData) {
    await this.delay(1000);
    const newAppointment = {
      id: Date.now().toString(),
      ...appointmentData,
      status: 'upcoming'
    };
    mockData.appointments.push(newAppointment);
    return newAppointment;
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id) {
    await this.delay(800);
    const appointment = mockData.appointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.status = 'cancelled';
      return appointment;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(id, newDateTime) {
    await this.delay(800);
    const appointment = mockData.appointments.find(apt => apt.id === id);
    if (appointment) {
      Object.assign(appointment, newDateTime);
      return appointment;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Request prescription refill
   */
  async requestRefill(id) {
    await this.delay(1200);
    const prescription = mockData.prescriptions.find(pres => pres.id === id);
    if (prescription) {
      prescription.status = 'refill_requested';
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
    return { ...settings };
  },

  /**
   * Download medical records
   */
  async downloadRecords(recordIds) {
    await this.delay(2000);
    return { downloadUrl: 'https://example.com/records.zip', filename: 'medical-records.zip' };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiService, mockData };
}
