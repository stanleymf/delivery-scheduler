import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, TestTube, CheckCircle, XCircle, Eye, EyeOff, Store, Key, Globe, Database, RefreshCw } from 'lucide-react';
import { authenticatedFetch, getAuthHeaders } from '@/utils/api';
import { FeeAutomationPanel } from './FeeAutomationPanel';

// Temporary direct API function for Shopify endpoints until deployment updates
const shopifyFetch = async (url: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  const workerUrl = `https://delivery-scheduler-widget.stanleytan92.workers.dev${url}`;
  
  const response = await fetch(workerUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  return response;
};

interface ShopifyCredentials {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
  appSecret: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  shopName?: string;
  plan?: string;
  email?: string;
  lastTested?: string;
}

interface PersistenceStatus {
  fileExists: boolean;
  fileSize: number | null;
  fileModified: string | null;
  totalUsersInMemory: number;
}

export function ShopifySettings() {
  const [credentials, setCredentials] = useState<ShopifyCredentials>({
    shopDomain: '',
    accessToken: '',
    apiVersion: '2024-01',
    appSecret: ''
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false
  });
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingPersistence, setIsCheckingPersistence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isGettingRailwayCommand, setIsGettingRailwayCommand] = useState(false);
  const [railwayCommand, setRailwayCommand] = useState<string | null>(null);

  // Load saved credentials on component mount
  useEffect(() => {
    loadCredentials();
    testConnection();
    checkPersistenceStatus();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await shopifyFetch('/api/shopify/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCredentials(data.credentials);
        }
      }
    } catch (error) {
      console.log('No saved credentials found');
    }
  };

  const checkPersistenceStatus = async () => {
    setIsCheckingPersistence(true);
    try {
      const response = await authenticatedFetch('/api/shopify/debug');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.debug.persistence) {
          setPersistenceStatus(data.debug.persistence);
        }
      }
    } catch (error) {
      console.error('Error checking persistence status:', error);
    } finally {
      setIsCheckingPersistence(false);
    }
  };

  const saveCredentials = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await shopifyFetch('/api/shopify/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Shopify credentials saved successfully and persisted to storage!');
        // Test connection after saving
        await testConnection();
        // Check persistence status
        await checkPersistenceStatus();
      } else {
        setError(data.error || 'Failed to save credentials');
      }
    } catch (error) {
      setError('Error saving credentials');
      console.error('Error saving credentials:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setError(null);

    try {
      const response = await shopifyFetch('/api/shopify/test-connection');
      const data = await response.json();

      if (data.success) {
        setConnectionStatus({
          isConnected: true,
          shopName: data.shopName,
          plan: data.plan,
          email: data.email,
          lastTested: new Date().toISOString()
        });
        setSuccess('Connection test successful!');
      } else {
        setConnectionStatus({ isConnected: false });
        setError(data.error || 'Connection test failed');
      }
    } catch (error) {
      setConnectionStatus({ isConnected: false });
      setError('Error testing connection');
      console.error('Error testing connection:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: keyof ShopifyCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatShopDomain = (domain: string) => {
    if (!domain) return domain;
    // Remove protocol and trailing slash
    return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  const getRailwayCommand = async () => {
    setIsGettingRailwayCommand(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/shopify/railway-env');
      const data = await response.json();

      if (data.success) {
        setRailwayCommand(data.command);
        if (!data.command) {
          setError('No credentials to persist. Save your credentials first.');
        }
      } else {
        setError(data.error || 'Failed to generate Railway command');
      }
    } catch (error) {
      setError('Error generating Railway command');
      console.error('Error generating Railway command:', error);
    } finally {
      setIsGettingRailwayCommand(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Shopify Store Configuration
          </CardTitle>
          <CardDescription>
            Configure your Shopify store credentials to enable webhooks and API integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credentials" className="space-y-4">
            <TabsList>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="status">Connection Status</TabsTrigger>
              <TabsTrigger value="automation">Fee Automation</TabsTrigger>
              <TabsTrigger value="help">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopDomain">Shop Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="shopDomain"
                      type="text"
                      placeholder="your-store.myshopify.com"
                      value={credentials.shopDomain}
                      onChange={(e) => handleInputChange('shopDomain', formatShopDomain(e.target.value))}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Shopify store URL (without https://)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type={showSecrets ? "text" : "password"}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={credentials.accessToken}
                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your Shopify Admin API access token
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appSecret">App Secret</Label>
                  <Input
                    id="appSecret"
                    type={showSecrets ? "text" : "password"}
                    placeholder="your_app_secret"
                    value={credentials.appSecret}
                    onChange={(e) => handleInputChange('appSecret', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your Shopify app secret for webhook verification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiVersion">API Version</Label>
                  <Input
                    id="apiVersion"
                    type="text"
                    value={credentials.apiVersion}
                    onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Shopify API version (default: 2024-01)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={saveCredentials} 
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Credentials
                  </Button>
                  <Button 
                    onClick={testConnection} 
                    disabled={isTesting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test Connection
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={connectionStatus.isConnected ? "default" : "destructive"}>
                    {connectionStatus.isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  {connectionStatus.lastTested && (
                    <span className="text-sm text-muted-foreground">
                      Last tested: {new Date(connectionStatus.lastTested).toLocaleString()}
                    </span>
                  )}
                </div>

                {connectionStatus.isConnected && (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span className="font-medium">{connectionStatus.shopName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{credentials.shopDomain}</span>
                    </div>
                    {connectionStatus.plan && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{connectionStatus.plan}</Badge>
                      </div>
                    )}
                    {connectionStatus.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {connectionStatus.email}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Persistence Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Storage Status
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkPersistenceStatus}
                      disabled={isCheckingPersistence}
                    >
                      {isCheckingPersistence ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {persistenceStatus && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Credentials File:</span>
                        <Badge variant={persistenceStatus.fileExists ? "default" : "destructive"}>
                          {persistenceStatus.fileExists ? "Exists" : "Missing"}
                        </Badge>
                      </div>
                      {persistenceStatus.fileExists && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>File Size:</span>
                            <span className="text-muted-foreground">
                              {persistenceStatus.fileSize ? `${persistenceStatus.fileSize} bytes` : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Last Modified:</span>
                            <span className="text-muted-foreground">
                              {persistenceStatus.fileModified 
                                ? new Date(persistenceStatus.fileModified).toLocaleString()
                                : 'Unknown'
                              }
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Users in Memory:</span>
                        <span className="text-muted-foreground">
                          {persistenceStatus.totalUsersInMemory}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💾 Your credentials are automatically saved to persistent storage and will survive server restarts.
                        The system backs up every 5 minutes and on shutdown.
                      </p>
                    </div>
                    
                    {/* Railway Persistence Helper */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Railway Persistence
                        </h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={getRailwayCommand}
                          disabled={isGettingRailwayCommand}
                          className="text-xs"
                        >
                          {isGettingRailwayCommand ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Get Command"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                        To persist credentials across Railway container restarts, run this command in your terminal:
                      </p>
                      {railwayCommand && (
                        <div className="bg-black/10 dark:bg-white/10 p-2 rounded text-xs font-mono break-all">
                          {railwayCommand}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <FeeAutomationPanel />
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">How to get your Shopify credentials:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to your Shopify Admin → Apps → App and sales channel settings</li>
                    <li>Click "Develop apps" → "Create an app"</li>
                    <li>Configure Admin API scopes (orders, products, customers)</li>
                    <li>Install the app in your store</li>
                    <li>Copy the Admin API access token</li>
                    <li>Note down your app secret for webhook verification</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Required API Scopes:</h4>
                  <div className="grid gap-1 text-sm">
                    <Badge variant="outline">read_orders</Badge>
                    <Badge variant="outline">write_orders</Badge>
                    <Badge variant="outline">read_products</Badge>
                    <Badge variant="outline">read_customers</Badge>
                    <Badge variant="outline">write_webhooks</Badge>
                  </div>
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Note:</strong> Your credentials are encrypted and stored securely. 
                    Never share your access token or app secret with anyone.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 