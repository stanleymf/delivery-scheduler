import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs/promises';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
const APP_VERSION = packageJson.version;

const app = express();
const PORT = process.env.PORT || 4321;

// Authentication configuration
const AUTH_CONFIG = {
  ADMIN_USERNAME: process.env.VITE_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.VITE_ADMIN_PASSWORD || 'admin123',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'admin_user',
  SESSION_TIMESTAMP_KEY: 'admin_session_timestamp',
  ADMIN_EMAIL: process.env.VITE_ADMIN_EMAIL || 'admin@example.com'
};

// In-memory session store (in production, use Redis or database)
const sessions = new Map();

// Session storage - will be persisted to file for Railway compatibility
const SESSIONS_FILE = join(__dirname, 'sessions.json');

// User data storage - stores all user configuration data
const userData = new Map();

// Import Shopify Fee Automation Service
import ShopifyFeeAutomation from './src/services/shopify-fee-automation.js';

// Persistent storage for Shopify credentials
// Note: Railway filesystem is ephemeral, so we'll use environment variables for persistence
const CREDENTIALS_FILE = join(__dirname, 'shopify-credentials.json');
const USER_DATA_FILE = join(__dirname, 'user-data.json');

// Load credentials from environment variables (Railway-compatible persistence)
async function loadCredentialsFromEnv() {
  try {
    const credentialsEnv = process.env.SHOPIFY_CREDENTIALS_JSON;
    if (credentialsEnv) {
      const credentials = JSON.parse(credentialsEnv);
      console.log('📁 Loaded credentials from environment for', Object.keys(credentials).length, 'users');
      return new Map(Object.entries(credentials));
    }
    console.log('📁 No credentials found in environment, starting fresh');
    return new Map();
  } catch (error) {
    console.error('❌ Error loading credentials from environment:', error);
    return new Map();
  }
}

// Load credentials from file on startup (fallback)
async function loadCredentialsFromFile() {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf8');
    const credentials = JSON.parse(data);
    console.log('📁 Loaded credentials from file for', Object.keys(credentials).length, 'users');
    return new Map(Object.entries(credentials));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 No existing credentials file found, checking environment...');
      return await loadCredentialsFromEnv();
    }
    console.error('❌ Error loading credentials from file:', error);
    return await loadCredentialsFromEnv();
  }
}

