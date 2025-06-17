# 🚚 Delivery Scheduler

A sophisticated delivery scheduling system for Shopify stores with advanced time slot management, postal code validation, and seamless integration.

## Latest Update
- ✅ **v1.16.0** - Full Cloudflare migration with enhanced features
- 🔧 **Architecture**: Cloudflare Pages + Workers + KV Storage
- 🛠️ **Fixed**: Shopify API routing with proper KV persistence (June 2025)

## 🏗️ Architecture

The system consists of two main components:

- **Admin Dashboard** - Full React application for managing delivery settings (deployed on Railway)
- **Customer Widget** - Lightweight embeddable component for Shopify stores (deployed on Cloudflare Workers)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Dashboard│    │  Cloudflare Worker│    │  Shopify Store  │
│   (Railway)     │◄──►│  (Widget + API)  │◄──►│  (Customer Site)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Deployment

### Quick Start

**Option 1: Automated Deployment**
```bash
# Deploy both admin dashboard and customer widget
./scripts/deploy.sh

# Deploy only admin dashboard
./scripts/deploy.sh --admin-only

# Deploy only customer widget
./scripts/deploy.sh --widget-only
```

**Option 2: Manual Deployment**
```bash
# Install dependencies
pnpm install

# Build both components
pnpm build:all

# Deploy admin dashboard to Railway
pnpm deploy:admin

# Deploy customer widget to Cloudflare Workers
pnpm deploy
```

### 📚 Deployment Guides

For detailed step-by-step instructions, see:

- **[Complete Deployment Guide](docs/COMPLETE_DEPLOYMENT_GUIDE.md)** - Comprehensive guide covering all aspects
- **[Quick Reference](docs/DEPLOYMENT_QUICK_REFERENCE.md)** - Essential commands and troubleshooting
- **[Original Deployment Guide](docs/DEPLOYMENT.md)** - Original detailed guide

### 🎯 What You'll Deploy

1. **Admin Dashboard** (Railway) - Full React application for managing delivery settings
2. **Customer Widget** (Cloudflare Workers) - Lightweight embeddable component for Shopify stores
3. **Shopify Integration** - API authentication and webhook configuration

### 🔗 Shopify Integration

Add this code to your Shopify theme's product page:

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

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🚀 Quick Start

### Option 1: Automated Deployment

```bash
# Deploy both admin dashboard and customer widget
./scripts/deploy.sh

# Deploy only admin dashboard
./scripts/deploy.sh --admin-only

# Deploy only customer widget
./scripts/deploy.sh --widget-only
```

### Option 2: Manual Deployment

```bash
# Install dependencies
pnpm install

# Build both components
pnpm build:all

# Deploy admin dashboard to Railway
pnpm deploy:admin

# Deploy customer widget to Cloudflare Workers
pnpm deploy
```

## 📋 Features

### Admin Dashboard
- ✅ **Delivery Areas**: Manage delivery zones and postal code restrictions
- ✅ **Time Slots**: Configure delivery time windows and pricing
- ✅ **Express Delivery**: Set up express delivery options
- ✅ **Availability Calendar**: Visual calendar with date range and bulk blocking
- ✅ **Product Management**: Sync and manage Shopify products
- ✅ **Live Preview**: Preview customer experience
- ✅ **Shopify Integration**: API connection management
- ✅ **Settings**: System configuration and tag mapping

### Customer Widget
- ✅ **Date Selection**: Interactive calendar with availability
- ✅ **Time Slots**: Multiple delivery options (morning, afternoon, evening, express)
- ✅ **Delivery Types**: Delivery vs collection options
- ✅ **Postal Code Validation**: Real-time area checking
- ✅ **Shopify Integration**: Automatic order tag generation
- ✅ **Responsive Design**: Works on all devices

## 🛠️ Development

### Prerequisites

- Node.js 18+ and pnpm
- Railway account (for admin dashboard)
- Cloudflare account (for customer widget)
- Shopify store (for integration)

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd delivery-scheduler

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build:all

# Run type checking
pnpm check

# Run linting
pnpm lint
```

### Environment Variables

Create a `.env` file for local development:

```env
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_your_access_token
SHOPIFY_API_VERSION=2024-01
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **Backend**: Cloudflare Workers
- **API**: Shopify Admin API
- **Deployment**: Railway, Cloudflare Pages
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd delivery-scheduler
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   VITE_SHOPIFY_ACCESS_TOKEN=shpat_your_access_token
   VITE_SHOPIFY_API_VERSION=2024-01
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

## 🚀 Deployment

### Local Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Railway Deployment

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```

4. **Set environment variables**:
   ```bash
   railway variables set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
   railway variables set SHOPIFY_ACCESS_TOKEN=shpat_your_access_token
   railway variables set SHOPIFY_API_VERSION=2024-01
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Cloudflare Workers Deployment

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy worker**:
   ```bash
   wrangler deploy
   ```

## 🔗 Shopify Integration

### API Endpoints

The system integrates with Shopify's Admin API for:

