# Changelog

## [1.5.0] - 2025-06-14

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



## [1.4.0] - 2025-06-14

### Added ✨
- **Enhanced Shopify webhook integration with comprehensive delivery scheduling support**

### Technical
- Version bump for minor release
- Automated changelog update



## [1.3.0] - 2025-06-14

### Added ✨
- **--type=feature**

### Technical
- Version bump for minor release
- Automated changelog update



## [1.2.2] - 2025-06-14

### Documentation 📚
- **Enhanced version management workflow**

### Technical
- Version bump for patch release
- Automated changelog update



## [1.2.1] - 2025-06-14

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.2.0] - 2025-06-13

### Minor
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for minor release



## [1.1.5] - 2025-06-13

### Added
- **Product Management Sync Feature**: Added sync products button to synchronize products from Shopify
- **Enhanced Product Display**: Added comprehensive product statistics and sync status indicators
- **Extended Mock Products**: Added 5 additional mock products to simulate real Shopify sync
- **Sync Status Feedback**: Added visual feedback for sync states (syncing, success, error)
- **Last Sync Tracking**: Added timestamp display for last successful sync operation

### Technical
- Enhanced ProductManagement component with async sync functionality
- Added loading states and error handling for sync operations
- Improved UI with product statistics dashboard
- Added sync status management with automatic state reset

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.1.4] - 2025-06-13

### Fixed
- **Collection Location Address Display**: Fixed issue where collection location addresses were not showing after selection in the live widget preview
- **Enhanced Location Selection UX**: Added visual confirmation of selected location with name and address display
- **Improved Confirmation Step**: Updated confirmation step to show both location name and address for collection orders

### Technical
- Enhanced LivePreview component with better location selection feedback
- Improved user experience for collection location selection workflow

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.1.3] - 2025-06-13

### Changed
- **Browser Tab Title**: Changed from "React Starter" to "Delivery Scheduler"
- **Custom Favicon**: Added flower-themed SVG favicon matching the brand colors
- **SEO Optimization**: Added comprehensive meta tags for better search engine visibility
- **Social Media**: Added Open Graph and Twitter Card meta tags for better sharing

### Technical
- Enhanced HTML head with proper meta tags and favicon links
- Added theme-color meta tag for mobile browser theming
- Improved accessibility with proper icon references

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.1.2] - 2025-06-13

### Changed
- **Sidebar UI Enhancement**: Removed emojis from sidebar menu items, keeping only icons
- **Collapsible Sidebar**: Added ability to minimize/expand sidebar with toggle button
- **Responsive Design**: Improved sidebar behavior on mobile and desktop
- **Accessibility**: Added sidebar toggle button in main content area for better UX

### Technical
- Enhanced sidebar component with collapsible functionality
- Improved responsive design and accessibility
- Added keyboard shortcut support (Cmd/Ctrl + B) for sidebar toggle

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.1.1] - 2025-06-13

### Patch
- **General improvements and bug fixes**: General improvements and bug fixes

### Technical
- Version bump for patch release



## [1.1.0] - 2025-06-13

### Minor
- **Sync live widget preview calendar with AvailabilityCalendar blocked dates and timeslots**: Sync live widget preview calendar with AvailabilityCalendar blocked dates and timeslots

### Technical
- Version bump for minor release



## [1.0.16] - 2025-06-13

### Patch
- **Fixed DialogFooter import and BlockedDateRange property access errors**: Fixed DialogFooter import and BlockedDateRange property access errors

### Technical
- Version bump for patch release



## [1.0.15] - 2025-06-13

### Patch
- **Fixed incomplete AvailabilityCalendar component file**: Fixed incomplete AvailabilityCalendar component file

### Technical
- Version bump for patch release



## [1.0.14] - 2025-06-13

### Patch
- **Added comprehensive version management documentation**: Added comprehensive version management documentation

### Technical
- Version bump for patch release



## [1.0.13] - 2025-06-13

### Patch
- **Fixed unterminated template literal error in AvailabilityCalendar component**: Fixed unterminated template literal error in AvailabilityCalendar component

### Technical
- Version bump for patch release



## [1.0.12] - 2025-06-13

### Patch
- **Test version update script**: Test version update script

### Technical
- Version bump for patch release



All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.11] - 2025-06-13

### Fixed
- **DialogFooter Import Error**: Added missing `DialogFooter` import to fix undefined component error
- **Timeslot Property Error**: Fixed incorrect `slot.time` references to use `slot.name` property
- **Date Handling in Bulk Dates**: Fixed `getValidBulkDates()` function to return Date objects instead of strings
- **Syntax Error**: Resolved unterminated template literal error in AvailabilityCalendar component

