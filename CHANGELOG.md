# Changelog

All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.1] - 14/06/2025

### Added ✨
- **Server Data Persistence**: Implemented complete server-side data storage for admin dashboard configurations
- **Data Migration System**: Added one-click migration from localStorage to server storage
- **Sync Status Dashboard**: Added comprehensive sync status monitoring in Settings page
- **Manual Sync Controls**: Added manual sync triggers and migration tools
- **Cross-Device Synchronization**: Configurations now persist across devices and browser sessions
- **Data Backup & Recovery**: Server-side data storage with automatic persistence

### Enhanced 🔄
- **Settings Loading**: Improved settings validation to ensure complete object structure
- **Data Integrity**: Enhanced data loading with proper fallbacks for missing properties
- **Error Prevention**: Added comprehensive safety checks for undefined property access
- **Sync Service**: Enhanced userDataSync service with better error handling and migration support

### Fixed 🐛
- **LivePreview White Screen**: Fixed critical error where LivePreview module showed white screen due to undefined tagMapping
- **Data Persistence Issues**: Resolved localStorage-only storage causing configuration loss across sessions
- **Settings Structure**: Fixed incomplete settings objects missing required properties like tagMapping
- **Undefined Property Access**: Added safety checks and optional chaining to prevent runtime errors
- **Cross-Session Data Loss**: Eliminated configuration loss when switching devices or clearing browser data

### Technical Details
- **Server Endpoints**: Added `/api/user/migrate` and `/api/user/sync` endpoints for data management
- **Settings Validation**: Enhanced `loadSettings()` function to ensure complete settings structure
- **Safety Checks**: Added optional chaining (`?.`) for all tagMapping property access
- **Fallback Strategy**: Comprehensive fallback system for missing or incomplete data
- **Migration Logic**: Smart migration that preserves existing server data while allowing localStorage migration

### Migration Guide 📋
- **Existing Users**: Use "Migrate Data to Server" button in Settings → Data Sync Status
- **New Users**: Data automatically stored on server from first configuration
- **Multi-Device**: Login from any device to access your configurations
- **Data Recovery**: Server-side storage provides automatic backup and recovery

### Deployment 🚀
- **Railway Server**: Updated with new migration and sync endpoints (✅ DEPLOYED)
- **Data Storage**: Server-side persistence active and functional (✅ OPERATIONAL)
- **Sync Status**: Real-time sync monitoring available in admin dashboard (✅ LIVE)
- **Migration Tools**: One-click migration tools available for existing users (✅ READY)

## [1.7.0] - 14/06/2025

### Added ✨
- **Real-Time Widget Synchronization**: Implemented complete sync between admin dashboard and customer widget
- **Public API Endpoints**: Added 4 new public endpoints for widget data access without authentication
  - `/api/public/widget/timeslots` - Returns timeslots configuration
  - `/api/public/widget/settings` - Returns settings including collection locations
  - `/api/public/widget/blocked-dates` - Returns blocked dates
  - `/api/public/widget/blocked-date-ranges` - Returns blocked date ranges
- **Enhanced Customer Widget (v1.3.0)**: Complete overhaul of Cloudflare Workers widget with sync capabilities
- **Widget Sync Status Indicator**: Added live sync status display in admin dashboard
- **Advanced Widget Integration**: Enhanced integration instructions with sync indicators and troubleshooting
- **Comprehensive Widget Testing**: Added testing checklist and debugging tools
- **Widget Health Monitoring**: Added widget endpoint health checks and status monitoring

### Enhanced 🔄
- **Live Preview Module**: Updated with sync status indicators and enhanced integration instructions
- **Widget Architecture**: Transformed from static widget to dynamic, real-time synced system
- **Customer Experience**: Widget now automatically reflects admin dashboard changes without manual updates
- **Integration Documentation**: Comprehensive update with sync capabilities, testing, and troubleshooting
- **Error Handling**: Enhanced widget error handling with graceful fallbacks and user feedback
- **CORS Configuration**: Proper cross-origin resource sharing for widget API access

### Fixed 🐛
- **Widget Data Mismatch**: Resolved complete disconnect between admin preview and customer widget
- **API Authentication Issues**: Fixed API endpoints returning HTML instead of JSON for widget access
- **Route Conflicts**: Resolved API route mismatches between widget expectations and server endpoints
- **Deployment Sync**: Eliminated manual deployment requirements for widget updates

### Technical Details
- **Server Architecture**: Added public API layer with proper CORS headers and JSON responses
- **Cloudflare Workers**: Updated to v1.3.0 with real-time data fetching and enhanced UI
- **Environment Configuration**: Added `ADMIN_DASHBOARD_URL` environment variable for widget sync
- **Data Flow**: Established seamless data flow from admin dashboard → public API → customer widget
- **Fallback Strategy**: Comprehensive fallback data system if API calls fail
- **Version Management**: Proper versioning system for widget deployments

