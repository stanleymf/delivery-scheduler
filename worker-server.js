// Cloudflare Worker-compatible Delivery Scheduler Server
// Version 1.15.2

const APP_VERSION = "1.15.2";

// Authentication configuration
const AUTH_CONFIG = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123',
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'admin_user',
  SESSION_TIMESTAMP_KEY: 'admin_session_timestamp',
  ADMIN_EMAIL: 'admin@example.com'
};

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  'Access-Control-Max-Age': '86400',
};

// Helper function to create JSON response with CORS
function createResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers
    }
  });
}

// Helper function to parse URL path and method
function parseRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const searchParams = url.searchParams;
  
  return { path, method, searchParams, url };
}

// Generate secure random token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get data from KV storage
async function getKVData(env, key) {
  try {
    const data = await env.DELIVERY_DATA.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting KV data:', error);
    return null;
  }
}

// Set data to KV storage
async function setKVData(env, key, data) {
  try {
    await env.DELIVERY_DATA.put(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error setting KV data:', error);
    return false;
  }
}

// Authentication middleware
async function authenticateToken(request, env) {
  const authHeader = request.headers.get('authorization');
  const adminToken = request.headers.get('x-admin-token');
  
  const token = authHeader?.split(' ')[1] || adminToken;
  
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  // Get session from KV
  const session = await getKVData(env, `session:${token}`);
  if (!session) {
    return { authenticated: false, error: 'Invalid token' };
  }

  // Check if session has expired
  const now = Date.now();
  if (now - session.timestamp > AUTH_CONFIG.SESSION_TIMEOUT) {
    await env.DELIVERY_DATA.delete(`session:${token}`);
    return { authenticated: false, error: 'Session expired' };
  }

  // Update session timestamp on successful auth
  session.timestamp = now;
  await setKVData(env, `session:${token}`, session);

  return { authenticated: true, session, userId: session.userId, token };
}

// Main request handler
async function handleRequest(request, env) {
  const { path, method, searchParams } = parseRequest(request);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Public widget routes (must come before /api/ to catch /api/public/widget/ routes)
  if (path.startsWith('/public/') || path.startsWith('/api/public/')) {
    return handlePublicRequest(request, env);
  }

  // API Routes
  if (path.startsWith('/api/')) {
    return handleApiRequest(request, env);
  }

  // For all other requests, return a basic admin dashboard landing page
  if (method === 'GET') {
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Scheduler Admin - Cloudflare</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .title { color: #1e293b; font-size: 2.5rem; font-weight: 700; margin-bottom: 16px; }
        .subtitle { color: #64748b; font-size: 1.125rem; }
        .status { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 500; }
        .info-grid { display: grid; gap: 24px; margin-bottom: 32px; }
        .info-card { background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .info-title { font-weight: 600; color: #374151; margin-bottom: 8px; }
        .info-value { color: #6b7280; }
        .login-section { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 24px; text-align: center; }
        .login-title { color: #92400e; font-weight: 600; margin-bottom: 12px; }
        .login-text { color: #b45309; margin-bottom: 16px; }
        .btn { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🚚 Delivery Scheduler</h1>
            <p class="subtitle">Admin Dashboard - Cloudflare Deployment</p>
        </div>
        
        <div class="status">
            <span class="status-badge">✅ Online & Healthy</span>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <div class="info-title">Deployment Status</div>
                <div class="info-value">Successfully deployed on Cloudflare Workers</div>
            </div>
            <div class="info-card">
                <div class="info-title">Version</div>
                <div class="info-value">v${APP_VERSION}</div>
            </div>
            <div class="info-card">
                <div class="info-title">Worker URL</div>
                <div class="info-value">https://delivery-scheduler-server.stanleytan92.workers.dev</div>
            </div>
            <div class="info-card">
                <div class="info-title">API Status</div>
                <div class="info-value">Ready to serve requests</div>
            </div>
            <div class="info-card">
                <div class="info-title">Storage</div>
                <div class="info-value">Cloudflare KV (Key-Value store)</div>
            </div>
        </div>
        
        <div class="login-section">
            <div class="login-title">🎯 Admin Dashboard Access</div>
            <p class="login-text">This is the backend API. Access the full admin interface deployed on Cloudflare Pages.</p>
            <a href="https://dashboard-delivery-scheduler.pages.dev/" class="btn" target="_blank">
                Access Full Admin Dashboard →
            </a>
        </div>
        
        <div style="margin-top: 32px; text-align: center; color: #9ca3af; font-size: 0.875rem;">
            <p>API Endpoints: /api/auth, /api/timeslots, /api/settings, /api/blocked-dates</p>
            <p>Widget Endpoints: /public/widget/*</p>
        </div>
    </div>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  return createResponse({ error: 'Not Found' }, 404);
}

// Handle API requests
async function handleApiRequest(request, env) {
  const { path, method } = parseRequest(request);
  
  // Public endpoints that don't require authentication
  if (path === '/api/version' && method === 'GET') {
    return createResponse({ 
      version: APP_VERSION, 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      worker: 'cloudflare'
    });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    return handleLogin(request, env);
  }

  // All other API endpoints require authentication
  const auth = await authenticateToken(request, env);
  if (!auth.authenticated) {
    return createResponse({ error: auth.error }, 401);
  }

  // Protected API routes
  switch (true) {
    case path === '/api/auth/validate' && method === 'POST':
      return createResponse({ 
        valid: true, 
        user: auth.session.user,
        timestamp: Date.now()
      });

    case path === '/api/auth/refresh' && method === 'POST':
      return createResponse({ 
        message: 'Session refreshed', 
        timestamp: Date.now(),
        expiresIn: AUTH_CONFIG.SESSION_TIMEOUT
      });

    case path === '/api/timeslots' && method === 'GET':
      return handleGetTimeslots(auth.userId, env);

    case path === '/api/timeslots' && method === 'POST':
      return handleSaveTimeslots(request, auth.userId, env);

    case path === '/api/blocked-dates' && method === 'GET':
      return handleGetBlockedDates(auth.userId, env);

    case path === '/api/blocked-dates' && method === 'POST':
      return handleSaveBlockedDates(request, auth.userId, env);

    case path === '/api/settings' && method === 'GET':
      return handleGetSettings(auth.userId, env);

    case path === '/api/settings' && method === 'POST':
      return handleSaveSettings(request, auth.userId, env);

    case path === '/api/delivery-areas' && method === 'GET':
      return handleGetDeliveryAreas(auth.userId, env);

    case path === '/api/delivery-areas' && method === 'POST':
      return handleSaveDeliveryAreas(request, auth.userId, env);

    case path === '/api/express-slots' && method === 'GET':
      return handleGetExpressSlots(auth.userId, env);

    case path === '/api/express-slots' && method === 'POST':
      return handleSaveExpressSlots(request, auth.userId, env);

    case path === '/api/shopify/connection' && method === 'GET':
      return handleGetShopifyConnection(auth.userId, env);

    case path === '/api/shopify/connection' && method === 'POST':
      return handleSaveShopifyConnection(request, auth.userId, env);

    case path === '/api/shopify/connection' && method === 'DELETE':
      return handleDeleteShopifyConnection(auth.userId, env);

    case path === '/api/products' && method === 'GET':
      return handleGetProducts(auth.userId, env);

    case path === '/api/products' && method === 'POST':
      return handleSaveProducts(request, auth.userId, env);

    default:
      return createResponse({ error: 'API endpoint not found' }, 404);
  }
}

// Handle public requests (widget API)
async function handlePublicRequest(request, env) {
  const { path, method } = parseRequest(request);

  // Handle both /public/widget/ and /api/public/widget/ routes
  if ((path === '/public/widget/timeslots' || path === '/api/public/widget/timeslots') && method === 'GET') {
    return handlePublicTimeslots(env);
  }

  if ((path.startsWith('/public/widget/') || path.startsWith('/api/public/widget/')) && method === 'GET') {
    return handlePublicTimeslots(env);
  }

  // Handle widget settings endpoint
  if ((path === '/public/widget/settings' || path === '/api/public/widget/settings') && method === 'GET') {
    return handlePublicTimeslots(env); // For now, return same data as timeslots
  }

  return createResponse({ error: 'Public endpoint not found' }, 404);
}

// Authentication handlers
async function handleLogin(request, env) {
  try {
    const { username, password } = await request.json();

    if (username === AUTH_CONFIG.ADMIN_USERNAME && password === AUTH_CONFIG.ADMIN_PASSWORD) {
      const token = generateToken();
      const userId = 'admin'; // Single tenant for now
      const user = {
        id: userId,
        username: AUTH_CONFIG.ADMIN_USERNAME,
        email: AUTH_CONFIG.ADMIN_EMAIL
      };

      const sessionData = {
        userId,
        user,
        timestamp: Date.now()
      };

      // Store session in KV
      await setKVData(env, `session:${token}`, sessionData);

      return createResponse({
        success: true,
        token,
        user,
        expiresIn: AUTH_CONFIG.SESSION_TIMEOUT
      });
    } else {
      return createResponse({ error: 'Invalid credentials' }, 401);
    }
  } catch (error) {
    return createResponse({ error: 'Invalid request body' }, 400);
  }
}

// Data handlers
async function handleGetTimeslots(userId, env) {
  const data = await getKVData(env, `user:${userId}:timeslots`) || [];
  return createResponse(data);
}

async function handleSaveTimeslots(request, userId, env) {
  try {
    const timeslots = await request.json();
    await setKVData(env, `user:${userId}:timeslots`, timeslots);
    
    return createResponse({ 
      success: true, 
      message: 'Timeslots saved successfully',
      count: timeslots.length
    });
  } catch (error) {
    return createResponse({ error: 'Invalid timeslots data' }, 400);
  }
}

async function handleGetBlockedDates(userId, env) {
  const blockedDates = await getKVData(env, `user:${userId}:blocked-dates`) || [];
  const blockedRanges = await getKVData(env, `user:${userId}:blocked-ranges`) || [];
  
  return createResponse({
    blockedDates,
    blockedRanges
  });
}

async function handleSaveBlockedDates(request, userId, env) {
  try {
    const { blockedDates, blockedRanges } = await request.json();
    
    await setKVData(env, `user:${userId}:blocked-dates`, blockedDates || []);
    await setKVData(env, `user:${userId}:blocked-ranges`, blockedRanges || []);
    
    return createResponse({ 
      success: true, 
      message: 'Blocked dates saved successfully',
      blockedDatesCount: (blockedDates || []).length,
      blockedRangesCount: (blockedRanges || []).length
    });
  } catch (error) {
    return createResponse({ error: 'Invalid blocked dates data' }, 400);
  }
}

async function handleGetSettings(userId, env) {
  const settings = await getKVData(env, `user:${userId}:settings`) || {};
  return createResponse(settings);
}

async function handleSaveSettings(request, userId, env) {
  try {
    const settings = await request.json();
    await setKVData(env, `user:${userId}:settings`, settings);
    
    return createResponse({ 
      success: true, 
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    return createResponse({ error: 'Invalid settings data' }, 400);
  }
}

async function handleGetDeliveryAreas(userId, env) {
  const areas = await getKVData(env, `user:${userId}:delivery-areas`) || {
    postalCodes: [],
    areaCodes: []
  };
  return createResponse(areas);
}

async function handleSaveDeliveryAreas(request, userId, env) {
  try {
    const areas = await request.json();
    await setKVData(env, `user:${userId}:delivery-areas`, areas);
    
    return createResponse({ 
      success: true, 
      message: 'Delivery areas saved successfully' 
    });
  } catch (error) {
    return createResponse({ error: 'Invalid delivery areas data' }, 400);
  }
}

async function handleGetExpressSlots(userId, env) {
  const slots = await getKVData(env, `user:${userId}:express-slots`) || [];
  return createResponse(slots);
}

async function handleSaveExpressSlots(request, userId, env) {
  try {
    const slots = await request.json();
    await setKVData(env, `user:${userId}:express-slots`, slots);
    
    return createResponse({ 
      success: true, 
      message: 'Express slots saved successfully',
      count: slots.length
    });
  } catch (error) {
    return createResponse({ error: 'Invalid express slots data' }, 400);
  }
}

async function handleGetShopifyConnection(userId, env) {
  const credentials = await getKVData(env, `user:${userId}:shopify-credentials`);
  if (!credentials) {
    return createResponse({ connected: false });
  }

  return createResponse({
    connected: true,
    shop: credentials.shop,
    // Don't send sensitive data like access tokens
  });
}

async function handleSaveShopifyConnection(request, userId, env) {
  try {
    const credentials = await request.json();
    await setKVData(env, `user:${userId}:shopify-credentials`, credentials);
    
    return createResponse({ 
      success: true, 
      message: 'Shopify connection saved successfully' 
    });
  } catch (error) {
    return createResponse({ error: 'Invalid credentials data' }, 400);
  }
}

async function handleDeleteShopifyConnection(userId, env) {
  try {
    await env.DELIVERY_DATA.delete(`user:${userId}:shopify-credentials`);
    
    return createResponse({ 
      success: true, 
      message: 'Shopify connection deleted successfully' 
    });
  } catch (error) {
    return createResponse({ error: 'Failed to delete connection' }, 500);
  }
}

async function handleGetProducts(userId, env) {
  const products = await getKVData(env, `user:${userId}:products`) || [];
  return createResponse(products);
}

async function handleSaveProducts(request, userId, env) {
  try {
    const products = await request.json();
    await setKVData(env, `user:${userId}:products`, products);
    
    return createResponse({ 
      success: true, 
      message: 'Products saved successfully',
      count: products.length
    });
  } catch (error) {
    return createResponse({ error: 'Invalid products data' }, 400);
  }
}

async function handlePublicTimeslots(env) {
  // Get data for admin user (single tenant for now)
  const userId = 'admin';
  
  try {
    const [timeslots, blockedDates, blockedRanges, settings] = await Promise.all([
      getKVData(env, `user:${userId}:timeslots`) || [],
      getKVData(env, `user:${userId}:blocked-dates`) || [],
      getKVData(env, `user:${userId}:blocked-ranges`) || [],
      getKVData(env, `user:${userId}:settings`) || {}
    ]);

    return createResponse({
      timeslots,
      blockedDates,
      blockedRanges,
      settings,
      timestamp: new Date().toISOString(),
      version: APP_VERSION
    });
  } catch (error) {
    console.error('Error fetching public timeslots:', error);
    return createResponse({
      timeslots: [],
      blockedDates: [],
      blockedRanges: [],
      settings: {},
      error: 'Failed to load data'
    }, 500);
  }
}

// Cloudflare Worker export
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Worker error:', error);
      return createResponse({ 
        error: 'Internal server error',
        message: error.message,
        version: APP_VERSION
      }, 500);
    }
  }
}; 