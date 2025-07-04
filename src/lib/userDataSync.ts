import { authenticatedFetch } from '@/utils/api';

// Storage keys for localStorage
const STORAGE_KEYS = {
  TIMESLOTS: 'delivery-scheduler-timeslots',
  BLOCKED_DATES: 'delivery-scheduler-blocked-dates',
  BLOCKED_DATE_RANGES: 'delivery-scheduler-blocked-date-ranges',
  SETTINGS: 'delivery-scheduler-settings',
  PRODUCTS: 'delivery-scheduler-products',
  BLOCKED_CODES: 'delivery-scheduler-blocked-codes',
  TAG_MAPPING_SETTINGS: 'tagMappingSettings',
  SYNC_STATUS: 'delivery-scheduler-sync-status'
};

export interface UserData {
  timeslots: any[];
  blockedDates: any[];
  blockedDateRanges: any[];
  settings: any;
  products: any[];
  blockedCodes: any[];
  tagMappingSettings?: any;
  lastUpdated?: string;
  migratedAt?: string;
}

export interface SyncStatus {
  lastSync: string;
  serverAvailable: boolean;
  migrated: boolean;
  autoSyncEnabled: boolean;
}

class UserDataSyncService {
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    // Don't start auto-sync immediately - wait for authentication
    console.log('UserDataSync service created, waiting for authentication...');
  }

  // Initialize the service after authentication
  initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    console.log('UserDataSync service initialized');
    
    // Start auto-sync after authentication
    this.startAutoSync();
  }

  // Check if service is initialized
  isReady(): boolean {
    return this.isInitialized;
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
      return stored ? JSON.parse(stored) : {
        lastSync: '',
        serverAvailable: false,
        migrated: false,
        autoSyncEnabled: true
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: '',
        serverAvailable: false,
        migrated: false,
        autoSyncEnabled: true
      };
    }
  }

  // Update sync status
  private updateSyncStatus(updates: Partial<SyncStatus>) {
    try {
      const current = this.getSyncStatus();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  // Get all localStorage data
  private getLocalStorageData(): UserData {
    try {
      return {
        timeslots: this.getLocalData(STORAGE_KEYS.TIMESLOTS, []),
        blockedDates: this.getLocalData(STORAGE_KEYS.BLOCKED_DATES, []),
        blockedDateRanges: this.getLocalData(STORAGE_KEYS.BLOCKED_DATE_RANGES, []),
        settings: this.getLocalData(STORAGE_KEYS.SETTINGS, {}),
        products: this.getLocalData(STORAGE_KEYS.PRODUCTS, []),
        blockedCodes: this.getLocalData(STORAGE_KEYS.BLOCKED_CODES, []),
        tagMappingSettings: this.getLocalData(STORAGE_KEYS.TAG_MAPPING_SETTINGS, {
          mappings: [],
          enableTagging: true,
          prefix: '',
          separator: ','
        })
      };
    } catch (error) {
      console.error('Error getting localStorage data:', error);
      return {
        timeslots: [],
        blockedDates: [],
        blockedDateRanges: [],
        settings: {},
        products: [],
        blockedCodes: [],
        tagMappingSettings: {
          mappings: [],
          enableTagging: true,
          prefix: '',
          separator: ','
        }
      };
    }
  }

  // Get specific data from localStorage
  private getLocalData(key: string, defaultValue: any): any {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  // Save data to localStorage
  private saveLocalData(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // Load data from server
  async loadFromServer(): Promise<UserData | null> {
    try {
      const response = await authenticatedFetch('/api/user/data');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          this.updateSyncStatus({ 
            serverAvailable: true,
            lastSync: new Date().toISOString()
          });
          console.log('✅ Loaded data from server:', {
            timeslots: result.data.timeslots?.length || 0,
            blockedDates: result.data.blockedDates?.length || 0,
            settings: Object.keys(result.data.settings || {}).length
          });
          return result.data;
        }
      }
      this.updateSyncStatus({ serverAvailable: false });
      return null;
    } catch (error) {
      console.error('Error loading data from server:', error);
      this.updateSyncStatus({ serverAvailable: false });
      return null;
    }
  }

  // Save data to server (push to Widget KV)
  async saveToServer(data: UserData): Promise<boolean> {
    try {
      console.log('📤 Pushing admin dashboard data to Widget KV storage...', {
        timeslots: data.timeslots?.length || 0,
        blockedDates: data.blockedDates?.length || 0,
        settings: Object.keys(data.settings || {}).length
      });

      const response = await authenticatedFetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userData: data })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.updateSyncStatus({ 
            serverAvailable: true,
            lastSync: new Date().toISOString()
          });
          console.log('✅ Successfully synced to Widget:', result.message);
          return true;
        }
      }
      this.updateSyncStatus({ serverAvailable: false });
      return false;
    } catch (error) {
      console.error('Error saving data to server:', error);
      this.updateSyncStatus({ serverAvailable: false });
      return false;
    }
  }

  // Save specific data type to server
  async saveDataTypeToServer(dataType: string, data: any): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('UserDataSync not initialized, saving locally only');
      return false;
    }

    try {
      const response = await authenticatedFetch(`/api/user/data/${dataType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.updateSyncStatus({ 
            serverAvailable: true,
            lastSync: new Date().toISOString()
          });
          return true;
        }
      }
      this.updateSyncStatus({ serverAvailable: false });
      return false;
    } catch (error) {
      console.error(`Error saving ${dataType} to server:`, error);
      this.updateSyncStatus({ serverAvailable: false });
      return false;
    }
  }

  // Migrate localStorage data to server (one-time)
  async migrateToServer(): Promise<boolean> {
    try {
      const localData = this.getLocalStorageData();
      
      // Check if there's any data to migrate
      const hasData = Object.values(localData).some(value => 
        Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0
      );

      if (!hasData) {
        console.log('No localStorage data to migrate');
        this.updateSyncStatus({ migrated: true });
        return true;
      }

      const response = await authenticatedFetch('/api/user/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ localStorageData: localData })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.updateSyncStatus({ 
            migrated: true,
            serverAvailable: true,
            lastSync: new Date().toISOString()
          });
          console.log('Migration result:', result.message);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error migrating data to server:', error);
      return false;
    }
  }

  // Sync data between localStorage and Widget KV (prioritize push)
  async syncData(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return false;
    }

    this.syncInProgress = true;
    
    try {
      // First, try to migrate if not done yet
      const syncStatus = this.getSyncStatus();
      if (!syncStatus.migrated) {
        await this.migrateToServer();
      }

      // Always push local changes to Widget KV storage
      const localData = this.getLocalStorageData();
      console.log('🔄 Syncing admin dashboard changes to Widget...', {
        timeslots: localData.timeslots?.length || 0,
        blockedDates: localData.blockedDates?.length || 0,
        settings: Object.keys(localData.settings || {}).length
      });

      const saved = await this.saveToServer(localData);
      if (saved) {
        console.log('✅ Local data successfully pushed to Widget KV storage');
        return true;
      } else {
        console.warn('⚠️ Failed to push local data to Widget');
        return false;
      }
      
    } catch (error) {
      console.error('Error during sync:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Start automatic sync every 30 seconds
  startAutoSync() {
    if (!this.isInitialized) {
      console.log('UserDataSync not initialized, skipping auto-sync start');
      return;
    }

    const syncStatus = this.getSyncStatus();
    if (!syncStatus.autoSyncEnabled) return;

    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = setInterval(async () => {
      if (this.isInitialized) {
        await this.syncData();
      }
    }, 30000); // 30 seconds

    // Initial sync with delay
    setTimeout(() => {
      if (this.isInitialized) {
        this.syncData();
      }
    }, 2000); // 2 second delay to allow authentication to complete
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
    this.updateSyncStatus({ autoSyncEnabled: false });
  }

  // Enable automatic sync
  enableAutoSync() {
    this.updateSyncStatus({ autoSyncEnabled: true });
    this.startAutoSync();
  }

  // Manual sync trigger
  async forcSync(): Promise<boolean> {
    return await this.syncData();
  }

  // Clear all data (both local and server)
  async clearAllData(): Promise<boolean> {
    try {
      // Clear server data
      const response = await authenticatedFetch('/api/user/data', {
        method: 'DELETE'
      });

      if (response.ok) {
        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log('All user data cleared');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userDataSync = new UserDataSyncService();

// Import auto sync function
import { autoSyncOnChange } from '@/utils/api';

// Export helper functions with widget auto-sync
export const loadTimeslots = () => userDataSync['getLocalData'](STORAGE_KEYS.TIMESLOTS, []);
export const saveTimeslots = (data: any[]) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.TIMESLOTS, data);
  // Auto-sync to Widget KV when timeslots change
  setTimeout(() => userDataSync.syncData(), 1000);
  autoSyncOnChange('timeslots', data);
};

export const loadBlockedDates = () => userDataSync['getLocalData'](STORAGE_KEYS.BLOCKED_DATES, []);
export const saveBlockedDates = (data: any[]) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.BLOCKED_DATES, data);
  userDataSync.saveDataTypeToServer('blockedDates', data);
  autoSyncOnChange('blockedDates', data);
};

export const loadBlockedDateRanges = () => userDataSync['getLocalData'](STORAGE_KEYS.BLOCKED_DATE_RANGES, []);
export const saveBlockedDateRanges = (data: any[]) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.BLOCKED_DATE_RANGES, data);
  userDataSync.saveDataTypeToServer('blockedDateRanges', data);
  autoSyncOnChange('blockedDateRanges', data);
};

export const loadSettings = () => userDataSync['getLocalData'](STORAGE_KEYS.SETTINGS, {});
export const saveSettings = (data: any) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.SETTINGS, data);
  // Auto-sync to Widget KV when settings change
  setTimeout(() => userDataSync.syncData(), 1000);
  autoSyncOnChange('settings', data);
};

export const loadProducts = () => userDataSync['getLocalData'](STORAGE_KEYS.PRODUCTS, []);
export const saveProducts = (data: any[]) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.PRODUCTS, data);
  userDataSync.saveDataTypeToServer('products', data);
  autoSyncOnChange('products', data);
};

export const loadBlockedCodes = () => userDataSync['getLocalData'](STORAGE_KEYS.BLOCKED_CODES, []);
export const saveBlockedCodes = (data: any[]) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.BLOCKED_CODES, data);
  userDataSync.saveDataTypeToServer('blockedCodes', data);
  autoSyncOnChange('blockedCodes', data);
};

export const loadTagMappingSettings = () => userDataSync['getLocalData'](STORAGE_KEYS.TAG_MAPPING_SETTINGS, {
  mappings: [],
  enableTagging: true,
  prefix: '',
  separator: ','
});
export const saveTagMappingSettings = (data: any) => {
  userDataSync['saveLocalData'](STORAGE_KEYS.TAG_MAPPING_SETTINGS, data);
  userDataSync.saveDataTypeToServer('tagMappingSettings', data);
  autoSyncOnChange('tagMappingSettings', data);
}; 