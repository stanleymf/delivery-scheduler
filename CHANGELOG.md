# Changelog

All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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