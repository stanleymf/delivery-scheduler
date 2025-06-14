# Changelog

All notable changes to the Delivery Scheduler project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

---

## Version History

- **v1.8.0** - Account Management System
- **v1.7.1** - Server Data Persistence & LivePreview Fixes  
- **v1.7.0** - Real-time Widget Synchronization
- **v1.6.1** - Initial Release
- **v1.9.0** - Express Delivery Fees

## Deployment Status

- **Admin Dashboard**: https://delivery-schedule2-production.up.railway.app/ ✅
- **Customer Widget**: https://delivery-scheduler-widget.stanleytan92.workers.dev/ ✅
- **Repository**: https://github.com/stanleymf/delivery-scheduler ✅

## Support

For issues, feature requests, or questions, please refer to the project documentation or contact the development team. 