// Enhanced Railway persistence with automatic environment variable updates
async function updateRailwayEnvironmentVariable(key, value) {
  // Only attempt Railway API updates if we have the necessary environment
  const railwayToken = process.env.RAILWAY_TOKEN;
  const railwayProjectId = process.env.RAILWAY_PROJECT_ID;
  const railwayEnvironmentId = process.env.RAILWAY_ENVIRONMENT_ID;
  
  if (!railwayToken || !railwayProjectId || !railwayEnvironmentId) {
    console.log(`💡 To persist ${key} across Railway restarts, set environment variable:`);
    console.log(`   ${key}=${JSON.stringify(value)}`);
    console.log(`💡 Or set these Railway API variables for automatic updates:`);
    console.log(`   RAILWAY_TOKEN=your_railway_token`);
    console.log(`   RAILWAY_PROJECT_ID=your_project_id`);
    console.log(`   RAILWAY_ENVIRONMENT_ID=your_environment_id`);
    return false;
  }

  try {
    const response = await fetch(`https://backboard.railway.app/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation variableUpsert($input: VariableUpsertInput!) {
            variableUpsert(input: $input) {
              id
              name
              value
            }
          }
        `,
        variables: {
          input: {
            projectId: railwayProjectId,
            environmentId: railwayEnvironmentId,
            name: key,
            value: JSON.stringify(value)
          }
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data?.variableUpsert) {
        console.log(`✅ Automatically updated Railway environment variable: ${key}`);
        return true;
      } else {
        console.log(`❌ Failed to update Railway variable ${key}:`, result.errors);
        return false;
      }
    } else {
      console.log(`❌ Railway API request failed for ${key}:`, response.status);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error updating Railway variable ${key}:`, error.message);
    return false;
  }
}

// Save credentials to both file and environment (Railway-compatible)
async function saveCredentialsToFile(credentialsMap) {
  try {
    const credentialsObj = Object.fromEntries(credentialsMap);
    
    // Save to file (temporary, will be lost on restart)
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentialsObj, null, 2));
    console.log('💾 Saved credentials to file for', credentialsMap.size, 'users');
    
    // Attempt automatic Railway environment variable update
    if (credentialsMap.size > 0) {
      const updated = await updateRailwayEnvironmentVariable('SHOPIFY_CREDENTIALS_JSON', credentialsObj);
      if (!updated) {
        console.log('💡 Manual Railway update required - copy the command above');
      }
    }
  } catch (error) {
    console.error('❌ Error saving credentials to file:', error);
  }
}

// Load user data from environment variables (Railway-compatible persistence)
async function loadUserDataFromEnv() {
  try {
    const userDataEnv = process.env.USER_DATA_JSON;
    if (userDataEnv) {
      const data = JSON.parse(userDataEnv);
      console.log('📁 Loaded user data from environment for', Object.keys(data).length, 'users');
      return new Map(Object.entries(data));
    }
    console.log('📁 No user data found in environment, starting fresh');
    return new Map();
  } catch (error) {
    console.error('❌ Error loading user data from environment:', error);
    return new Map();
  }
}

// Load user data from file on startup (fallback)
async function loadUserDataFromFile() {
  try {
    const data = await fs.readFile(USER_DATA_FILE, 'utf8');
    const userDataObj = JSON.parse(data);
    console.log('📁 Loaded user data from file for', Object.keys(userDataObj).length, 'users');
    return new Map(Object.entries(userDataObj));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 No existing user data file found, checking environment...');
      return await loadUserDataFromEnv();
    }
    console.error('❌ Error loading user data from file:', error);
    return await loadUserDataFromEnv();
  }
}

// Save user data to both file and environment (Railway-compatible)
async function saveUserDataToFile(userDataMap) {
  try {
    const userDataObj = Object.fromEntries(userDataMap);
    
    // Save to file (temporary, will be lost on restart)
    await fs.writeFile(USER_DATA_FILE, JSON.stringify(userDataObj, null, 2));
    console.log('💾 Saved user data to file for', userDataMap.size, 'users');
    
    // Attempt automatic Railway environment variable update
    if (userDataMap.size > 0) {
      const updated = await updateRailwayEnvironmentVariable('USER_DATA_JSON', userDataObj);
      if (!updated) {
        console.log('💡 Manual Railway update required - copy the command above');
      }
    }
  } catch (error) {
    console.error('❌ Error saving user data to file:', error);
  }
}

// Initialize credentials, user data, and sessions from file
const shopifyCredentials = await loadCredentialsFromFile();
const userDataStore = await loadUserDataFromFile();
await loadSessionsFromFile();

// Copy user data to the userData Map
for (const [userId, data] of userDataStore) {
  userData.set(userId, data);
}

// Periodic backup every 5 minutes (in case of unexpected shutdowns)
setInterval(async () => {
  if (shopifyCredentials.size > 0) {
    await saveCredentialsToFile(shopifyCredentials);
  }
  if (userData.size > 0) {
    await saveUserDataToFile(userData);
  }
  if (sessions.size > 0) {
    await saveSessionsToFile();
  }
}, 5 * 60 * 1000);

// Graceful shutdown handler to save credentials, user data, and sessions
process.on('SIGTERM', async () => {
  console.log('🔄 Graceful shutdown initiated, saving data...');
  await saveCredentialsToFile(shopifyCredentials);
  await saveUserDataToFile(userData);
  await saveSessionsToFile();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Graceful shutdown initiated, saving data...');
  await saveCredentialsToFile(shopifyCredentials);
  await saveUserDataToFile(userData);
  await saveSessionsToFile();
  process.exit(0);
});

app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log(`🔐 Auth check for ${req.method} ${req.path}`);
  console.log(`🎫 Token present: ${!!token}`);

  if (!token) {
    console.log(`❌ No token provided for ${req.path}`);
    return res.status(401).json({ error: 'Access token required' });
  }

  const session = sessions.get(token);
  if (!session) {
    console.log(`❌ Invalid token for ${req.path}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check if session is expired
  if (Date.now() - session.timestamp > AUTH_CONFIG.SESSION_TIMEOUT) {
    sessions.delete(token);
    console.log(`❌ Expired session for ${req.path}`);
    return res.status(401).json({ error: 'Session expired' });
  }

  // Update session timestamp
  session.timestamp = Date.now();
  req.user = session.user;
  console.log(`✅ Authenticated user: ${session.user} for ${req.path}`);
  next();
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Check credentials
  if (username === AUTH_CONFIG.ADMIN_USERNAME && password === AUTH_CONFIG.ADMIN_PASSWORD) {
    // Generate token
    const token = btoa(`${username}:${Date.now()}:${Math.random()}`);
    
    // Store session
    sessions.set(token, {
      user: username,
      timestamp: Date.now()
    });

    // Persist sessions to file
    await saveSessionsToFile();

    res.json({
      success: true,
      token,
      user: username,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
    // Persist sessions to file
    await saveSessionsToFile();
  }
  
  res.json({ success: true, message: 'Logout successful' });
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Token is valid'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Shopify Settings endpoints (protected)
app.get('/api/shopify/settings', authenticateToken, (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (credentials) {
    res.json({
      success: true,
      credentials: {
        shopDomain: credentials.shopDomain,
        accessToken: credentials.accessToken,
        apiVersion: credentials.apiVersion,
        appSecret: credentials.appSecret
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'No credentials found'
    });
  }
});

app.post('/api/shopify/settings', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { shopDomain, accessToken, apiVersion, appSecret } = req.body;

  // Validate required fields
  if (!shopDomain || !accessToken) {
    return res.status(400).json({
      success: false,
      error: 'Shop domain and access token are required'
    });
  }

  // Store credentials (in production, encrypt these)
  const credentials = {
    shopDomain: shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    accessToken,
    apiVersion: apiVersion || '2024-01',
    appSecret: appSecret || '',
    savedAt: new Date().toISOString()
  };

  shopifyCredentials.set(userId, credentials);
  
  // Persist to file
  await saveCredentialsToFile(shopifyCredentials);

  res.json({
    success: true,
    message: 'Credentials saved successfully and persisted to storage'
  });
});

// Test Shopify connection (protected)
app.get('/api/shopify/test-connection', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);

  console.log(`🔍 Test connection request from user: ${userId}`);
  console.log(`📋 Credentials found: ${!!credentials}`);

  if (!credentials) {
    console.log(`❌ No credentials found for user: ${userId}`);
    return res.status(404).json({
      success: false,
      error: 'No Shopify credentials found. Please save your credentials first.'
    });
  }

  try {
    const response = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const shopData = await response.json();
      res.json({
        success: true,
        shopName: shopData.shop.name,
        plan: shopData.shop.plan_name,
        email: shopData.shop.email,
        message: 'Connection successful'
      });
    } else {
      const errorData = await response.json();
      res.status(response.status).json({
        success: false,
        error: errorData.errors || 'Failed to connect to Shopify'
      });
    }
  } catch (error) {
    console.error('Shopify connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Error testing connection to Shopify'
    });
  }
});

// Shopify API proxy for direct API calls (more specific pattern to avoid conflicts)
// This should only handle direct Shopify API proxying, not our custom endpoints
app.use('/api/shopify/proxy/:endpoint*', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  const endpoint = req.params.endpoint + (req.params[0] || '');
  const shopifyUrl = `https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/${endpoint}`;
  
  try {
    const response = await fetch(shopifyUrl, {
      method: req.method,
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Shopify API error:', error);
    res.status(500).json({ error: 'Shopify API request failed' });
  }
});

// Delivery API mock endpoints (protected)
app.get('/api/delivery/timeslots', authenticateToken, (req, res) => {
  const timeslots = [
    { id: 'morning', name: 'Morning Delivery', type: 'delivery', startTime: '10:00', endTime: '14:00', price: 0, available: true },
    { id: 'afternoon', name: 'Afternoon Delivery', type: 'delivery', startTime: '14:00', endTime: '18:00', price: 0, available: true },
    { id: 'evening', name: 'Evening Delivery', type: 'delivery', startTime: '18:00', endTime: '22:00', price: 5, available: true },
    { id: 'express', name: 'Express Delivery', type: 'delivery', startTime: '11:00', endTime: '13:00', price: 15, available: true },
    { id: 'collection', name: 'Store Collection', type: 'collection', startTime: '09:00', endTime: '21:00', price: -5, available: true },
  ];
  res.json({ timeslots });
});

app.get('/api/delivery/availability', authenticateToken, (req, res) => {
  const { date, postalCode } = req.query;
  // Mock availability data
  res.json({
    date,
    postalCode,
    available: true,
    message: 'Available for delivery',
  });
});

app.get('/api/delivery/orders', authenticateToken, (req, res) => {
  // Mock orders data
  res.json({ orders: [] });
});

// Enhanced Shopify Webhook endpoint with comprehensive delivery scheduling support
app.post('/api/shopify/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const shopHeader = req.get('X-Shopify-Shop-Domain');
  const topicHeader = req.get('X-Shopify-Topic');
  const apiVersionHeader = req.get('X-Shopify-API-Version');
  const webhookIdHeader = req.get('X-Shopify-Webhook-Id');
  const body = req.body;

  console.log(`🔔 Webhook received: ${topicHeader} from ${shopHeader}`);

  // Find credentials by shop domain
  let userCredentials = null;
  let userId = null;
  
  for (const [user, credentials] of shopifyCredentials.entries()) {
    if (credentials.shopDomain === shopHeader) {
      userCredentials = credentials;
      userId = user;
      break;
    }
  }

  if (!userCredentials) {
    console.error('❌ Webhook received from unknown shop:', shopHeader);
    return res.status(404).send('Shop not found');
  }

  // Verify HMAC signature (critical for security)
  const generatedHmac = crypto
    .createHmac('sha256', userCredentials.appSecret)
    .update(Buffer.isBuffer(body) ? body : Buffer.from(body), 'utf8')
    .digest('base64');

  if (generatedHmac !== hmacHeader) {
    console.error('❌ Webhook signature verification failed for shop:', shopHeader);
    console.error('Expected:', hmacHeader);
    console.error('Generated:', generatedHmac);
    return res.status(401).send('Webhook signature verification failed');
  }

  // Parse the JSON body
  let event;
  try {
    event = JSON.parse(body.toString('utf8'));
  } catch (e) {
    console.error('❌ Invalid JSON in webhook for shop:', shopHeader);
    return res.status(400).send('Invalid JSON');
  }

  // Log webhook event with user context
  console.log(`🔔 Shopify Webhook processed for user ${userId} (${shopHeader}):`, {
    topic: topicHeader,
    webhookId: webhookIdHeader,
    apiVersion: apiVersionHeader,
    eventId: event.id
  });

  // Enhanced webhook processing with delivery scheduling focus
  try {
    switch (topicHeader) {
      // Order-related webhooks (critical for delivery scheduling)
      case 'orders/create':
        await handleOrderCreated(event, userCredentials, userId);
        break;
      case 'orders/updated':
        await handleOrderUpdated(event, userCredentials, userId);
        break;
      case 'orders/cancelled':
        await handleOrderCancelled(event, userCredentials, userId);
        break;
      case 'orders/fulfilled':
        await handleOrderFulfilled(event, userCredentials, userId);
        break;
      case 'orders/partially_fulfilled':
        await handleOrderPartiallyFulfilled(event, userCredentials, userId);
        break;
      case 'orders/paid':
        await handleOrderPaid(event, userCredentials, userId);
        break;

      // Product-related webhooks (for delivery availability)
      case 'products/create':
        await handleProductCreated(event, userCredentials, userId);
        break;
      case 'products/update':
        await handleProductUpdated(event, userCredentials, userId);
        break;
      case 'products/delete':
        await handleProductDeleted(event, userCredentials, userId);
        break;
      case 'inventory_levels/update':
        await handleInventoryUpdated(event, userCredentials, userId);
        break;

      // Customer-related webhooks (for delivery preferences)
      case 'customers/create':
        await handleCustomerCreated(event, userCredentials, userId);
        break;
      case 'customers/update':
        await handleCustomerUpdated(event, userCredentials, userId);
        break;
      case 'customers/delete':
        await handleCustomerDeleted(event, userCredentials, userId);
        break;

      // App lifecycle webhooks
      case 'app/uninstalled':
        await handleAppUninstalled(event, userCredentials, userId, shopHeader);
        break;
      case 'app/subscriptions/update':
        await handleSubscriptionUpdated(event, userCredentials, userId);
        break;

      // Fulfillment webhooks (for delivery tracking)
      case 'fulfillments/create':
        await handleFulfillmentCreated(event, userCredentials, userId);
        break;
      case 'fulfillments/update':
        await handleFulfillmentUpdated(event, userCredentials, userId);
        break;

      // Shipping webhooks (for delivery zones)
      case 'shipping_addresses/update':
        await handleShippingAddressUpdated(event, userCredentials, userId);
        break;

      // Cart webhooks (for delivery scheduling during checkout)
      case 'carts/create':
        await handleCartCreated(event, userCredentials, userId);
        break;
      case 'carts/update':
        await handleCartUpdated(event, userCredentials, userId);
        break;

      default:
        console.log(`📝 Unhandled webhook topic: ${topicHeader}`);
        // Still return 200 to acknowledge receipt
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Don't return an error to Shopify, just log it
    // Shopify will retry failed webhooks
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).send('Webhook received');
});

// Debug endpoint for webhook troubleshooting
app.get('/api/shopify/debug', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://delivery-schedule2-production.up.railway.app';
  
  // Check if credentials file exists
  let fileExists = false;
  let fileStats = null;
  try {
    fileStats = await fs.stat(CREDENTIALS_FILE);
    fileExists = true;
  } catch (error) {
    fileExists = false;
  }
  
  res.json({
    success: true,
    debug: {
      userId,
      hasCredentials: !!credentials,
      credentialsInfo: credentials ? {
        shopDomain: credentials.shopDomain,
        hasAccessToken: !!credentials.accessToken,
        accessTokenLength: credentials.accessToken ? credentials.accessToken.length : 0,
        apiVersion: credentials.apiVersion,
        hasAppSecret: !!credentials.appSecret,
        savedAt: credentials.savedAt
      } : null,
      persistence: {
        credentialsFile: CREDENTIALS_FILE,
        fileExists,
        fileSize: fileStats ? fileStats.size : null,
        fileModified: fileStats ? fileStats.mtime.toISOString() : null,
        totalUsersInMemory: shopifyCredentials.size
      },
      webhookBaseUrl,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL,
        RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Manual backup endpoint
app.post('/api/shopify/backup', authenticateToken, async (req, res) => {
  try {
    await saveCredentialsToFile(shopifyCredentials);
    res.json({
      success: true,
      message: 'Credentials backed up successfully',
      timestamp: new Date().toISOString(),
      userCount: shopifyCredentials.size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to backup credentials',
      details: error.message
    });
  }
});

// Manual restore endpoint
app.post('/api/shopify/restore', authenticateToken, async (req, res) => {
  try {
    const restoredCredentials = await loadCredentialsFromFile();
    
    // Merge with current credentials (don't overwrite current session)
    for (const [userId, creds] of restoredCredentials) {
      shopifyCredentials.set(userId, creds);
    }
    
    res.json({
      success: true,
      message: 'Credentials restored successfully',
      timestamp: new Date().toISOString(),
      userCount: shopifyCredentials.size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to restore credentials',
      details: error.message
    });
  }
});

// User Data Management endpoints (protected)

// Get user data
app.get('/api/user/data', authenticateToken, (req, res) => {
  const userId = req.user;
  const userConfig = userData.get(userId) || {
    timeslots: [],
    blockedDates: [],
    blockedDateRanges: [],
    settings: {},
    products: [],
    blockedCodes: [],
    lastUpdated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: userConfig
  });
});

// Public API endpoints for widget (no authentication required)
// These endpoints return data for the first user (admin) for widget consumption
app.get('/api/public/widget/timeslots', (req, res) => {
  try {
    // Get the first user's data (admin user)
    const firstUserId = userData.keys().next().value;
    if (!firstUserId) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const userConfig = userData.get(firstUserId);
    const timeslots = userConfig?.timeslots || [];
    
    res.json({
      success: true,
      data: timeslots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeslots',
      details: error.message
    });
  }
});

app.get('/api/public/widget/settings', (req, res) => {
  try {
    // Get the first user's data (admin user)
    const firstUserId = userData.keys().next().value;
    if (!firstUserId) {
      return res.json({
        success: true,
        data: { collectionLocations: [] }
      });
    }
    
    const userConfig = userData.get(firstUserId);
    const settings = userConfig?.settings || {};
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      details: error.message
    });
  }
});

app.get('/api/public/widget/blocked-dates', (req, res) => {
  try {
    // Get the first user's data (admin user)
    const firstUserId = userData.keys().next().value;
    if (!firstUserId) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const userConfig = userData.get(firstUserId);
    const blockedDates = userConfig?.blockedDates || [];
    
    res.json({
      success: true,
      data: blockedDates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blocked dates',
      details: error.message
    });
  }
});

app.get('/api/public/widget/blocked-date-ranges', (req, res) => {
  try {
    // Get the first user's data (admin user)
    const firstUserId = userData.keys().next().value;
    if (!firstUserId) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const userConfig = userData.get(firstUserId);
    const blockedDateRanges = userConfig?.blockedDateRanges || [];
    
    res.json({
      success: true,
      data: blockedDateRanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blocked date ranges',
      details: error.message
    });
  }
});

app.get('/api/public/widget/tag-mapping-settings', (req, res) => {
  try {
    // Get the first user's data (admin user)
    const firstUserId = userData.keys().next().value;
    if (!firstUserId) {
      return res.json({
        success: true,
        data: {
          mappings: [
            {
              id: 'delivery',
              type: 'delivery',
              label: 'Delivery',
              tag: 'Delivery',
              enabled: true,
              description: 'Tag applied when customer selects delivery option'
            },
            {
              id: 'collection',
              type: 'collection',
              label: 'Collection',
              tag: 'Collection',
              enabled: true,
              description: 'Tag applied when customer selects collection option'
            },
            {
              id: 'express',
              type: 'express',
              label: 'Express Delivery',
              tag: 'Express',
              enabled: true,
              description: 'Tag applied when customer selects express delivery'
            },
            {
              id: 'timeslot',
              type: 'timeslot',
              label: 'Timeslot',
              tag: 'hh:mm-hh:mm',
              enabled: true,
              description: 'Tag applied with selected timeslot in 24-hour format'
            },
            {
              id: 'date',
              type: 'date',
              label: 'Selected Date',
              tag: 'dd/mm/yyyy',
              enabled: true,
              description: 'Tag applied with selected delivery date'
            }
          ],
          enableTagging: true,
          prefix: '',
          separator: ','
        }
      });
    }
    
    const userConfig = userData.get(firstUserId);
    const tagMappingSettings = userConfig?.tagMappingSettings || {
      mappings: [
        {
          id: 'delivery',
          type: 'delivery',
          label: 'Delivery',
          tag: 'Delivery',
          enabled: true,
          description: 'Tag applied when customer selects delivery option'
        },
        {
          id: 'collection',
          type: 'collection',
          label: 'Collection',
          tag: 'Collection',
          enabled: true,
          description: 'Tag applied when customer selects collection option'
        },
        {
          id: 'express',
          type: 'express',
          label: 'Express Delivery',
          tag: 'Express',
          enabled: true,
          description: 'Tag applied when customer selects express delivery'
        },
        {
          id: 'timeslot',
          type: 'timeslot',
          label: 'Timeslot',
          tag: 'hh:mm-hh:mm',
          enabled: true,
          description: 'Tag applied with selected timeslot in 24-hour format'
        },
        {
          id: 'date',
          type: 'date',
          label: 'Selected Date',
          tag: 'dd/mm/yyyy',
          enabled: true,
          description: 'Tag applied with selected delivery date'
        }
      ],
      enableTagging: true,
      prefix: '',
      separator: ','
    };
    
    res.json({
      success: true,
      data: tagMappingSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag mapping settings',
      details: error.message
    });
  }
});

// Save user data
app.post('/api/user/data', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { timeslots, blockedDates, blockedDateRanges, settings, products, blockedCodes } = req.body;
  
  try {
    const userConfig = {
      timeslots: timeslots || [],
      blockedDates: blockedDates || [],
      blockedDateRanges: blockedDateRanges || [],
      settings: settings || {},
      products: products || [],
      blockedCodes: blockedCodes || [],
      lastUpdated: new Date().toISOString()
    };
    
    userData.set(userId, userConfig);
    
    // Persist to file
    await saveUserDataToFile(userData);

    // 🤖 AUTOMATIC FEE AUTOMATION TRIGGER
    // Check if there are express timeslots and Shopify credentials
    const credentials = shopifyCredentials.get(userId);
    const hasExpressTimeslots = timeslots && timeslots.some(slot => slot.type === 'express' && slot.fee > 0);
    
    if (credentials && hasExpressTimeslots) {
      console.log(`🤖 Detected express timeslots, triggering automatic fee product creation...`);
      
      // Run automation in background (don't wait for completion)
      setImmediate(async () => {
        try {
          const automation = new ShopifyFeeAutomation(credentials);
          const results = await automation.automateExpressTimeslots(timeslots);
          
          // Update user data with automation results
          const currentUserData = userData.get(userId) || {};
          currentUserData.feeAutomation = {
            lastRun: new Date().toISOString(),
            results: results.summary,
            triggeredBy: 'data_save'
          };
          userData.set(userId, currentUserData);
          await saveUserDataToFile(userData);
          
          console.log(`✅ Automatic fee automation completed for ${userId}:`, results.summary);
        } catch (error) {
          console.error(`❌ Automatic fee automation failed for ${userId}:`, error);
        }
      });
    }
    
    res.json({
      success: true,
      message: 'User data saved successfully',
      timestamp: userConfig.lastUpdated,
      automationTriggered: credentials && hasExpressTimeslots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save user data',
      details: error.message
    });
  }
});

// Save specific data type
app.post('/api/user/data/:type', authenticateToken, async (req, res) => {
  const userId = req.user;
  const dataType = req.params.type;
  const { data } = req.body;
  
  try {
    let userConfig = userData.get(userId) || {
      timeslots: [],
      blockedDates: [],
      blockedDateRanges: [],
      settings: {},
      products: [],
      blockedCodes: [],
      tagMappingSettings: {
        mappings: [],
        enableTagging: true,
        prefix: '',
        separator: ','
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Update specific data type
    switch (dataType) {
      case 'timeslots':
        userConfig.timeslots = data;
        break;
      case 'blockedDates':
        userConfig.blockedDates = data;
        break;
      case 'blockedDateRanges':
        userConfig.blockedDateRanges = data;
        break;
      case 'settings':
        userConfig.settings = data;
        break;
      case 'products':
        userConfig.products = data;
        break;
      case 'blockedCodes':
        userConfig.blockedCodes = data;
        break;
      case 'tagMappingSettings':
        userConfig.tagMappingSettings = data;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid data type'
        });
    }
    
    userConfig.lastUpdated = new Date().toISOString();
    userData.set(userId, userConfig);
    
    // Persist to file
    await saveUserDataToFile(userData);

    // 🤖 AUTOMATIC FEE AUTOMATION TRIGGER (for timeslots)
    if (dataType === 'timeslots') {
      const credentials = shopifyCredentials.get(userId);
      const hasExpressTimeslots = data && data.some(slot => slot.type === 'express' && slot.fee > 0);
      
      if (credentials && hasExpressTimeslots) {
        console.log(`🤖 Detected express timeslots update, triggering automatic fee product creation...`);
        
        // Run automation in background
        setImmediate(async () => {
          try {
            const automation = new ShopifyFeeAutomation(credentials);
            const results = await automation.automateExpressTimeslots(data);
            
            // Update user data with automation results
            const currentUserData = userData.get(userId) || {};
            currentUserData.feeAutomation = {
              lastRun: new Date().toISOString(),
              results: results.summary,
              triggeredBy: 'timeslots_update'
            };
            userData.set(userId, currentUserData);
            await saveUserDataToFile(userData);
            
            console.log(`✅ Automatic fee automation completed for ${userId}:`, results.summary);
          } catch (error) {
            console.error(`❌ Automatic fee automation failed for ${userId}:`, error);
          }
        });
      }
    }
    
    res.json({
      success: true,
      message: `${dataType} saved successfully`,
      timestamp: userConfig.lastUpdated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to save ${dataType}`,
      details: error.message
    });
  }
});

// Migrate localStorage data to server (one-time migration)
app.post('/api/user/migrate', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { localStorageData } = req.body;
  
  try {
    // Check if user already has data on server
    const existingData = userData.get(userId);
    
    if (existingData && existingData.lastUpdated) {
      // Server data exists, return it instead of overwriting
      return res.json({
        success: true,
        message: 'Server data already exists, using server version',
        action: 'server_data_used',
        serverData: existingData
      });
    }
    
    // No server data exists, migrate from localStorage
    const migratedData = {
      timeslots: localStorageData.timeslots || [],
      blockedDates: localStorageData.blockedDates || [],
      blockedDateRanges: localStorageData.blockedDateRanges || [],
      settings: localStorageData.settings || {},
      products: localStorageData.products || [],
      blockedCodes: localStorageData.blockedCodes || [],
      tagMappingSettings: localStorageData.tagMappingSettings || {
        mappings: [],
        enableTagging: true,
        prefix: '',
        separator: ','
      },
      lastUpdated: new Date().toISOString(),
      migratedAt: new Date().toISOString()
    };
    
    userData.set(userId, migratedData);
    
    // Persist to file
    await saveUserDataToFile(userData);
    
    res.json({
      success: true,
      message: 'Data migrated successfully from localStorage to server',
      action: 'data_migrated',
      itemsMigrated: {
        timeslots: migratedData.timeslots.length,
        blockedDates: migratedData.blockedDates.length,
        blockedDateRanges: migratedData.blockedDateRanges.length,
        settings: Object.keys(migratedData.settings).length,
        products: migratedData.products.length,
        blockedCodes: migratedData.blockedCodes.length,
        tagMappingSettings: Object.keys(migratedData.tagMappingSettings).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to migrate data',
      details: error.message
    });
  }
});

// Manual sync trigger endpoint
app.post('/api/user/sync', authenticateToken, async (req, res) => {
  const userId = req.user;
  
  try {
    const userConfig = userData.get(userId);
    
    if (userConfig) {
      res.json({
        success: true,
        message: 'Data synced successfully',
        data: userConfig,
        lastUpdated: userConfig.lastUpdated
      });
    } else {
      res.json({
        success: true,
        message: 'No server data found',
        data: {
          timeslots: [],
          blockedDates: [],
          blockedDateRanges: [],
          settings: {},
          products: [],
          blockedCodes: [],
          tagMappingSettings: {
            mappings: [],
            enableTagging: true,
            prefix: '',
            separator: ','
          }
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to sync data',
      details: error.message
    });
  }
});

// Clear user data
app.delete('/api/user/data', authenticateToken, async (req, res) => {
  const userId = req.user;
  
  try {
    userData.delete(userId);
    
    // Persist to file
    await saveUserDataToFile(userData);
    
    res.json({
      success: true,
      message: 'User data cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear user data',
      details: error.message
    });
  }
});

// Emergency reset - clear all corrupted data and force fresh start
app.post('/api/user/emergency-reset', authenticateToken, async (req, res) => {
  const userId = req.user;
  
  try {
    // Clear server data
    userData.delete(userId);
    
    // Persist to file
    await saveUserDataToFile(userData);
    
    res.json({
      success: true,
      message: 'Emergency reset completed - all data cleared, will fallback to defaults',
      action: 'Please refresh the page to load fresh default data'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform emergency reset',
      details: error.message
    });
  }
});

// Get Railway environment variable command for persistence
app.get('/api/shopify/railway-env', authenticateToken, (req, res) => {
  try {
    if (shopifyCredentials.size === 0) {
      return res.json({
        success: true,
        message: 'No credentials to persist',
        command: null
      });
    }

    const credentialsObj = Object.fromEntries(shopifyCredentials);
    const envValue = JSON.stringify(credentialsObj);
    const command = `railway variables --set "SHOPIFY_CREDENTIALS_JSON=${envValue}"`;
    
    res.json({
      success: true,
      message: 'Railway environment variable command generated',
      command,
      credentialsCount: shopifyCredentials.size,
      note: 'Run this command in your terminal to persist credentials across Railway restarts'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate Railway command',
      details: error.message
    });
  }
});

// 🤖 SHOPIFY FEE AUTOMATION ENDPOINTS

// Trigger express timeslot automation
app.post('/api/shopify/automate-express-fees', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      success: false,
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  try {
    // Get user's current timeslots
    const userTimeslots = userData.get(userId)?.timeslots || [];
    
    if (userTimeslots.length === 0) {
      return res.json({
        success: true,
        message: 'No timeslots configured yet',
        results: {
          created: [],
          updated: [],
          errors: [],
          summary: {
            totalFeeAmounts: 0,
            productsCreated: 0,
            productsUpdated: 0,
            errors: 0,
            success: true
          }
        }
      });
    }

    console.log(`🤖 Starting fee automation for user ${userId} with ${userTimeslots.length} timeslots`);
    
    // Initialize automation service
    const automation = new ShopifyFeeAutomation(credentials);
    
    // Run automation
    const results = await automation.automateExpressTimeslots(userTimeslots);
    
    // Update user data with automation results
    const currentUserData = userData.get(userId) || {};
    currentUserData.feeAutomation = {
      lastRun: new Date().toISOString(),
      results: results.summary,
      triggeredBy: 'manual_trigger'
    };
    userData.set(userId, currentUserData);
    
    // Save user data
    await saveUserDataToFile(userData);
    
    res.json({
      success: true,
      message: 'Express fee automation completed successfully',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Express fee automation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Fee automation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get fee automation status
app.get('/api/shopify/fee-automation-status', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      success: false,
      error: 'Shopify credentials not configured' 
    });
  }

  try {
    const automation = new ShopifyFeeAutomation(credentials);
    const status = await automation.getAutomationStatus();
    
    // Get user's automation history
    const userAutomationData = userData.get(userId)?.feeAutomation || null;
    
    res.json({
      success: true,
      status,
      userAutomation: userAutomationData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting fee automation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get automation status',
      details: error.message
    });
  }
});

// Clean up unused fee products
app.post('/api/shopify/cleanup-fee-products', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      success: false,
      error: 'Shopify credentials not configured' 
    });
  }

  try {
    // Get current active fee amounts from user's timeslots
    const userTimeslots = userData.get(userId)?.timeslots || [];
    const automation = new ShopifyFeeAutomation(credentials);
    const activeFeeAmounts = automation.extractFeeAmounts(userTimeslots);
    
    console.log(`🧹 Starting cleanup for user ${userId}, active fees:`, activeFeeAmounts);
    
    // Run cleanup
    const cleanupResults = await automation.cleanupUnusedFeeProducts(activeFeeAmounts);
    
    res.json({
      success: true,
      message: 'Fee product cleanup completed',
      results: cleanupResults,
      activeFeeAmounts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fee product cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cleanup failed',
      details: error.message
    });
  }
});

// Enhanced webhook registration with comprehensive delivery scheduling topics
app.post('/api/shopify/register-webhooks', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  // Use the correct Railway URL for webhooks
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://delivery-schedule2-production.up.railway.app';
  
  console.log(`🔗 Using webhook base URL: ${webhookBaseUrl}`);

  // Comprehensive webhook configuration for delivery scheduling
  const webhooksToRegister = [
    // Order lifecycle (critical for delivery scheduling)
    { topic: 'orders/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/updated', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/cancelled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/fulfilled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/partially_fulfilled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/paid', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Product management (for delivery availability)
    { topic: 'products/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'products/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'products/delete', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'inventory_levels/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Customer management (for delivery preferences)
    { topic: 'customers/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'customers/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'customers/delete', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Fulfillment tracking (for delivery status)
    { topic: 'fulfillments/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'fulfillments/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Shipping and delivery
    { topic: 'shipping_addresses/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Cart events (for delivery scheduling during checkout)
    { topic: 'carts/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'carts/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // App lifecycle
    { topic: 'app/uninstalled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'app/subscriptions/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' }
  ];

  try {
    const results = [];
    
    console.log(`🔍 Fetching existing webhooks from: https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks.json`);
    
    // First, get existing webhooks to avoid duplicates
    const existingWebhooksResponse = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      }
    });

    let existingWebhooks = [];
    if (existingWebhooksResponse.ok) {
      const existingData = await existingWebhooksResponse.json();
      existingWebhooks = existingData.webhooks || [];
      console.log(`📋 Found ${existingWebhooks.length} existing webhooks`);
    } else {
      const errorData = await existingWebhooksResponse.json();
      console.error('❌ Failed to fetch existing webhooks:', errorData);
      return res.status(existingWebhooksResponse.status).json({
        success: false,
        error: 'Failed to fetch existing webhooks',
        details: errorData
      });
    }

    // Register each webhook
    for (const webhook of webhooksToRegister) {
      try {
        console.log(`🔄 Processing webhook: ${webhook.topic}`);
        
        // Check if webhook already exists
        const existingWebhook = existingWebhooks.find(w => w.topic === webhook.topic);
        
        if (existingWebhook) {
          // Update existing webhook if address is different
          if (existingWebhook.address !== webhook.address) {
            console.log(`🔄 Updating existing webhook: ${webhook.topic}`);
            const updateResponse = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks/${existingWebhook.id}.json`, {
              method: 'PUT',
              headers: {
                'X-Shopify-Access-Token': credentials.accessToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ webhook: { address: webhook.address } })
            });

            if (updateResponse.ok) {
              const updatedData = await updateResponse.json();
              results.push({
                topic: webhook.topic,
                status: 'updated',
                webhook: updatedData.webhook
              });
              console.log(`✅ Webhook updated: ${webhook.topic}`);
            } else {
              const errorData = await updateResponse.json();
              results.push({
                topic: webhook.topic,
                status: 'error',
                error: errorData.errors || 'Failed to update existing webhook'
              });
              console.error(`❌ Failed to update webhook: ${webhook.topic}`, errorData);
            }
          } else {
            results.push({
              topic: webhook.topic,
              status: 'exists',
              webhook: existingWebhook
            });
            console.log(`ℹ️ Webhook already exists: ${webhook.topic}`);
          }
        } else {
          // Create new webhook
          console.log(`➕ Creating new webhook: ${webhook.topic}`);
          const response = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks.json`, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': credentials.accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhook })
          });

          const data = await response.json();
          
          if (response.ok) {
            results.push({
              topic: webhook.topic,
              status: 'success',
              webhook: data.webhook
            });
            console.log(`✅ Webhook registered: ${webhook.topic}`);
          } else {
            results.push({
              topic: webhook.topic,
              status: 'error',
              error: data.errors || 'Unknown error'
            });
            console.error(`❌ Failed to register webhook: ${webhook.topic}`, data);
          }
        }
      } catch (error) {
        results.push({
          topic: webhook.topic,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error registering webhook: ${webhook.topic}`, error);
      }
    }

    const summary = {
      total: webhooksToRegister.length,
      success: results.filter(r => r.status === 'success').length,
      updated: results.filter(r => r.status === 'updated').length,
      exists: results.filter(r => r.status === 'exists').length,
      errors: results.filter(r => r.status === 'error').length
    };

    console.log(`📊 Webhook registration summary:`, summary);

    res.json({
      success: true,
      message: 'Webhook registration completed',
      results,
      summary,
      webhookBaseUrl // Include this for debugging
    });

  } catch (error) {
    console.error('❌ Webhook registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to register webhooks',
      details: error.message
    });
  }
});