### Deployment 🚀
- **Railway Server**: Deployed with new public API endpoints (✅ LIVE)
- **Cloudflare Workers**: Deployed v1.3.0 with sync capabilities (✅ SYNCED)
- **Environment Variables**: Configured cross-platform environment variables
- **Health Checks**: All 4 public API endpoints responding correctly
- **Widget Proxy**: Cloudflare Worker proxy functioning for API access

### Breaking Changes ⚠️
- **Widget Integration**: Existing widget integrations should update to v1.3.0 for sync capabilities
- **API Structure**: New public API endpoints replace previous widget data access methods
- **Environment Setup**: Requires `ADMIN_DASHBOARD_URL` environment variable in Cloudflare Workers

### Migration Guide 📋
- Update widget script tag to reference v1.3.0
- Configure `ADMIN_DASHBOARD_URL` environment variable
- Test widget sync functionality with admin dashboard changes
- Update integration documentation for customers

## [1.6.1] - 14/06/2025

### Added ✨
- **Bulk Day Selection**: Added convenient bulk selection buttons for assigning days when creating timeslots
- **Quick Day Presets**: Added "Select All", "Select None", "Weekdays", and "Weekends" buttons
- **Improved UX**: Streamlined day assignment process for both TimeSlots and Express components

### Enhanced 🔄
- **TimeSlots Creation**: Enhanced day assignment UI with bulk selection options
- **Express Slots Creation**: Added same bulk selection functionality to Express delivery slots
- **User Experience**: Reduced clicks needed to assign common day patterns

### Technical Details
- Added bulk selection functions: `handleSelectAllDays`, `handleSelectNoDays`, `handleSelectWeekdays`, `handleSelectWeekends`
- Updated UI layout to include bulk selection buttons above individual day checkboxes
- Maintained existing individual day selection functionality
- Applied consistent styling and behavior across both TimeSlots and Express components

## [1.6.0] - 14/06/2025

### Added ✨
- **URL Routing**: Implemented proper URL routing with React Router DOM
- **Bookmarkable Pages**: Each module now has its own URL that can be bookmarked and shared
- **Browser Navigation**: Back/forward buttons now work correctly with module navigation
- **Direct Links**: Users can now navigate directly to specific modules via URL

### Changed 🔄
- **Navigation System**: Replaced state-based navigation with URL-based routing
- **Sidebar Navigation**: Updated AppSidebar to use NavLink components with proper active states
- **URL Structure**: Added clean URL paths for each module:
  - `/delivery-areas` - Delivery Areas management
  - `/time-slots` - Time Slots configuration
  - `/express` - Express delivery settings
  - `/calendar` - Availability Calendar
  - `/products` - Product Management
  - `/preview` - Live Preview widget
  - `/shopify` - Shopify Integration
  - `/settings` - Application Settings

### Technical Details
- Added `react-router-dom` dependency for client-side routing
- Updated App.tsx to use BrowserRouter with Routes and Route components
- Modified AppSidebar to use useLocation hook and NavLink components
- Implemented automatic redirect from root path to delivery-areas
- Added fallback route handling for unknown URLs

## [1.5.4] - 14/06/2025

### Fixed
- **Timeslot Persistence**: Fixed issue where deleted express timeslots would reappear after page refresh
- **Component State Sync**: Updated TimeSlots and Express components to properly load from and save to localStorage
- **Cross-Component Updates**: Added reactive state management so Express component updates when delivery timeslots are modified in TimeSlots component

### Technical Details
- Updated TimeSlots component to use localStorage persistence for all timeslot operations
- Updated Express component to use localStorage persistence and react to storage changes
- Fixed state initialization to load from saved data instead of static mock data
- Added proper state synchronization between components that share timeslot data

## [1.5.3] - 14/06/2025

### Fixed
- **Data Persistence**: Comprehensive fix for data persistence across all components
- **Mock Data Override**: All components now properly load from localStorage with fallback to mock data
- **State Management**: Added robust save/load functions for timeslots, blocked dates, settings, and products
- **Component Synchronization**: LivePreview and AvailabilityCalendar now maintain data consistency

### Technical Details
- Added loadTimeslots(), saveTimeslots(), loadBlockedDates(), saveBlockedDates() functions to mockData.ts
- Updated AvailabilityCalendar with comprehensive persistence for all data modification operations
- Updated LivePreview to load all data from localStorage with graceful fallback
- Implemented automatic saving on all data changes with error handling
- Enhanced storage strategy with robust error recovery

### Deployment
- Version bump for patch release
- Automated changelog update

## [1.5.2] - 14/06/2025

### Fixed 🐛
- **Webhook Fetching Issue**: Fixed middleware routing conflict that prevented webhook endpoints from working
- **API Proxy Interference**: Changed Shopify API proxy pattern from `/api/shopify/*` to `/api/shopify/proxy/*`
- **Endpoint Accessibility**: Webhook registration, fetching, and deletion endpoints now work correctly
- **Error Resolution**: Resolved "Shopify API request failed" error when accessing webhook management

### Changed 🔄
- **Middleware Routing**: Updated Shopify API proxy middleware to use more specific routing pattern
- **Endpoint Isolation**: Separated direct Shopify API proxying from custom webhook management endpoints

