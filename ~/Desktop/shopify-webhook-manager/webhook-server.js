const express = require('express');
const crypto = require('crypto');

// Webhook Registration Endpoint
app.post('/api/shopify/register-webhooks', authenticateToken, async (req, res) => {
  const userId = req.user;
  const credentials = shopifyCredentials.get(userId);
  
  if (!credentials) {
    return res.status(400).json({ 
      error: 'Shopify credentials not configured. Please set up your credentials first.' 
    });
  }

  // Your webhook base URL (change this to your domain)
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'https://your-app.com';
  
  console.log(`🔗 Using webhook base URL: ${webhookBaseUrl}`);

  // Define webhooks to register (customize for your app)
  const webhooksToRegister = [
    // Order lifecycle
    { topic: 'orders/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/updated', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/cancelled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/fulfilled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'orders/paid', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Product management
    { topic: 'products/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'products/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'products/delete', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'inventory_levels/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // Customer management
    { topic: 'customers/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
    { topic: 'customers/update', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },

    // App lifecycle
    { topic: 'app/uninstalled', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' }
  ];

  try {
    const results = [];
    
    // Get existing webhooks to avoid duplicates
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
      webhookBaseUrl
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

// Webhook Listing Endpoint
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

// Webhook Deletion Endpoint
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

// Main Webhook Receiver Endpoint
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

  // Verify HMAC signature (CRITICAL for security)
  const generatedHmac = crypto
    .createHmac('sha256', userCredentials.appSecret)
    .update(body, 'utf8')
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

  // Process webhook based on topic
  try {
    switch (topicHeader) {
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
      case 'orders/paid':
        await handleOrderPaid(event, userCredentials, userId);
        break;
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
      case 'customers/create':
        await handleCustomerCreated(event, userCredentials, userId);
        break;
      case 'customers/update':
        await handleCustomerUpdated(event, userCredentials, userId);
        break;
      case 'app/uninstalled':
        await handleAppUninstalled(event, userCredentials, userId, shopHeader);
        break;
      default:
        console.log(`📝 Unhandled webhook topic: ${topicHeader}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Don't return an error to Shopify, just log it
    // Shopify will retry failed webhooks
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).send('Webhook received');
});

// Example webhook handlers (customize for your app)
async function handleOrderCreated(event, credentials, userId) {
  console.log(`📦 New order created: ${event.id}`);
  
  try {
    // Extract order information
    const order = event;
    const orderInfo = {
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: order.customer?.id,
      customerEmail: order.customer?.email,
      totalPrice: order.total_price,
      currency: order.currency,
      lineItems: order.line_items,
      shippingAddress: order.shipping_address,
      tags: order.tags,
      createdAt: order.created_at,
      userId: userId
    };

    // Your custom logic here
    console.log('Order details:', orderInfo);
    
    // Example: Save to database, send notifications, etc.
    
  } catch (error) {
    console.error('Error processing order creation:', error);
  }
}

async function handleOrderUpdated(event, credentials, userId) {
  console.log(`📦 Order updated: ${event.id}`);
  
  try {
    const order = event;
    
    // Handle order updates
    console.log('Order update details:', {
      id: order.id,
      number: order.order_number,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      tags: order.tags
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing order update:', error);
  }
}

async function handleOrderCancelled(event, credentials, userId) {
  console.log(`❌ Order cancelled: ${event.id}`);
  
  try {
    const order = event;
    
    // Handle order cancellation
    console.log('Cancelled order details:', {
      id: order.id,
      number: order.order_number,
      cancelReason: order.cancel_reason,
      cancelledAt: order.cancelled_at
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing order cancellation:', error);
  }
}

async function handleOrderFulfilled(event, credentials, userId) {
  console.log(`✅ Order fulfilled: ${event.id}`);
  
  try {
    const order = event;
    
    // Handle order fulfillment
    console.log('Fulfilled order details:', {
      id: order.id,
      number: order.order_number,
      fulfillmentStatus: order.fulfillment_status
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing order fulfillment:', error);
  }
}

async function handleOrderPaid(event, credentials, userId) {
  console.log(`💰 Order paid: ${event.id}`);
  
  try {
    const order = event;
    
    // Handle order payment
    console.log('Paid order details:', {
      id: order.id,
      number: order.order_number,
      totalPrice: order.total_price,
      financialStatus: order.financial_status
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing order payment:', error);
  }
}

async function handleProductCreated(event, credentials, userId) {
  console.log(`🆕 New product created: ${event.id}`);
  
  try {
    const product = event;
    
    // Handle new product
    console.log('New product details:', {
      id: product.id,
      title: product.title,
      handle: product.handle,
      productType: product.product_type,
      vendor: product.vendor,
      tags: product.tags
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing product creation:', error);
  }
}

async function handleProductUpdated(event, credentials, userId) {
  console.log(`📝 Product updated: ${event.id}`);
  
  try {
    const product = event;
    
    // Handle product update
    console.log('Updated product details:', {
      id: product.id,
      title: product.title,
      updatedAt: product.updated_at
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing product update:', error);
  }
}

async function handleProductDeleted(event, credentials, userId) {
  console.log(`🗑️ Product deleted: ${event.id}`);
  
  try {
    const product = event;
    
    // Handle product deletion
    console.log('Deleted product details:', {
      id: product.id,
      title: product.title
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing product deletion:', error);
  }
}

async function handleInventoryUpdated(event, credentials, userId) {
  console.log(`📦 Inventory updated for location: ${event.location_id}`);
  
  try {
    const inventoryLevel = event;
    
    // Handle inventory update
    console.log('Inventory update details:', {
      inventoryItemId: inventoryLevel.inventory_item_id,
      locationId: inventoryLevel.location_id,
      available: inventoryLevel.available,
      updatedAt: inventoryLevel.updated_at
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing inventory update:', error);
  }
}

async function handleCustomerCreated(event, credentials, userId) {
  console.log(`👤 New customer created: ${event.id}`);
  
  try {
    const customer = event;
    
    // Handle new customer
    console.log('New customer details:', {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      tags: customer.tags
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing customer creation:', error);
  }
}

async function handleCustomerUpdated(event, credentials, userId) {
  console.log(`👤 Customer updated: ${event.id}`);
  
  try {
    const customer = event;
    
    // Handle customer update
    console.log('Updated customer details:', {
      id: customer.id,
      email: customer.email,
      updatedAt: customer.updated_at
    });
    
    // Your custom logic here
    
  } catch (error) {
    console.error('Error processing customer update:', error);
  }
}

async function handleAppUninstalled(event, credentials, userId, shopDomain) {
  console.log(`🗑️ App uninstalled from shop: ${shopDomain}`);
  
  try {
    // Clean up user data when app is uninstalled
    console.log('Cleaning up data for shop:', shopDomain);
    
    // Remove credentials from memory
    shopifyCredentials.delete(userId);
    
    // Your custom cleanup logic here
    // - Remove user data from database
    // - Cancel subscriptions
    // - Send notification emails
    // - Clean up files/resources
    
  } catch (error) {
    console.error('Error processing app uninstallation:', error);
  }
} 