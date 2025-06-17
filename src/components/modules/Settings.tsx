import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings as SettingsIcon, Plus, Edit, Trash2, MapPin, Palette, AlertTriangle } from "lucide-react";
import { loadSettings, saveSettings, type CollectionLocation } from "@/lib/mockData";
import { authenticatedFetch } from "@/utils/api";
import { getVersionInfo, formatVersion, VERSION_RULES } from "@/lib/version";
import { TagMappingSettings } from "./TagMappingSettings";
import { SyncStatus } from "./SyncStatus";
import { useAutoSave } from "@/lib/autoSave";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";

export function Settings() {
  const [settings, setSettings] = useState(loadSettings());
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CollectionLocation | null>(null);

  // Auto-save functionality
  const { saveNow, state: autoSaveState } = useAutoSave(
    settings,
    async (updatedSettings: typeof settings) => {
      saveSettings(updatedSettings);
    },
    {
      delay: 1500,
      showToast: true,
      onError: (error) => {
        console.error('Auto-save failed for settings:', error);
      }
    }
  );
  const [locationForm, setLocationForm] = useState({
    name: "",
    address: ""
  });
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const openLocationDialog = (location?: CollectionLocation) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name,
        address: location.address
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        name: "",
        address: ""
      });
    }
    setIsLocationDialogOpen(true);
  };

  const handleSaveLocation = () => {
    if (!locationForm.name || !locationForm.address) return;

    const newLocation: CollectionLocation = {
      id: editingLocation?.id || Date.now().toString(),
      name: locationForm.name,
      address: locationForm.address
    };

    let updatedSettings;
    if (editingLocation) {
      updatedSettings = {
        ...settings,
        collectionLocations: settings.collectionLocations.map(loc => 
          loc.id === editingLocation.id ? newLocation : loc
        )
      };
    } else {
      updatedSettings = {
        ...settings,
        collectionLocations: [...settings.collectionLocations, newLocation]
      };
    }

    setSettings(updatedSettings);
    // Auto-save will trigger automatically due to state change

    setIsLocationDialogOpen(false);
    setEditingLocation(null);
    setLocationForm({ name: "", address: "" });
  };

  const handleDeleteLocation = (id: string) => {
    const updatedSettings = {
      ...settings,
      collectionLocations: settings.collectionLocations.filter(loc => loc.id !== id)
    };
    setSettings(updatedSettings);
    // Auto-save will trigger automatically due to state change
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    const updatedSettings = {
      ...settings,
      theme
    };
    setSettings(updatedSettings);
    // Auto-save will trigger automatically due to state change
  };

  const handleEmergencyReset = async () => {
    if (!confirm('⚠️ EMERGENCY RESET ⚠️\n\nThis will clear ALL server data and force the app to use default settings. This action cannot be undone.\n\nAre you sure you want to proceed?')) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      const response = await authenticatedFetch('/api/user/emergency-reset', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setResetMessage('✅ Emergency reset completed! Please refresh the page to load fresh data.');
        
        // Auto refresh after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setResetMessage('❌ Reset failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Emergency reset error:', error);
      setResetMessage('❌ Reset failed due to network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-olive" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Settings</h1>
            <AutoSaveIndicator state={autoSaveState} variant="badge" />
          </div>
          <p className="text-muted-foreground">Configure collection locations and dashboard preferences • Changes save automatically</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Collection Locations
              </div>
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openLocationDialog()} className="bg-olive hover:bg-olive/90 text-olive-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation ? 'Edit Collection Location' : 'Add Collection Location'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure a physical location where customers can collect their orders.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="locationName">Location Name</Label>
                      <Input
                        id="locationName"
                        placeholder="e.g., Main Store"
                        value={locationForm.name}
                        onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationAddress">Address</Label>
                      <Textarea
                        id="locationAddress"
                        placeholder="e.g., 123 Orchard Road, Singapore 238858"
                        value={locationForm.address}
                        onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveLocation}
                        disabled={!locationForm.name || !locationForm.address}
                        className="bg-olive hover:bg-olive/90 text-olive-foreground"
                      >
                        {editingLocation ? 'Update' : 'Add'} Location
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Manage physical locations where customers can collect their orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.collectionLocations.map((location) => (
                <div key={location.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-olive" />
                      {location.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openLocationDialog(location)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {settings.collectionLocations.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No collection locations configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Dashboard Theme
            </CardTitle>
            <CardDescription>
              Customize the appearance of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-light" className="text-base font-medium">Light Theme</Label>
                  <p className="text-sm text-muted-foreground">Clean and bright interface</p>
                </div>
                <Switch
                  id="theme-light"
                  checked={settings.theme === 'light'}
                  onCheckedChange={() => handleThemeChange('light')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-dark" className="text-base font-medium">Dark Theme</Label>
                  <p className="text-sm text-muted-foreground">Easy on the eyes for extended use</p>
                </div>
                <Switch
                  id="theme-dark"
                  checked={settings.theme === 'dark'}
                  onCheckedChange={() => handleThemeChange('dark')}
                />
              </div>
            </div>

            <div className="p-4 bg-dust/30 rounded-lg">
              <h4 className="font-medium mb-2">🎨 Color Palette</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-olive rounded-full border-2 border-white shadow-sm" />
                  <span className="text-sm">Olive (#616B53)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-dust rounded-full border-2 border-white shadow-sm" />
                  <span className="text-sm">Dust (#E2E5DA)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <TagMappingSettings /> */}

        <SyncStatus />

        <Card>
          <CardHeader>
            <CardTitle>🔧 System Information</CardTitle>
            <CardDescription>
              Current system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dashboard Version</Label>
                <p className="text-sm text-muted-foreground">{formatVersion(getVersionInfo().version)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Build Number</Label>
                <p className="text-sm text-muted-foreground">{getVersionInfo().buildNumber}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Release Date</Label>
                <p className="text-sm text-muted-foreground">{getVersionInfo().releaseDate}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Collection Locations</Label>
                <p className="text-sm text-muted-foreground">{settings.collectionLocations.length} configured</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Theme</Label>
                <p className="text-sm text-muted-foreground capitalize">{settings.theme}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">📋 Version Rules</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Major (X.0.0):</span>
                  <span className="text-muted-foreground">{VERSION_RULES.MAJOR}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Minor (0.X.0):</span>
                  <span className="text-muted-foreground">{VERSION_RULES.MINOR}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Patch (0.0.X):</span>
                  <span className="text-muted-foreground">{VERSION_RULES.PATCH}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛡️ Data & Privacy</CardTitle>
            <CardDescription>
              Information about data handling and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Local Storage:</strong> Settings and preferences are stored locally in your browser
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Shopify Integration:</strong> Product data is synced from your Shopify store via secure API
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Customer Data:</strong> Delivery preferences are securely transmitted to Shopify orders
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Emergency Data Reset
            </CardTitle>
            <CardDescription>
              Use this only if you're experiencing data corruption issues (like white screens or loading errors)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">⚠️ Warning</h4>
              <p className="text-sm text-red-700">
                This will permanently delete all your server data including timeslots, blocked dates, settings, and products. 
                The app will revert to default mock data. This action cannot be undone.
              </p>
            </div>
            
            {resetMessage && (
              <div className={`p-4 rounded-lg ${resetMessage.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm ${resetMessage.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>
                  {resetMessage}
                </p>
              </div>
            )}

            <Button 
              onClick={handleEmergencyReset}
              disabled={isResetting}
              variant="destructive"
              className="w-full"
            >
              {isResetting ? 'Resetting...' : '🚨 Emergency Reset - Clear All Data'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Only use this if TimeSlots or other modules are showing white screens or errors
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}