// Update webhook listing to use user-specific credentials
app.get('/api/shopify/webhooks', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  try {
    const response = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      res.json({
        success: true,
        webhooks: data.webhooks
      });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Update webhook deletion to use user-specific credentials
app.delete('/api/shopify/webhooks/:id', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  const webhookId = req.params.id;

  try {
    const response = await fetch(`https://${credentials.shopDomain}/admin/api/${credentials.apiVersion}/webhooks/${webhookId}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      res.json({
        success: true,
        message: `Webhook ${webhookId} deleted successfully`
      });
    } else {
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Debug endpoint to check stored user data (no auth required for debugging)
app.get('/api/debug/user-data', (req, res) => {
  try {
    const allUserData = {};
    for (const [userId, data] of userData.entries()) {
      allUserData[userId] = {
        timeslots: data.timeslots?.length || 0,
        blockedDates: data.blockedDates?.length || 0,
        blockedDateRanges: data.blockedDateRanges?.length || 0,
        settings: Object.keys(data.settings || {}).length,
        products: data.products?.length || 0,
        blockedCodes: data.blockedCodes?.length || 0,
        lastUpdated: data.lastUpdated
      };
    }
    
    res.json({
      success: true,
      userCount: userData.size,
      users: allUserData,
      firstUserId: userData.keys().next().value || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch debug data',
      details: error.message
    });
  }
});

// Test endpoint to populate server with sample data (no auth required for testing)
app.post('/api/debug/populate-test-data', (req, res) => {
  try {
    const testUserId = 'admin';
    const testData = {
      timeslots: [
        {
          id: '1',
          name: 'Morning Delivery',
          startTime: '10:00',
          endTime: '14:00',
          type: 'delivery',
          maxOrders: 50,
          cutoffTime: '08:00',
          cutoffDay: 'same',
          assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        {
          id: '2',
          name: 'Afternoon Delivery',
          startTime: '14:00',
          endTime: '18:00',
          type: 'delivery',
          maxOrders: 40,
          cutoffTime: '22:00',
          cutoffDay: 'previous',
          assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
        {
          id: '5',
          name: 'Express Morning',
          startTime: '11:00',
          endTime: '13:00',
          type: 'express',
          maxOrders: 10,
          cutoffTime: '09:00',
          cutoffDay: 'same',
          assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          parentTimeslotId: '1',
        },
        {
          id: '4',
          name: 'Store Collection',
          startTime: '09:00',
          endTime: '21:00',
          type: 'collection',
          maxOrders: 100,
          cutoffTime: '08:00',
          cutoffDay: 'same',
          assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        }
      ],
      blockedDates: [
        { id: '1', date: '2024-12-25', type: 'full', reason: 'Christmas Day - Store Closed' },
        { id: '2', date: '2024-01-01', type: 'full', reason: 'New Year Day - Store Closed' }
      ],
      blockedDateRanges: [
        {
          id: 'range-1',
          name: 'Christmas Holiday Period',
          startDate: '2024-12-24',
          endDate: '2024-12-26',
          type: 'full',
          reason: 'Christmas Holiday - Store Closed for 3 Days',
          createdAt: '2024-01-15T10:30:00Z',
          dates: ['2024-12-24', '2024-12-25', '2024-12-26']
        }
      ],
      settings: {
        futureOrderLimit: 30,
        collectionLocations: [
          {
            id: '1',
            name: 'Main Store',
            address: '123 Main Street, Singapore 123456'
          },
          {
            id: '2',
            name: 'Branch Store',
            address: '456 Branch Road, Singapore 654321'
          }
        ],
        theme: 'light'
      },
      products: [],
      blockedCodes: [],
      lastUpdated: new Date().toISOString()
    };
    
    userData.set(testUserId, testData);
    
    res.json({
      success: true,
      message: 'Test data populated successfully',
      userId: testUserId,
      dataKeys: Object.keys(testData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to populate test data',
      details: error.message
    });
  }
});

// Clear test data endpoint (for debugging)
app.post('/api/debug/clear-test-data', (req, res) => {
  try {
    // Clear all user data to start fresh
    userData.clear();
    
    res.json({
      success: true,
      message: 'Test data cleared successfully',
      userCount: userData.size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear test data',
      details: error.message
    });
  }
});

// Account Management Endpoints

// Get current account info
app.get('/api/account/info', authenticateToken, (req, res) => {
  const userId = req.user;
  
  try {
    // Get account info (excluding sensitive data)
    const accountInfo = {
      username: userId,
      email: AUTH_CONFIG.ADMIN_EMAIL || 'admin@example.com',
      createdAt: '2024-01-01T00:00:00.000Z', // Default creation date
      lastLogin: new Date().toISOString()
    };
    
    res.json({
      success: true,
      account: accountInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get account info',
      details: error.message
    });
  }
});

// Change password
app.post('/api/account/change-password', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  try {
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'All password fields are required'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New passwords do not match'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // Verify current password
    if (currentPassword !== AUTH_CONFIG.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password in environment (in production, this would update a database)
    AUTH_CONFIG.ADMIN_PASSWORD = newPassword;
    
    // In production, you would:
    // 1. Hash the new password
    // 2. Update the database
    // 3. Invalidate all existing sessions except current one
    
    // For now, we'll just update the in-memory config
    // Note: This won't persist across server restarts without env var update
    
    res.json({
      success: true,
      message: 'Password changed successfully',
      note: 'Please update your environment variables to persist this change'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      details: error.message
    });
  }
});

// Change email
app.post('/api/account/change-email', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { newEmail, password } = req.body;
  
  try {
    // Validate input
    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }
    
    // Verify password
    if (password !== AUTH_CONFIG.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect'
      });
    }
    
    // Update email in environment (in production, this would update a database)
    AUTH_CONFIG.ADMIN_EMAIL = newEmail;
    
    res.json({
      success: true,
      message: 'Email changed successfully',
      newEmail: newEmail,
      note: 'Please update your environment variables to persist this change'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to change email',
      details: error.message
    });
  }
});

// Change username
app.post('/api/account/change-username', authenticateToken, async (req, res) => {
  const currentUserId = req.user;
  const { newUsername, password } = req.body;
  
  try {
    // Validate input
    if (!newUsername || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    if (newUsername.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long'
      });
    }
    
    // Username validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(newUsername)) {
      return res.status(400).json({
        success: false,
        error: 'Username can only contain letters, numbers, and underscores'
      });
    }
    
    // Verify password
    if (password !== AUTH_CONFIG.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect'
      });
    }
    
    // Check if username is different
    if (newUsername === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'New username must be different from current username'
      });
    }
    
    // Update username in environment
    const oldUsername = AUTH_CONFIG.ADMIN_USERNAME;
    AUTH_CONFIG.ADMIN_USERNAME = newUsername;
    
    // Migrate user data to new username
    const oldUserData = userData.get(currentUserId);
    if (oldUserData) {
      userData.set(newUsername, oldUserData);
      userData.delete(currentUserId);
      await saveUserDataToFile(userData);
    }
    
    // Migrate Shopify credentials to new username
    const oldCredentials = shopifyCredentials.get(currentUserId);
    if (oldCredentials) {
      shopifyCredentials.set(newUsername, oldCredentials);
      shopifyCredentials.delete(currentUserId);
      await saveCredentialsToFile(shopifyCredentials);
    }
    
    // Invalidate current session and create new one
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      sessions.delete(token);
    }
    
    // Create new session with new username
    const newToken = btoa(`${newUsername}:${Date.now()}:${Math.random()}`);
    sessions.set(newToken, {
      user: newUsername,
      timestamp: Date.now()
    });
    
    await saveSessionsToFile();
    
    res.json({
      success: true,
      message: 'Username changed successfully',
      newUsername: newUsername,
      newToken: newToken,
      note: 'Please update your environment variables to persist this change'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to change username',
      details: error.message
    });
  }
});

// Delete account (with confirmation)
app.post('/api/account/delete', authenticateToken, async (req, res) => {
  const userId = req.user;
  const { password, confirmDelete } = req.body;
  
  try {
    // Validate input
    if (!password || confirmDelete !== 'DELETE') {
      return res.status(400).json({
        success: false,
        error: 'Password and confirmation required. Type "DELETE" to confirm.'
      });
    }
    
    // Verify password
    if (password !== AUTH_CONFIG.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect'
      });
    }
    
    // Delete all user data
    userData.delete(userId);
    shopifyCredentials.delete(userId);
    
    // Clear all sessions
    sessions.clear();
    
    // Save changes
    await saveUserDataToFile(userData);
    await saveCredentialsToFile(shopifyCredentials);
    await saveSessionsToFile();
    
    res.json({
      success: true,
      message: 'Account deleted successfully',
      note: 'All data has been permanently removed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      details: error.message
    });
  }
});

// Serve static files from dist/client directory
app.use(express.static(join(__dirname, 'dist', 'client')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Delivery Scheduler server running on port ${PORT}`);
  console.log(`🔐 Authentication enabled - Default: ${AUTH_CONFIG.ADMIN_USERNAME} / ${AUTH_CONFIG.ADMIN_PASSWORD}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 App available at http://localhost:${PORT}`);
  
  // Log current user data status
  console.log(`📊 Current user data: ${userData.size} users stored`);
  if (userData.size > 0) {
    for (const [userId, data] of userData.entries()) {
      console.log(`   - User: ${userId}, Last Updated: ${data.lastUpdated || 'Never'}`);
    }
  }

  // Enhanced logging for Railway deployment
  console.log('🚀 Starting Delivery Scheduler Server...');
  console.log('📊 Environment Check:');
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('   - PORT:', process.env.PORT || 4321);
  console.log('   - Admin Username:', process.env.VITE_ADMIN_USERNAME || 'admin');
  console.log('   - Admin Email:', process.env.VITE_ADMIN_EMAIL || 'admin@example.com');
  console.log('   - Shopify Credentials Env:', !!process.env.SHOPIFY_CREDENTIALS_JSON);
  console.log('   - User Data Env:', !!process.env.USER_DATA_JSON);
  console.log('   - Sessions Env:', !!process.env.SESSIONS_JSON);
});

// Webhook Handler Functions for Delivery Scheduling

// Function to apply delivery tags to orders based on cart attributes
async function applyDeliveryTagsToOrder(order, credentials, userId) {
  try {
    // Check if order has delivery attributes from cart
    const deliveryTags = order.note_attributes?.find(attr => attr.name === 'delivery_tags')?.value ||
                        order.attributes?.delivery_tags;
    
    if (!deliveryTags) {
      console.log(`📦 Order ${order.id} has no delivery tags to apply`);
      return;
    }
    
    console.log(`🏷️ Applying delivery tags to order ${order.id}: ${deliveryTags}`);
    
    // Parse the delivery tags (comma-separated)
    const tagsToAdd = deliveryTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    if (tagsToAdd.length === 0) {
      console.log(`📦 No valid delivery tags found for order ${order.id}`);
      return;
    }
    
    // Get existing tags
    const existingTags = order.tags ? order.tags.split(',').map(tag => tag.trim()) : [];
    
    // Combine existing tags with new delivery tags (avoid duplicates)
    const allTags = [...new Set([...existingTags, ...tagsToAdd])];
    const tagsString = allTags.join(', ');
    
    // Update order with new tags using Shopify Admin API
    const shopDomain = credentials.shop_domain;
    const accessToken = credentials.access_token;
    
    const updateData = {
      order: {
        id: order.id,
        tags: tagsString
      }
    };
    
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/orders/${order.id}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      const updatedOrder = await response.json();
      console.log(`✅ Successfully applied delivery tags to order ${order.id}:`, tagsToAdd);
      console.log(`📋 Order ${order.id} now has tags: ${updatedOrder.order.tags}`);
      
      // Also update order notes with delivery information
      await updateOrderNotesWithDeliveryInfo(order, credentials, userId);
      
    } else {
      const errorData = await response.text();
      console.error(`❌ Failed to apply delivery tags to order ${order.id}:`, response.status, errorData);
    }
    
  } catch (error) {
    console.error(`❌ Error applying delivery tags to order ${order.id}:`, error);
  }
}

// Function to update order notes with delivery information
async function updateOrderNotesWithDeliveryInfo(order, credentials, userId) {
  try {
    // Get delivery notes from order attributes
    const deliveryNotes = order.note_attributes?.find(attr => attr.name === 'delivery_notes')?.value ||
                         order.attributes?.delivery_notes;
    
    if (!deliveryNotes) {
      console.log(`📦 Order ${order.id} has no delivery notes to add`);
      return;
    }
    
    console.log(`📝 Adding delivery notes to order ${order.id}`);
    
    // Combine existing notes with delivery notes
    const existingNotes = order.note || '';
    const separator = existingNotes ? '\n\n---\n\n' : '';
    const updatedNotes = existingNotes + separator + deliveryNotes;
    
    // Update order with new notes using Shopify Admin API
    const shopDomain = credentials.shop_domain;
    const accessToken = credentials.access_token;
    
    const updateData = {
      order: {
        id: order.id,
        note: updatedNotes
      }
    };
    
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/orders/${order.id}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      console.log(`✅ Successfully added delivery notes to order ${order.id}`);
    } else {
      const errorData = await response.text();
      console.error(`❌ Failed to add delivery notes to order ${order.id}:`, response.status, errorData);
    }
    
  } catch (error) {
    console.error(`❌ Error adding delivery notes to order ${order.id}:`, error);
  }
}