### Technical
- Fixed middleware route pattern to prevent conflicts with specific endpoints
- Enhanced endpoint accessibility for webhook management functionality
- Improved error handling and debugging for webhook operations
- Version bump for patch release
- Automated changelog update

## [1.5.1] - 14/06/2025

### Added ✨
- **Railway Environment Variable Support**: Added WEBHOOK_BASE_URL environment variable for proper webhook registration
- **Railway Persistence UI Helper**: Added Railway persistence command generator in Shopify Settings UI
- **Environment Variable Persistence**: Implemented Railway-compatible credential persistence using environment variables
- **Railway Command Generator**: Users can now get exact Railway CLI commands to persist credentials across restarts

### Fixed 🐛
- **Webhook Registration on Railway**: Fixed webhook URL construction to use Railway's public domain correctly
- **Railway Container Persistence**: Fixed credentials disappearing on Railway container restarts
- **Environment Variable Loading**: Enhanced credential loading to check environment variables as fallback

### Changed 🔄
- **Persistence Strategy**: Updated persistence to work with Railway's ephemeral filesystem
- **UI Enhancement**: Added Railway-specific persistence instructions and command generator
- **Error Handling**: Enhanced error messages for Railway deployment scenarios

### Deployment 🚀
- **Railway Configuration**: Added WEBHOOK_BASE_URL=https://delivery-schedule2-production.up.railway.app
- **Environment Variables**: Enhanced Railway environment variable management
- **Container Restart Compatibility**: Credentials now survive Railway container restarts when properly configured

## [1.5.0] - 14/06/2025

### Added ✨
- **Persistent Storage for Shopify Credentials**: Implemented file-based credential storage with JSON persistence
- **Automatic Backup System**: Added automatic backup every 5 minutes and on graceful shutdown
- **Storage Status Dashboard**: Real-time storage status indicator with file information and refresh capability
- **Manual Backup/Restore Endpoints**: Admin endpoints for manual credential backup and restore operations
- **Enhanced Webhook Registration**: Fixed webhook URL construction and added comprehensive error handling
- **Debug Endpoint**: Added troubleshooting endpoint for webhook and credential debugging
- **UI Reorganization**: Moved Shopify configuration and webhooks to unified Shopify Integration tab
- **Persistence Recovery**: Comprehensive error handling and recovery mechanisms for storage failures

### Fixed 🐛
- **Webhook Registration Issues**: Fixed webhook URL construction to use correct Railway domain
- **Credential Persistence**: Credentials now survive server restarts and app refreshes
- **Duplicate Module Navigation**: Eliminated duplicate Shopify functionality between Settings and Shopify Integration
- **Error Handling**: Enhanced error messages with detailed information for troubleshooting

### Changed 🔄
- **Settings Organization**: Restored original Settings with collection locations and theme preferences
- **Shopify Integration Structure**: Consolidated ShopifySettings and WebhookManager into unified module
- **Storage Architecture**: Migrated from memory-only to persistent file-based credential storage
- **UI Layout**: Better organization with Store Connection, Webhooks, and Integration Settings tabs

### Technical
- Enhanced server.js with persistent storage using fs/promises
- Added graceful shutdown handlers for data preservation
- Implemented periodic backup mechanism with 5-minute intervals
- Added comprehensive logging and debugging capabilities
- Updated ShopifySettings component with storage status monitoring
- Reorganized navigation structure for better user experience
- Version bump for minor release
- Automated changelog update

### Security 🔒
- User-isolated credential storage with secure file-based persistence
- Server-side storage with no client-side credential exposure
- Graceful error handling for file corruption and recovery scenarios

## [1.1.5] - 14/06/2025

### Added ✨
- **Product Management Sync Feature**: Added sync products button to synchronize products from Shopify
- **Enhanced Product Display**: Added comprehensive product statistics and sync status indicators
- **Extended Mock Products**: Added 5 additional mock products to simulate real Shopify sync
- **Sync Status Feedback**: Added visual feedback for sync states (syncing, success, error)
- **Last Sync Tracking**: Added timestamp display for last successful sync operation

### Technical Details
- Enhanced ProductManagement component with async sync functionality
- Added loading states and error handling for sync operations
- Improved UI with product statistics dashboard
- Added sync status management with automatic state reset

## [1.1.4] - 14/06/2025

### Fixed 🐛
- **Collection Location Address Display**: Fixed issue where collection location addresses were not showing after selection in the live widget preview
- **Enhanced Location Selection UX**: Added visual confirmation of selected location with name and address display
- **Improved Confirmation Step**: Updated confirmation step to show both location name and address for collection orders

## [1.0.11] - 14/06/2025

### Added ✨
- **Initial Release**: Complete delivery scheduling system with Shopify integration
- **Core Features**: Time slots, delivery areas, availability calendar, product management
- **Shopify Integration**: Webhook management, credential persistence, API integration
- **Live Preview**: Interactive widget preview with real-time configuration
- **Authentication**: Secure admin authentication system
- **Comprehensive API**: Full REST API with Shopify webhook support
- **Production Ready**: Deployment configuration for Railway and Cloudflare

All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). 