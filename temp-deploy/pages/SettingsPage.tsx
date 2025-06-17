import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Store, Webhook } from 'lucide-react';
import { ShopifySettings } from '@/components/shopify/ShopifySettings';
import { WebhookManager } from '@/components/shopify/WebhookManager';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="shopify" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shopify" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Shopify Integration
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shopify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shopify Store Configuration</CardTitle>
              <CardDescription>
                Connect your Shopify store to enable delivery scheduling and webhook notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShopifySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>
                Manage webhooks to receive real-time notifications from your Shopify store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 