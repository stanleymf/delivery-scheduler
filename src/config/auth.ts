// Authentication configuration
export const AUTH_CONFIG = {
  // Default admin credentials - can be overridden by environment variables
  ADMIN_USERNAME: (import.meta as any).env?.VITE_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123',
  
  // Session configuration
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds (extended for better UX)
  
  // Storage keys
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'admin_user',
  SESSION_TIMESTAMP_KEY: 'admin_session_timestamp'
};

// Helper function to check if session is expired
export const isSessionExpired = (): boolean => {
  const timestamp = localStorage.getItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY);
  console.log('🔍 Session check - stored timestamp:', timestamp);
  
  if (!timestamp) {
    console.log('❌ No session timestamp found');
    return true;
  }
  
  const sessionTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const timeDiff = currentTime - sessionTime;
  const isExpired = timeDiff > AUTH_CONFIG.SESSION_TIMEOUT;
  
  console.log('🔍 Session details:');
  console.log('  - Session time:', new Date(sessionTime).toISOString());
  console.log('  - Current time:', new Date(currentTime).toISOString());
  console.log('  - Time diff (ms):', timeDiff);
  console.log('  - Timeout (ms):', AUTH_CONFIG.SESSION_TIMEOUT);
  console.log('  - Is expired:', isExpired);
  
  return isExpired;
};

// Helper function to update session timestamp
export const updateSessionTimestamp = (): void => {
  const timestamp = Date.now().toString();
  console.log('✅ Updating session timestamp:', timestamp, new Date().toISOString());
  localStorage.setItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY, timestamp);
}; 