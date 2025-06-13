import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4321;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: process.env.VITE_APP_VERSION || '1.1.5',
    timestamp: new Date().toISOString()
  });
});

// Shopify API proxy
app.use('/api/shopify/:endpoint(*)', async (req, res) => {
  const endpoint = req.params.endpoint;
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shopDomain || !accessToken) {
    return res.status(500).json({ error: 'Shopify credentials not set' });
  }

  const shopifyUrl = `https://${shopDomain}/admin/api/${apiVersion}/${endpoint}`;
  try {
    const response = await fetch(shopifyUrl, {
      method: req.method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
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

// Delivery API mock endpoints
app.get('/api/delivery/timeslots', (req, res) => {
  const timeslots = [
    { id: 'morning', name: 'Morning Delivery', type: 'delivery', startTime: '10:00', endTime: '14:00', price: 0, available: true },
    { id: 'afternoon', name: 'Afternoon Delivery', type: 'delivery', startTime: '14:00', endTime: '18:00', price: 0, available: true },
    { id: 'evening', name: 'Evening Delivery', type: 'delivery', startTime: '18:00', endTime: '22:00', price: 5, available: true },
    { id: 'express', name: 'Express Delivery', type: 'delivery', startTime: '11:00', endTime: '13:00', price: 15, available: true },
    { id: 'collection', name: 'Store Collection', type: 'collection', startTime: '09:00', endTime: '21:00', price: -5, available: true },
  ];
  res.json({ timeslots });
});

app.get('/api/delivery/availability', (req, res) => {
  const { date, postalCode } = req.query;
  // Mock availability data
  res.json({
    date,
    postalCode,
    available: true,
    message: 'Available for delivery',
  });
});

app.get('/api/delivery/orders', (req, res) => {
  // Mock orders data
  res.json({ orders: [] });
});

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Delivery Scheduler server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 App available at http://localhost:${PORT}`);
}); 