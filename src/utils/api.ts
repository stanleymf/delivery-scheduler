import { AUTH_CONFIG, updateSessionTimestamp, isSessionExpired } from '@/config/auth';

// Get authentication headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Make authenticated API request
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Check if session is expired before making request
  if (isSessionExpired()) {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY);
    window.location.href = '/';
    throw new Error('Session expired');
  }

  const headers = getAuthHeaders();
  
  // For Shopify endpoints, use Worker directly since Pages Functions don't have KV access
  let finalUrl = url;
  if (url.startsWith('/api/shopify/')) {
    finalUrl = `https://delivery-scheduler-widget.stanleytan92.workers.dev${url}`;
  }
  
  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  // If unauthorized, redirect to login
  if (response.status === 401) {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY);
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  // If request was successful, refresh session timestamp
  if (response.ok) {
    updateSessionTimestamp();
  }

  return response;
};

// API base URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://delivery-scheduler-server.stanleytan92.workers.dev';

// Common API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY: '/api/auth/verify',
  HEALTH: '/health',
  SHOPIFY: '/api/shopify',
  DELIVERY: {
    TIMESLOTS: '/api/delivery/timeslots',
    AVAILABILITY: '/api/delivery/availability',
    ORDERS: '/api/delivery/orders'
  }
}; 