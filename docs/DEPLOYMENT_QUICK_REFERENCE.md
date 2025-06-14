# 🚀 Deployment Quick Reference

## 📋 Essential Commands

### Setup & Build
```bash
# Install dependencies
pnpm install

# Build everything
pnpm build:all

# Type checking
pnpm check
```

## 🔐 Authentication Setup

### Set Admin Credentials (Railway)
```bash
# Set custom admin username and password
railway variables set VITE_ADMIN_USERNAME=your_username
railway variables set VITE_ADMIN_PASSWORD=your_secure_password

# Default credentials: admin / admin123
```

### Local Development Authentication
```bash
# Create .env file for local development
cp env.example .env
# Edit .env with your credentials
```

### Cloudflare Widget Deployment
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Set secrets
wrangler secret put SHOPIFY_ACCESS_TOKEN
wrangler secret put SHOPIFY_SHOP_DOMAIN
wrangler secret put SHOPIFY_API_VERSION

# Deploy
wrangler deploy
```

### Railway Admin Dashboard Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set variables
railway variables set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
railway variables set SHOPIFY_ACCESS_TOKEN=shpat_your_token
railway variables set SHOPIFY_API_VERSION=2024-01

# Deploy
railway up
```

### Automated Deployment
```bash
# Deploy everything
./scripts/deploy.sh

# Deploy widget only
./scripts/deploy.sh --widget-only

# Deploy admin only
./scripts/deploy.sh --admin-only
```

## 🔗 Shopify Integration

### Widget Code for Theme
```html
<div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}">
</div>
<script src="https://your-worker-url.com/widget.js"></script>
```

### Required Shopify Permissions
- `read_products`, `write_products`
- `read_orders`, `write_orders`
- `read_customers`, `write_customers`
- `read_inventory`

### Webhook URLs
- Order events: `https://your-worker-url.com/api/delivery/orders`
- Product events: `https://your-worker-url.com/api/shopify/products`

## 🧪 Testing

### Health Checks
```bash
# Widget health
curl https://your-worker-url.com/health

# Admin health
curl https://your-railway-url.com/health

# Widget bundle
curl https://your-worker-url.com/widget.js
```

### API Testing
```bash
# Timeslots
curl https://your-worker-url.com/api/delivery/timeslots

# Availability
curl "https://your-worker-url.com/api/delivery/availability?date=2024-12-25&postalCode=123456"

# Shopify API
curl -H "X-Shopify-Access-Token: shpat_your_token" \
     "https://your-store.myshopify.com/admin/api/2024-01/products.json"
```

## 🚨 Troubleshooting

### Common Issues
```bash
# Check logs
railway logs
wrangler tail

# Verify secrets
wrangler secret list
railway variables

# Test locally
pnpm dev
wrangler dev
```

### Quick Fixes
- **Widget not loading**: Check CORS and script URL
- **API errors**: Verify Shopify credentials
- **Build fails**: Run `pnpm check` and fix TypeScript errors
- **Deployment fails**: Check CLI authentication

## 📊 URLs to Remember

### Your Deployments
- **Widget**: `https://your-worker-url.com`
- **Admin**: `https://your-railway-url.com`
- **Widget Bundle**: `https://your-worker-url.com/widget.js`
- **Documentation**: `https://your-worker-url.com/widget-docs`

### External Services
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Railway Dashboard**: https://railway.app/dashboard
- **Shopify Partners**: https://partners.shopify.com
- **Shopify Admin**: https://your-store.myshopify.com/admin

## 🔄 Update Process

```bash
# Update version
pnpm version:patch

# Deploy updates
pnpm deploy:all

# Or individually
pnpm deploy:admin
pnpm deploy
```

## 📞 Support

- **Logs**: `railway logs`