### Technical
- Improved TypeScript type safety for date handling
- Enhanced error handling for bulk date operations
- Fixed all linter errors and warnings

## [1.0.10] - 2025-06-13

### Fixed
- **Syntax Error Recovery**: Restored AvailabilityCalendar.tsx from backup to fix compilation errors
- **Template Literal Error**: Resolved unterminated template literal at line 822

## [1.0.9] - 2025-06-13

### Changed
- **Calendar UI Enhancement**: Removed month/year view dropdown
- **Interactive Month Header**: Made month header clickable to switch to year selection
- **Year Selection Grid**: Added year selection grid with 10 years (current ± 2 years)
- **Back to Month Button**: Added "Back to Month" button for easy navigation

### Technical
- Improved calendar navigation UX
- Enhanced state management for view modes
- Added smooth transitions between month and year views

## [1.0.8] - 2025-06-13

### Fixed
- **Calendar View Issue**: Fixed year/month view dropdown functionality
- **Multi-Month Display**: Added proper props to Calendar component for multi-month display

## [1.0.7] - 2025-06-13

### Changed
- **Settings Button Label**: Changed "Settings" button label to "Future Dates" for better clarity

## [1.0.6] - 2025-06-13

### Added
- **Future Order Limit Management**: Made future order limit setting editable
- **Automatic Future Date Blocking**: Dates beyond today + limit are automatically blocked
- **Calendar Legend Update**: Updated legend to show future blocked dates
- **Settings UI Enhancement**: Improved settings dialog with immediate effect feedback

### Technical
- Enhanced date blocking logic with automatic future date handling
- Improved calendar visual indicators for different date states

## [1.0.5] - 2025-06-13

### Added
- **Blocked Date Range Editing**: Added edit dialogs and functions for blocked date ranges
- **Range-Individual Sync**: Synchronized updates between ranges and individual dates
- **Edit Buttons**: Added edit buttons in the management card for date ranges

### Technical
- Enhanced range management with full CRUD operations
- Improved data consistency between ranges and individual dates

## [1.0.4] - 2025-06-13

### Added
- **Blocked Dates Management Card**: Added management card below Service Calendar
- **Reason Tracking**: Added reason tracking to BlockedDate interface
- **BlockedDateRange Interface**: Created new interface for date range management
- **Edit and Delete Capabilities**: Added edit and delete functionality for individual dates and ranges

### Technical
- Enhanced blocked date management with comprehensive UI
- Improved data structure for better range handling

## [1.0.3] - 2025-06-13

### Added
- **Availability Calendar**: Comprehensive calendar with date range blocking
- **Three Tab Interface**: Single date blocking, range blocking, and bulk blocking tabs
- **Timeslot Selection**: Timeslot selection for partial blocking
- **Reason Tracking**: Reason tracking for all blocked dates and ranges

### Technical
- Complete calendar implementation with advanced blocking features
- Enhanced user interface with intuitive tab navigation

## [1.0.2] - 2025-06-13

### Added
- **Bulk Postal Code Blocking**: Added comma-separated input for bulk postal code blocking
- **Area Code Support**: Extended bulk blocking to support both postal and area codes
- **Validation and UI Feedback**: Added comprehensive validation and user feedback

### Technical
- Enhanced postal code management with bulk operations
- Improved user experience with real-time validation

## [1.0.1] - 2025-06-13

### Added
- **Postal Code Reference Card**: Added comprehensive postal code reference for Singapore and Malaysia
- **Filtering UI**: Added filtering capabilities for postal codes
- **React Warning Fixes**: Fixed React warnings and improved component stability
- **Singapore Coverage**: Improved Singapore postal code coverage

### Technical
- Enhanced delivery area management with comprehensive postal code data
- Improved UI/UX with filtering and search capabilities

## [1.0.0] - 2025-06-13

### Added
- **Initial Release**: Complete delivery scheduling system with Shopify integration
- **Version Management**: Implemented semantic versioning starting from v1.0.0
- **Shopify API Integration**: Added comprehensive Shopify API utilities and components
- **Backend Infrastructure**: Complete backend setup with deployment configuration
- **Core Features**: Basic delivery scheduling functionality

### Technical
- Full-stack application with modern React frontend
- Comprehensive API integration with Shopify
- Production-ready deployment configuration 