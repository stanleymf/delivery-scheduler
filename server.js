import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4321;

// Authentication configuration
const AUTH_CONFIG = {
  ADMIN_USERNAME: process.env.VITE_ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.VITE_ADMIN_PASSWORD || 'admin123',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_KEY: 'admin_token',
  USER_KEY: 'admin_user',
  SESSION_TIMESTAMP_KEY: 'admin_session_timestamp'
};

// In-memory session store (in production, use Redis or database)
const sessions = new Map();

// In-memory credential store (in production, use a database)
const shopifyCredentials = new Map();

app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check if session is expired
  if (Date.now() - session.timestamp > AUTH_CONFIG.SESSION_TIMEOUT) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  // Update session timestamp
  session.timestamp = Date.now();
  req.user = session.user;
  next();
};

// Login endpoint
app.post('/api/auth/login', (req, res) => {
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
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
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
    version: process.env.VITE_APP_VERSION || '1.1.5',
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

app.post('/api/shopify/settings', authenticateToken, (req, res) => {
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
  shopifyCredentials.set(userId, {
    shopDomain: shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    accessToken,
    apiVersion: apiVersion || '2024-01',
    appSecret: appSecret || ''
  });

  res.json({
    success: true,
    message: 'Credentials saved successfully'
  });
});

// Test Shopify connection (protected)
app.get('/api/shopify/test-connection', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);

  if (!credentials) {
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

// Update Shopify API proxy to use user-specific credentials
app.use('/api/shopify/:endpoint*', authenticateToken, async (req, res) => {
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

// Shopify Webhook endpoint (no authentication)
app.post('/api/shopify/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const shopHeader = req.get('X-Shopify-Shop-Domain');
  const topicHeader = req.get('X-Shopify-Topic');
  const body = req.body;

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

  // Verify HMAC signature
  const generatedHmac = crypto
    .createHmac('sha256', userCredentials.appSecret)
    .update(body, 'utf8')
    .digest('base64');

  if (generatedHmac !== hmacHeader) {
    console.error('❌ Webhook signature verification failed for shop:', shopHeader);
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
  console.log(`🔔 Shopify Webhook received for user ${userId} (${shopHeader}):`, {
    topic: topicHeader,
    event: event
  });

  // Handle different webhook topics
  try {
    switch (topicHeader) {
      case 'orders/create':
        console.log(`📦 New order created: ${event.id}`);
        // Add your order processing logic here
        break;
      case 'orders/updated':
        console.log(`📦 Order updated: ${event.id}`);
        // Add your order update logic here
        break;
      case 'orders/cancelled':
        console.log(`❌ Order cancelled: ${event.id}`);
        // Add your order cancellation logic here
        break;
      case 'app/uninstalled':
        console.log(`🚫 App uninstalled from shop: ${shopHeader}`);
        // Clean up user data when app is uninstalled
        shopifyCredentials.delete(userId);
        break;
      case 'products/create':
        console.log(`🆕 New product created: ${event.id}`);
        // Add your product processing logic here
        break;
      case 'products/update':
        console.log(`✏️ Product updated: ${event.id}`);
        // Add your product update logic here
        break;
      case 'customers/create':
        console.log(`👤 New customer created: ${event.id}`);
        // Add your customer processing logic here
        break;
      case 'customers/update':
        console.log(`✏️ Customer updated: ${event.id}`);
        // Add your customer update logic here
        break;
      default:
        console.log(`📝 Unknown webhook topic: ${topicHeader}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Don't return an error to Shopify, just log it
  }

  // Respond to Shopify
  res.status(200).send('Webhook received');
});

// Update webhook registration to use user-specific credentials
app.post('/api/shopify/register-webhooks', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;

  // Define webhooks to register
  const webhooksToRegister = [
    {
      topic: 'orders/create',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'orders/updated',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'orders/cancelled',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'app/uninstalled',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'products/create',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'products/update',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'customers/create',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    },
    {
      topic: 'customers/update',
      address: `${webhookBaseUrl}/api/shopify/webhook`,
      format: 'json'
    }
  ];

  try {
    const results = [];
    
    for (const webhook of webhooksToRegister) {
      try {
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
      } catch (error) {
        results.push({
          topic: webhook.topic,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error registering webhook: ${webhook.topic}`, error);
      }
    }

    res.json({
      success: true,
      message: 'Webhook registration completed',
      results
    });

  } catch (error) {
    console.error('Webhook registration error:', error);
    res.status(500).json({ error: 'Failed to register webhooks' });
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
}); 