/**
 * MEDILINK CONFIGURATION
 * ========================
 * 
 * ⚠️ SECURITY NOTICE:
 * 1. Copy this file to config.js (which is .gitignored)
 * 2. Add your real Supabase credentials
 * 3. NEVER commit config.js to version control
 * 4. Use window.CONFIG in your code
 * 
 * GET YOUR CREDENTIALS:
 * 1. Go to https://supabase.com
 * 2. Create a new project
 * 3. Copy your Project URL and Anon Key from Settings > API
 */

// ✅ YOUR SUPABASE CREDENTIALS (Replace with your actual values)
window.CONFIG = {
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE', // e.g., https://xxxxx.supabase.co
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE', // e.g., eyJhbGc... (long key)
  
  // Optional: API endpoints
  APP_NAME: 'MediLink Cloud',
  APP_VERSION: '1.0.0',
  DEBUG_MODE: true, // Set to false in production
};

// Verify credentials are set
if (!window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not configured. Create config.js and add your credentials.');
}
