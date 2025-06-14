export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: string[];
}

export const VERSION_CONFIG: VersionInfo = {
  version: "1.7.1",
  buildNumber: "1.7.1.0",
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
    "Enhanced settings validation and data integrity with comprehensive safety checks"
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

export const APP_VERSION = '1.8.0';

export const CHANGELOG = [
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
]; 