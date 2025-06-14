import { AUTH_CONFIG } from '@/config/auth';

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
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
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
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};

// API base URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

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