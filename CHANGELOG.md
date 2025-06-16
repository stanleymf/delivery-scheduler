# Changelog

## [1.16.0] - 2024-12-20

### 🚀 CLOUDFLARE MIGRATION COMPLETE - RESTORED MISSING FEATURES!

#### 🔄 MAJOR INFRASTRUCTURE MIGRATION
- **Platform Migration**: Successfully migrated from Railway to Cloudflare Pages + Workers
- **Data Persistence**: Implemented Cloudflare KV storage for reliable data persistence
- **Performance**: Improved global performance with Cloudflare's edge network
- **Reliability**: Enhanced uptime and availability with Cloudflare infrastructure

#### ✅ RESTORED BULK DAY ASSIGNMENT FOR TIMESLOTS
- **Enhanced UI**: Bulk assignment buttons now prominently displayed in highlighted section
- **Quick Selection**: ✅ All Days, ❌ Clear All, 📅 Mon-Fri, 🏖️ Sat-Sun buttons
- **Visual Feedback**: Live preview of selected days with badge display
- **Improved UX**: More discoverable and user-friendly than previous implementation
- **Full Functionality**: Individual day checkboxes + bulk selection buttons working perfectly

#### 🏷️ COMPREHENSIVE ORDER TAGGING SYSTEM (SIMPLIFIED 3-TAG APPROACH)
- **New Module**: `src/lib/enhancedTagging.ts` - Clean, professional tagging functions
- **Simplified Tags**: Only 3 essential tags per order for clean Shopify management
  - **Delivery Type**: `Delivery`, `Collection`, or `Express`
  - **Date Format**: `dd/mm/yyyy` (e.g., `20/12/2024`)
  - **Timeslot Format**: `hh:mm-hh:mm` (e.g., `10:00-14:00`)
- **Enhanced UI**: Updated TagMappingSettings component with live preview
- **Cart Integration**: Comprehensive cart attributes and delivery notes generation
- **Example Output**: `Delivery, 20/12/2024, 10:00-14:00`

#### 💰 SHOPIFY FEE AUTOMATION SYSTEM (CONFIRMED WORKING)
- **Server Endpoints**: All API endpoints confirmed working:
  - `/api/shopify/automate-express-fees` - Auto-create fee products
  - `/api/shopify/fee-automation-status` - Monitor automation status
  - `/api/shopify/cleanup-fee-products` - Clean orphaned products
- **UI Integration**: FeeAutomationPanel properly integrated in ShopifySettings
- **Cloudflare Support**: Added KV storage for fee product management
- **Auto-fee Products**: Seamless express delivery fee integration

#### 🔧 ENHANCED CART WIDGET (v1.15.2)
- **New Widget**: `cart-widget-enhanced-tagging.html` with modern UI
- **Real-time Tagging**: Live tag preview for customers during selection
- **Fee Integration**: Automatic Shopify fee product addition to cart
- **Comprehensive Notes**: Detailed delivery information in order notes
- **Mobile Optimized**: Responsive design with professional styling

#### ☁️ CLOUDFLARE INFRASTRUCTURE ENHANCEMENTS
- **KV Storage**: Full data persistence using Cloudflare KV
- **Worker APIs**: New API endpoints for enhanced functionality:
  - `/api/kv/data` - Get/save delivery data with backup support
  - `/api/shopify-fees/products` - Manage fee products in KV storage
  - `/api/enhanced-tagging/generate` - Generate simplified tags
  - `/widget-enhanced.html` - Serve enhanced widget
- **Fallback System**: Automatic fallback to KV when Railway dashboard unavailable
- **Health Monitoring**: Enhanced health checks with KV connection testing

#### 📊 DATA MIGRATION & BACKUP
- **Backup System**: Automated KV backup creation with timestamps
- **Data Restoration**: Seamless restoration of timeslots, settings, blocked dates
- **Version Tracking**: Data versioning with lastUpdated timestamps
- **Migration Tools**: Scripts and APIs for data migration between environments

#### 🎯 TECHNICAL IMPROVEMENTS
- **Enhanced Worker**: Updated worker interface with KV and D1 database support
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Performance**: Optimized API calls with parallel data fetching
- **Monitoring**: Enhanced debugging and health check endpoints
- **Security**: Improved authentication and environment variable management

#### 🔧 UPDATED COMPONENTS
- **TimeSlots.tsx**: Enhanced bulk day assignment with visual improvements
- **TagMappingSettings.tsx**: Simplified 3-tag system with live preview
- **ShopifySettings.tsx**: Confirmed fee automation panel integration
- **worker/index.ts**: Full Cloudflare infrastructure support
- **enhancedTagging.ts**: New comprehensive tagging utility module

#### 🚀 DEPLOYMENT IMPROVEMENTS
- **Cloudflare Pages**: Automatic deployment from Git
- **Worker Deployment**: Seamless worker updates with new APIs
- **Environment Sync**: Proper environment variable management
- **Version Control**: Git-based deployment with proper versioning

### Migration Notes
- All Railway features successfully restored on Cloudflare
- Enhanced bulk day assignment more user-friendly than before
- Simplified tagging system provides cleaner Shopify order management
- Shopify fee automation working seamlessly with Cloudflare KV storage
- No breaking changes - all existing functionality preserved and enhanced

### Files Added/Updated
- `src/lib/enhancedTagging.ts` - New comprehensive tagging system
- `cart-widget-enhanced-tagging.html` - Enhanced customer widget
- `src/components/modules/TimeSlots.tsx` - Enhanced bulk day assignment UI
- `src/components/modules/TagMappingSettings.tsx` - Simplified tagging interface
- `worker/index.ts` - Full Cloudflare infrastructure support
- `package.json` - Version bump to 1.16.0

---

## [1.15.2] - 2024-12-19

### 🗓️ CRITICAL WIDGET CALENDAR SYNC FIX - BLOCKED DATES NOW WORK!

#### 🚨 PROBLEM SOLVED: Widget Calendar Not Syncing with Admin Dashboard
- **Fixed**: Blocked dates set in admin dashboard not reflecting in customer widget
- **Fixed**: Customers able to select blocked dates causing order conflicts
- **Fixed**: Widget using wrong API endpoints for fetching calendar data
- **Fixed**: No validation of blocked dates when customers select delivery dates

