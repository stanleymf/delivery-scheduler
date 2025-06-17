import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { syncToWidget, getWidgetSyncStatus, performFullSync } from '@/utils/api';

interface SyncStatusData {
  success: boolean;
  lastUpdated?: string;
  dataSize?: number;
  timeslotsCount?: number;
  settingsCount?: number;
  error?: string;
}

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getWidgetSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      setSyncStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sync status' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setLastSyncAttempt(new Date().toISOString());
    
    try {
      const result = await performFullSync();
      if (result.success) {
        // Refresh status after successful sync
        await fetchSyncStatus();
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getSyncStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Loading...</Badge>;
    }
    
    if (!syncStatus) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
    
    if (syncStatus.success) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Widget Sync Status
            </CardTitle>
            <CardDescription>
              Dashboard data synchronization with customer widget
            </CardDescription>
          </div>
          {getSyncStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus?.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{syncStatus.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sync Information</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatLastUpdated(syncStatus?.lastUpdated)}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Size:</span>
                <span>{formatFileSize(syncStatus?.dataSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeslots:</span>
                <span>{syncStatus?.timeslotsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Settings:</span>
                <span>{syncStatus?.settingsCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                onClick={handleManualSync} 
                disabled={isSyncing}
                className="w-full"
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              
              <Button 
                onClick={fetchSyncStatus} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>

              <Button 
                asChild
                variant="outline"
                className="w-full"
                size="sm"
              >
                <a 
                  href="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget-docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Widget Docs
                </a>
              </Button>
            </div>
          </div>
        </div>

        {lastSyncAttempt && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Last sync attempt: {formatLastUpdated(lastSyncAttempt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 