# Delivery Scheduler v1.0.0

A comprehensive delivery scheduling system for Shopify stores, featuring an admin dashboard and customer-facing widget for managing delivery preferences.

## 🚀 Features

- **Admin Dashboard**: Complete delivery management interface
- **Customer Widget**: Embedded delivery scheduling for Shopify stores
- **Shopify Integration**: Full API integration for products, orders, and customers
- **Version Management**: Semantic versioning with proper update rules
- **Real-time Preview**: Live preview of customer experience
- **Multi-location Support**: Manage multiple collection points
- **Express Delivery**: Configure express delivery options
- **Availability Calendar**: Visual calendar for managing availability

## 📋 Version Management

### Current Version: v1.0.11

This project follows [Semantic Versioning](https://semver.org/) (SemVer) rules:

- **MAJOR (X.0.0)**: Breaking changes, incompatible API changes
- **MINOR (0.X.0)**: New features, backward compatible
- **PATCH (0.0.X)**: Bug fixes, backward compatible
- **PRE-RELEASE**: Alpha, beta, or release candidate versions

### Version Update Rules

1. **Major Version (X.0.0)**:
   - Breaking changes to API endpoints
   - Incompatible changes to data structures
   - Major UI/UX redesigns
   - Database schema changes

2. **Minor Version (0.X.0)**:
   - New features added
   - New API endpoints
   - Enhanced functionality
   - Backward compatible changes

3. **Patch Version (0.0.X)**:
   - Bug fixes
   - Performance improvements
   - Documentation updates
   - Minor UI adjustments

### Version Management Scripts

We provide automated scripts for version management:

```bash
# Update patch version (0.0.X)
npm run version:patch

# Update minor version (0.X.0)
npm run version:minor

# Update major version (X.0.0)
npm run version:major

# Manual version update with description
node scripts/version-update.js patch "Fixed dialog import error"
```

### Changelog

All changes are documented in [CHANGELOG.md](./CHANGELOG.md) following the [Keep a Changelog](https://keepachangelog.com/) format.

### Version History

- **v1.0.11** (Current): Fixed DialogFooter import and TypeScript errors
- **v1.0.10**: Syntax error recovery and template literal fixes
- **v1.0.9**: Interactive month header with year selection
- **v1.0.8**: Fixed calendar view dropdown functionality
- **v1.0.7**: Changed Settings button to "Future Dates"
- **v1.0.6**: Added future order limit management
- **v1.0.5**: Added blocked date range editing
- **v1.0.4**: Added blocked dates management card
- **v1.0.3**: Added comprehensive availability calendar
- **v1.0.2**: Added bulk postal code blocking
- **v1.0.1**: Added postal code reference card
- **v1.0.0**: Initial release with core functionality

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
│   └── App.tsx              # Main application
├── worker/
│   └── index.ts             # Cloudflare Worker backend
├── public/                  # Static assets
└── package.json
```

## 🔧 Configuration

### Admin Dashboard Modules

1. **Delivery Areas**: Manage delivery zones and restrictions
2. **Time Slots**: Configure delivery time windows
3. **Express**: Set up express delivery options
4. **Availability Calendar**: Visual calendar management
5. **Product Management**: Sync and manage products
6. **Live Preview**: Preview customer experience
7. **Shopify Integration**: API connection management
8. **Settings**: System configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_SHOP_DOMAIN` | Your Shopify store domain | Yes |
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API access token | Yes |
| `SHOPIFY_API_VERSION` | Shopify API version | Yes |

## 🧪 Testing

```bash
# Run type checking
pnpm check

# Run linting
pnpm lint

# Format code
pnpm format
```

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update version if necessary
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Shopify API documentation

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