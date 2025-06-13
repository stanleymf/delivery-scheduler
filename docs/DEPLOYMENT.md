# 🚀 Deployment Guide

This guide explains how to deploy both parts of the Delivery Scheduler system:
- **Admin Dashboard** - Full React application for managing delivery settings
- **Customer Widget** - Lightweight embeddable component for Shopify stores

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Dashboard│    │  Cloudflare Worker│    │  Shopify Store  │
│   (Railway)     │◄──►│  (Widget + API)  │◄──►│  (Customer Site)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Prerequisites

1. **Railway Account** - For admin dashboard hosting
2. **Cloudflare Account** - For widget and API hosting
3. **Shopify Store** - For customer widget integration
4. **GitHub Repository** - For version control

## Step 1: Deploy Admin Dashboard (Railway)

### 1.1 Connect to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link
```

### 1.2 Set Environment Variables

```bash
# Set Shopify integration variables
railway variables set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
railway variables set SHOPIFY_ACCESS_TOKEN=shpat_your_access_token
railway variables set SHOPIFY_API_VERSION=2024-01

# Set app configuration
railway variables set NODE_ENV=production
railway variables set VITE_APP_VERSION=1.1.5
railway variables set VITE_APP_TITLE="Delivery Scheduler"
```

### 1.3 Deploy

```bash
# Deploy to Railway
pnpm deploy:admin

# Or manually
railway up
```

Your admin dashboard will be available at: `https://your-app-name.railway.app`

## Step 2: Deploy Customer Widget (Cloudflare Workers)

### 2.1 Build Widget Bundle

```bash
# Build both admin dashboard and widget
pnpm build:all

# Or build just the widget
pnpm build:widget
```

### 2.2 Configure Cloudflare Worker

1. **Login to Cloudflare**:
```bash
npx wrangler login
```

2. **Set Environment Variables**:
```bash
# Set Shopify credentials
npx wrangler secret put SHOPIFY_ACCESS_TOKEN
npx wrangler secret put SHOPIFY_SHOP_DOMAIN
npx wrangler secret put SHOPIFY_API_VERSION
```

3. **Deploy Worker**:
```bash
# Deploy to production
pnpm deploy

# Or deploy to staging
pnpm deploy:staging
```

Your widget will be available at: `https://delivery-scheduler-widget.your-subdomain.workers.dev`

## Step 3: Integrate with Shopify

### 3.1 Add Widget to Shopify Theme

Add this code to your Shopify theme's product page template:

```html
<!-- Delivery Scheduler Widget -->
<div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}">
</div>

<!-- Widget Script -->
<script src="https://delivery-scheduler-widget.your-subdomain.workers.dev/widget.js"></script>
```

### 3.2 Advanced Configuration

```html
<div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}"
     data-theme="light"
     data-locale="{{ shop.locale }}">
</div>
```

### 3.3 JavaScript API

```javascript
// Initialize widget programmatically
window.DeliverySchedulerWidget.init({
    shopDomain: 'your-store.myshopify.com',
    productId: '123456789',
    variantId: '987654321',
    containerId: 'my-widget-container',
    theme: 'light',
    locale: 'en'
});

// Destroy widget
window.DeliverySchedulerWidget.destroy('my-widget-container');
```

## Step 4: Configure Shopify Webhooks

Set up webhooks in your Shopify admin to sync data:

1. **Order Creation**: `https://your-worker-url.com/api/delivery/orders`
2. **Product Updates**: `https://your-worker-url.com/api/shopify/products`
3. **Customer Updates**: `https://your-worker-url.com/api/shopify/customers`

## Step 5: Testing Deployment

### 5.1 Test Admin Dashboard

1. Visit your Railway URL
2. Configure delivery areas, time slots, and availability
3. Test the live preview widget

### 5.2 Test Customer Widget

1. Visit your Shopify store
2. Navigate to a product page
3. Verify the widget appears and functions correctly
4. Test the complete delivery selection flow

### 5.3 Test API Endpoints

```bash
# Test health check
curl https://your-worker-url.com/health

# Test timeslots API
curl https://your-worker-url.com/api/delivery/timeslots

# Test availability API
curl "https://your-worker-url.com/api/delivery/availability?date=2024-12-25&postalCode=123456"
```

## Deployment Commands

### Quick Deploy Everything

```bash
# Deploy both admin dashboard and widget
pnpm deploy:all
```

### Individual Deployments

```bash
# Deploy only admin dashboard
pnpm deploy:admin

# Deploy only widget
pnpm deploy

# Build everything
pnpm build:all
```

## Environment Variables

### Railway (Admin Dashboard)

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_SHOP_DOMAIN` | Your Shopify store domain | Yes |
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API access token | Yes |
| `SHOPIFY_API_VERSION` | Shopify API version | Yes |
| `NODE_ENV` | Environment (production/staging) | Yes |
| `VITE_APP_VERSION` | App version for display | No |

### Cloudflare Workers (Widget)

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API access token | Yes |
| `SHOPIFY_SHOP_DOMAIN` | Your Shopify store domain | Yes |
| `SHOPIFY_API_VERSION` | Shopify API version | Yes |

## Monitoring and Maintenance

### 1. Health Checks

- Admin Dashboard: `https://your-railway-url.com/health`
- Widget API: `https://your-worker-url.com/health`

### 2. Logs

```bash
# Railway logs
railway logs

# Cloudflare Worker logs
npx wrangler tail
```

### 3. Updates

```bash
# Update version
pnpm version:patch  # or minor/major

# Deploy updates
pnpm deploy:all
```

## Troubleshooting

### Common Issues

1. **Widget not loading**: Check CORS settings and script URL
2. **API errors**: Verify environment variables and Shopify credentials
3. **Build failures**: Check TypeScript errors and dependencies

### Debug Commands

```bash
# Check build output
pnpm build:all

# Test locally
pnpm dev

# Check worker locally
npx wrangler dev

# Validate configuration
pnpm check
```

## Security Considerations

1. **API Tokens**: Store securely in environment variables
2. **CORS**: Configure allowed origins in worker
3. **Rate Limiting**: Implement in worker for API endpoints
4. **HTTPS**: All endpoints should use HTTPS

## Performance Optimization

1. **CDN**: Cloudflare Workers provide global CDN
2. **Caching**: Implement proper cache headers
3. **Bundle Size**: Optimize widget bundle size
4. **Lazy Loading**: Load widget only when needed

## Support

For deployment issues:
1. Check the logs: `railway logs` or `npx wrangler tail`
2. Verify environment variables
3. Test endpoints individually
4. Check Shopify API limits and permissions 