import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Calendar, Edit, X, Plus, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { mockProducts, type Product } from "@/lib/mockData";

// Extended mock products to simulate Shopify sync
const extendedMockProducts: Product[] = [
  ...mockProducts,
  {
    id: '6',
    title: 'Birthday Celebration Bouquet',
    handle: 'birthday-celebration-bouquet',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&h=300&fit=crop',
  },
  {
    id: '7',
    title: 'Wedding Anniversary Roses',
    handle: 'wedding-anniversary-roses',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop',
  },
  {
    id: '8',
    title: 'Get Well Soon Flowers',
    handle: 'get-well-soon-flowers',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
  },
  {
    id: '9',
    title: 'Corporate Gift Basket',
    handle: 'corporate-gift-basket',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ec2d17d05a?w=300&h=300&fit=crop',
  },
  {
    id: '10',
    title: 'Holiday Season Special',
    handle: 'holiday-season-special',
    image: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=300&h=300&fit=crop',
    dateRangeStart: '2024-12-01',
    dateRangeEnd: '2024-12-31',
  },
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const openRuleDialog = (product: Product) => {
    setSelectedProduct(product);
    setDateRangeStart(product.dateRangeStart || "");
    setDateRangeEnd(product.dateRangeEnd || "");
    setIsRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(product => 
      product.id === selectedProduct.id 
        ? {
            ...product,
            dateRangeStart: dateRangeStart || undefined,
            dateRangeEnd: dateRangeEnd || undefined
          }
        : product
    );

    setProducts(updatedProducts);
    setIsRuleDialogOpen(false);
    setSelectedProduct(null);
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  const handleRemoveRule = (productId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? {
            ...product,
            dateRangeStart: undefined,
            dateRangeEnd: undefined
          }
        : product
    );

    setProducts(updatedProducts);
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      // Simulate API call to Shopify
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful sync with extended products
      setProducts(extendedMockProducts);
      setLastSyncTime(new Date().toLocaleString());
      setSyncStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync products:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const productsWithRules = products.filter(p => p.dateRangeStart && p.dateRangeEnd);
  const productsWithoutRules = products.filter(p => !p.dateRangeStart || !p.dateRangeEnd);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return null;
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const getSyncButtonContent = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Syncing...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Synced Successfully
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
            Sync Failed
          </>
        );
      default:
        return (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Products
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-6 h-6 text-olive" />
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage date-based availability rules for Shopify products</p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🛍️ Shopify Integration
              </CardTitle>
              <CardDescription>
                Sync products from your Shopify store and apply date range restrictions to limit when customers can order specific products.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {lastSyncTime && (
                <div className="text-sm text-muted-foreground">
                  Last synced: {lastSyncTime}
                </div>
              )}
              <Button 
                onClick={handleSyncProducts}
                disabled={isSyncing}
                className={`${
                  syncStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : syncStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-olive hover:bg-olive/90 text-olive-foreground'
                }`}
              >
                {getSyncButtonContent()}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-lg text-blue-600">{products.length}</div>
              <div className="text-muted-foreground">Total Products</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-lg text-amber-600">{productsWithRules.length}</div>
              <div className="text-muted-foreground">With Date Rules</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-lg text-green-600">{productsWithoutRules.length}</div>
              <div className="text-muted-foreground">Always Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Products with Date Restrictions ({productsWithRules.length})
            </CardTitle>
            <CardDescription>
              Products that are only available for ordering within specific date ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsWithRules.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg bg-amber-50/30">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">Handle: {product.handle}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        📅 {formatDateRange(product.dateRangeStart, product.dateRangeEnd)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openRuleDialog(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveRule(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {productsWithRules.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No products have date restrictions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Products ({productsWithoutRules.length})
            </CardTitle>
            <CardDescription>
              Products available for ordering at any time (no date restrictions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsWithoutRules.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">Handle: {product.handle}</p>
                    <Badge variant="secondary">Always Available</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openRuleDialog(product)}
                      className="bg-olive hover:bg-olive/90 text-olive-foreground border-olive"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Date Rule
                    </Button>
                  </div>
                </div>
              ))}
              {productsWithoutRules.length === 0 && (
                <p className="text-muted-foreground text-center py-8">All products have date restrictions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.dateRangeStart ? 'Edit Date Rule' : 'Add Date Rule'}
            </DialogTitle>
            <DialogDescription>
              Set the date range when "{selectedProduct?.title}" can be ordered by customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  min={dateRangeStart}
                />
              </div>
            </div>

            {dateRangeStart && dateRangeEnd && (
              <div className="p-3 bg-dust/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Preview:</strong> Customers will only be able to select delivery/collection dates between{" "}
                  <strong>{new Date(dateRangeStart).toLocaleDateString()}</strong> and{" "}
                  <strong>{new Date(dateRangeEnd).toLocaleDateString()}</strong> when this product is in their cart.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRule}
                disabled={!dateRangeStart || !dateRangeEnd || dateRangeStart >= dateRangeEnd}
                className="bg-olive hover:bg-olive/90 text-olive-foreground"
              >
                {selectedProduct?.dateRangeStart ? 'Update Rule' : 'Add Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}