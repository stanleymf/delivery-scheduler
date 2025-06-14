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