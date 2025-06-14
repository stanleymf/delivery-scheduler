import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tag, Settings, Save, RotateCcw, Info, Copy, Eye, Plus, Trash2, Download, Upload, CheckCircle } from "lucide-react";

export interface TagMapping {
  id: string;
  type: 'delivery' | 'collection' | 'express' | 'timeslot' | 'date';
  label: string;
  tag: string;
  enabled: boolean;
  description: string;
}

export interface TagMappingSettings {
  mappings: TagMapping[];
  enableTagging: boolean;
  prefix: string;
  separator: string;
}

const defaultMappings: TagMapping[] = [
  {
    id: 'delivery',
    type: 'delivery',
    label: 'Delivery',
    tag: 'Delivery',
    enabled: true,
    description: 'Tag applied when customer selects delivery option'
  },
  {
    id: 'collection',
    type: 'collection',
    label: 'Collection',
    tag: 'Collection',
    enabled: true,
    description: 'Tag applied when customer selects collection option'
  },
  {
    id: 'express',
    type: 'express',
    label: 'Express Delivery',
    tag: 'Express',
    enabled: true,
    description: 'Tag applied when customer selects express delivery'
  },
  {
    id: 'timeslot',
    type: 'timeslot',
    label: 'Timeslot',
    tag: 'hh:mm-hh:mm',
    enabled: true,
    description: 'Tag applied with selected timeslot in 24-hour format'
  },
  {
    id: 'date',
    type: 'date',
    label: 'Selected Date',
    tag: 'dd/mm/yyyy',
    enabled: true,
    description: 'Tag applied with selected delivery date'
  }
];

// Predefined tag templates
const tagTemplates = {
  'Simple': {
    prefix: '',
    separator: ',',
    mappings: defaultMappings
  },
  'Detailed': {
    prefix: 'Delivery-',
    separator: ' | ',
    mappings: [
      {
        id: 'delivery',
        type: 'delivery',
        label: 'Delivery',
        tag: 'Standard Delivery',
        enabled: true,
        description: 'Tag applied when customer selects delivery option'
      },
      {
        id: 'collection',
        type: 'collection',
        label: 'Collection',
        tag: 'Store Pickup',
        enabled: true,
        description: 'Tag applied when customer selects collection option'
      },
      {
        id: 'express',
        type: 'express',
        label: 'Express Delivery',
        tag: 'Express Delivery',
        enabled: true,
        description: 'Tag applied when customer selects express delivery'
      },
      {
        id: 'timeslot',
        type: 'timeslot',
        label: 'Timeslot',
        tag: 'Time: hh:mm-hh:mm',
        enabled: true,
        description: 'Tag applied with selected timeslot in 24-hour format'
      },
      {
        id: 'date',
        type: 'date',
        label: 'Selected Date',
        tag: 'Date: dd/mm/yyyy',
        enabled: true,
        description: 'Tag applied with selected delivery date'
      }
    ]
  },
  'Minimal': {
    prefix: '',
    separator: ' ',
    mappings: [
      {
        id: 'delivery',
        type: 'delivery',
        label: 'Delivery',
        tag: 'D',
        enabled: true,
        description: 'Tag applied when customer selects delivery option'
      },
      {
        id: 'collection',
        type: 'collection',
        label: 'Collection',
        tag: 'C',
        enabled: true,
        description: 'Tag applied when customer selects collection option'
      },
      {
        id: 'express',
        type: 'express',
        label: 'Express Delivery',
        tag: 'E',
        enabled: true,
        description: 'Tag applied when customer selects express delivery'
      },
      {
        id: 'timeslot',
        type: 'timeslot',
        label: 'Timeslot',
        tag: 'hh:mm',
        enabled: true,
        description: 'Tag applied with selected timeslot in 24-hour format'
      },
      {
        id: 'date',
        type: 'date',
        label: 'Selected Date',
        tag: 'dd/mm',
        enabled: true,
        description: 'Tag applied with selected delivery date'
      }
    ]
  }
};

