import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Package, 
  Users, 
  ShoppingCart, 
  Tag, 
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { ShopifyAPI, DELIVERY_TAGS } from "@/lib/shopify";

interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
  isConnected: boolean;
}

export function ShopifyIntegration() {
  const [config, setConfig] = useState<ShopifyConfig>({
    shopDomain: "",
    accessToken: "",
    apiVersion: "2024-01",
    isConnected: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    tags: 0,
  });

  const handleConnect = async () => {
    if (!config.shopDomain || !config.accessToken) {
      setConnectionStatus("error");
      return;
    }

    setIsLoading(true);
    setConnectionStatus("idle");

    try {
      const shopify = new ShopifyAPI(config);
      
      // Test connection by fetching products
      const productsResponse = await shopify.getProducts(1);
      const ordersResponse = await shopify.getOrders(1);
      const customersResponse = await shopify.getCustomers(1);
      const tagsResponse = await shopify.getAllTags();

      setStats({
        products: productsResponse.products.length,
        orders: ordersResponse.orders.length,
        customers: customersResponse.customers.length,
        tags: tagsResponse.tags.length,
      });

      setConfig(prev => ({ ...prev, isConnected: true }));
      setConnectionStatus("success");
    } catch (error) {
      console.error("Shopify connection failed:", error);
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProducts = async () => {
    if (!config.isConnected) return;
    
    setIsLoading(true);
    try {
      const shopify = new ShopifyAPI(config);
      const response = await shopify.getProducts(50);
      // Here you would typically sync products with your local system
      console.log("Synced products:", response.products.length);
    } catch (error) {
      console.error("Product sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    if (!config.isConnected) return;
    
    setIsLoading(true);
    try {
      const shopify = new ShopifyAPI(config);
      const response = await shopify.getOrders(50);
      // Here you would typically sync orders with your local system
      console.log("Synced orders:", response.orders.length);
    } catch (error) {
      console.error("Order sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Connection
              </CardTitle>
              <CardDescription>
                Connect your Shopify store to enable product and order synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopDomain">Shop Domain</Label>
                  <Input
                    id="shopDomain"
                    placeholder="your-store.myshopify.com"
                    value={config.shopDomain}
                    onChange={(e) => setConfig(prev => ({ ...prev, shopDomain: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="shpat_..."
                    value={config.accessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiVersion">API Version</Label>
                <Input
                  id="apiVersion"
                  value={config.apiVersion}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiVersion: e.target.value }))}
                />
              </div>

              {connectionStatus === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully connected to Shopify store
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to connect. Please check your credentials and try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleConnect}
                disabled={isLoading || !config.shopDomain || !config.accessToken}
                className="bg-olive hover:bg-olive/90 text-olive-foreground"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Shopify"
                )}
              </Button>
            </CardContent>
          </Card>

          {config.isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Store Statistics</CardTitle>
                <CardDescription>
                  Current data from your Shopify store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 text-olive" />
                    <div className="text-2xl font-bold">{stats.products}</div>
                    <div className="text-sm text-muted-foreground">Products</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-olive" />
                    <div className="text-2xl font-bold">{stats.orders}</div>
                    <div className="text-sm text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-olive" />
                    <div className="text-2xl font-bold">{stats.customers}</div>
                    <div className="text-sm text-muted-foreground">Customers</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-olive" />
                    <div className="text-2xl font-bold">{stats.tags}</div>
                    <div className="text-sm text-muted-foreground">Tags</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization</CardTitle>
              <CardDescription>
                Sync data between your Shopify store and delivery scheduler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-olive" />
                  <div>
                    <h3 className="font-medium">Products</h3>
                    <p className="text-sm text-muted-foreground">Sync product catalog and availability</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSyncProducts}
                  disabled={!config.isConnected || isLoading}
                  variant="outline"
                >
                  Sync Products
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-olive" />
                  <div>
                    <h3 className="font-medium">Orders</h3>
                    <p className="text-sm text-muted-foreground">Sync order data and delivery preferences</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSyncOrders}
                  disabled={!config.isConnected || isLoading}
                  variant="outline"
                >
                  Sync Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Tags</CardTitle>
              <CardDescription>
                Manage delivery-related tags for products, orders, and customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(DELIVERY_TAGS).map(([key, tag]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{key.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-muted-foreground">{tag}</p>
                    </div>
                    <Badge variant="secondary">{tag}</Badge>
                  </div>
                ))}
              </div>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-sync Products</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync product changes</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-sync Orders</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync new orders</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Apply Delivery Tags</Label>
                  <p className="text-sm text-muted-foreground">Automatically tag orders with delivery preferences</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 