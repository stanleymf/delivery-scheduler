import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Webhook, Settings as SettingsIcon, Tag } from "lucide-react";
import { ShopifySettings } from "@/components/shopify/ShopifySettings";
import { WebhookManager } from "@/components/shopify/WebhookManager";

export function ShopifyIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Store className="w-6 h-6 text-olive" />
        <div>
          <h1 className="text-2xl font-bold">Shopify Integration</h1>
          <p className="text-muted-foreground">Connect and manage your Shopify store integration</p>
        </div>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store Connection
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Integration Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
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

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure how the delivery scheduler integrates with Shopify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium mb-3">🏷️ Delivery Tags</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Order Processing:</span>
                    <div className="flex gap-2">
                      <code className="px-2 py-1 bg-background rounded text-xs">delivery-scheduled</code>
                      <code className="px-2 py-1 bg-background rounded text-xs">collection-scheduled</code>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Date & Time:</span>
                    <div className="flex gap-2">
                      <code className="px-2 py-1 bg-background rounded text-xs">delivery-date:YYYY-MM-DD</code>
                      <code className="px-2 py-1 bg-background rounded text-xs">delivery-time:HH:MM</code>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Status Updates:</span>
                    <div className="flex gap-2">
                      <code className="px-2 py-1 bg-background rounded text-xs">delivery-confirmed</code>
                      <code className="px-2 py-1 bg-background rounded text-xs">delivery-cancelled</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium mb-3">📋 Integration Features</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Real-time Webhooks:</strong> Receive instant notifications for orders, products, and customer changes
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Secure Authentication:</strong> HMAC signature verification for all webhook payloads
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Delivery Scheduling:</strong> Automatic tagging and processing of delivery preferences
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <strong>Multi-user Support:</strong> User-specific webhook management and credentials
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-dust/30 rounded-lg">
                <h4 className="font-medium mb-2">🔒 Security & Privacy</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• All API credentials are encrypted and stored securely</p>
                  <p>• Webhook payloads are verified using HMAC signatures</p>
                  <p>• User data is isolated and never shared between accounts</p>
                  <p>• Full compliance with Shopify's security requirements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 