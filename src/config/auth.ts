// Authentication configuration
export const AUTH_CONFIG = {
  // Default admin credentials - can be overridden by environment variables
  ADMIN_USERNAME: (import.meta as any).env?.VITE_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123',
  
  // Session configuration
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Storage keys
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'admin_user',
  SESSION_TIMESTAMP_KEY: 'admin_session_timestamp'
};

// Helper function to check if session is expired
export const isSessionExpired = (): boolean => {
  const timestamp = localStorage.getItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY);
  if (!timestamp) return true;
  
  const sessionTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  
  return (currentTime - sessionTime) > AUTH_CONFIG.SESSION_TIMEOUT;
};

// Helper function to update session timestamp
export const updateSessionTimestamp = (): void => {
  localStorage.setItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY, Date.now().toString());
}; 