// Order-related handlers
async function handleOrderCreated(event, credentials, userId) {
  console.log(`📦 New order created: ${event.id}`);
  
  try {
    // Extract delivery information from order
    const order = event;
    const deliveryInfo = {
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: order.customer?.id,
      customerEmail: order.customer?.email,
      deliveryAddress: order.shipping_address,
      lineItems: order.line_items,
      tags: order.tags,
      createdAt: order.created_at,
      userId: userId
    };

    // CRITICAL: Apply delivery tags to the order based on cart attributes
    await applyDeliveryTagsToOrder(order, credentials, userId);

    // Check if order has delivery scheduling tags
    const hasDeliveryTag = order.tags && order.tags.includes('delivery-scheduled');
    const hasCollectionTag = order.tags && order.tags.includes('collection-scheduled');

    if (hasDeliveryTag || hasCollectionTag) {
      console.log(`🚚 Order ${order.id} has delivery/collection scheduling`);
      
      // Extract delivery date and time from tags or notes
      const deliveryDate = extractDeliveryDateFromOrder(order);
      const deliveryTime = extractDeliveryTimeFromOrder(order);
      
      if (deliveryDate && deliveryTime) {
        console.log(`📅 Delivery scheduled for ${deliveryDate} at ${deliveryTime}`);
        
        // Here you would typically:
        // 1. Save to your delivery scheduling database
        // 2. Send confirmation emails
        // 3. Update inventory
        // 4. Trigger notifications
      }
    }

    // Log order details for debugging
    console.log('Order details:', {
      id: order.id,
      number: order.order_number,
      total: order.total_price,
      currency: order.currency,
      tags: order.tags,
      customer: order.customer?.email
    });

  } catch (error) {
    console.error('Error processing order creation:', error);
  }
}