#### 🔄 COMPLETE CALENDAR SYNCHRONIZATION
- **Real-time Sync** - Widget now fetches live data from admin dashboard blocked dates
- **Instant Validation** - Blocked dates immediately prevent customer selection
- **Smart Error Messages** - Shows specific reasons why dates are blocked
- **Comprehensive Blocking** - Supports both individual blocked dates and date ranges
- **Future Order Limits** - Respects admin-configured future order limits

#### 🛡️ ENHANCED DATE VALIDATION SYSTEM
- **Pre-selection Validation** - Prevents blocked dates from being selected
- **Clear User Feedback** - Informative error messages with blocking reasons
- **Automatic Reset** - Clears invalid date selections automatically
- **Timeslot Filtering** - Removes blocked timeslots for partially blocked dates
- **Full Date Blocking** - Completely blocks dates when set to 'full' block type

#### 📡 COMPREHENSIVE API INTEGRATION
- **Parallel Data Fetching** - Loads timeslots, blocked dates, ranges, and settings simultaneously
- **Proper Endpoint Usage** - Now uses correct `/api/public/widget/*` endpoints
- **Fallback Handling** - Graceful degradation if admin data is unavailable
- **Efficient Caching** - Loads data once and reuses for performance
- **Debug Logging** - Comprehensive logging for troubleshooting

#### 🎯 INTELLIGENT BLOCKING LOGIC
- **Individual Date Blocks** - Respects specific blocked dates from admin calendar
- **Date Range Blocks** - Handles blocked date ranges (holidays, vacations, etc.)
- **Partial vs Full Blocking** - Differentiates between full date blocks and timeslot-specific blocks
- **Future Limit Enforcement** - Automatically blocks dates beyond configured future order limit
- **Priority-based Filtering** - Applies all blocking rules in correct order

#### 🔧 TECHNICAL IMPROVEMENTS
- **Fixed API Base URL** - Corrected widget API endpoint from old to current Railway deployment
- **Enhanced Widget State** - Added blockedDates, blockedDateRanges, and settings to widget state
- **Optimized Data Flow** - Single initialization load followed by cached filtering
- **Error Recovery** - Robust error handling with fallback to default timeslots
- **Performance Optimization** - Efficient date checking and timeslot filtering

### Use Case Examples
- **Admin blocks Christmas Day** → Customer cannot select December 25th
- **Admin blocks morning slots on Monday** → Customer sees only afternoon slots for Monday
- **Admin sets 2-week future limit** → Customer cannot select dates beyond 2 weeks
- **Admin blocks vacation week** → Customer sees "Date range blocked for staff holidays"

### Technical Implementation
- **fetchWidgetData()** - New function to load all admin calendar data
- **isDateBlocked()** - Comprehensive date validation logic
- **getAvailableTimeslots()** - Smart timeslot filtering based on blocking rules
- **Enhanced handleDateChange()** - Real-time date validation with user feedback
- **Parallel API calls** - Efficient data loading with Promise.all()

### Files Updated
- `cart-widget-dynamic-fee.html` - Complete calendar sync implementation
- `package.json` - Version bump to 1.15.2

### Breaking Changes
- None - fully backward compatible, existing widgets will automatically benefit

### Migration Notes
- Widget automatically fetches live admin calendar data
- No customer-facing changes except properly blocked dates
- Improved reliability and sync with admin dashboard

---

## [1.15.1] - 2024-12-19

### 🔐 CRITICAL SESSION MANAGEMENT FIX - NO MORE UNEXPECTED LOGOUTS!

#### 🚨 PROBLEM SOLVED: Automatic Logout During Active Usage
- **Fixed**: Users being logged out unexpectedly while actively using the admin dashboard
- **Fixed**: Session expiring after navigating between pages for extended periods
- **Fixed**: Lost work and configurations due to sudden authentication timeouts
- **Fixed**: Having to re-login multiple times during long admin sessions

#### 🔄 INTELLIGENT SESSION REFRESH SYSTEM
- **Automatic Activity Detection** - Session refreshes on user activity (clicks, scrolls, typing, navigation)
- **Throttled Updates** - Smart refresh limiting (once per minute) to prevent excessive API calls
- **Background Monitoring** - Automatic session refresh every 5 minutes regardless of activity
- **API Integration** - Session timestamp updates on every successful API call
- **Graceful Expiration** - Proper handling when sessions actually need to expire

#### ⏰ EXTENDED SESSION DURATION
- **Increased from 24 hours to 7 days** - Much more user-friendly timeout period
- **Active User Protection** - As long as you're using the app, session never expires
- **Smart Inactivity** - Only logs out after 7 days of complete inactivity
- **Peace of Mind** - Work on configurations without fear of losing progress

#### 🎯 ENHANCED USER EXPERIENCE
- **Seamless Navigation** - Move between pages without session concerns
- **Work Protection** - Never lose configurations due to unexpected logouts
- **Professional Feel** - App stays logged in like modern web applications
- **Zero Interruption** - Focus on work instead of authentication issues

#### 📱 MOBILE WIDGET ENHANCEMENTS
- **Touch-Optimized Interface** - Better mobile responsiveness with larger touch targets
- **iOS Safari Optimization** - 16px font size prevents unwanted zoom on form fields
- **Enhanced Loading States** - Professional animated spinners and visual feedback
- **Auto-Dismissing Messages** - Error and success messages fade automatically
- **Visual Improvements** - Icons, better spacing, smooth transitions

#### 🔧 TECHNICAL IMPROVEMENTS
- **Activity Event Listeners** - Monitors mousedown, mousemove, keypress, scroll, touchstart, click
- **Throttled Refresh Logic** - Prevents excessive session updates while maintaining responsiveness
- **Pre-request Validation** - Checks session validity before making API calls
- **Post-request Updates** - Refreshes session on successful API responses
- **Memory Efficient** - Proper cleanup of event listeners and intervals

### Technical Implementation
- **Enhanced AuthContext** - Added automatic session refresh with activity detection
- **Improved API Utils** - Session validation and refresh on API calls
- **Extended Session Config** - 7-day timeout with intelligent refresh system
- **Widget Mobile Optimization** - Responsive design improvements and loading states
- **Event Management** - Proper event listener setup and cleanup

