// Doctor API Service - Mock API Layer for Doctor Portal
class DoctorApiService {
    constructor() {
        this.baseURL = '/api/doctor';
        this.mockData = {
            doctor: null,
            patients: [],
            appointments: [],
            records: [],
            schedule: []
        };
    }

    // Authentication
    async login(credentials) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (credentials.email === 'doctor@medilink.com' && credentials.password === 'password') {
            return {
                success: true,
                data: {
                    token: 'mock-jwt-token',
                    doctor: await this.fetchDoctorData()
                }
            };
        }
        
        return {
            success: false,
            error: 'Invalid credentials'
        };
    }

    async logout() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    }

    // Doctor Data
    async fetchDoctorData() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            id: 'doc001',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@medilink.com',
            specialty: 'Cardiology',
            license: 'MD-12345',
            phone: '+1 (555) 123-4567',
            department: 'Cardiology',
            experience: 8,
            rating: 4.8,
            workingHours: {
                monday: { start: '09:00', end: '17:00' },
                tuesday: { start: '09:00', end: '17:00' },
                wednesday: { start: '09:00', end: '17:00' },
                thursday: { start: '09:00', end: '17:00' },
                friday: { start: '09:00', end: '17:00' },
                saturday: { start: '10:00', end: '14:00' },
                sunday: { start: 'closed', end: 'closed' }
            }
        };
    }

    async updateDoctorProfile(data) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate validation
        if (!data.firstName || !data.lastName || !data.email) {
            throw new Error('Required fields are missing');
        }
        
        return {
            success: true,
            data: {
                ...this.mockData.doctor,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                specialty: data.specialty,
                license: data.license,
                department: data.department,
                experience: parseInt(data.experience) || 0
            }
        };
    }

    // Patients
    async fetchPatients() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                id: 'pat001',
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 987-6543',
                age: 45,
                gender: 'Male',
                bloodType: 'O+',
                lastVisit: new Date().toISOString(),
                conditions: ['Hypertension', 'Type 2 Diabetes'],
                medications: ['Metformin', 'Lisinopril'],
                avatar: null,
                notes: []
            },
            {
                id: 'pat002',
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                phone: '+1 (555) 876-5432',
                age: 32,
                gender: 'Female',
                bloodType: 'A+',
                lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                conditions: ['Asthma'],
                medications: ['Albuterol'],
                avatar: null,
                notes: []
            },
            {
                id: 'pat003',
                name: 'Robert Johnson',
                email: 'robert.j@email.com',
                phone: '+1 (555) 765-4321',
                age: 58,
                gender: 'Male',
                bloodType: 'B+',
                lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                conditions: ['Coronary Artery Disease'],
                medications: ['Aspirin', 'Beta Blocker'],
                avatar: null,
                notes: []
            }
        ];
    }

    async addPatientNote(patientId, note) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const patients = await this.fetchPatients();
        const patient = patients.find(p => p.id === patientId);
        
        if (!patient) {
            throw new Error('Patient not found');
        }
        
        patient.notes = patient.notes || [];
        patient.notes.push({
            id: `note_${Date.now()}`,
            content: note.note,
            date: note.date,
            doctor: 'Dr. Sarah Johnson'
        });
        
        return { success: true, patient };
    }

    // Appointments
    async fetchAppointments() {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                id: 'apt001',
                patientId: 'pat001',
                patientName: 'John Doe',
                date: today.toISOString().split('T')[0],
                time: '09:00',
                duration: 30,
                type: 'Follow-up',
                status: 'scheduled',
                notes: 'Regular checkup for hypertension management',
                priority: 'medium'
            },
            {
                id: 'apt002',
                patientId: 'pat002',
                patientName: 'Jane Smith',
                date: today.toISOString().split('T')[0],
                time: '10:30',
                duration: 45,
                type: 'Consultation',
                status: 'scheduled',
                notes: 'Asthma follow-up and medication review',
                priority: 'low'
            },
            {
                id: 'apt003',
                patientId: 'pat003',
                patientName: 'Robert Johnson',
                date: tomorrow.toISOString().split('T')[0],
                time: '14:00',
                duration: 60,
                type: 'Procedure',
                status: 'scheduled',
                notes: 'Cardiac stress test',
                priority: 'high'
            }
        ];
    }

    async updateAppointmentStatus(appointmentId, status) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const appointments = await this.fetchAppointments();
        const appointment = appointments.find(apt => apt.id === appointmentId);
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        appointment.status = status;
        appointment.updatedAt = new Date().toISOString();
        
        return { success: true, appointment };
    }

    async createAppointment(data) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newAppointment = {
            id: `apt_${Date.now()}`,
            patientId: data.patientId,
            patientName: data.patientName,
            date: data.date,
            time: data.time,
            duration: parseInt(data.duration) || 30,
            type: data.type,
            status: 'scheduled',
            notes: data.notes || '',
            priority: data.priority || 'medium',
            createdAt: new Date().toISOString()
        };
        
        return { success: true, appointment: newAppointment };
    }

    // Medical Records
    async fetchRecords() {
        await new Promise(resolve => setTimeout(resolve, 350));
        
        return [
            {
                id: 'rec001',
                patientId: 'pat001',
                patientName: 'John Doe',
                type: 'clinical',
                title: 'Hypertension Management',
                date: new Date().toISOString(),
                content: 'Patient blood pressure readings have been stable. Continue current medication regimen.',
                doctor: 'Dr. Sarah Johnson',
                attachments: []
            },
            {
                id: 'rec002',
                patientId: 'pat001',
                patientName: 'John Doe',
                type: 'lab',
                title: 'Blood Work Results',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                content: 'CBC and metabolic panel within normal ranges. HbA1c: 7.2%',
                doctor: 'Dr. Sarah Johnson',
                attachments: ['lab_results.pdf']
            },
            {
                id: 'rec003',
                patientId: 'pat002',
                patientName: 'Jane Smith',
                type: 'prescription',
                title: 'Albuterol Refill',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                content: 'Albuterol inhaler 90mcg, use as needed for asthma symptoms.',
                doctor: 'Dr. Sarah Johnson',
                attachments: []
            }
        ];
    }

    async addMedicalRecord(data) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newRecord = {
            id: `rec_${Date.now()}`,
            patientId: data.patientId,
            patientName: data.patientName,
            type: data.type,
            title: data.title,
            date: new Date().toISOString(),
            content: data.content,
            doctor: 'Dr. Sarah Johnson',
            attachments: data.attachments || []
        };
        
        return { success: true, record: newRecord };
    }

    async createPrescription(patientId, data) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const patients = await this.fetchPatients();
        const patient = patients.find(p => p.id === patientId);
        
        if (!patient) {
            throw new Error('Patient not found');
        }
        
        const prescription = {
            id: `pres_${Date.now()}`,
            patientId,
            patientName: patient.name,
            medication: data.medication,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            instructions: data.instructions,
            date: new Date().toISOString(),
            status: 'active',
            doctor: 'Dr. Sarah Johnson'
        };
        
        return { success: true, prescription };
    }

    // Schedule
    async fetchSchedule() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const today = new Date();
        const schedule = [];
        
        // Generate schedule for next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            schedule.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
                slots: [
                    { time: '09:00', available: true, appointmentId: null },
                    { time: '09:30', available: true, appointmentId: null },
                    { time: '10:00', available: true, appointmentId: null },
                    { time: '10:30', available: false, appointmentId: 'apt002' },
                    { time: '11:00', available: true, appointmentId: null },
                    { time: '11:30', available: true, appointmentId: null },
                    { time: '14:00', available: false, appointmentId: 'apt003' },
                    { time: '14:30', available: true, appointmentId: null },
                    { time: '15:00', available: true, appointmentId: null },
                    { time: '15:30', available: true, appointmentId: null },
                    { time: '16:00', available: true, appointmentId: null },
                    { time: '16:30', available: true, appointmentId: null }
                ]
            });
        }
        
        return schedule;
    }

    // Statistics
    async fetchDashboardStats() {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const [patients, appointments] = await Promise.all([
            this.fetchPatients(),
            this.fetchAppointments()
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(apt => apt.date === today);
        
        return {
            totalPatients: patients.length,
            todayAppointments: todayAppointments.length,
            pendingRequests: appointments.filter(apt => apt.status === 'pending').length,
            completedToday: todayAppointments.filter(apt => apt.status === 'completed').length,
            averageRating: 4.8,
            totalRevenue: patients.length * 150
        };
    }

    // Error handling
    handleError(error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// Create and export singleton instance
const doctorApiService = new DoctorApiService();
export default doctorApiService;
