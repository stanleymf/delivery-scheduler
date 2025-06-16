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
import { Tag, Settings, Save, RotateCcw, Info, Copy, Eye, Plus, Trash2, Download, Upload, CheckCircle, Zap } from "lucide-react";
import { TagMapping, TagMappingSettings as TagMappingSettingsType } from "@/lib/mockData";
import { loadTagMappingSettings, saveTagMappingSettings } from "@/lib/userDataSync";
import { generateDeliveryTags, getTaggingExamples, type DeliveryData } from "@/lib/enhancedTagging";

// Simplified default mappings for the 3-tag system
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

// Predefined tag templates for simplified system
const tagTemplates = {
  'Simple': {
    prefix: '',
    separator: ',',
    mappings: defaultMappings
  },
  'Prefixed': {
    prefix: 'Delivery-',
    separator: ',',
    mappings: [
      { ...defaultMappings[0], tag: 'Standard' },
      { ...defaultMappings[1], tag: 'Pickup' },
      { ...defaultMappings[2], tag: 'Express' },
      { ...defaultMappings[3] },
      { ...defaultMappings[4] }
    ]
  },
  'Minimal': {
    prefix: '',
    separator: ' ',
    mappings: [
      { ...defaultMappings[0], tag: 'D' },
      { ...defaultMappings[1], tag: 'C' },
      { ...defaultMappings[2], tag: 'E' },
      { ...defaultMappings[3] },
      { ...defaultMappings[4] }
    ]
  }
};

export function TagMappingSettings() {
  const [settings, setSettings] = useState<TagMappingSettingsType>(() => {
    const saved = loadTagMappingSettings();
    return saved || {
      mappings: defaultMappings,
      enableTagging: true,
      prefix: '',
      separator: ','
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearMessages = () => {
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      clearMessages();
      
      saveTagMappingSettings(settings);
      setSuccess('Tag mapping settings saved successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving tag mapping settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      mappings: defaultMappings,
      enableTagging: true,
      prefix: '',
      separator: ','
    });
    clearMessages();
  };

  const applyTemplate = (templateName: keyof typeof tagTemplates) => {
    const template = tagTemplates[templateName];
    setSettings(prev => ({
      ...prev,
      prefix: template.prefix,
      separator: template.separator,
      mappings: template.mappings
    }));
    clearMessages();
  };

  const updateMapping = (id: string, updates: Partial<TagMapping>) => {
    setSettings(prev => ({
      ...prev,
      mappings: prev.mappings.map(mapping =>
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    }));
    clearMessages();
  };

  const updateGlobalSetting = (key: keyof TagMappingSettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    clearMessages();
  };

  // Generate preview tags using the enhanced tagging system
  const generatePreviewTags = (exampleData: DeliveryData): string[] => {
    const tagMappingSettings = {
      deliveryTag: settings.mappings.find(m => m.type === 'delivery')?.tag || 'Delivery',
      collectionTag: settings.mappings.find(m => m.type === 'collection')?.tag || 'Collection',
      expressTag: settings.mappings.find(m => m.type === 'express')?.tag || 'Express',
      enableTagging: settings.enableTagging,
      separator: settings.separator
    };

    return generateDeliveryTags(exampleData, tagMappingSettings);
  };

  const examples = getTaggingExamples();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Tag className="w-6 h-6 text-olive" />
        <div>
          <h1 className="text-2xl font-bold">Order Tag Mapping</h1>
          <p className="text-muted-foreground">Configure how delivery information appears as tags on Shopify orders</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Simplified Tagging Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Simplified 3-Tag System
          </CardTitle>
          <CardDescription>
            Clean, professional tags perfect for Shopify order management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Only 3 essential tags per order:</strong>
              <br />• Delivery Type (Delivery/Collection/Express)
              <br />• Date (dd/mm/yyyy format)  
              <br />• Timeslot (hh:mm-hh:mm format)
              <br /><br />
              <strong>Example:</strong> <code>Delivery, 20/12/2024, 10:00-14:00</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Configure overall tag generation behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Order Tagging</Label>
              <p className="text-sm text-muted-foreground">
                Generate tags automatically when orders are created
              </p>
            </div>
            <Switch
              checked={settings.enableTagging}
              onCheckedChange={(checked) => updateGlobalSetting('enableTagging', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Tag Prefix</Label>
              <Input
                id="prefix"
                placeholder="e.g., Delivery-"
                value={settings.prefix}
                onChange={(e) => updateGlobalSetting('prefix', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional prefix added to all tags
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="separator">Tag Separator</Label>
              <Select 
                value={settings.separator} 
                onValueChange={(value) => updateGlobalSetting('separator', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=" ">Space ( )</SelectItem>
                  <SelectItem value=" | ">Pipe ( | )</SelectItem>
                  <SelectItem value=" • ">Bullet ( • )</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How tags are separated in lists
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>Apply pre-configured tag mapping templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {Object.keys(tagTemplates).map((templateName) => (
              <Button
                key={templateName}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(templateName as keyof typeof tagTemplates)}
              >
                {templateName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Mappings</CardTitle>
          <CardDescription>Customize the text used for each tag type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.mappings.map((mapping) => (
              <div key={mapping.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">{mapping.label}</Label>
                  <p className="text-xs text-muted-foreground">{mapping.description}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`tag-${mapping.id}`}>Tag Text</Label>
                  <Input
                    id={`tag-${mapping.id}`}
                    value={mapping.tag}
                    onChange={(e) => updateMapping(mapping.id, { tag: e.target.value })}
                    placeholder={mapping.type === 'timeslot' ? 'hh:mm-hh:mm' : mapping.type === 'date' ? 'dd/mm/yyyy' : mapping.label}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={mapping.enabled}
                    onCheckedChange={(checked) => updateMapping(mapping.id, { enabled: checked })}
                  />
                  <Label className="text-sm">Enabled</Label>
                </div>

                <div className="flex items-center">
                  <Badge variant={mapping.enabled ? "default" : "secondary"}>
                    {mapping.type.charAt(0).toUpperCase() + mapping.type.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>See how your tag settings will appear on orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.map((example, index) => {
              const previewTags = generatePreviewTags(example.deliveryData);
              return (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{example.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {example.deliveryData.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Generated Tags:</strong>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {settings.enableTagging ? (
                        previewTags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="default" className="text-xs">
                            {settings.prefix}{tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Tagging Disabled
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Order Tag String:</strong> {settings.enableTagging ? previewTags.map(tag => settings.prefix + tag).join(settings.separator) : 'No tags'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        
        <Button onClick={handleSave} disabled={isSaving} className="bg-olive hover:bg-olive/90 text-olive-foreground">
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 