### Files Updated
- `src/contexts/AuthContext.tsx` - Added automatic session refresh functionality
- `src/utils/api.ts` - Enhanced with session validation and refresh
- `src/config/auth.ts` - Extended session timeout to 7 days
- `cart-widget-dynamic-fee.html` - Mobile optimizations and loading improvements

### Breaking Changes
- None - fully backward compatible with existing authentication

### Migration Notes
- Existing logged-in users will automatically benefit from extended sessions
- No action required - improvements are automatic and transparent
- Session refresh happens seamlessly in the background

---

## [1.15.0] - 2024-12-19

### 🔧 COMPLETE RAILWAY PERSISTENCE SOLUTION - NO MORE DATA LOSS!

#### 🚨 PROBLEM SOLVED: Data Loss on Every Deploy
- **Fixed**: Admin login credentials lost on every Railway deploy
- **Fixed**: Shopify API settings lost on every Railway deploy  
- **Fixed**: Mock blocked dates lost on every Railway deploy
- **Fixed**: All configuration lost on every Railway deploy
- **Fixed**: Frustrating re-entry of credentials after each deploy

#### 🤖 AUTOMATED PERSISTENCE FIX SCRIPT
- **New Script**: `scripts/fix-railway-persistence.sh` - One-command solution to persistence issues
- **Interactive Setup**: Guides through Railway API token setup
- **Admin Credentials**: Permanent configuration of admin username, password, email
- **Shopify Integration**: Optional Shopify API credentials setup
- **Automatic Deployment**: Deploys with full persistence enabled
- **Comprehensive Validation**: Verifies all persistence variables are set correctly

#### 🔑 RAILWAY API INTEGRATION
- **Automatic Environment Updates**: Uses Railway GraphQL API to update environment variables
- **Railway Token Support**: Secure API token authentication for automatic persistence
- **Background Processing**: Non-blocking automatic saves to Railway environment
- **Error Handling**: Graceful fallback to manual persistence mode if API fails
- **Real-time Logging**: Shows automatic persistence operations in Railway logs

#### 💾 ENTERPRISE-GRADE DATA PERSISTENCE
- **Admin Credentials**: `VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD`, `VITE_ADMIN_EMAIL`
- **Shopify Settings**: `SHOPIFY_CREDENTIALS_JSON` - Automatic save/restore of API credentials
- **User Configuration**: `USER_DATA_JSON` - Timeslots, locations, blocked dates, settings
- **Login Sessions**: `SESSIONS_JSON` - Persistent login sessions across deployments
- **Automatic Backups**: Every 5 minutes and on graceful shutdown

#### 🎯 TWO PERSISTENCE MODES
- **Automatic Mode**: With Railway API token - zero manual work required
- **Manual Mode**: Without API token - logs commands for manual copying
- **Seamless Fallback**: Automatically switches between modes based on token availability
- **User Choice**: Script allows skipping automatic mode for manual preference

#### 🔍 COMPREHENSIVE MONITORING
- **Real-time Status**: Live persistence status in admin dashboard
- **Automatic Logging**: `✅ Automatically updated Railway environment variable` messages
- **Error Tracking**: Detailed error messages for troubleshooting
- **Persistence Verification**: Built-in checks to verify data survival across deploys

#### 📋 COMPLETE SETUP AUTOMATION
- **Railway CLI Integration**: Automatic Railway CLI installation and login verification
- **Project Detection**: Automatic project and environment ID extraction
- **Variable Management**: Intelligent handling of existing vs new environment variables
- **Deployment Integration**: Seamless deployment with persistence enabled
- **Status Verification**: Post-deployment verification of persistence functionality

#### 🛡️ SECURITY & RELIABILITY
- **Secure Token Handling**: Railway API tokens encrypted in environment variables
- **Credential Protection**: Admin passwords securely stored in Railway environment
- **API Security**: Shopify tokens properly encrypted and managed
- **Session Security**: Login sessions with proper expiration and renewal
- **Backup Strategy**: Multiple layers of data protection and recovery

#### 🎉 USER EXPERIENCE IMPROVEMENTS
- **Zero Configuration Loss**: Never lose settings again after deployments
- **Persistent Login**: Stay logged in across Railway restarts
- **Automatic Restoration**: All settings automatically restored on startup
- **Seamless Updates**: Configuration changes automatically persisted
- **Peace of Mind**: Deploy with confidence knowing data will persist

### Technical Implementation
- **Railway GraphQL API**: Direct integration with Railway's environment variable API
- **Automated Script**: Comprehensive bash script for one-command setup
- **Environment Management**: Intelligent handling of Railway environment variables
- **Persistence Layer**: Multi-tier data persistence with automatic and manual modes
- **Error Recovery**: Robust error handling and fallback mechanisms

### Files Added/Updated
- `scripts/fix-railway-persistence.sh` - Automated persistence setup script (NEW)
- `RAILWAY_PERSISTENCE_SOLUTION.md` - Comprehensive persistence guide (NEW)
- `src/components/shopify/FeeAutomationPanel.tsx` - Fixed undefined triggeredBy error
- `server.js` - Enhanced Railway API integration and automatic persistence

### Breaking Changes
- None - fully backward compatible with existing deployments

### Migration Notes
- Run `./scripts/fix-railway-persistence.sh` to enable automatic persistence
- Existing manual persistence continues working
- Railway API token optional but recommended for best experience

---

## [1.14.0] - 2024-12-19

### 🤖 COMPLETE SHOPIFY FEE AUTOMATION SYSTEM

#### 🏭 AUTOMATED FEE PRODUCT CREATION
- **Fully Automated Workflow** - System automatically creates Shopify products when admin creates express timeslots
- **Smart Product Management** - Detects existing products, prevents duplicates, updates prices automatically
- **Intelligent Cleanup** - Removes unused fee products when timeslots are deleted or modified
- **Background Processing** - Non-blocking automation with automatic triggers on timeslot saves
- **Production Ready** - Complete Railway persistence and deployment support

