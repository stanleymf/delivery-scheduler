import React, { useState, useEffect } from 'react';
import { userDataSync } from '@/lib/userDataSync';
import { authenticatedFetch } from '@/utils/api';

interface SyncStatusProps {
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const [syncStatus, setSyncStatus] = useState(userDataSync.getSyncStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string>('');

  useEffect(() => {
    // Update sync status every 5 seconds
    const interval = setInterval(() => {
      setSyncStatus(userDataSync.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsLoading(true);
    setLastSyncResult('');

    try {
      // First try to migrate any localStorage data
      const migrated = await userDataSync.migrateToServer();
      
      // Then force a sync
      const synced = await userDataSync.forcSync();
      
      if (synced) {
        setLastSyncResult('✅ Sync successful');
        setSyncStatus(userDataSync.getSyncStatus());
      } else {
        setLastSyncResult('⚠️ Sync completed with warnings');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      setLastSyncResult('❌ Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateData = async () => {
    setIsLoading(true);
    setLastSyncResult('');

    try {
      const response = await authenticatedFetch('/api/user/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          localStorageData: {
            timeslots: JSON.parse(localStorage.getItem('delivery-scheduler-timeslots') || '[]'),
            blockedDates: JSON.parse(localStorage.getItem('delivery-scheduler-blocked-dates') || '[]'),
            blockedDateRanges: JSON.parse(localStorage.getItem('delivery-scheduler-blocked-date-ranges') || '[]'),
            settings: JSON.parse(localStorage.getItem('delivery-scheduler-settings') || '{}'),
            products: JSON.parse(localStorage.getItem('delivery-scheduler-products') || '[]'),
            blockedCodes: JSON.parse(localStorage.getItem('delivery-scheduler-blocked-codes') || '[]')
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLastSyncResult(`✅ ${result.message}`);
          
          // Update sync status
          userDataSync['updateSyncStatus']({ 
            migrated: true,
            serverAvailable: true,
            lastSync: new Date().toISOString()
          });
          setSyncStatus(userDataSync.getSyncStatus());
          
          // Trigger a sync to get the latest data
          await userDataSync.forcSync();
        } else {
          setLastSyncResult('❌ Migration failed');
        }
      } else {
        setLastSyncResult('❌ Migration request failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      setLastSyncResult('❌ Migration error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.serverAvailable) return 'text-red-600';
    if (!syncStatus.migrated) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (!syncStatus.serverAvailable) return 'Server Unavailable';
    if (!syncStatus.migrated) return 'Migration Needed';
    return 'Synced';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Sync Status</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-opacity-10`}>
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Server Available:</span>
            <span className={`ml-2 ${syncStatus.serverAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {syncStatus.serverAvailable ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Data Migrated:</span>
            <span className={`ml-2 ${syncStatus.migrated ? 'text-green-600' : 'text-yellow-600'}`}>
              {syncStatus.migrated ? '✅ Yes' : '⚠️ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Auto Sync:</span>
            <span className={`ml-2 ${syncStatus.autoSyncEnabled ? 'text-green-600' : 'text-gray-600'}`}>
              {syncStatus.autoSyncEnabled ? '✅ Enabled' : '⏸️ Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Sync:</span>
            <span className="ml-2 text-gray-800">
              {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        {lastSyncResult && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm">{lastSyncResult}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!syncStatus.migrated && (
            <button
              onClick={handleMigrateData}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoading ? 'Migrating...' : 'Migrate Data to Server'}
            </button>
          )}
          
          <button
            onClick={handleManualSync}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Syncing...' : 'Manual Sync'}
          </button>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p><strong>Note:</strong> Your configuration data is now stored on the server and will persist across sessions and devices. Use "Migrate Data to Server" if you have existing configurations in your browser that need to be saved to the server.</p>
        </div>
      </div>
    </div>
  );
}; 