# 🚀 Complete Deployment Guide

This comprehensive guide covers the deployment of all components of the Delivery Scheduler system:

1. **Customer Widget** → Cloudflare Workers
2. **Admin Dashboard** → Railway
3. **Shopify Authentication** → API Setup & Webhooks

## 📋 Prerequisites

### Required Accounts
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (Free tier works)
- [Railway Account](https://railway.app/) (Free tier available)
- [Shopify Store](https://www.shopify.com/) (Any plan)

### Required Tools
- Node.js 18+ installed
- Git for version control
- Terminal/Command Line access

### Required Credentials
- Shopify Admin API access token
- Shopify store domain
- Shopify webhook endpoints

---

## 🎯 Part 1: Customer Widget Deployment to Cloudflare

### Step 1: Install Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Verify installation
wrangler --version
```

### Step 2: Login to Cloudflare

```bash
# Login to your Cloudflare account
wrangler login

# This opens your browser for authentication
# Follow the prompts to complete login
```

### Step 3: Configure Environment Variables

```bash
# Set Shopify credentials as secrets
wrangler secret put SHOPIFY_ACCESS_TOKEN
# Enter: shpat_your_actual_access_token_here

wrangler secret put SHOPIFY_SHOP_DOMAIN
# Enter: your-store.myshopify.com

wrangler secret put SHOPIFY_API_VERSION
# Enter: 2024-01
```

### Step 4: Build the Widget

```bash
# Navigate to your project directory
cd /path/to/delivery-scheduler

# Install dependencies
pnpm install

# Build the widget
pnpm build:widget
```

### Step 5: Deploy to Cloudflare Workers

```bash
# Deploy to production
wrangler deploy

# Expected output:
# ✨ Deployed to production
# 📅 2024-12-25 12:00:00
# 🌍 https://delivery-scheduler-widget.your-subdomain.workers.dev
```

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://your-worker-url.com/health

# Test widget endpoint
curl https://your-worker-url.com/widget.js

# Test widget documentation
curl https://your-worker-url.com/widget-docs
```

### Step 7: Get Your Widget URLs

Your widget will be available at:
- **Widget Bundle**: `https://your-worker-url.com/widget.js`
- **Widget CSS**: `https://your-worker-url.com/widget.css`
- **API Endpoints**: `https://your-worker-url.com/api/delivery/*`

---

## 🏢 Part 2: Admin Dashboard Deployment to Railway

### Step 1: Install Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### Step 2: Login to Railway

```bash
# Login to Railway
railway login

# This opens your browser for authentication
# Follow the prompts to complete login
```

### Step 3: Initialize Railway Project

```bash
# Navigate to your project directory
cd /path/to/delivery-scheduler

# Link to Railway project
railway link

# If you don't have a project yet, create one:
railway init
```

### Step 4: Configure Environment Variables

```bash
# Set Shopify integration variables
railway variables set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
railway variables set SHOPIFY_ACCESS_TOKEN=shpat_your_access_token
railway variables set SHOPIFY_API_VERSION=2024-01

# Set app configuration
railway variables set NODE_ENV=production
railway variables set VITE_APP_VERSION=1.2.0
railway variables set VITE_APP_TITLE="Delivery Scheduler"
railway variables set VITE_APP_DESCRIPTION="Advanced delivery scheduling system"
```

### Step 5: Build and Deploy

```bash
# Build the admin dashboard
pnpm build

# Deploy to Railway
railway up

# Or use the npm script
pnpm deploy:admin
```

### Step 6: Verify Deployment

```bash
# Get your Railway URL
railway status

# Test the deployment
curl https://your-railway-url.com/health
```

### Step 7: Access Your Admin Dashboard

Your admin dashboard will be available at:
- **Main URL**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/health`

---

## 🔐 Part 3: Shopify Authentication & Integration

### Step 1: Create Shopify App

1. **Go to Shopify Partner Dashboard**
   - Visit [partners.shopify.com](https://partners.shopify.com)
   - Sign in or create a partner account

2. **Create a New App**
   - Click "Apps" → "Create app"
   - Choose "Create app manually"
   - Name: "Delivery Scheduler"
   - App URL: `https://your-railway-url.com`

### Step 2: Configure App Settings

1. **App Setup**
   ```
   App name: Delivery Scheduler
   App URL: https://your-railway-url.com
   Allowed redirection URLs: 
   - https://your-railway-url.com/auth/callback
   - https://your-railway-url.com/auth/shopify/callback
   ```

2. **API Credentials**
   - Go to "App setup" → "API credentials"
   - Note down your API key and secret

### Step 3: Generate Access Token

1. **Install App on Your Store**
   - Go to "App setup" → "Install app"
   - Select your store
   - Grant necessary permissions

2. **Get Access Token**
   ```bash
   # The access token will be provided after installation
   # Format: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 4: Configure Required Permissions

Your app needs these Shopify permissions:

**Read Access:**
- `read_products` - Read product information
- `read_orders` - Read order details
- `read_customers` - Read customer information
- `read_inventory` - Read inventory levels

**Write Access:**
- `write_products` - Update product tags
- `write_orders` - Update order tags
- `write_customers` - Update customer tags

### Step 5: Set Up Webhooks

Configure these webhooks in your Shopify admin:

1. **Order Creation**
   ```
   URL: https://your-worker-url.com/api/delivery/orders
   Event: Order creation
   Format: JSON
   ```

2. **Order Updates**
   ```
   URL: https://your-worker-url.com/api/delivery/orders
   Event: Order updates
   Format: JSON
   ```

3. **Product Updates**
   ```
   URL: https://your-worker-url.com/api/shopify/products
   Event: Product updates
   Format: JSON
   ```

### Step 6: Test Authentication

```bash
# Test Shopify API connection
curl -H "X-Shopify-Access-Token: shpat_your_token" \
     -H "Content-Type: application/json" \
     "https://your-store.myshopify.com/admin/api/2024-01/products.json"
```

---

## 🔗 Part 4: Integration & Testing

### Step 1: Add Widget to Shopify Theme

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
<script src="https://your-worker-url.com/widget.js"></script>
```

### Step 2: Test Complete Flow

1. **Visit your Shopify store**
2. **Navigate to a product page**
3. **Verify widget appears**
4. **Test delivery selection flow**
5. **Check order tag generation**

### Step 3: Monitor Integration

```bash
# Check admin dashboard logs
railway logs

# Check widget logs
wrangler tail

# Test API endpoints
curl https://your-worker-url.com/api/delivery/timeslots
curl https://your-worker-url.com/api/delivery/availability?date=2024-12-25&postalCode=123456
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Widget Not Loading
```bash
# Check if worker is running
curl https://your-worker-url.com/health

# Check CORS settings
wrangler tail

# Verify script URL in Shopify theme
```

#### 2. API Authentication Errors
```bash
# Verify environment variables
wrangler secret list
railway variables

# Test API connection
curl -H "X-Shopify-Access-Token: shpat_your_token" \
     "https://your-store.myshopify.com/admin/api/2024-01/products.json"
```

#### 3. Build Failures
```bash
# Check TypeScript errors
pnpm check

# Clean and rebuild
rm -rf dist/
pnpm build:all

# Check dependencies
pnpm install
```

#### 4. Railway Deployment Issues
```bash
# Check Railway logs
railway logs

# Verify environment variables
railway variables

# Check build process
railway up --debug
```

#### 5. Cloudflare Deployment Issues
```bash
# Check Wrangler status
wrangler whoami

# Test locally
wrangler dev

# Check worker logs
wrangler tail
```

---

## 📊 Monitoring & Maintenance

### Health Checks

Set up monitoring for these endpoints:

**Admin Dashboard:**
- `https://your-railway-url.com/health`

**Customer Widget:**
- `https://your-worker-url.com/health`
- `https://your-worker-url.com/widget.js`

### Logs & Debugging

```bash
# Railway logs
railway logs

# Cloudflare Worker logs
wrangler tail

# Local development
pnpm dev
wrangler dev
```

### Updates & Maintenance

```bash
# Update version
pnpm version:patch  # or minor/major

# Deploy updates
pnpm deploy:all

# Or deploy individually
pnpm deploy:admin  # Railway
pnpm deploy        # Cloudflare
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit secrets to Git
- Use Railway and Cloudflare secret management
- Rotate tokens regularly

### 2. API Security
- Use HTTPS for all endpoints
- Implement rate limiting
- Validate all inputs

### 3. Shopify Security
- Use minimal required permissions
- Monitor webhook security
- Validate webhook signatures

---

## 📝 Deployment Checklist

### ✅ Pre-Deployment
- [ ] All code committed to Git
- [ ] TypeScript checks pass (`pnpm check`)
- [ ] Build succeeds (`pnpm build:all`)
- [ ] Environment variables configured
- [ ] Shopify app created and configured

### ✅ Cloudflare Deployment
- [ ] Wrangler CLI installed and logged in
- [ ] Environment secrets set
- [ ] Widget built successfully
- [ ] Worker deployed and accessible
- [ ] Health checks passing

### ✅ Railway Deployment
- [ ] Railway CLI installed and logged in
- [ ] Project linked and configured
- [ ] Environment variables set
- [ ] Admin dashboard deployed
- [ ] Health checks passing

### ✅ Shopify Integration
- [ ] App installed on store
- [ ] Access token generated
- [ ] Webhooks configured
- [ ] Widget added to theme
- [ ] Complete flow tested

### ✅ Post-Deployment
- [ ] All endpoints responding
- [ ] Widget loading correctly
- [ ] Admin dashboard accessible
- [ ] Order tags generating
- [ ] Monitoring set up

---

## 🆘 Support

### Getting Help

1. **Check Logs First**
   ```bash
   railway logs
   wrangler tail
   ```

2. **Verify Configuration**
   ```bash
   wrangler secret list
   railway variables
   ```

3. **Test Endpoints**
   ```bash
   curl https://your-worker-url.com/health
   curl https://your-railway-url.com/health
   ```

4. **Review Documentation**
   - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
   - [Railway Docs](https://docs.railway.app/)
   - [Shopify API Docs](https://shopify.dev/docs/api)

### Common Support Issues

- **Widget not appearing**: Check script URL and CORS settings
- **API errors**: Verify Shopify credentials and permissions
- **Build failures**: Check TypeScript errors and dependencies
- **Deployment issues**: Verify CLI tools and authentication

---

## 🎉 Success!

Once all steps are completed, you'll have:

✅ **Customer Widget** running on Cloudflare Workers  
✅ **Admin Dashboard** running on Railway  
✅ **Shopify Integration** fully configured  
✅ **Real-time sync** between all components  
✅ **Automatic order tag generation**  
✅ **Global CDN** for fast widget loading  

Your delivery scheduling system is now fully deployed and ready to serve customers! 