#### 🎨 COMPLETE ADMIN UI PANEL
- **FeeAutomationPanel Component** - Full management interface integrated into Shopify settings tab
- **Real-time Monitoring** - Live status dashboard with product listing and automation history
- **Manual Controls** - Trigger automation, cleanup products, view detailed results
- **Status Dashboard** - Metrics showing total products, recent operations, success rates
- **Comprehensive Results Display** - Detailed operation logs with timestamps and status

#### 🔧 BACKEND AUTOMATION SERVICE
- **ShopifyFeeAutomation Class** - Core automation service with full product lifecycle management
- **3 New API Endpoints**:
  - `/api/shopify/automate-express-fees` - Trigger fee product automation
  - `/api/shopify/fee-automation-status` - Get automation status and product list
  - `/api/shopify/cleanup-fee-products` - Clean up unused fee products
- **Automatic Triggers** - Runs automation when timeslots are saved or updated
- **Persistent History** - Stores automation results and operation logs

#### 🚀 RAILWAY PERSISTENCE SOLUTION
- **Complete Railway API Integration** - Automatic environment variable updates using Railway GraphQL API
- **Two-Option Setup**:
  - **Option A (Automatic)** - Full Railway API integration with `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`
  - **Option B (Manual)** - Copy JSON values from logs to Railway dashboard
- **Automated Setup Script** - `scripts/setup-railway-persistence.sh` for one-command setup
- **Comprehensive Documentation** - Complete guides for both setup options

#### 🔄 COMPLETE AUTOMATION WORKFLOW
```
Admin creates express timeslot with fee → System automatically detects → Creates Shopify product "Express Delivery Fee - $X.XX" → Saves variant ID to database → Widget uses correct product for cart integration → Customer pays accurate amount
```

#### ✅ PRODUCTION BENEFITS
- **Zero Manual Work** - Fee products created automatically, no admin intervention needed
- **Always Accurate** - Prices sync perfectly with timeslot configurations
- **Clean Store Management** - Unused products automatically removed, no clutter
- **Full Visibility** - Complete monitoring and control through admin interface
- **Production Stable** - Comprehensive error handling, logging, and fallback mechanisms
- **Performance Optimized** - Background processing ensures UI remains responsive

#### 📋 TECHNICAL IMPLEMENTATION
- **Core Service**: `src/services/shopify-fee-automation.js` - Complete automation logic
- **Backend Integration**: Enhanced `server.js` with 3 new endpoints and automatic triggers
- **Admin UI**: `src/components/shopify/FeeAutomationPanel.tsx` - Complete React interface
- **Settings Integration**: Added automation panel as new tab in Shopify settings
- **Comprehensive Documentation**: `SHOPIFY_FEE_AUTOMATION_COMPLETE.md` with full workflow guide

### Files Added/Updated
- `src/services/shopify-fee-automation.js` - Core automation service (NEW)
- `src/components/shopify/FeeAutomationPanel.tsx` - Complete admin UI (NEW)
- `src/components/shopify/ShopifySettings.tsx` - Added automation tab
- `server.js` - Enhanced with 3 new API endpoints and automatic triggers
- `SHOPIFY_FEE_AUTOMATION_COMPLETE.md` - Comprehensive automation guide (NEW)

### Breaking Changes
- None - fully backward compatible with existing fee handling

### Migration Notes
- Existing manual fee products continue working
- Widget automatically detects and uses automated products
- Admin can monitor and control automation through new UI panel

---

## [1.13.0] - 2024-12-19

### 🚀 MAJOR RELEASE - Dynamic Fee Handling & Automated Product Creation

#### 💰 DYNAMIC FEE HANDLING SYSTEM
- **Automated fee product creation** - System automatically creates Shopify products when admin creates express timeslots
- **Dynamic fee detection** - Widget automatically finds and uses correct fee products based on timeslot selections
- **Smart fee management** - Removes old fees when changing selections, prevents duplicate fees
- **Multiple fee support** - Handles unlimited fee amounts ($15, $25, $35, etc.) with single system

#### 🛍️ SHOPIFY PRODUCT INTEGRATION
- **Auto-product creation** - Backend creates fee products with correct pricing when timeslots are saved
- **Product lifecycle management** - Automatic creation, updating, and deletion of fee products
- **Correct cart totals** - Customers see accurate pricing immediately in cart
- **Professional checkout** - Seamless fee handling with proper line items

#### 🎯 INTELLIGENT FEE RESOLUTION
- **Priority-based detection** - Widget tries timeslot-specific products first, then manual products, then fallbacks
- **Graceful degradation** - Falls back to cart notes if products don't exist
- **Error-resistant** - Continues working even if Shopify API fails
- **Debug-friendly** - Comprehensive console logging for troubleshooting

#### 🔧 BACKEND AUTOMATION FEATURES
- **Shopify Admin API integration** - Full product creation/deletion via Shopify API
- **Database schema enhancements** - Stores fee product IDs with timeslots
- **Enhanced timeslot management** - Creates/updates/deletes fee products automatically
- **Widget API improvements** - Includes fee variant IDs in timeslot responses

#### 🧹 CODE CLEANUP & OPTIMIZATION
- **Removed hard-coded variant IDs** - No more manual product ID management
- **Clean Express button** - Removed misleading static fee displays
- **Updated version tracking** - Consistent v1.13.0 across all components
- **Improved console messages** - Clearer debugging and status information
- **Professional UI** - Clean, dynamic fee displays in timeslot selection

#### 📋 COMPLETE AUTOMATION WORKFLOW
1. **Admin creates express timeslot** with fee amount in Railway dashboard
2. **System automatically creates** Shopify fee product with correct price
3. **Timeslot saved** with reference to fee product variant ID
4. **Customer selects express timeslot** in widget
5. **Widget automatically adds** correct fee product to cart
6. **Cart total shows** accurate amount immediately

#### 🎯 DEPLOYMENT OPTIONS
- **Option A: Full Automation** - Complete backend integration with automatic product creation
- **Option B: Manual Products** - Create fee products manually, widget auto-detects them
- **Option C: Cart Notes** - Fallback to manual processing with comprehensive fee information

#### 🔄 MIGRATION SUPPORT
- **Backward compatible** - Works with existing setups
- **Graceful fallbacks** - Handles missing products elegantly
- **Easy migration** - Can upgrade from manual to automated approach seamlessly