async function handleOrderUpdated(event, credentials, userId) {
  console.log(`📦 Order updated: ${event.id}`);
  
  try {
    const order = event;
    
    // Check for delivery-related changes
    const oldTags = order.tags; // You might need to store previous state
    const newTags = order.tags;
    
    // Handle delivery status changes
    if (newTags.includes('delivery-confirmed') && !oldTags.includes('delivery-confirmed')) {
      console.log(`✅ Delivery confirmed for order ${order.id}`);
      // Trigger delivery confirmation workflow
    }
    
    if (newTags.includes('delivery-cancelled') && !oldTags.includes('delivery-cancelled')) {
      console.log(`❌ Delivery cancelled for order ${order.id}`);
      // Handle delivery cancellation
    }

  } catch (error) {
    console.error('Error processing order update:', error);
  }
}

async function handleOrderCancelled(event, credentials, userId) {
  console.log(`❌ Order cancelled: ${event.id}`);
  
  try {
    const order = event;
    
    // Cancel any scheduled deliveries
    if (order.tags && order.tags.includes('delivery-scheduled')) {
      console.log(`🚫 Cancelling scheduled delivery for order ${order.id}`);
      // Cancel delivery scheduling
    }

  } catch (error) {
    console.error('Error processing order cancellation:', error);
  }
}

