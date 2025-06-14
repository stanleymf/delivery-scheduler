# Shopify Webhook Manager

A complete, production-ready Shopify webhook management system with React frontend and Node.js backend.

## 🎯 Features

- **Complete Webhook Management**: Register, list, and delete webhooks
- **Security**: HMAC signature verification for webhook authenticity
- **Multi-tenant Support**: User-isolated credentials and webhook handling
- **Beautiful UI**: Responsive interface with status indicators and real-time updates
- **Error Handling**: Comprehensive error handling and logging
- **Topic Overview**: Visual overview of all webhook topics and their registration status
- **Customizable**: Easy to modify webhook topics for your specific needs

## 📁 Files Included

- `WebhookManager.tsx` - React component for webhook management UI
- `webhook-server.js` - Node.js/Express server endpoints for webhook management
- `api-utils.ts` - Authentication and API utility functions
- `README.md` - This setup guide

## 🚀 Quick Setup

### 1. Frontend Setup (React)

```bash
# Install dependencies
npm install lucide-react

# Copy the component
cp WebhookManager.tsx src/components/
cp api-utils.ts src/utils/

# Import and use in your app
import { WebhookManager } from './components/WebhookManager';
```

### 2. Backend Setup (Node.js/Express)

```bash
# Install dependencies
npm install express crypto

# Add the webhook endpoints to your server
# Copy code from webhook-server.js to your main server file
```

### 3. Environment Variables

```bash
# Set your webhook base URL
WEBHOOK_BASE_URL=https://your-app.com

# Optional: Set Shopify app secret
SHOPIFY_APP_SECRET=your_shopify_app_secret
```

## 🔧 Configuration

### Customize Webhook Topics

Edit the `WEBHOOK_TOPICS` object in `WebhookManager.tsx` and `webhooksToRegister` array in `webhook-server.js`:

```javascript
const WEBHOOK_TOPICS = {
  'orders/create': { 
    description: 'New orders created', 
    importance: 'Critical',
    category: 'Orders'
  },
  // Add your custom topics here
};

const webhooksToRegister = [
  { topic: 'orders/create', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' },
  // Add your custom webhooks here
];
```

### Customize Webhook Handlers

Modify the webhook handler functions in `webhook-server.js`:

```javascript
async function handleOrderCreated(event, credentials, userId) {
  console.log(`📦 New order created: ${event.id}`);
  
  // Your custom logic here
  // - Save to database
  // - Send notifications
  // - Update inventory
  // - Trigger workflows
}
```

## 🔐 Authentication Setup

### 1. Implement Authentication Middleware

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token (implement your own logic)
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = session.user;
  next();
};
```

### 2. Shopify Credentials Storage

```javascript
// In-memory storage (use database in production)
const shopifyCredentials = new Map();

// Store credentials
shopifyCredentials.set(userId, {
  shopDomain: 'your-store.myshopify.com',
  accessToken: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  apiVersion: '2024-01',
  appSecret: 'your_app_secret'
});
```

## 🛡️ Security Best Practices

### 1. HMAC Verification

The webhook receiver automatically verifies HMAC signatures:

```javascript
const generatedHmac = crypto
  .createHmac('sha256', userCredentials.appSecret)
  .update(body, 'utf8')
  .digest('base64');

if (generatedHmac !== hmacHeader) {
  return res.status(401).send('Webhook signature verification failed');
}
```

### 2. Credential Protection

- Store credentials securely (encrypted in database)
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Use HTTPS for all webhook endpoints

## 📊 Webhook Topics Supported

### Orders
- `orders/create` - New orders created
- `orders/updated` - Orders modified
- `orders/cancelled` - Orders cancelled
- `orders/fulfilled` - Orders fulfilled
- `orders/paid` - Orders paid

### Products
- `products/create` - New products added
- `products/update` - Products modified
- `products/delete` - Products deleted
- `inventory_levels/update` - Inventory changes

### Customers
- `customers/create` - New customers registered
- `customers/update` - Customer information updated

### App Lifecycle
- `app/uninstalled` - App uninstalled from store

## 🔄 Webhook Processing Flow

1. **Registration**: Use the UI to register all webhooks at once
2. **Receiving**: Webhooks are received at `/api/shopify/webhook`
3. **Verification**: HMAC signature is verified for security
4. **Processing**: Event is routed to appropriate handler function
5. **Response**: Always return 200 to acknowledge receipt

## 🎨 UI Components

The webhook manager includes:

- **Registration Controls**: Register all webhooks with one click
- **Registration Results**: Real-time feedback on registration status
- **Topic Overview**: Visual grid showing all webhook topics and their status
- **Webhook List**: Detailed list of registered webhooks with management options
- **Status Indicators**: Color-coded importance levels and registration status

## 🐛 Troubleshooting

### Common Issues

1. **Webhooks not registering**
   - Check Shopify credentials are valid
   - Verify webhook URL is accessible
   - Check API permissions

2. **Webhooks not receiving**
   - Verify HMAC signature verification
   - Check webhook URL is publicly accessible
   - Ensure proper HTTPS setup

3. **Authentication errors**
   - Check token is valid and not expired
   - Verify authentication middleware is working
   - Check user permissions

### Debug Endpoints

Use the debug endpoint to troubleshoot:

```bash
GET /api/shopify/debug
```

Returns:
- User credentials status
- Webhook configuration
- Environment variables
- System information

## 📝 Customization Examples

### Add Custom Webhook Topic

1. Add to `WEBHOOK_TOPICS` in React component:
```javascript
'custom/event': {
  description: 'Custom event occurred',
  importance: 'Medium',
  category: 'Custom'
}
```

2. Add to `webhooksToRegister` in server:
```javascript
{ topic: 'custom/event', address: `${webhookBaseUrl}/api/shopify/webhook`, format: 'json' }
```

3. Add handler function:
```javascript
async function handleCustomEvent(event, credentials, userId) {
  console.log(`🔔 Custom event: ${event.id}`);
  // Your logic here
}
```

4. Add to switch statement in webhook receiver:
```javascript
case 'custom/event':
  await handleCustomEvent(event, userCredentials, userId);
  break;
```

## 🚀 Deployment

### Environment Variables
```bash
WEBHOOK_BASE_URL=https://your-production-domain.com
SHOPIFY_APP_SECRET=your_production_app_secret
NODE_ENV=production
```

### Production Considerations
- Use a proper database for credential storage
- Implement rate limiting
- Add monitoring and alerting
- Use a queue system for webhook processing
- Implement retry logic for failed webhooks

## 📄 License

This code is provided as-is for educational and commercial use. Modify as needed for your specific requirements.

## 🤝 Support

For questions or issues:
1. Check the troubleshooting section
2. Review Shopify's webhook documentation
3. Test with the debug endpoint
4. Check server logs for detailed error messages

---

**Happy webhook managing! 🎉** 