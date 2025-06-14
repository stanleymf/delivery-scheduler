// Authentication utility for API requests

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};

// API base URL configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Common API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY: '/api/auth/verify',
  HEALTH: '/health',
  SHOPIFY: {
    SETTINGS: '/api/shopify/settings',
    TEST_CONNECTION: '/api/shopify/test-connection',
    WEBHOOKS: '/api/shopify/webhooks',
    REGISTER_WEBHOOKS: '/api/shopify/register-webhooks',
    DEBUG: '/api/shopify/debug'
  }
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function for authenticated API calls with error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await authenticatedFetch(endpoint, options);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}; 