async function handleOrderFulfilled(event, credentials, userId) {
  console.log(`✅ Order fulfilled: ${event.id}`);
  
  try {
    const order = event;
    
    // Update delivery status
    if (order.tags && order.tags.includes('delivery-scheduled')) {
      console.log(`📦 Delivery completed for order ${order.id}`);
      // Mark delivery as completed
    }

  } catch (error) {
    console.error('Error processing order fulfillment:', error);
  }
}

async function handleOrderPartiallyFulfilled(event, credentials, userId) {
  console.log(`📦 Order partially fulfilled: ${event.id}`);
  
  try {
    const order = event;
    
    // Handle partial fulfillment for delivery scheduling
    console.log(`📋 Partial fulfillment for order ${order.id}`);
    // Update delivery schedule for remaining items

  } catch (error) {
    console.error('Error processing partial fulfillment:', error);
  }
}

async function handleOrderPaid(event, credentials, userId) {
  console.log(`💰 Order paid: ${event.id}`);
  
  try {
    const order = event;
    
    // Payment confirmation for delivery scheduling
    if (order.tags && order.tags.includes('delivery-scheduled')) {
      console.log(`💳 Payment confirmed for scheduled delivery ${order.id}`);
      // Confirm delivery scheduling after payment
    }

  } catch (error) {
    console.error('Error processing order payment:', error);
  }
}

