import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, DollarSign, Package, Zap } from 'lucide-react';
import { authenticatedFetch } from '@/utils/api';

interface FeeProduct {
  id: string;
  title: string;
  price: string;
  variantId: string;
  feeAmount: number;
  created: string;
  updated: string;
}

interface AutomationStatus {
  totalFeeProducts: number;
  feeProducts: FeeProduct[];
  lastChecked: string;
  error?: string;
}

interface AutomationResults {
  created: Array<{
    feeAmount: number;
    product: any;
    variantId: string;
  }>;
  updated: Array<{
    feeAmount: number;
    product: any;
    variantId: string;
  }>;
  errors: Array<{
    feeAmount: number;
    error: string;
  }>;
  summary: {
    totalFeeAmounts: number;
    productsCreated: number;
    productsUpdated: number;
    errors: number;
    success: boolean;
  };
}

interface UserAutomation {
  lastRun: string;
  results: AutomationResults['summary'];
  triggeredBy: string;
}

export function FeeAutomationPanel() {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [userAutomation, setUserAutomation] = useState<UserAutomation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<AutomationResults | null>(null);

  // Load automation status on component mount
  useEffect(() => {
    loadAutomationStatus();
  }, []);

  const loadAutomationStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/shopify/fee-automation-status');
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        setUserAutomation(data.userAutomation);
      } else {
        setError(data.error || 'Failed to load automation status');
      }
    } catch (error) {
      setError('Error loading automation status');
      console.error('Error loading automation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAutomation = async () => {
    setIsRunningAutomation(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authenticatedFetch('/api/shopify/automate-express-fees', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setSuccess('Fee automation completed successfully!');
        setLastResults(data.results);
        // Reload status to show updated products
        await loadAutomationStatus();
      } else {
        setError(data.error || 'Fee automation failed');
      }
    } catch (error) {
      setError('Error running fee automation');
      console.error('Error running fee automation:', error);
    } finally {
      setIsRunningAutomation(false);
    }
  };

  const cleanupProducts = async () => {
    setIsCleaningUp(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authenticatedFetch('/api/shopify/cleanup-fee-products', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        const { deleted, kept } = data.results;
        setSuccess(`Cleanup completed: ${deleted.length} products deleted, ${kept.length} kept`);
        // Reload status to show updated products
        await loadAutomationStatus();
      } else {
        setError(data.error || 'Cleanup failed');
      }
    } catch (error) {
      setError('Error cleaning up products');
      console.error('Error cleaning up products:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Product Automation</h2>
          <p className="text-muted-foreground">
            Automatically create and manage Shopify fee products for express delivery
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAutomationStatus}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Controls
          </CardTitle>
          <CardDescription>
            Manage fee product creation and cleanup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={runAutomation}
              disabled={isRunningAutomation || isLoading}
              className="flex items-center gap-2"
            >
              {isRunningAutomation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Automation
            </Button>

            <Button
              variant="outline"
              onClick={cleanupProducts}
              disabled={isCleaningUp || isLoading}
              className="flex items-center gap-2"
            >
              {isCleaningUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Cleanup Unused
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• <strong>Run Automation:</strong> Creates fee products for all express timeslots</p>
            <p>• <strong>Cleanup Unused:</strong> Removes fee products no longer needed</p>
            <p>• <strong>Automatic:</strong> Runs automatically when you save express timeslots</p>
          </div>
        </CardContent>
      </Card>

      {/* Automation Status */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {status.totalFeeProducts}
                </div>
                <div className="text-sm text-muted-foreground">Fee Products</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {status.feeProducts.reduce((sum, product) => sum + product.feeAmount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Fee Value</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {status.lastChecked ? formatDate(status.lastChecked) : 'Never'}
                </div>
                <div className="text-sm text-muted-foreground">Last Checked</div>
              </div>
            </div>

            {status.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fee Products List */}
      {status && status.feeProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Products ({status.feeProducts.length})
            </CardTitle>
            <CardDescription>
              Currently active fee products in your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.feeProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Product ID: {product.id} • Variant ID: {product.variantId}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono">
                      {formatCurrency(product.feeAmount)}
                    </Badge>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Created: {formatDate(product.created)}</div>
                      <div>Updated: {formatDate(product.updated)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Automation Run */}
      {userAutomation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Automation Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {userAutomation.results.productsCreated}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Created</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {userAutomation.results.productsUpdated}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Updated</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {userAutomation.results.errors}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {userAutomation.results.totalFeeAmounts}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Fee Types</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={userAutomation.results.success ? "default" : "destructive"}>
                  {userAutomation.results.success ? "Success" : "Failed"}
                </Badge>
                <span className="text-muted-foreground">
                  Triggered by: {userAutomation.triggeredBy.replace('_', ' ')}
                </span>
              </div>
              <div className="text-muted-foreground">
                {formatDate(userAutomation.lastRun)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Results Details */}
      {lastResults && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Automation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastResults.created.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2">
                    Created Products ({lastResults.created.length})
                  </h4>
                  <div className="space-y-2">
                    {lastResults.created.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <span>{item.product.title}</span>
                        <Badge variant="outline">{formatCurrency(item.feeAmount)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastResults.updated.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">
                    Updated Products ({lastResults.updated.length})
                  </h4>
                  <div className="space-y-2">
                    {lastResults.updated.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <span>{item.product.title}</span>
                        <Badge variant="outline">{formatCurrency(item.feeAmount)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">
                    Errors ({lastResults.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {lastResults.errors.map((item, index) => (
                      <div key={index} className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <div className="font-medium">Fee: {formatCurrency(item.feeAmount)}</div>
                        <div className="text-sm text-red-600">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {status && status.feeProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Fee Products Found</h3>
            <p className="text-muted-foreground mb-4">
              Create express timeslots with fees to automatically generate fee products
            </p>
            <Button onClick={runAutomation} disabled={isRunningAutomation}>
              {isRunningAutomation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Automation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 