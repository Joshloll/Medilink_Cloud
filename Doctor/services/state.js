/**
 * Global State Management for MediLink Doctor Portal
 * Centralized state object for the entire application
 */

const state = {
  // User information
  user: null,
  
  // Application data
  appointments: [],
  patients: [],
  records: [],
  notifications: [],
  
  // UI state
  currentPage: 'dashboard',
  loading: false,
  error: null,
  
  // Settings
  settings: {
    notifications: {
      email: true,
      sms: true,
      push: false
    },
    darkMode: false,
    workingHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: 'closed', end: 'closed' },
      sunday: { start: 'closed', end: 'closed' }
    }
  }
};

/**
 * State management utilities
 */
const stateManager = {
  /**
   * Get current state
   */
  getState() {
    return state;
  },

  /**
   * Update state with new data
   */
  setState(updates) {
    Object.assign(state, updates);
    this.notifyListeners();
  },

  /**
   * Update specific nested property
   */
  updateProperty(path, value) {
    const keys = path.split('.');
    let current = state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.notifyListeners();
  },

  /**
   * Add item to array
   */
  addToArray(arrayName, item) {
    state[arrayName].push(item);
    this.notifyListeners();
  },

  /**
   * Remove item from array by ID
   */
  removeFromArray(arrayName, id) {
    state[arrayName] = state[arrayName].filter(item => item.id !== id);
    this.notifyListeners();
  },

  /**
   * Update item in array by ID
   */
  updateInArray(arrayName, id, updates) {
    const index = state[arrayName].findIndex(item => item.id === id);
    if (index !== -1) {
      Object.assign(state[arrayName][index], updates);
      this.notifyListeners();
    }
  },

  /**
   * Listeners for state changes
   */
  listeners: [],

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  },

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(state));
  },

  /**
   * Clear all data (for logout)
   */
  clear() {
    state.user = null;
    state.appointments = [];
    state.patients = [];
    state.records = [];
    state.notifications = [];
    state.currentPage = 'dashboard';
    state.loading = false;
    state.error = null;
    this.notifyListeners();
  },

  /**
   * Set loading state
   */
  setLoading(loading) {
    state.loading = loading;
    this.notifyListeners();
  },

  /**
   * Set error state
   */
  setError(error) {
    state.error = error;
    this.notifyListeners();
  },

  /**
   * Clear error state
   */
  clearError() {
    state.error = null;
    this.notifyListeners();
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { state, stateManager };
}
