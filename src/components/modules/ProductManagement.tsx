import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Calendar, Edit, X, Plus } from "lucide-react";
import { mockProducts, type Product } from "@/lib/mockData";

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");

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

  const productsWithRules = products.filter(p => p.dateRangeStart && p.dateRangeEnd);
  const productsWithoutRules = products.filter(p => !p.dateRangeStart || !p.dateRangeEnd);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return null;
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
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
          <CardTitle className="flex items-center gap-2">
            🛍️ Shopify Integration
          </CardTitle>
          <CardDescription>
            Products are automatically synced from your Shopify store. Apply date range restrictions to limit when customers can order specific products.
          </CardDescription>
        </CardHeader>
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