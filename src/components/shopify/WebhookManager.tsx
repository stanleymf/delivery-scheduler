import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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
  status: 'success' | 'error';
  webhook?: Webhook;
  error?: string;
}

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResults, setRegistrationResults] = useState<WebhookRegistrationResult[]>([]);
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
    setError(null);
    
    try {
      const response = await authenticatedFetch('/api/shopify/register-webhooks', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setRegistrationResults(data.results);
        // Refresh webhooks list
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
        // Remove from local state
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

  return (
    <div className="space-y-6">
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
              Register Webhooks
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

          {registrationResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Registration Results:</h4>
              {registrationResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono">{result.topic}</span>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  {result.error && (
                    <span className="text-red-600 text-xs">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              No webhooks registered. Click "Register Webhooks" to set up webhook notifications.
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{webhook.topic}</Badge>
                        <Badge variant="outline">{webhook.format}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {webhook.address}
                      </p>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 