// Product-related handlers
async function handleProductCreated(event, credentials, userId) {
  console.log(`🆕 New product created: ${event.id}`);
  
  try {
    const product = event;
    
    // Check if product has delivery scheduling enabled
    const hasDeliveryScheduling = product.tags && product.tags.includes('delivery-scheduling');
    
    if (hasDeliveryScheduling) {
      console.log(`🚚 Product ${product.id} has delivery scheduling enabled`);
      // Initialize delivery scheduling for this product
    }

  } catch (error) {
    console.error('Error processing product creation:', error);
  }
}

async function handleProductUpdated(event, credentials, userId) {
  console.log(`✏️ Product updated: ${event.id}`);
  
  try {
    const product = event;
    
    // Update delivery scheduling settings if needed
    const hasDeliveryScheduling = product.tags && product.tags.includes('delivery-scheduling');
    
    if (hasDeliveryScheduling) {
      console.log(`🔄 Updating delivery scheduling for product ${product.id}`);
      // Update delivery scheduling configuration
    }

  } catch (error) {
    console.error('Error processing product update:', error);
  }
}

async function handleProductDeleted(event, credentials, userId) {
  console.log(`🗑️ Product deleted: ${event.id}`);
  
  try {
    const product = event;
    
    // Clean up delivery scheduling for deleted product
    console.log(`🧹 Cleaning up delivery scheduling for product ${product.id}`);
    // Remove product from delivery scheduling system

  } catch (error) {
    console.error('Error processing product deletion:', error);
  }
}

