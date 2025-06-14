import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, Edit, Trash2, Truck, Building } from "lucide-react";
import { mockTimeslots, type Timeslot, formatTimeRange, getDayName, loadTimeslots, saveTimeslots } from "@/lib/mockData";

export function TimeSlots() {
  const [timeslots, setTimeslots] = useState<Timeslot[]>(() => {
    const savedTimeslots = loadTimeslots();
    return savedTimeslots.filter(slot => slot.type !== 'express');
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Timeslot | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    type: "delivery" as "delivery" | "collection",
    maxOrders: "",
    cutoffTime: "",
    cutoffDay: "same" as "same" | "previous",
    assignedDays: [] as string[]
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      type: "delivery",
      maxOrders: "",
      cutoffTime: "",
      cutoffDay: "same",
      assignedDays: []
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingSlot(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (slot: Timeslot) => {
    setFormData({
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type as "delivery" | "collection",
      maxOrders: slot.maxOrders.toString(),
      cutoffTime: slot.cutoffTime,
      cutoffDay: slot.cutoffDay,
      assignedDays: slot.assignedDays
    });
    setEditingSlot(slot);
    setIsCreateDialogOpen(true);
  };

  const handleSave = () => {
    const newSlot: Timeslot = {
      id: editingSlot?.id || Date.now().toString(),
      name: formData.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      maxOrders: Number.parseInt(formData.maxOrders),
      cutoffTime: formData.cutoffTime,
      cutoffDay: formData.cutoffDay,
      assignedDays: formData.assignedDays
    };

    let updatedTimeslots: Timeslot[];
    if (editingSlot) {
      updatedTimeslots = timeslots.map(slot => slot.id === editingSlot.id ? newSlot : slot);
    } else {
      updatedTimeslots = [...timeslots, newSlot];
    }
    
    setTimeslots(updatedTimeslots);
    
    // Save to localStorage - need to merge with express slots
    const allTimeslots = loadTimeslots();
    const expressSlots = allTimeslots.filter(slot => slot.type === 'express');
    saveTimeslots([...updatedTimeslots, ...expressSlots]);

    setIsCreateDialogOpen(false);
    resetForm();
    setEditingSlot(null);
  };

  const handleDelete = (id: string) => {
    const updatedTimeslots = timeslots.filter(slot => slot.id !== id);
    setTimeslots(updatedTimeslots);
    
    // Save to localStorage - need to merge with express slots
    const allTimeslots = loadTimeslots();
    const expressSlots = allTimeslots.filter(slot => slot.type === 'express');
    saveTimeslots([...updatedTimeslots, ...expressSlots]);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        assignedDays: [...formData.assignedDays, day]
      });
    } else {
      setFormData({
        ...formData,
        assignedDays: formData.assignedDays.filter(d => d !== day)
      });
    }
  };

  // Bulk day selection functions
  const handleSelectAllDays = () => {
    setFormData({
      ...formData,
      assignedDays: [...days]
    });
  };

  const handleSelectNoDays = () => {
    setFormData({
      ...formData,
      assignedDays: []
    });
  };

  const handleSelectWeekdays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    setFormData({
      ...formData,
      assignedDays: weekdays
    });
  };

  const handleSelectWeekends = () => {
    const weekends = ['saturday', 'sunday'];
    setFormData({
      ...formData,
      assignedDays: weekends
    });
  };

  const deliverySlots = timeslots.filter(slot => slot.type === 'delivery');
  const collectionSlots = timeslots.filter(slot => slot.type === 'collection');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-olive" />
          <div>
            <h1 className="text-2xl font-bold">Time Slots</h1>
            <p className="text-muted-foreground">Manage global delivery and collection time slots</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-olive hover:bg-olive/90 text-olive-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}</DialogTitle>
              <DialogDescription>
                Configure a new time slot for delivery or collection services.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Time Slot Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Delivery"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: "delivery" | "collection") => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">🚚 Delivery</SelectItem>
                      <SelectItem value="collection">🏢 Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxOrders">Maximum Orders</Label>
                  <Input
                    id="maxOrders"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.maxOrders}
                    onChange={(e) => setFormData({...formData, maxOrders: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cutoffTime">Cut-off Time</Label>
                  <Input
                    id="cutoffTime"
                    type="time"
                    value={formData.cutoffTime}
                    onChange={(e) => setFormData({...formData, cutoffTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cutoffDay">Cut-off Day</Label>
                <Select value={formData.cutoffDay} onValueChange={(value: "same" | "previous") => setFormData({...formData, cutoffDay: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same Day</SelectItem>
                    <SelectItem value="previous">Previous Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned Days</Label>
                <div className="space-y-3 mt-2">
                  {/* Bulk selection buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllDays}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectNoDays}
                      className="text-xs"
                    >
                      Select None
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectWeekdays}
                      className="text-xs"
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectWeekends}
                      className="text-xs"
                    >
                      Weekends
                    </Button>
                  </div>
                  
                  {/* Individual day checkboxes */}
                  <div className="grid grid-cols-4 gap-2">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.assignedDays.includes(day)}
                          onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                        />
                        <Label htmlFor={day} className="text-sm">{getDayName(day).slice(0, 3)}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!formData.name || !formData.startTime || !formData.endTime || !formData.maxOrders || formData.assignedDays.length === 0}
                  className="bg-olive hover:bg-olive/90 text-olive-foreground"
                >
                  {editingSlot ? 'Update' : 'Create'} Time Slot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Time Slots ({deliverySlots.length})
            </CardTitle>
            <CardDescription>
              Time slots for delivery services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverySlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{slot.name}</h3>
                      <Badge variant="outline">🚚 Delivery</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRange(slot.startTime, slot.endTime)} • Max {slot.maxOrders} orders
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cut-off: {slot.cutoffTime} ({slot.cutoffDay} day)
                    </p>
                    <div className="flex gap-1">
                      {slot.assignedDays.map((day) => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {getDayName(day).slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(slot)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(slot.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {deliverySlots.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No delivery time slots created</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Collection Time Slots ({collectionSlots.length})
            </CardTitle>
            <CardDescription>
              Time slots for in-store collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{slot.name}</h3>
                      <Badge variant="outline">🏢 Collection</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRange(slot.startTime, slot.endTime)} • Max {slot.maxOrders} orders
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cut-off: {slot.cutoffTime} ({slot.cutoffDay} day)
                    </p>
                    <div className="flex gap-1">
                      {slot.assignedDays.map((day) => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          {getDayName(day).slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(slot)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(slot.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {collectionSlots.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No collection time slots created</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}