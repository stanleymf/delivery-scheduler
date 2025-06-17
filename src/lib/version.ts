export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: string[];
}

export const VERSION_CONFIG: VersionInfo = {
  version: "1.17.0",
  buildNumber: "1.17.0.0",
  releaseDate: new Date().toISOString().split('T')[0],
  changelog: [
    "Initial release of Delivery Scheduler",
    "Admin dashboard with delivery area management",
    "Time slot configuration",
    "Express delivery settings",
    "Availability calendar",
    "Product management integration",
    "Live preview functionality",
    "Settings and theme customization",
    "Shopify API integration",
    "Customer widget component",
    "Postal code reference system for Singapore and Malaysia",
    "Enhanced delivery area management with postal code lookup",
    "Fixed postal code filtering and display issues",
    "Comprehensive Singapore postal code coverage including all major towns and central areas",
    "Bulk postal code blocking functionality with comma-separated input",
    "Availability calendar with date range blocking and bulk date management",
    "Blocked dates management with reason tracking and range grouping",
    "Blocked date ranges editing functionality with full management capabilities",
    "Future dates blocking logic based on configurable order limit settings",
    "Updated Future Dates button label for better clarity and user experience",
    "Fixed year/month view functionality in availability calendar with proper multi-month display",
    "Replaced dropdown with clickable month header for intuitive year selection navigation",
    "Implemented URL routing with React Router DOM for bookmarkable pages",
    "Added bulk day selection for timeslots with convenient preset buttons",
    "Enhanced Shopify integration with persistent credential storage",
    "Added comprehensive webhook management with Railway deployment support",
    "Implemented real-time widget synchronization between admin dashboard and customer widget",
    "Added public API endpoints for widget data access without authentication",
    "Enhanced customer widget (v1.3.0) with complete sync capabilities",
    "Added widget sync status indicators and comprehensive integration documentation",
    "Implemented server-side data persistence for admin dashboard configurations",
    "Added data migration system for localStorage to server storage transition",
    "Added sync status dashboard with manual sync controls and cross-device synchronization",
    "Fixed LivePreview white screen error caused by undefined tagMapping properties",
    "Enhanced settings validation and data integrity with comprehensive safety checks",
    "Implemented comprehensive auto-save functionality with intelligent debouncing and visual feedback",
    "Added auto-save to TimeSlots, AvailabilityCalendar, and Settings components",
    "Created auto-save utility library with React hooks and status indicators",
    "Enhanced user experience with automatic background saving and sync to Widget KV storage"
  ]
};

export const VERSION_RULES = {
  MAJOR: "Breaking changes, incompatible API changes",
  MINOR: "New features, backward compatible",
  PATCH: "Bug fixes, backward compatible",
  PRE_RELEASE: "Alpha, beta, or release candidate versions"
};

export function getVersionInfo(): VersionInfo {
  return VERSION_CONFIG;
}

