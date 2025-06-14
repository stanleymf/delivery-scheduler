import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { mockTimeslots, type Timeslot, formatTimeRange, getDayName, loadTimeslots, saveTimeslots } from "@/lib/mockData";

export function Express() {
  const [expressSlots, setExpressSlots] = useState<Timeslot[]>(() => {
    const savedTimeslots = loadTimeslots();
    return savedTimeslots.filter(slot => slot.type === 'express');
  });
  const [globalSlots, setGlobalSlots] = useState<Timeslot[]>(() => {
    const savedTimeslots = loadTimeslots();
    return savedTimeslots.filter(slot => slot.type === 'delivery');
  });

  // Update globalSlots when localStorage changes (e.g., from TimeSlots component)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTimeslots = loadTimeslots();
      setGlobalSlots(savedTimeslots.filter(slot => slot.type === 'delivery'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Timeslot | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    maxOrders: "",
    cutoffTime: "",
    cutoffDay: "same" as "same" | "previous",
    assignedDays: [] as string[],
    parentTimeslotId: ""
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      maxOrders: "",
      cutoffTime: "",
      cutoffDay: "same",
      assignedDays: [],
      parentTimeslotId: ""
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
      maxOrders: slot.maxOrders.toString(),
      cutoffTime: slot.cutoffTime,
      cutoffDay: slot.cutoffDay,
      assignedDays: slot.assignedDays,
      parentTimeslotId: slot.parentTimeslotId || ""
    });
    setEditingSlot(slot);
    setIsCreateDialogOpen(true);
  };

  const isTimeWithinParent = (startTime: string, endTime: string, parentId: string): boolean => {
    const parent = globalSlots.find(slot => slot.id === parentId);
    if (!parent) return false;

    const parentStart = parent.startTime;
    const parentEnd = parent.endTime;

    return startTime >= parentStart && endTime <= parentEnd;
  };

  const handleSave = () => {
    const newSlot: Timeslot = {
      id: editingSlot?.id || Date.now().toString(),
      name: formData.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: 'express',
      maxOrders: Number.parseInt(formData.maxOrders),
      cutoffTime: formData.cutoffTime,
      cutoffDay: formData.cutoffDay,
      assignedDays: formData.assignedDays,
      parentTimeslotId: formData.parentTimeslotId
    };

    let updatedExpressSlots: Timeslot[];
    if (editingSlot) {
      updatedExpressSlots = expressSlots.map(slot => slot.id === editingSlot.id ? newSlot : slot);
    } else {
      updatedExpressSlots = [...expressSlots, newSlot];
    }
    
    setExpressSlots(updatedExpressSlots);
    
    // Save to localStorage - need to merge with non-express slots
    const allTimeslots = loadTimeslots();
    const nonExpressSlots = allTimeslots.filter(slot => slot.type !== 'express');
    saveTimeslots([...nonExpressSlots, ...updatedExpressSlots]);

    setIsCreateDialogOpen(false);
    resetForm();
    setEditingSlot(null);
  };

  const handleDelete = (id: string) => {
    const updatedExpressSlots = expressSlots.filter(slot => slot.id !== id);
    setExpressSlots(updatedExpressSlots);
    
    // Save to localStorage - need to merge with non-express slots
    const allTimeslots = loadTimeslots();
    const nonExpressSlots = allTimeslots.filter(slot => slot.type !== 'express');
    saveTimeslots([...nonExpressSlots, ...updatedExpressSlots]);
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

  const getParentSlotName = (parentId: string) => {
    const parent = globalSlots.find(slot => slot.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const isFormValid = () => {
    return formData.name && 
           formData.startTime && 
           formData.endTime && 
           formData.maxOrders && 
           formData.assignedDays.length > 0 && 
           formData.parentTimeslotId &&
           isTimeWithinParent(formData.startTime, formData.endTime, formData.parentTimeslotId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-olive" />
          <div>
            <h1 className="text-2xl font-bold">Express Delivery</h1>
            <p className="text-muted-foreground">Manage express delivery time slots within global delivery windows</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-olive hover:bg-olive/90 text-olive-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Express Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSlot ? 'Edit Express Slot' : 'Create New Express Slot'}</DialogTitle>
              <DialogDescription>
                Configure a new express delivery slot within an existing global delivery timeframe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Express Slot Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Express Morning"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="parentSlot">Parent Delivery Slot</Label>
                  <Select value={formData.parentTimeslotId} onValueChange={(value) => setFormData({...formData, parentTimeslotId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {globalSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.name} ({formatTimeRange(slot.startTime, slot.endTime)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.parentTimeslotId && (
                <div className="p-3 bg-dust/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Express slot must be within: {formatTimeRange(
                      globalSlots.find(s => s.id === formData.parentTimeslotId)?.startTime || "",
                      globalSlots.find(s => s.id === formData.parentTimeslotId)?.endTime || ""
                    )}
                  </p>
                </div>
              )}

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

              {formData.startTime && formData.endTime && formData.parentTimeslotId && 
               !isTimeWithinParent(formData.startTime, formData.endTime, formData.parentTimeslotId) && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Express slot must be within the parent delivery slot timeframe</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxOrders">Maximum Orders</Label>
                  <Input
                    id="maxOrders"
                    type="number"
                    placeholder="e.g., 10"
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
                <div className="grid grid-cols-4 gap-2 mt-2">
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

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isFormValid()}
                  className="bg-olive hover:bg-olive/90 text-olive-foreground"
                >
                  {editingSlot ? 'Update' : 'Create'} Express Slot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Express Delivery Overview
          </CardTitle>
          <CardDescription>
            Express slots are premium delivery windows within existing global delivery slots. They offer faster, more precise delivery times with limited capacity.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Express Time Slots ({expressSlots.length})
          </CardTitle>
          <CardDescription>
            Premium delivery slots with limited capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expressSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{slot.name}</h3>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      ⚡ Express
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeRange(slot.startTime, slot.endTime)} • Max {slot.maxOrders} orders
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Within: {getParentSlotName(slot.parentTimeslotId || "")} • Cut-off: {slot.cutoffTime} ({slot.cutoffDay} day)
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
            {expressSlots.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No express time slots created</p>
            )}
          </div>
        </CardContent>
      </Card>

      {globalSlots.length === 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">No Global Delivery Slots Available</p>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              You need to create global delivery time slots first before you can add express slots.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}