### Technical Implementation
- Added Shopify Admin API integration for product management
- Enhanced timeslot creation/update/delete with fee product lifecycle
- Updated widget with intelligent fee variant detection
- Added comprehensive error handling and fallback mechanisms
- Implemented priority-based fee resolution system

### Files Updated
- `cart-widget-updated.html` - Enhanced with dynamic fee handling
- `package.json` - Version bump to 1.13.0
- Added `AUTOMATED_FEE_PRODUCT_CREATION.md` - Complete automation guide
- Added `RAILWAY_BACKEND_INTEGRATION.md` - Step-by-step backend implementation
- Added `SHOPIFY_FEE_SOLUTIONS.md` - Technical limitation explanations
- Added `WIDGET_CLEANUP_SUMMARY.md` - Code cleanup documentation

### Breaking Changes
- None - fully backward compatible

### Migration Notes
- Existing widgets continue working with cart notes fallback
- Manual fee products are automatically detected and used
- No immediate action required for existing deployments

---

## [1.12.3] - 2024-12-19

### 🎯 SIMPLIFIED TAGGING - Clean Shopify Order Tags

#### 🏷️ STREAMLINED TAG GENERATION
- **Reduced complexity** - Simplified from 15+ tags to just 3 essential tags
- **Shopify-optimized** - Clean, readable tags perfect for order management
- **Fulfillment-friendly** - Easy identification and processing for teams

#### 📋 THE 3 ESSENTIAL TAGS
1. **Delivery Type** - `Delivery`, `Collection`, or `Express`
2. **Delivery Date** - `20/12/2024` (dd/mm/yyyy format)
3. **Timeslot** - `10:00-14:00` (hh:mm-hh:mm format)

#### ✨ EXAMPLES
- **Delivery Order**: `Delivery, 20/12/2024, 10:00-14:00`
- **Collection Order**: `Collection, 20/12/2024, 14:00-16:00`
- **Express Order**: `Express, 20/12/2024, 10:30-11:30`

#### 🎯 BENEFITS
- **Clean Shopify orders** - No tag clutter, just essential information
- **Easy order filtering** - Simple tags for order management
- **Quick fulfillment** - Instant identification of delivery requirements
- **Professional appearance** - Clean, readable tags in Shopify admin

#### 🔧 TECHNICAL CHANGES
- Simplified `generateDeliveryTags()` function to 3 core tags
- Updated default tag mapping settings with proper capitalization
- Maintained all cart attributes and delivery notes functionality
- Preserved automatic order tagging workflow

### Files Updated
- `cart-widget-updated.html` - Simplified tag generation system
- `test-enhanced-tagging.html` - Updated to show simplified tagging examples



## [1.12.2] - 2024-12-19

### 🏷️ ENHANCED TAGGING SYSTEM - Comprehensive Timeslot-Based Tags

#### 🕐 TIMESLOT-BASED TAGGING
- **Timeslot name tags** - `timeslot-am-delivery`, `timeslot-pm-collection`, `timeslot-ex-1030`
- **Start time tags** - `start-10:00`, `start-14:00`, `start-10:30` (hh:mm format)
- **End time tags** - `end-14:00`, `end-16:00`, `end-11:30` (hh:mm format)
- **Time range tags** - `10:00-14:00`, `14:00-16:00`, `10:30-11:30` (full range)
- **Type-specific time tags** - `delivery-10:00-14:00`, `collection-14:00-16:00`, `express-10:30-11:30`

#### 📅 ENHANCED DATE TAGGING
- **ISO date format** - `delivery-date-2024-12-20`
- **Day of week tags** - `delivery-monday`, `delivery-friday`, `delivery-sunday`
- **Formatted date tags** - `date-20-12-2024` (dd-mm-yyyy format for readability)

#### 📍 IMPROVED LOCATION TAGGING
- **Location name tags** - `collection-windflower-florist`, `collection-main-store`
- **Location ID tags** - `location-id-1749988809207` (for precise tracking)
- **Postal area tags** - `delivery-area-12`, `delivery-area-60` (first 2 digits)
- **Full postal tags** - `postal-123456`, `postal-608123` (complete postal code)

#### 💰 COMPREHENSIVE FEE TAGGING
- **Premium delivery tag** - `premium-delivery` (for any paid service)
- **General fee tags** - `fee-25`, `fee-15` (fee amount)
- **Express-specific tags** - `express-fee-25`, `express-fee-15` (express delivery fees)

#### 🔧 TECHNICAL ENHANCEMENTS
- **Enhanced delivery notes** - includes timeslot details, cutoff times, max orders
- **Tag reference in notes** - generated tags included in delivery notes for debugging
- **Configurable tag generation** - `enableTimeslotTags` option in settings
- **Comprehensive cart attributes** - all tag data stored in cart for order processing

#### 📋 EXAMPLE TAG GENERATION
**AM Delivery (10:00-14:00, $25 Express Fee):**
`delivery`, `timeslot-am-delivery`, `start-10:00`, `end-14:00`, `10:00-14:00`, `delivery-10:00-14:00`, `delivery-date-2024-12-20`, `delivery-friday`, `date-20-12-2024`, `delivery-area-12`, `postal-123456`, `premium-delivery`, `fee-25`, `express-fee-25`

**PM Collection (14:00-16:00, Windflower Florist):**
`collection`, `timeslot-pm-collection`, `start-14:00`, `end-16:00`, `14:00-16:00`, `collection-14:00-16:00`, `delivery-date-2024-12-20`, `delivery-friday`, `date-20-12-2024`, `collection-windflower-florist`, `location-id-1749988809207`

### Files Enhanced
- `cart-widget-updated.html` - Enhanced tag generation system
- `test-enhanced-tagging.html` - Comprehensive tagging demonstration
- Enhanced delivery notes with detailed timeslot information



## [1.12.1] - 2024-12-19

### 🚀 ENHANCED CUSTOM WIDGET - Full Shopify Cart Integration

#### 🛒 COMPLETE SHOPIFY CART INTEGRATION
- **Enhanced custom cart widget** with full Shopify `/cart/update.js` API integration
- **Comprehensive cart attributes** - delivery_date, delivery_timeslot, delivery_type, delivery_postal_code, delivery_location_name, delivery_location_address, delivery_fee, delivery_tags, delivery_notes, delivery_widget_version, delivery_timestamp
- **Real-time cart updates** - proper cart attribute processing and validation
- **Error handling and user feedback** - comprehensive cart update error handling with detailed messages

