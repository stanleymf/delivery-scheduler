import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, RefreshCw, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

interface Webhook {
  id: number;
  topic: string;
  address: string;
  format: string;
  created_at: string;
  updated_at: string;
}

interface WebhookRegistrationResult {
  topic: string;
  status: 'success' | 'error' | 'updated' | 'exists';
  webhook?: Webhook;
  error?: string;
}

interface WebhookSummary {
  total: number;
  success: number;
  updated: number;
  exists: number;
  errors: number;
}

// Webhook topic descriptions for better UX
const WEBHOOK_TOPICS = {
  'orders/create': { 
    description: 'New orders created', 
    importance: 'Critical',
    category: 'Orders'
  },
  'orders/updated': { 
    description: 'Orders modified', 
    importance: 'Critical',
    category: 'Orders'
  },
  'orders/cancelled': { 
    description: 'Orders cancelled', 
    importance: 'High',
    category: 'Orders'
  },
  'orders/fulfilled': { 
    description: 'Orders fulfilled', 
    importance: 'High',
    category: 'Orders'
  },
  'orders/partially_fulfilled': { 
    description: 'Orders partially fulfilled', 
    importance: 'Medium',
    category: 'Orders'
  },
  'orders/paid': { 
    description: 'Orders paid', 
    importance: 'High',
    category: 'Orders'
  },
  'products/create': { 
    description: 'New products added', 
    importance: 'Medium',
    category: 'Products'
  },
  'products/update': { 
    description: 'Products modified', 
    importance: 'Medium',
    category: 'Products'
  },
  'products/delete': { 
    description: 'Products deleted', 
    importance: 'Medium',
    category: 'Products'
  },
  'inventory_levels/update': { 
    description: 'Inventory levels changed', 
    importance: 'High',
    category: 'Inventory'
  },
  'customers/create': { 
    description: 'New customers registered', 
    importance: 'Medium',
    category: 'Customers'
  },
  'customers/update': { 
    description: 'Customer information updated', 
    importance: 'Medium',
    category: 'Customers'
  },
  'customers/delete': { 
    description: 'Customers deleted', 
    importance: 'Low',
    category: 'Customers'
  },
  'fulfillments/create': { 
    description: 'Fulfillments created', 
    importance: 'High',
    category: 'Fulfillment'
  },
  'fulfillments/update': { 
    description: 'Fulfillments updated', 
    importance: 'High',
    category: 'Fulfillment'
  },
  'shipping_addresses/update': { 
    description: 'Shipping addresses changed', 
    importance: 'Medium',
    category: 'Shipping'
  },
  'carts/create': { 
    description: 'Shopping carts created', 
    importance: 'Medium',
    category: 'Carts'
  },
  'carts/update': { 
    description: 'Shopping carts updated', 
    importance: 'Medium',
    category: 'Carts'
  },
  'app/uninstalled': { 
    description: 'App uninstalled from store', 
    importance: 'Critical',
    category: 'App'
  },
  'app/subscriptions/update': { 
    description: 'Subscription changes', 
    importance: 'High',
    category: 'App'
  }
};

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResults, setRegistrationResults] = useState<WebhookRegistrationResult[]>([]);
  const [summary, setSummary] = useState<WebhookSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authenticatedFetch('/api/shopify/webhooks');
      const data = await response.json();
      
      if (data.success) {
        setWebhooks(data.webhooks);
      } else {
        setError('Failed to fetch webhooks');
      }
    } catch (error) {
      setError('Error fetching webhooks');
      console.error('Error fetching webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWebhooks = async () => {
    setIsRegistering(true);
    setRegistrationResults([]);
    setSummary(null);
    setError(null);
    
    try {
      const response = await authenticatedFetch('/api/shopify/register-webhooks', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setRegistrationResults(data.results);
        setSummary(data.summary);
        await fetchWebhooks();
      } else {
        setError('Failed to register webhooks');
      }
    } catch (error) {
      setError('Error registering webhooks');
      console.error('Error registering webhooks:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const deleteWebhook = async (webhookId: number) => {
    try {
      const response = await authenticatedFetch(`/api/shopify/webhooks/${webhookId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
      } else {
        setError('Failed to delete webhook');
      }
    } catch (error) {
      setError('Error deleting webhook');
      console.error('Error deleting webhook:', error);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'exists': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Shopify Webhook Manager
          </CardTitle>
          <CardDescription>
            Manage webhooks for your Shopify store. Webhooks allow you to receive real-time notifications when events occur in your store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={registerWebhooks} 
              disabled={isRegistering}
              className="flex items-center gap-2"
            >
              {isRegistering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Register All Webhooks
            </Button>
            <Button 
              onClick={fetchWebhooks} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Results */}
          {registrationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registration Results</CardTitle>
                {summary && (
                  <CardDescription>
                    Total: {summary.total} | Success: {summary.success} | Updated: {summary.updated} | Exists: {summary.exists} | Errors: {summary.errors}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {registrationResults.map((result, index) => {
                    const topicInfo = WEBHOOK_TOPICS[result.topic as keyof typeof WEBHOOK_TOPICS];
                    return (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {result.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                          {result.status === 'updated' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                          {result.status === 'exists' && <Info className="h-4 w-4 text-gray-600" />}
                          <span className="font-medium">{result.topic}</span>
                          {topicInfo && (
                            <Badge className={getImportanceColor(topicInfo.importance)}>
                              {topicInfo.importance}
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Webhook Topics Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Topics Overview</CardTitle>
          <CardDescription>
            All webhook topics that will be registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(WEBHOOK_TOPICS).map(([topic, info]) => {
              const isRegistered = webhooks.some(w => w.topic === topic);
              return (
                <div key={topic} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{info.category}</Badge>
                    <Badge className={getImportanceColor(info.importance)}>
                      {info.importance}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{topic}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isRegistered ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isRegistered ? 'Registered' : 'Not registered'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Registered Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Webhooks</CardTitle>
          <CardDescription>
            {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} currently registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>No webhooks registered. Click "Register All Webhooks" to set up webhook notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => {
                const topicInfo = WEBHOOK_TOPICS[webhook.topic as keyof typeof WEBHOOK_TOPICS];
                return (
                  <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{webhook.topic}</Badge>
                          <Badge variant="outline">{webhook.format}</Badge>
                          {topicInfo && (
                            <Badge className={getImportanceColor(topicInfo.importance)}>
                              {topicInfo.importance}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                          {webhook.address}
                        </p>
                        {topicInfo && (
                          <p className="text-xs text-muted-foreground">
                            {topicInfo.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {formatDate(webhook.created_at)} | 
                      Updated: {formatDate(webhook.updated_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 