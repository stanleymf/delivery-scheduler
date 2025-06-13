import { useState } from "react";
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
import { Tag, Settings, Save, RotateCcw, Info } from "lucide-react";

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

export function TagMappingSettings() {
  const [settings, setSettings] = useState<TagMappingSettings>({
    mappings: defaultMappings,
    enableTagging: true,
    prefix: '',
    separator: ','
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TagMapping | null>(null);
  const [editForm, setEditForm] = useState({
    label: '',
    tag: '',
    enabled: true,
    description: ''
  });

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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tag Mappings</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefaults}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </Button>
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

              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Example Generated Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-background border rounded-lg">
                    <code className="text-sm">
                      {generateExampleTags()}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is how the tags will appear on Shopify orders based on your current settings.
                  </p>
                </CardContent>
              </Card>
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
    </div>
  );
} 