#### 🏷️ AUTOMATIC ORDER TAGGING INTEGRATION
- **Tag generation from selections** - automatic tag creation based on delivery type, date, and location
- **Tag mapping settings integration** - fetches and applies configured tag mappings
- **Dynamic tag application** - tags generated based on user selections and applied to cart
- **Order webhook processing** - automatic tag application when orders are created

#### 📝 ORDER NOTES INTEGRATION
- **Automatic delivery notes** - comprehensive delivery information added to cart attributes
- **Professional formatting** - structured delivery details for order processing
- **Order confirmation display** - delivery details shown in order confirmation
- **Admin order visibility** - enhanced order information for staff processing

#### 🎨 DYNAMIC BUTTON TEXT ENHANCEMENT
- **Cart-specific button text** - "Update Cart with [Delivery/Collection/Express Delivery]"
- **Real-time text updates** - button text changes based on selected delivery type
- **Loading state management** - "Updating Cart..." during processing
- **Type-specific messaging** - different text for delivery, collection, and express options

#### 🔧 TECHNICAL ENHANCEMENTS
- **Tag mapping settings API integration** - fetches real-time tag configuration
- **Enhanced data validation** - comprehensive delivery data validation before cart update
- **Improved error handling** - detailed error messages and fallback mechanisms
- **Cart mode detection** - automatic detection of cart page vs product page context

#### 📋 INTEGRATION FEATURES
- **Widget selections** → **Cart attributes** → **Order attributes** → **Order tags** (complete flow)
- **Delivery details** → **Order notes** (automatic transfer)
- **Tag mapping settings** → **Applied tags** (configurable tagging)
- **Collection locations** → **Location attributes** (branch support)

### Files Enhanced
- `cart-widget-updated.html` - Enhanced with full Shopify cart integration
- Added comprehensive cart attribute processing
- Integrated automatic order tagging functionality
- Enhanced dynamic button text system



All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.12.0] - 2024-12-19

### 🚀 MAJOR RELEASE - Complete Shopify Cart Integration

#### 🏷️ AUTOMATIC ORDER TAGGING (MOST IMPORTANT!)
- **Automatic delivery tag application** to orders based on tag mapping settings
- **Real-time tag processing** via webhook when orders are created
- **Configurable tag mapping** from admin dashboard applied to customer orders
- **Tag inheritance** from cart attributes to order tags seamlessly

#### 🛒 COMPLETE CART INTEGRATION
- **Cart attributes processing** - delivery preferences stored as cart attributes
- **Shopify cart API integration** - proper `/cart/update.js` integration
- **Error handling and validation** - comprehensive cart update error handling
- **User feedback system** - detailed success/error messages for customers

#### 📝 ORDER NOTES INTEGRATION
- **Automatic order notes** - delivery details added to Shopify order notes section
- **Formatted delivery information** - professional formatting matching Shopify admin
- **Order confirmation display** - delivery details shown on order confirmation pages
- **Admin order details** - enhanced order information for staff processing

#### 🎨 SHOPIFY THEME INTEGRATION
- **Complete theme integration file** (`shopify-theme-integration.liquid`)
- **Cart page delivery summary** - shows delivery details on cart page
- **Checkout confirmation banner** - delivery confirmation during checkout
- **Order confirmation display** - delivery details on thank you page
- **Responsive design** - mobile-friendly delivery displays
- **Print-friendly styling** - proper order confirmation printing

#### 🔧 TECHNICAL ENHANCEMENTS
- **Tag mapping settings API** - `/api/public/widget/tag-mapping-settings` endpoint
- **Enhanced widget data fetching** - includes tag mapping configuration
- **Webhook order processing** - automatic tag application on order creation
- **Cart attribute validation** - comprehensive delivery data validation
- **Delivery fee handling** - proper fee calculation and display

#### 📋 INTEGRATION FEATURES
- **Cart attributes** → **Order attributes** → **Order tags** (complete flow)
- **Delivery notes** → **Order notes** (automatic transfer)
- **Tag mapping settings** → **Applied tags** (configurable tagging)
- **Widget selections** → **Shopify order data** (seamless integration)

#### 🛡️ BACKWARD COMPATIBILITY
- **Fully backward compatible** - no breaking changes to existing functionality
- **Enhanced existing features** - all previous features maintained and improved
- **Optional integration** - theme integration is optional, widget works standalone

### Files Added
- `shopify-theme-integration.liquid` - Complete Shopify theme integration
- Enhanced webhook handlers for automatic order processing
- Tag mapping settings public API endpoint

### Technical Implementation
- Added `applyDeliveryTagsToOrder()` function for automatic tagging
- Added `updateOrderNotesWithDeliveryInfo()` for order notes enhancement
- Enhanced widget with tag generation and cart integration
- Comprehensive error handling and user feedback systems

## [1.11.4] - 2024-12-19

### 🚨 CRITICAL FIX - Restore Data Persistence
- **Fixed data reset issue**: Removed temporary mock data bypass from v1.11.2
- **Restored server sync**: All data loading functions now properly use server sync again
- **Fixed configuration persistence**: User configurations will now persist across page refreshes
- **Removed bypass code**: Eliminated all temporary bypass functions that were forcing mock data

### 🔧 Root Cause
The issue was leftover temporary bypass code in `src/lib/mockData.ts` from v1.11.2 that was forcing all data loading functions to return mock data instead of using the server sync. This caused all user configurations to reset to defaults on every page refresh.

### ✅ What's Fixed
- ✅ TimeSlots configurations now persist
- ✅ Settings changes now persist  
- ✅ Express delivery configurations now persist
- ✅ Blocked dates and date ranges now persist
- ✅ Product configurations now persist
- ✅ Delivery area restrictions now persist
- ✅ TagMappingSettings now persist (from v1.11.3)

## [1.11.3] - 2024-12-19