export function formatVersion(version: string): string {
  return `v${version}`;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

export const APP_VERSION = '1.17.0';

export const VERSION = '1.17.0';

export const CHANGELOG = [
  {
    version: '1.17.0',
    date: '2024-12-21',
    type: 'feature' as const,
    title: 'Auto-Save Functionality',
    description: 'Comprehensive auto-save system eliminates manual saving requirements',
    changes: [
      '💾 **Smart Auto-Save** - Changes automatically saved 1.5 seconds after editing stops',
      '🔄 **Real-time Sync** - All changes instantly synced to Widget KV storage',
      '📊 **Visual Feedback** - Auto-save status indicators show current save state',
      '⏰ **Time Slots Auto-Save** - Auto-saves when creating, editing, or deleting time slots',
      '📅 **Calendar Auto-Save** - Auto-saves blocked dates, date ranges, and settings',
      '⚙️ **Settings Auto-Save** - Auto-saves collection locations and theme preferences',
      '🎯 **Intelligent Logic** - Only saves when actual changes are detected',
      '🚫 **Duplicate Prevention** - Smart debouncing prevents excessive save attempts',
      '🔧 **Enhanced UX** - No manual save buttons needed, peace of mind workflow'
    ],
    technical: [
      'Created comprehensive auto-save utility library (src/lib/autoSave.ts)',
      'Added useAutoSave React hook for easy component integration',
      'Built AutoSaveIndicator component for consistent UI feedback',
      'Enhanced TimeSlots, AvailabilityCalendar, and Settings with auto-save',
      'Implemented intelligent change detection and debouncing',
      'Added toast notifications and error recovery mechanisms'
    ]
  },
  {
    version: '1.9.2',
    date: '2024-06-15',
    type: 'fix' as const,
    title: 'Enhanced Data Persistence for Railway',
    description: 'Comprehensive data persistence improvements to prevent data loss on Railway deployments',
    changes: [
      '🔒 **Enhanced Environment Variable Support** - Improved loading from Railway environment variables',
      '📊 **Enhanced Deployment Logging** - Better visibility into data loading and persistence status',
      '💾 **Automatic Backup Improvements** - Enhanced periodic data backup every 5 minutes',
      '📋 **Persistence Command Logging** - Clear instructions for setting up environment variables',
      '🔄 **Session Persistence** - Added environment variable support for login sessions',
      '📖 **Setup Documentation** - Comprehensive Railway persistence setup guide',
      '⚡ **Graceful Shutdown** - Improved data saving on application shutdown',
      '🛡️ **Data Recovery** - Clear recovery steps for lost data scenarios'
    ],
    technical: [
      'Added loadSessionsFromEnv() function for session persistence',
      'Enhanced logging for all persistence operations',
      'Created RAILWAY_PERSISTENCE_SETUP.md documentation',
      'Improved error handling for environment variable loading',
      'Added comprehensive environment status logging on startup',
      'Enhanced graceful shutdown handlers for data preservation'
    ]
  },
  {
    version: '1.9.1',
    date: '2024-06-15',
    type: 'fix' as const,
    title: 'Widget Stability & Express Fee Cleanup',
    description: 'Reverted problematic express fee display code to restore widget stability',
    changes: [
      '🔧 **Widget Error Resolution** - Fixed "ReferenceError: slot is not defined" in Cloudflare Worker',
      '🧹 **Code Cleanup** - Removed problematic express fee display code from widget',
      '✅ **Stable Operation** - Restored reliable widget functionality',
      '🔄 **Template Literal Fix** - Resolved nested template literal syntax issues',
      '📱 **Widget Deployment** - Successful Cloudflare Worker deployment',
      '🎯 **Core Functionality** - Maintained essential delivery scheduling features'
    ],
    technical: [
      'Removed complex fee display logic from widget JavaScript',
      'Simplified timeslot option rendering',
      'Cleaned up delivery summary generation',
      'Removed fee calculation from cart integration',
      'Restored basic widget operation without fee complications'
    ]
  },
  {
    version: '1.8.0',
    date: '2024-06-14',
    type: 'feature' as const,
    title: 'Account Management System',
    description: 'Complete account management functionality with security features',
    changes: [
      '🔐 **Account Management Dashboard** - Comprehensive account settings interface',
      '🔑 **Password Management** - Change password with current password verification',
      '📧 **Email Management** - Update email address with validation',
      '👤 **Username Management** - Change username with data migration',
      '🗑️ **Account Deletion** - Secure account deletion with confirmation',
      '👁️ **Password Visibility** - Toggle password visibility in forms',
      '✅ **Form Validation** - Client and server-side validation for all forms',
      '🔒 **Security Features** - Password requirements and confirmation dialogs',
      '📱 **Responsive Design** - Mobile-friendly account management interface',
      '🔄 **Session Management** - Proper session handling for username changes'
    ],
    technical: [
      'Added 5 new account management API endpoints',
      'Created comprehensive AccountManagement React component',
      'Implemented proper form validation and error handling',
      'Added account management to navigation and routing',
      'Enhanced security with password verification for sensitive operations',
      'Added data migration for username changes',
      'Implemented proper session invalidation and renewal'
    ]
  },
  {
    version: '1.7.1',
    date: '2024-06-14',
    type: 'fix' as const,
    title: 'Server Data Persistence & LivePreview Fixes',
    description: 'Fixed server data persistence and LivePreview white screen issues',
    changes: [
      '💾 **Server Data Persistence** - All configurations now properly saved to server',
      '🔄 **Data Migration Tools** - One-click migration from localStorage to server',
      '📊 **Sync Status Monitoring** - Real-time sync status with manual controls',
      '🖥️ **LivePreview Fix** - Resolved white screen error with tagMapping validation',
      '⚡ **Enhanced Settings Validation** - Comprehensive settings structure validation',
      '🔧 **Improved Error Handling** - Better error handling for incomplete data'
    ],
    technical: [
      'Added /api/user/migrate endpoint for localStorage migration',
      'Added /api/user/sync endpoint for manual sync triggers',
      'Enhanced loadSettings() with comprehensive validation',
      'Fixed tagMapping undefined errors in LivePreview',
      'Added SyncStatus component to Settings page',
      'Implemented optional chaining for all tagMapping access'
    ]
  },
  {
    version: '1.9.0',
    date: '2024-12-19',
    type: 'feature' as const,
    title: 'Express Delivery Fees',
    description: 'Added comprehensive fee system for express delivery timeslots',
    changes: [
      'Added fee field to Timeslot interface for express delivery charges',
      'Updated Express component with fee input field and validation',
      'Enhanced widget to display express fees in timeslot options',
      'Added fee calculation and display in delivery summary',
      'Updated cart integration to include express fee information',
      'Added fee badges and visual indicators for express timeslots',
      'Implemented total fee calculation for cart integration',
      'Updated mock data with sample express delivery fees'
    ],
    technical: [
      'Extended Timeslot interface with optional fee property',
      'Enhanced Express.tsx component with DollarSign icon and fee input',
      'Updated widget JavaScript to handle fee display and calculation',
      'Modified public API endpoints to include fee data',
      'Added fee validation and formatting throughout the system'
    ]
  },
  {
    version: '1.9.1',
    date: '2024-12-19',
    type: 'fix' as const,
    title: 'Widget Stability Fix',
    description: 'Fixed widget deployment issues and ensured stable operation',
    changes: [
      'Fixed template literal syntax errors in widget JavaScript',
      'Restored widget functionality and deployment stability',
      'Express fees functionality available in admin dashboard',
      'Widget infrastructure ready for fee display implementation'
    ],
    technical: [
      'Resolved template literal scope issues in Cloudflare Worker',
      'Reverted to stable widget codebase',
      'Maintained admin dashboard express fee functionality',
      'Prepared foundation for future widget fee integration'
    ]
  },
]; 