- **Products**: Sync product catalog and manage delivery options
- **Orders**: Handle order processing with delivery preferences
- **Customers**: Manage customer delivery preferences
- **Tags**: Apply delivery-related tags to products, orders, and customers

### Delivery Tags

The system uses the following delivery tags:

- `express-delivery`: Express delivery option
- `same-day-delivery`: Same day delivery
- `next-day-delivery`: Next day delivery
- `scheduled-delivery`: Scheduled delivery
- `pickup-available`: Store pickup option
- `delivery-area`: Delivery area restriction
- `time-slot`: Specific time slot

### Webhook Integration

Configure Shopify webhooks for:
- Order creation/updates
- Product changes
- Customer updates

## 🎨 Customer Widget

The customer widget can be embedded in Shopify stores:

```html
<!-- Add to your Shopify theme -->
<div id="delivery-scheduler-widget"></div>
<script src="https://your-deployment-url.com/widget.js"></script>
```

### Widget Features

- Date and time selection
- Delivery vs collection options
- Postal code validation
- Real-time availability checking
- Integration with Shopify cart

## 📁 Project Structure

```
delivery-scheduler/
├── src/
│   ├── components/
│   │   ├── modules/          # Admin dashboard modules
│   │   ├── ui/              # Reusable UI components
│   │   └── CustomerWidget.tsx # Customer-facing widget
│   ├── lib/
│   │   ├── shopify.ts       # Shopify API integration
│   │   ├── version.ts       # Version management
│   │   └── mockData.ts      # Mock data for development
│   ├── widget.tsx           # Widget entry point
│   └── App.tsx              # Main application
├── worker/
│   └── index.ts             # Cloudflare Worker backend
├── scripts/
│   ├── deploy.sh            # Deployment automation
│   └── version-update.js    # Version management
├── docs/
│   └── DEPLOYMENT.md        # Detailed deployment guide
├── public/                  # Static assets
└── package.json
```

## 🔧 Configuration

### Admin Dashboard Modules

1. **Delivery Areas**: Manage delivery zones and blocked postal codes
2. **Time Slots**: Set up delivery time windows and pricing
3. **Express**: Configure express delivery options
4. **Availability Calendar**: Manage blocked dates and availability
5. **Product Management**: Sync and manage Shopify products
6. **Live Preview**: Preview customer widget experience
7. **Shopify Integration**: Manage API connections
8. **Settings**: Configure tag mapping and system settings

### Widget Configuration

The customer widget supports various configuration options:

- `data-shop-domain`: Your Shopify store domain
- `data-product-id`: Product ID for context
- `data-variant-id`: Product variant ID
- `data-theme`: Widget theme (light/dark)
- `data-locale`: Language/locale setting

## 🧪 Testing

```bash
# Run type checking
pnpm check

# Run linting
pnpm lint

# Format code
pnpm format

# Test deployment
./scripts/deploy.sh --help
```

## 📝 Version Management

```bash
# Update version
pnpm version:patch  # or minor/major

# Deploy updates
pnpm deploy:all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For deployment and integration support:

1. Check the [deployment guide](docs/DEPLOYMENT.md)
2. Review the [API documentation](#api-endpoints)
3. Test endpoints individually
4. Check logs: `railway logs` or `wrangler tail`

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete list of changes and updates.

## 📝 API Documentation

### Delivery API Endpoints

- `GET /api/delivery/timeslots` - Get available time slots
- `GET /api/delivery/availability?date=YYYY-MM-DD&postalCode=123456` - Check availability
- `POST /api/delivery/orders` - Create delivery order

### Shopify API Proxy

- `GET /api/shopify/products` - Get products
- `GET /api/shopify/orders` - Get orders
- `GET /api/shopify/customers` - Get customers
- `PUT /api/shopify/products/{id}` - Update product tags

### Widget Endpoints

- `GET /widget.js` - Customer widget bundle
- `GET /widget.css` - Widget styles
- `GET /widget-docs` - Integration documentation

## 🔄 Version Updates

When updating versions:

1. Update `package.json` version
2. Update `src/lib/version.ts` configuration
3. Update this README
4. Create a git tag
5. Update deployment configurations

### Example Version Update

```bash
# Update version in package.json
npm version patch  # or minor, major

# Update version configuration
# Edit src/lib/version.ts

# Commit changes
git add .
git commit -m "Bump version to v1.0.1"

# Create tag
git tag v1.0.1

# Push changes
git push origin main --tags
```

## 🔐 Authentication

The admin dashboard includes secure authentication to protect your delivery scheduler settings.

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Customizing Credentials

#### Local Development
Create a `.env` file in your project root:
```bash
VITE_ADMIN_USERNAME=your_username
VITE_ADMIN_PASSWORD=your_secure_password
```

#### Production (Railway)
Set environment variables:
```bash
railway variables set VITE_ADMIN_USERNAME=your_username
railway variables set VITE_ADMIN_PASSWORD=your_secure_password
```

### Security Features
- **Session Management**: 24-hour session timeout
- **Secure Storage**: Encrypted local storage
- **Auto Logout**: Automatic session expiration
- **Protected Routes**: All admin features require authentication 