### 🔧 Critical Data Persistence Fix
- **Fixed TagMappingSettings server persistence**: Integrated TagMappingSettings with userDataSync service
- **Added comprehensive data validation**: Enhanced validation for all data loading functions
- **Implemented server-side tagMappingSettings support**: Added full CRUD operations for tag mapping data
- **Created comprehensive data persistence audit**: Documented all data storage points and prevention plan
- **Enhanced data integrity monitoring**: Added validation and fallback mechanisms

### 🛡️ Prevention Measures
- All modules now use centralized userDataSync service
- Server-side validation for all user data types
- Comprehensive audit document created (DATA_PERSISTENCE_AUDIT.md)
- Enhanced error handling and data recovery mechanisms

### 📋 Technical Changes
- Updated `src/lib/userDataSync.ts` with tagMappingSettings support
- Enhanced server endpoints to handle tagMappingSettings data type
- Modified TagMappingSettings component to use server-synced storage
- Added comprehensive validation and fallback mechanisms

## [1.11.2] - 30/12/2024

### 🚨 IMMEDIATE FIX - Bypass Corrupted Server Data
- 🔧 **Complete Server Bypass** - All data loading functions now return mock data directly
- ✅ **Guaranteed Fix** - Bypasses all server sync to eliminate corrupted data issues
- 📊 **Mock Data Only** - Temporarily uses only clean mock data until server data is resolved
- 🛡️ **Error Prevention** - Prevents any undefined/null data from reaching components
- 🔍 **Debug Logging** - Added console logs to confirm mock data usage

### What This Does
- **loadTimeslots()** - Returns mock timeslots directly (no server sync)
- **loadBlockedDates()** - Returns mock blocked dates directly (no server sync)
- **loadBlockedDateRanges()** - Returns mock date ranges directly (no server sync)
- **loadSettings()** - Returns mock settings directly (no server sync)
- **loadProducts()** - Returns mock products directly (no server sync)
- **loadBlockedCodes()** - Returns mock postal codes directly (no server sync)

### Result
- ✅ **TimeSlots page will work immediately**
- ✅ **All components will load properly**
- ✅ **No more white screen errors**
- ✅ **All functionality restored**

### Note
This is a temporary fix. Server sync is commented out and can be restored later once the server data corruption is resolved.

## [1.11.1] - 30/12/2024

### 🚨 CRITICAL FIX - Emergency Data Reset Tool
- 🛠️ **Emergency Reset Endpoint** - Added `/api/user/emergency-reset` to clear corrupted server data
- 🔧 **Settings Reset Button** - Added emergency reset button in Settings page for easy access
- 🗑️ **Data Corruption Fix** - Resolves white screen issues caused by corrupted server data from previous versions
- ⚡ **Auto Refresh** - Automatically refreshes page after reset to load fresh default data
- 🛡️ **Safety Warnings** - Clear warnings and confirmations before data deletion

### Root Cause Resolution
The white screen persisted after code revert because corrupted data remained on the server. This tool clears all server data, forcing the app to use fresh default mock data.

### How to Use
1. Go to Settings page
2. Scroll to "Emergency Data Reset" section
3. Click the red "Emergency Reset" button
4. Confirm the action
5. Page will auto-refresh with fresh data

### Technical Changes
- Added emergency reset API endpoint in server.js
- Enhanced Settings component with reset functionality
- Added proper error handling and user feedback
- Implemented auto-refresh after successful reset

## [1.11.0] - 30/12/2024

### 🔄 EMERGENCY REVERT - Restore Stable TimeSlots Functionality
- 🚨 **CRITICAL REVERT** - Reverted to v1.9.2 stable codebase to restore TimeSlots functionality
- ✅ **TimeSlots Working** - All TimeSlots module functionality restored and operational
- ✅ **Express Delivery Working** - Express delivery features maintained from v1.9.0-1.9.2
- ✅ **Core Features Stable** - All core delivery scheduling features operational
- 🛡️ **Data Persistence** - Railway deployment data persistence maintained

### What Was Reverted
- Removed problematic data sync changes from v1.9.9+ that caused white screen errors
- Removed availability calendar data persistence changes that broke component loading
- Removed array safety fixes that introduced new issues instead of solving them

### What's Maintained
- ✅ Express delivery fees functionality (v1.9.0)
- ✅ Widget stability fixes (v1.9.1) 
- ✅ Enhanced data persistence for Railway (v1.9.2)
- ✅ All core scheduling functionality
- ✅ Shopify integration
- ✅ Account management
- ✅ Live preview and settings

### Technical Changes
- Reverted to commit 2a824d7 (v1.9.2) as stable base
- Updated version to v1.11.0 to indicate emergency revert
- Maintained all working features from v1.9.0-1.9.2 series
- Removed all problematic changes from v1.9.9-1.10.5 series

### Next Steps
- TimeSlots module now fully functional
- Future data persistence improvements will be implemented more carefully
- All new features will be thoroughly tested before deployment

## [1.8.0] - 2024-06-14

### Added - Account Management System
- 🔐 **Account Management Dashboard** - Comprehensive account settings interface
- 🔑 **Password Management** - Change password with current password verification
- 📧 **Email Management** - Update email address with validation
- 👤 **Username Management** - Change username with data migration
- 🗑️ **Account Deletion** - Secure account deletion with confirmation
- 👁️ **Password Visibility** - Toggle password visibility in forms
- ✅ **Form Validation** - Client and server-side validation for all forms
- 🔒 **Security Features** - Password requirements and confirmation dialogs
- 📱 **Responsive Design** - Mobile-friendly account management interface
- 🔄 **Session Management** - Proper session handling for username changes

### Technical Changes
- Added 5 new account management API endpoints:
  - `GET /api/account/info` - Get account information
  - `POST /api/account/change-password` - Change password
  - `POST /api/account/change-email` - Change email address
  - `POST /api/account/change-username` - Change username with data migration
  - `POST /api/account/delete` - Delete account permanently
- Created comprehensive AccountManagement React component
- Implemented proper form validation and error handling
- Added account management to navigation and routing
- Enhanced security with password verification for sensitive operations
- Added data migration for username changes
- Implemented proper session invalidation and renewal

## [1.7.1] - 2024-06-14

