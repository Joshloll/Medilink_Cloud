// Doctor Store - Global State Management for Doctor Portal
class DoctorStore {
    constructor() {
        this.state = {
            doctor: {},
            patients: [],
            appointments: [],
            records: [],
            schedule: [],
            loading: false,
            error: null,
            currentPage: 'dashboard',
            filters: {
                patients: '',
                records: 'all',
                appointments: 'all'
            }
        };
        this.listeners = [];
        this.init();
    }

    init() {
        // Load initial data
        this.loadInitialData();
    }

    // State Management
    getState() {
        return this.state;
    }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    updateState(path, value) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.notifyListeners();
    }

    // Event System
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Data Loading
    async loadInitialData() {
        this.setState({ loading: true, error: null });
        
        try {
            const [doctor, patients, appointments, records, schedule] = await Promise.all([
                this.fetchDoctorData(),
                this.fetchPatients(),
                this.fetchAppointments(),
                this.fetchRecords(),
                this.fetchSchedule()
            ]);

            this.setState({
                doctor,
                patients,
                appointments,
                records,
                schedule,
                loading: false
            });
        } catch (error) {
            this.setState({ loading: false, error: error.message });
        }
    }

    // Mock API Functions
    async fetchDoctorData() {
        // Simulate API delay
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
                avatar: null
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
                avatar: null
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
                avatar: null
            }
        ];
    }

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

    // Action Methods
    async updateAppointmentStatus(appointmentId, status) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const appointments = this.state.appointments.map(apt => 
                apt.id === appointmentId ? { ...apt, status } : apt
            );
            
            this.setState({ appointments });
            
            // Update schedule slots
            const schedule = this.state.schedule.map(day => ({
                ...day,
                slots: day.slots.map(slot => 
                    slot.appointmentId === appointmentId 
                        ? { ...slot, available: status === 'cancelled' } 
                        : slot
                )
            }));
            
            this.setState({ schedule });
            
            return { success: true };
        } catch (error) {
            this.setState({ error: error.message });
            return { success: false, error: error.message };
        }
    }

    async addPatientNote(patientId, note) {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const patients = this.state.patients.map(patient => 
                patient.id === patientId 
                    ? { ...patient, notes: [...(patient.notes || []), note] }
                    : patient
            );
            
            this.setState({ patients });
            
            return { success: true };
        } catch (error) {
            this.setState({ error: error.message });
            return { success: false, error: error.message };
        }
    }

    async createPrescription(patientId, prescriptionData) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const newPrescription = {
                id: `pres_${Date.now()}`,
                patientId,
                patientName: this.state.patients.find(p => p.id === patientId)?.name,
                ...prescriptionData,
                date: new Date().toISOString(),
                status: 'active',
                doctor: this.state.doctor.name
            };
            
            const records = [...this.state.records, newPrescription];
            this.setState({ records });
            
            return { success: true, prescription: newPrescription };
        } catch (error) {
            this.setState({ error: error.message });
            return { success: false, error: error.message };
        }
    }

    async updateDoctorProfile(profileData) {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const doctor = { ...this.state.doctor, ...profileData };
            this.setState({ doctor });
            
            return { success: true, doctor };
        } catch (error) {
            this.setState({ error: error.message });
            return { success: false, error: error.message };
        }
    }

    // Filter Methods
    setFilter(type, value) {
        this.updateState(`filters.${type}`, value);
    }

    getFilteredPatients() {
        const { patients, filters } = this.state;
        if (!filters.patients) return patients;
        
        return patients.filter(patient => 
            patient.name.toLowerCase().includes(filters.patients.toLowerCase()) ||
            patient.email.toLowerCase().includes(filters.patients.toLowerCase())
        );
    }

    getFilteredRecords() {
        const { records, filters } = this.state;
        if (filters.records === 'all') return records;
        
        return records.filter(record => record.type === filters.records);
    }

    getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        return this.state.appointments.filter(apt => apt.date === today);
    }

    // Statistics Methods
    calculateDoctorStats() {
        const { patients, appointments } = this.state;
        const todayAppointments = this.getTodayAppointments();
        
        return {
            totalPatients: patients.length,
            todayAppointments: todayAppointments.length,
            pendingRequests: appointments.filter(apt => apt.status === 'pending').length,
            completedToday: todayAppointments.filter(apt => apt.status === 'completed').length,
            averageRating: this.state.doctor.rating || 0,
            totalRevenue: patients.length * 150 // Mock revenue calculation
        };
    }
}

// Create and export singleton instance
const doctorStore = new DoctorStore();
export default doctorStore;