async function handleInventoryUpdated(event, credentials, userId) {
  console.log(`📦 Inventory updated: ${event.inventory_item_id}`);
  
  try {
    const inventory = event;
    
    // Update delivery availability based on inventory
    console.log(`🔄 Updating delivery availability for inventory item ${inventory.inventory_item_id}`);
    // Update delivery scheduling availability

  } catch (error) {
    console.error('Error processing inventory update:', error);
  }
}

// Customer-related handlers
async function handleCustomerCreated(event, credentials, userId) {
  console.log(`👤 New customer created: ${event.id}`);
  
  try {
    const customer = event;
    
    // Initialize customer delivery preferences
    console.log(`👤 Setting up delivery preferences for customer ${customer.id}`);
    // Set default delivery preferences

  } catch (error) {
    console.error('Error processing customer creation:', error);
  }
}

async function handleCustomerUpdated(event, credentials, userId) {
  console.log(`✏️ Customer updated: ${event.id}`);
  
  try {
    const customer = event;
    
    // Update customer delivery preferences
    console.log(`🔄 Updating delivery preferences for customer ${customer.id}`);
    // Update delivery scheduling preferences

  } catch (error) {
    console.error('Error processing customer update:', error);
  }
}

async function handleCustomerDeleted(event, credentials, userId) {
  console.log(`🗑️ Customer deleted: ${event.id}`);
  
  try {
    const customer = event;
    
    // Clean up customer delivery data
    console.log(`🧹 Cleaning up delivery data for customer ${customer.id}`);
    // Remove customer from delivery scheduling system

  } catch (error) {
    console.error('Error processing customer deletion:', error);
  }
}

// Fulfillment handlers
async function handleFulfillmentCreated(event, credentials, userId) {
  console.log(`📦 Fulfillment created: ${event.id}`);
  
  try {
    const fulfillment = event;
    
    // Update delivery status
    console.log(`🚚 Fulfillment created for order ${fulfillment.order_id}`);
    // Update delivery tracking

  } catch (error) {
    console.error('Error processing fulfillment creation:', error);
  }
}

async function handleFulfillmentUpdated(event, credentials, userId) {
  console.log(`📦 Fulfillment updated: ${event.id}`);
  
  try {
    const fulfillment = event;
    
    // Update delivery tracking
    console.log(`🔄 Fulfillment updated for order ${fulfillment.order_id}`);
    // Update delivery status and tracking

  } catch (error) {
    console.error('Error processing fulfillment update:', error);
  }
}

// Shipping handlers
async function handleShippingAddressUpdated(event, credentials, userId) {
  console.log(`📍 Shipping address updated: ${event.id}`);
  
  try {
    const address = event;
    
    // Update delivery zone calculations
    console.log(`🔄 Updating delivery zone for address update`);
    // Recalculate delivery availability and zones

  } catch (error) {
    console.error('Error processing shipping address update:', error);
  }
}

// Cart handlers
async function handleCartCreated(event, credentials, userId) {
  console.log(`🛒 Cart created: ${event.id}`);
  
  try {
    const cart = event;
    
    // Initialize delivery scheduling for cart
    console.log(`🛒 Setting up delivery scheduling for cart ${cart.id}`);
    // Prepare delivery scheduling options

  } catch (error) {
    console.error('Error processing cart creation:', error);
  }
}

async function handleCartUpdated(event, credentials, userId) {
  console.log(`🛒 Cart updated: ${event.id}`);
  
  try {
    const cart = event;
    
    // Update delivery scheduling options
    console.log(`🔄 Updating delivery scheduling for cart ${cart.id}`);
    // Update available delivery slots based on cart contents

  } catch (error) {
    console.error('Error processing cart update:', error);
  }
}

// App lifecycle handlers
async function handleAppUninstalled(event, credentials, userId, shopDomain) {
  console.log(`🚫 App uninstalled from shop: ${shopDomain}`);
  
  try {
    // Clean up user data when app is uninstalled
    shopifyCredentials.delete(userId);
    
    // Clean up delivery scheduling data
    console.log(`🧹 Cleaning up delivery scheduling data for user ${userId}`);
    // Remove all delivery scheduling data for this user
    
    console.log(`✅ Cleanup completed for user ${userId} (${shopDomain})`);
  } catch (error) {
    console.error('Error processing app uninstall:', error);
  }
}

async function handleSubscriptionUpdated(event, credentials, userId) {
  console.log(`💳 Subscription updated for user: ${userId}`);
  
  try {
    const subscription = event;
    
    // Update delivery scheduling features based on subscription
    console.log(`🔄 Updating delivery scheduling features for subscription`);
    // Adjust delivery scheduling capabilities based on plan

  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

// Helper functions for delivery scheduling
function extractDeliveryDateFromOrder(order) {
  // Extract delivery date from order tags, notes, or line item properties
  if (order.tags) {
    const deliveryTag = order.tags.find(tag => tag.startsWith('delivery-date:'));
    if (deliveryTag) {
      return deliveryTag.replace('delivery-date:', '');
    }
  }
  
  if (order.note) {
    const dateMatch = order.note.match(/delivery date: (\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      return dateMatch[1];
    }
  }
  
  return null;
}

function extractDeliveryTimeFromOrder(order) {
  // Extract delivery time from order tags, notes, or line item properties
  if (order.tags) {
    const timeTag = order.tags.find(tag => tag.startsWith('delivery-time:'));
    if (timeTag) {
      return timeTag.replace('delivery-time:', '');
    }
  }
  
  if (order.note) {
    const timeMatch = order.note.match(/delivery time: (\d{2}:\d{2})/i);
    if (timeMatch) {
      return timeMatch[1];
    }
  }
  
  return null;
}

// Load sessions from environment variables (Railway-compatible persistence)
async function loadSessionsFromEnv() {
  try {
    const sessionsEnv = process.env.SESSIONS_JSON;
    if (sessionsEnv) {
      const sessionsObj = JSON.parse(sessionsEnv);
      console.log('📁 Loaded sessions from environment for', Object.keys(sessionsObj).length, 'tokens');
      
      // Only load non-expired sessions
      const now = Date.now();
      for (const [token, session] of Object.entries(sessionsObj)) {
        if (now - session.timestamp < AUTH_CONFIG.SESSION_TIMEOUT) {
          sessions.set(token, session);
        }
      }
      console.log('✅ Restored', sessions.size, 'valid sessions from environment');
      return sessions;
    }
    console.log('📁 No sessions found in environment, starting fresh');
    return sessions;
  } catch (error) {
    console.error('❌ Error loading sessions from environment:', error);
    return sessions;
  }
}

// Load sessions from file on startup (fallback)
async function loadSessionsFromFile() {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf8');
    const sessionsObj = JSON.parse(data);
    console.log('📁 Loaded sessions from file for', Object.keys(sessionsObj).length, 'tokens');
    
    // Only load non-expired sessions
    const now = Date.now();
    for (const [token, session] of Object.entries(sessionsObj)) {
      if (now - session.timestamp < AUTH_CONFIG.SESSION_TIMEOUT) {
        sessions.set(token, session);
      }
    }
    console.log('✅ Restored', sessions.size, 'valid sessions');
    return sessions;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 No existing sessions file found, checking environment...');
      return await loadSessionsFromEnv();
    } else {
      console.error('❌ Error loading sessions from file:', error);
      return await loadSessionsFromEnv();
    }
  }
}

// Save sessions to file and log environment variable suggestion
async function saveSessionsToFile() {
  try {
    const sessionsObj = Object.fromEntries(sessions);
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2));
    console.log('💾 Saved sessions to file for', sessions.size, 'tokens');
    
    // Attempt automatic Railway environment variable update
    if (sessions.size > 0) {
      const updated = await updateRailwayEnvironmentVariable('SESSIONS_JSON', sessionsObj);
      if (!updated) {
        console.log('💡 Manual Railway update required - copy the command above');
      }
    }
  } catch (error) {
    console.error('❌ Error saving sessions to file:', error);
  }
} 