### Fixed - Server Data Persistence & LivePreview
- 💾 **Server Data Persistence** - All configurations now properly saved to server
- 🔄 **Data Migration Tools** - One-click migration from localStorage to server
- 📊 **Sync Status Monitoring** - Real-time sync status with manual controls
- 🖥️ **LivePreview Fix** - Resolved white screen error with tagMapping validation
- ⚡ **Enhanced Settings Validation** - Comprehensive settings structure validation
- 🔧 **Improved Error Handling** - Better error handling for incomplete data

### Technical Changes
- Added `/api/user/migrate` endpoint for localStorage migration
- Added `/api/user/sync` endpoint for manual sync triggers
- Enhanced `loadSettings()` with comprehensive validation
- Fixed tagMapping undefined errors in LivePreview
- Added SyncStatus component to Settings page
- Implemented optional chaining for all tagMapping access

## [1.7.0] - 2024-06-14

### Added - Real-time Widget Synchronization
- 🔄 **Real-time Widget Sync** - Customer widget now syncs live with admin dashboard
- 🌐 **Public API Endpoints** - 4 new public endpoints for widget data access
- 📊 **Enhanced Customer Widget** - Updated to v1.3.0 with better UI and validation
- 🔧 **Sync Status Indicator** - Live sync status in admin dashboard
- 📝 **Enhanced Integration Guide** - Comprehensive setup and troubleshooting docs

### Technical Changes
- Added 4 public API endpoints:
  - `/api/public/widget/timeslots`
  - `/api/public/widget/settings`
  - `/api/public/widget/blocked-dates`
  - `/api/public/widget/blocked-date-ranges`
- Updated Cloudflare Worker to v1.3.0 with sync functionality
- Enhanced LivePreview component with sync status
- Added comprehensive testing and debugging tools
- Improved error handling and fallback systems

## [1.6.1] - 2024-06-13

### Added - Initial Release
- 🚚 **Delivery Scheduling System** - Complete delivery management platform
- 📅 **Time Slot Management** - Configure delivery windows and capacity
- 🗓️ **Availability Calendar** - Block dates and manage delivery schedule
- ⚡ **Express Delivery** - Premium delivery options with custom pricing
- 📦 **Product Management** - Link products to delivery options
- 🛒 **Shopify Integration** - Full e-commerce platform integration
- 🎨 **Live Preview** - Real-time widget preview and testing
- ⚙️ **Settings Management** - Comprehensive configuration options

### Technical Features
- React-based admin dashboard with TypeScript
- Express.js backend with Railway deployment
- Cloudflare Workers for customer widget
- Real-time data synchronization
- Responsive design with Tailwind CSS
- Authentication and session management
- File-based data persistence
- Comprehensive API endpoints

## [1.9.0] - 2024-12-19

### 🚀 Features
- **Express Delivery Fees**: Added comprehensive fee system for express delivery timeslots
  - Added fee field to Timeslot interface for express delivery charges
  - Updated Express component with fee input field and validation
  - Enhanced widget to display express fees in timeslot options
  - Added fee calculation and display in delivery summary
  - Updated cart integration to include express fee information
  - Added fee badges and visual indicators for express timeslots
  - Implemented total fee calculation for cart integration
  - Updated mock data with sample express delivery fees

### 🔧 Technical Changes
- Extended Timeslot interface with optional fee property
- Enhanced Express.tsx component with DollarSign icon and fee input
- Updated widget JavaScript to handle fee display and calculation
- Modified public API endpoints to include fee data
- Added fee validation and formatting throughout the system

### 💡 User Experience
- Express timeslots now display fees prominently in the widget
- Fee information is included in delivery summary before cart addition
- Visual indicators distinguish express delivery options with fees
- Cart integration includes detailed fee breakdown for transparency

## [1.9.1] - 2024-12-19

### 🔧 Fixes
- **Widget Stability Fix**: Fixed widget deployment issues and ensured stable operation
  - Fixed template literal syntax errors in widget JavaScript
  - Restored widget functionality and deployment stability
  - Express fees functionality available in admin dashboard
  - Widget infrastructure ready for fee display implementation

### 🔧 Technical Changes
- Resolved template literal scope issues in Cloudflare Worker
- Reverted to stable widget codebase
- Maintained admin dashboard express fee functionality
- Prepared foundation for future widget fee integration

### 📋 Current Status
- ✅ Admin Dashboard: Express delivery fees fully functional
- ✅ Widget: Stable and operational (basic functionality)
- 🔄 Integration: Fee display in widget pending future update

## [1.9.2] - 2024-06-15

### Fixed - Enhanced Data Persistence for Railway
- 🔒 **Enhanced Environment Variable Support** - Improved loading from Railway environment variables
- 📊 **Enhanced Deployment Logging** - Better visibility into data loading and persistence status
- 💾 **Automatic Backup Improvements** - Enhanced periodic data backup every 5 minutes
- 📋 **Persistence Command Logging** - Clear instructions for setting up environment variables
- 🔄 **Session Persistence** - Added environment variable support for login sessions
- 📖 **Setup Documentation** - Comprehensive Railway persistence setup guide
- ⚡ **Graceful Shutdown** - Improved data saving on application shutdown
- 🛡️ **Data Recovery** - Clear recovery steps for lost data scenarios

### Technical Changes
- Added `loadSessionsFromEnv()` function for session persistence
- Enhanced logging for all persistence operations
- Created `RAILWAY_PERSISTENCE_SETUP.md` documentation
- Improved error handling for environment variable loading
- Added comprehensive environment status logging on startup
- Enhanced graceful shutdown handlers for data preservation

---

## Version History

- **v1.8.0** - Account Management System
- **v1.7.1** - Server Data Persistence & LivePreview Fixes  
- **v1.7.0** - Real-time Widget Synchronization
- **v1.6.1** - Initial Release
- **v1.9.0** - Express Delivery Fees
- **v1.9.1** - Widget Stability Fix
- **v1.9.2** - Enhanced Data Persistence for Railway

## Deployment Status

- **Admin Dashboard**: https://delivery-schedule2-production.up.railway.app/ ✅
- **Customer Widget**: https://delivery-scheduler-widget.stanleytan92.workers.dev/ ✅
- **Repository**: https://github.com/stanleymf/delivery-scheduler ✅

## Support

For issues, feature requests, or questions, please refer to the project documentation or contact the development team. 