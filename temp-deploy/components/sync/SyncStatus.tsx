import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Wifi,
  WifiOff,
  Settings,
  Trash2
} from 'lucide-react';
import { userDataSync, type SyncStatus as SyncStatusType } from '@/lib/userDataSync';

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(userDataSync.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Update sync status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(userDataSync.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncMessage('');
    
    try {
      const success = await userDataSync.forcSync();
      setLastSyncAttempt(new Date().toISOString());
      
      if (success) {
        setSyncMessage('✅ Data synced successfully');
      } else {
        setSyncMessage('⚠️ Sync completed with warnings');
      }
      
      // Update status after sync
      setSyncStatus(userDataSync.getSyncStatus());
    } catch (error) {
      setSyncMessage('❌ Sync failed: ' + (error as Error).message);
    } finally {
      setIsManualSyncing(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleToggleAutoSync = () => {
    if (syncStatus.autoSyncEnabled) {
      userDataSync.stopAutoSync();
      setSyncMessage('🔄 Auto-sync disabled');
    } else {
      userDataSync.enableAutoSync();
      setSyncMessage('🔄 Auto-sync enabled');
    }
    
    setSyncStatus(userDataSync.getSyncStatus());
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all user data? This action cannot be undone.')) {
      try {
        const success = await userDataSync.clearAllData();
        if (success) {
          setSyncMessage('🗑️ All data cleared successfully');
          setSyncStatus(userDataSync.getSyncStatus());
        } else {
          setSyncMessage('❌ Failed to clear data');
        }
      } catch (error) {
        setSyncMessage('❌ Error clearing data: ' + (error as Error).message);
      }
      
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (!syncStatus.serverAvailable) return 'destructive';
    if (!syncStatus.migrated) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (!syncStatus.serverAvailable) return <CloudOff className="h-4 w-4" />;
    if (syncStatus.migrated) return <Cloud className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!syncStatus.serverAvailable) return 'Server Offline';
    if (!syncStatus.migrated) return 'Migration Pending';
    return 'Synced';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Synchronization
        </CardTitle>
        <CardDescription>
          Manage data persistence across browser sessions and devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            {syncStatus.autoSyncEnabled ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Auto-sync On
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Auto-sync Off
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={isManualSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
              {isManualSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Sync Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">Last Sync</div>
            <div className="flex items-center gap-1">
              {syncStatus.lastSync ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-yellow-600" />
              )}
              {formatLastSync(syncStatus.lastSync)}
            </div>
          </div>
          
          <div>
            <div className="font-medium text-muted-foreground">Server Status</div>
            <div className="flex items-center gap-1">
              {syncStatus.serverAvailable ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-600" />
              )}
              {syncStatus.serverAvailable ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Sync Message */}
        {syncMessage && (
          <Alert>
            <AlertDescription>{syncMessage}</AlertDescription>
          </Alert>
        )}

        {/* Migration Status */}
        {!syncStatus.migrated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your data will be automatically migrated to the server on next sync. 
              This ensures your settings persist across different browsers and devices.
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAutoSync}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {syncStatus.autoSyncEnabled ? 'Disable Auto-sync' : 'Enable Auto-sync'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Data
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="font-medium mb-1">How it works:</div>
          <ul className="space-y-1">
            <li>• Data is automatically synced between localStorage and server</li>
            <li>• Works across different browsers and incognito mode</li>
            <li>• Auto-sync runs every 30 seconds when enabled</li>
            <li>• Manual sync available anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 