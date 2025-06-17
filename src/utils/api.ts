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
export const WIDGET_API_BASE_URL = 'https://delivery-scheduler-widget.stanleytan92.workers.dev';

// Sync data to widget KV storage
export const syncToWidget = async (data: any) => {
  try {
    const response = await fetch(`${WIDGET_API_BASE_URL}/api/sync/delivery-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('📡 Widget sync result:', result);
    return result;
  } catch (error) {
    console.error('❌ Widget sync failed:', error);
    throw error;
  }
};

// Get widget sync status
export const getWidgetSyncStatus = async () => {
  try {
    const response = await fetch(`${WIDGET_API_BASE_URL}/api/sync/delivery-data`);
    return await response.json();
  } catch (error) {
    console.error('❌ Failed to get widget sync status:', error);
    throw error;
  }
};

// Helper to sync current dashboard data to widget
export const performFullSync = async () => {
  try {
    // Collect all data from localStorage or make API calls to get current data
    const timeslots = JSON.parse(localStorage.getItem('delivery-timeslots') || '[]');
    const blockedDates = JSON.parse(localStorage.getItem('blocked-dates') || '[]');
    const blockedDateRanges = JSON.parse(localStorage.getItem('blocked-date-ranges') || '[]');
    const settings = JSON.parse(localStorage.getItem('delivery-settings') || '{}');
    const collectionLocations = JSON.parse(localStorage.getItem('collection-locations') || '[]');
    const tagMappingSettings = JSON.parse(localStorage.getItem('tag-mapping-settings') || '{}');
    const expressSlots = JSON.parse(localStorage.getItem('express-slots') || '[]');
    
    const syncData = {
      timeslots,
      blockedDates,
      blockedDateRanges,
      settings,
      collectionLocations,
      tagMappingSettings,
      expressSlots,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('🔄 Syncing data to widget:', syncData);
    return await syncToWidget(syncData);
  } catch (error) {
    console.error('❌ Full sync failed:', error);
    throw error;
  }
};

// Auto sync whenever local data changes
export const autoSyncOnChange = (dataType: string, data: any) => {
  // Debounce sync calls to avoid too many requests
  clearTimeout((window as any)._syncTimeout);
  (window as any)._syncTimeout = setTimeout(async () => {
    try {
      console.log(`🔄 Auto-syncing ${dataType} to widget`);
      await performFullSync();
    } catch (error) {
      console.warn(`⚠️ Auto-sync failed for ${dataType}:`, error);
    }
  }, 1000); // 1 second debounce
};

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
  },
  SYNC: {
    TO_WIDGET: `${WIDGET_API_BASE_URL}/api/sync/delivery-data`,
    STATUS: `${WIDGET_API_BASE_URL}/api/sync/delivery-data`
  }
}; 