export function TagMappingSettings() {
  const [settings, setSettings] = useState<TagMappingSettings>({
    mappings: defaultMappings,
    enableTagging: true,
    prefix: '',
    separator: ','
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TagMapping | null>(null);
  const [editForm, setEditForm] = useState({
    label: '',
    tag: '',
    enabled: true,
    description: ''
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('tagMappingSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as TagMappingSettings;
        // Validate the parsed data
        if (parsed.mappings && Array.isArray(parsed.mappings)) {
          setSettings(parsed);
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('tagMappingSettings', JSON.stringify(settings));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleEditMapping = (mapping: TagMapping) => {
    setEditingMapping(mapping);
    setEditForm({
      label: mapping.label,
      tag: mapping.tag,
      enabled: mapping.enabled,
      description: mapping.description
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingMapping) return;

    const updatedMappings = settings.mappings.map(mapping =>
      mapping.id === editingMapping.id
        ? { ...mapping, ...editForm }
        : mapping
    );

    setSettings({
      ...settings,
      mappings: updatedMappings
    });

    setIsEditDialogOpen(false);
    setEditingMapping(null);
  };

  const handleResetToDefaults = () => {
    setSettings({
      mappings: defaultMappings,
      enableTagging: true,
      prefix: '',
      separator: ','
    });
  };

  const handleToggleMapping = (mappingId: string) => {
    const updatedMappings = settings.mappings.map(mapping =>
      mapping.id === mappingId
        ? { ...mapping, enabled: !mapping.enabled }
        : mapping
    );

    setSettings({
      ...settings,
      mappings: updatedMappings
    });
  };

  const handleApplyTemplate = (templateName: string) => {
    const template = tagTemplates[templateName as keyof typeof tagTemplates];
    if (template) {
      setSettings({
        mappings: template.mappings as TagMapping[],
        enableTagging: settings.enableTagging,
        prefix: template.prefix,
        separator: template.separator
      });
    }
  };

  const generateExampleTags = () => {
    const enabledMappings = settings.mappings.filter(m => m.enabled);
    const tags = enabledMappings.map(mapping => {
      switch (mapping.type) {
        case 'delivery':
          return mapping.tag;
        case 'collection':
          return mapping.tag;
        case 'express':
          return mapping.tag;
        case 'timeslot':
          return '14:00-16:00';
        case 'date':
          return '25/12/2024';
        default:
          return mapping.tag;
      }
    });

    return tags.join(settings.separator);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tag-mapping-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string) as TagMappingSettings;
          // Validate the imported data
          if (importedSettings.mappings && Array.isArray(importedSettings.mappings)) {
            setSettings(importedSettings);
          }
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getGeneratedTags = () => {
    if (!settings.enableTagging) return 'Tagging is disabled';
    
    const tags = generateExampleTags();
    if (!tags) return 'No tags generated (no enabled mappings)';
    
    return settings.prefix + tags;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Shopify Order Tag Mapping
          </CardTitle>
          <CardDescription>
            Configure how customer selections in the delivery widget are mapped to Shopify order tags.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Order Tagging</Label>
              <p className="text-xs text-muted-foreground">
                Automatically add tags to Shopify orders based on customer selections
              </p>
            </div>
            <Switch
              checked={settings.enableTagging}
              onCheckedChange={(checked) => setSettings({ ...settings, enableTagging: checked })}
            />
          </div>

          {settings.enableTagging && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tag Prefix</Label>
                  <Input
                    placeholder="e.g., Delivery-"
                    value={settings.prefix}
                    onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional prefix for all generated tags
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tag Separator</Label>
                  <Input
                    placeholder=","
                    value={settings.separator}
                    onChange={(e) => setSettings({ ...settings, separator: e.target.value })}
                    maxLength={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Character to separate multiple tags
                  </p>
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Templates</Label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(tagTemplates).map((templateName) => (
                    <Button
                      key={templateName}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(templateName)}
                    >
                      {templateName}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Apply predefined tag templates to quickly set up common configurations
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tag Mappings</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetToDefaults}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {settings.mappings.map((mapping) => (
                    <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={mapping.enabled}
                          onCheckedChange={() => handleToggleMapping(mapping.id)}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">{mapping.label}</Label>
                            <Badge variant="outline" className="text-xs">
                              {mapping.tag}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {mapping.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMapping(mapping)}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-background border rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">
                        {getGeneratedTags()}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(getGeneratedTags())}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is how the tags will appear on Shopify orders based on your current settings.
                  </p>
                </CardContent>
              </Card>

              {/* Import/Export */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSettings}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Settings
                  </Button>
                </div>
                <Button
                  onClick={saveSettings}
                  className="flex items-center gap-2 bg-olive hover:bg-olive/90 text-olive-foreground"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>

              {/* Save Success Message */}
              {showSaveSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Settings saved successfully! Your tag mappings will be applied to new orders.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Mapping Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tag Mapping</DialogTitle>
            <DialogDescription>
              Customize how this selection maps to a Shopify order tag.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <div className="col-span-3">
                <Input
                  id="label"
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag" className="text-right">
                Tag
              </Label>
              <div className="col-span-3">
                <Input
                  id="tag"
                  value={editForm.tag}
                  onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                  placeholder="e.g., Delivery, 14:00-16:00, 25/12/2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Enabled</Label>
              <div className="col-span-3">
                <Switch
                  checked={editForm.enabled}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, enabled: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tag Preview</DialogTitle>
            <DialogDescription>
              See how your tag mappings will work with different customer selections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="delivery" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="collection">Collection</TabsTrigger>
                <TabsTrigger value="express">Express</TabsTrigger>
              </TabsList>
              
              <TabsContent value="delivery" className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">🚚 Standard Delivery</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Date:</strong> 25/12/2024</div>
                    <div><strong>Time:</strong> 14:00-16:00</div>
                    <div><strong>Generated Tags:</strong></div>
                    <code className="block p-2 bg-background rounded text-xs">
                      {settings.prefix}Delivery{settings.separator}25/12/2024{settings.separator}14:00-16:00
                    </code>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="collection" className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">🏢 Store Collection</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Date:</strong> 25/12/2024</div>
                    <div><strong>Time:</strong> 14:00-16:00</div>
                    <div><strong>Generated Tags:</strong></div>
                    <code className="block p-2 bg-background rounded text-xs">
                      {settings.prefix}Collection{settings.separator}25/12/2024{settings.separator}14:00-16:00
                    </code>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="express" className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">⚡ Express Delivery</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Date:</strong> 25/12/2024</div>
                    <div><strong>Time:</strong> 14:00-16:00</div>
                    <div><strong>Generated Tags:</strong></div>
                    <code className="block p-2 bg-background rounded text-xs">
                      {settings.prefix}Express{settings.separator}25/12/2024{settings.separator}14:00-16:00
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 