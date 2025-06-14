import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Settings, Ban, Clock, AlertCircle, CalendarRange, Upload, Trash2, CalendarDays, Edit, List } from "lucide-react";
import { mockBlockedDates, mockTimeslots, mockSettings, mockBlockedDateRanges, type BlockedDate, type Timeslot, type BlockedDateRange, formatTimeRange } from "@/lib/mockData";

export function AvailabilityCalendar() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(mockBlockedDates);
  const [blockedDateRanges, setBlockedDateRanges] = useState<BlockedDateRange[]>(mockBlockedDateRanges);
  const [futureOrderLimit, setFutureOrderLimit] = useState(mockSettings.futureOrderLimit);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditRangeDialogOpen, setIsEditRangeDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockedDate | null>(null);
  const [editingRange, setEditingRange] = useState<BlockedDateRange | null>(null);
  const [blockType, setBlockType] = useState<'full' | 'partial'>('full');
  const [selectedTimeslots, setSelectedTimeslots] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [blockReason, setBlockReason] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Date range blocking state
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [bulkDates, setBulkDates] = useState("");
  const [rangeBlockType, setRangeBlockType] = useState<'full' | 'partial'>('full');
  const [rangeSelectedTimeslots, setRangeSelectedTimeslots] = useState<string[]>([]);
  const [rangeReason, setRangeReason] = useState("");

  const timeslots = mockTimeslots;

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date is beyond future order limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureLimitDate = new Date(today);
    futureLimitDate.setDate(today.getDate() + futureOrderLimit);
    
    if (date > futureLimitDate) {
      return true; // Block dates beyond future order limit
    }
    
    // Check manual blocks
    return blockedDates.some(blocked => blocked.date === dateStr);
  };

  const getDateStatus = (date: Date): 'available' | 'blocked' | 'partial' | 'future-blocked' => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date is beyond future order limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureLimitDate = new Date(today);
    futureLimitDate.setDate(today.getDate() + futureOrderLimit);
    
    if (date > futureLimitDate) {
      return 'future-blocked'; // Special status for future blocked dates
    }
    
    // Check manual blocks
    const blocked = blockedDates.find(b => b.date === dateStr);
    
    if (!blocked) return 'available';
    return blocked.type === 'full' ? 'blocked' : 'partial';
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Check if date is beyond future order limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureLimitDate = new Date(today);
      futureLimitDate.setDate(today.getDate() + futureOrderLimit);
      
      if (date > futureLimitDate) {
        // Don't allow editing future blocked dates
        return;
      }
      
      setIsBlockDialogOpen(true);
    }
  };

  const handleBlockDate = () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingBlock = blockedDates.find(b => b.date === dateStr);

    if (existingBlock) {
      // Update existing block
      setBlockedDates(blockedDates.map(b => 
        b.date === dateStr 
          ? { ...b, type: blockType, blockedTimeslots: blockType === 'partial' ? selectedTimeslots : undefined, reason: blockReason }
          : b
      ));
    } else {
      // Create new block
      const newBlock: BlockedDate = {
        id: Date.now().toString(),
        date: dateStr,
        type: blockType,
        blockedTimeslots: blockType === 'partial' ? selectedTimeslots : undefined,
        reason: blockReason
      };
      setBlockedDates([...blockedDates, newBlock]);
    }

    setIsBlockDialogOpen(false);
    setSelectedDate(undefined);
    setSelectedTimeslots([]);
    setBlockReason("");
  };

  const handleUnblockDate = () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    setBlockedDates(blockedDates.filter(b => b.date !== dateStr));
    setIsBlockDialogOpen(false);
    setSelectedDate(undefined);
  };

  const handleTimeslotToggle = (timeslotId: string) => {
    if (selectedTimeslots.includes(timeslotId)) {
      setSelectedTimeslots(selectedTimeslots.filter(id => id !== timeslotId));
    } else {
      setSelectedTimeslots([...selectedTimeslots, timeslotId]);
    }
  };

  const handleRangeTimeslotToggle = (timeslotId: string) => {
    if (rangeSelectedTimeslots.includes(timeslotId)) {
      setRangeSelectedTimeslots(rangeSelectedTimeslots.filter(id => id !== timeslotId));
    } else {
      setRangeSelectedTimeslots([...rangeSelectedTimeslots, timeslotId]);
    }
  };

  const handleMonthClick = () => {
    console.log('Month clicked! Current viewMode:', viewMode);
    if (viewMode === 'month') {
      setViewMode('year');
    } else {
      setViewMode('month');
    }
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setViewMode('month');
  };

  const getSelectedDateInfo = () => {
    if (!selectedDate) return null;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return blockedDates.find(b => b.date === dateStr);
  };

  const selectedDateInfo = getSelectedDateInfo();

  const modifiers = {
    blocked: (date: Date) => getDateStatus(date) === 'blocked',
    partial: (date: Date) => getDateStatus(date) === 'partial',
    'future-blocked': (date: Date) => getDateStatus(date) === 'future-blocked',
  };

  const modifiersStyles = {
    blocked: { 
      backgroundColor: '#fecaca', 
      color: '#dc2626',
      fontWeight: 'bold'
    },
    partial: { 
      backgroundColor: '#fed7aa', 
      color: '#ea580c',
      fontWeight: 'bold'
    },
    'future-blocked': {
      backgroundColor: '#e5e7eb',
      color: '#6b7280',
      fontWeight: 'normal',
      textDecoration: 'line-through'
    }
  };

  // Date range blocking functions
  const handleBlockDateRange = () => {
    if (!dateRange.from || !dateRange.to) return;

    const rangeId = `range-${Date.now()}`;
    const newBlocks: BlockedDate[] = [];
    const rangeDates: string[] = [];
    const currentDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingBlock = blockedDates.find(b => b.date === dateStr);

      if (!existingBlock) {
        newBlocks.push({
          id: Date.now().toString() + Math.random(),
          date: dateStr,
          type: rangeBlockType,
          blockedTimeslots: rangeBlockType === 'partial' ? rangeSelectedTimeslots : undefined,
          reason: rangeReason,
          rangeId
        });
        rangeDates.push(dateStr);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newBlocks.length > 0) {
      setBlockedDates([...blockedDates, ...newBlocks]);
      
      // Create range record
      const newRange: BlockedDateRange = {
        id: rangeId,
        name: `Date Range ${new Date().toLocaleDateString()}`,
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        type: rangeBlockType,
        blockedTimeslots: rangeBlockType === 'partial' ? rangeSelectedTimeslots : undefined,
        reason: rangeReason,
        createdAt: new Date().toISOString(),
        dates: rangeDates
      };
      
      setBlockedDateRanges([...blockedDateRanges, newRange]);
    }

    // Reset range
    setDateRange({ from: undefined, to: undefined });
    setRangeSelectedTimeslots([]);
    setRangeReason("");
  };

  const handleBulkBlockDates = () => {
    if (!bulkDates.trim()) return;

    // Parse comma-separated dates
    const dateStrings = bulkDates
      .split(',')
      .map(date => date.trim())
      .filter(date => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      });

    const newBlocks: BlockedDate[] = dateStrings
      .map(dateStr => {
        const date = new Date(dateStr);
        const isoDateStr = date.toISOString().split('T')[0];
        const existingBlock = blockedDates.find(b => b.date === isoDateStr);
        
        if (!existingBlock) {
          return {
            id: Date.now().toString() + Math.random(),
            date: isoDateStr,
            type: rangeBlockType,
            blockedTimeslots: rangeBlockType === 'partial' ? rangeSelectedTimeslots : undefined,
            reason: rangeReason
          };
        }
        return null;
      })
      .filter(block => block !== null) as BlockedDate[];

    if (newBlocks.length > 0) {
      setBlockedDates([...blockedDates, ...newBlocks]);
    }

    setBulkDates("");
    setRangeSelectedTimeslots([]);
    setRangeReason("");
  };

  const getValidBulkDates = () => {
    if (!bulkDates.trim()) return [];
    return bulkDates
      .split(',')
      .map(date => date.trim())
      .filter(date => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      })
      .map(dateStr => new Date(dateStr))
      .filter(date => {
        const isoDateStr = date.toISOString().split('T')[0];
        return !blockedDates.some(blocked => blocked.date === isoDateStr);
      });
  };

  const validBulkDates = getValidBulkDates();

  // Calculate range days
  const getRangeDays = () => {
    if (!dateRange.from || !dateRange.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Edit blocked date
  const handleEditBlock = (block: BlockedDate) => {
    setEditingBlock(block);
    setBlockType(block.type);
    setSelectedTimeslots(block.blockedTimeslots || []);
    setBlockReason(block.reason || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingBlock) return;

    setBlockedDates(blockedDates.map(b => 
      b.id === editingBlock.id 
        ? { ...b, type: blockType, blockedTimeslots: blockType === 'partial' ? selectedTimeslots : undefined, reason: blockReason }
        : b
    ));

    setIsEditDialogOpen(false);
    setEditingBlock(null);
    setSelectedTimeslots([]);
    setBlockReason("");
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlockedDates(blockedDates.filter(b => b.id !== blockId));
  };

  const handleDeleteRange = (rangeId: string) => {
    setBlockedDates(blockedDates.filter(b => b.rangeId !== rangeId));
    setBlockedDateRanges(blockedDateRanges.filter(r => r.id !== rangeId));
  };

  // Edit blocked date range
  const handleEditRange = (range: BlockedDateRange) => {
    setEditingRange(range);
    setRangeBlockType(range.type);
    setRangeSelectedTimeslots(range.blockedTimeslots || []);
    setRangeReason(range.reason);
    setIsEditRangeDialogOpen(true);
  };

  const handleSaveRangeEdit = () => {
    if (!editingRange) return;

    // Update the range
    const updatedRange: BlockedDateRange = {
      ...editingRange,
      type: rangeBlockType,
      blockedTimeslots: rangeBlockType === 'partial' ? rangeSelectedTimeslots : undefined,
      reason: rangeReason
    };

    setBlockedDateRanges(blockedDateRanges.map(r => 
      r.id === editingRange.id ? updatedRange : r
    ));

    // Update all individual dates in this range
    setBlockedDates(blockedDates.map(b => 
      b.rangeId === editingRange.id 
        ? { ...b, type: rangeBlockType, blockedTimeslots: rangeBlockType === 'partial' ? rangeSelectedTimeslots : undefined, reason: rangeReason }
        : b
    ));

    setIsEditRangeDialogOpen(false);
    setEditingRange(null);
    setRangeSelectedTimeslots([]);
    setRangeReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-olive" />
          <div>
            <h1 className="text-2xl font-bold">Availability Calendar</h1>
            <p className="text-muted-foreground">Manage service availability and blocked dates</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Future Dates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calendar Settings</DialogTitle>
                <DialogDescription>
                  Configure calendar behavior and future order limits. Changes take effect immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="futureLimit">Future Order Limit (days)</Label>
                  <Input
                    id="futureLimit"
                    type="number"
                    value={futureOrderLimit}
                    onChange={(e) => setFutureOrderLimit(Number.parseInt(e.target.value) || 10)}
                    min="1"
                    max="365"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers can order up to {futureOrderLimit} days in advance. 
                    Dates beyond {(() => {
                      const today = new Date();
                      const futureLimitDate = new Date(today);
                      futureLimitDate.setDate(today.getDate() + futureOrderLimit);
                      return futureLimitDate.toLocaleDateString();
                    })()} will be automatically blocked.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleMonthClick}>
            Test: {viewMode === 'month' ? 'Switch to Year' : 'Switch to Month'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">📅 Calendar</TabsTrigger>
          <TabsTrigger value="range">📅 Range Block</TabsTrigger>
          <TabsTrigger value="bulk">📅 Bulk Block</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>📅 Service Calendar</CardTitle>
              <CardDescription>
                Click on any date to block or unblock services. Red dates are fully blocked, orange dates have partial blocks.
              </CardDescription>
            </CardHeader>
            <CardContent>
                  {viewMode === 'month' ? (
                    <div>
                      <div className="mb-4 p-2 border rounded-md bg-muted/30">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              const newDate = new Date(currentMonth);
                              newDate.setMonth(currentMonth.getMonth() - 1);
                              setCurrentMonth(newDate);
                            }}
                            className="p-2 hover:bg-muted rounded-md"
                          >
                            ←
                          </button>
                          <button
                            onClick={handleMonthClick}
                            className="flex-1 text-center font-medium hover:bg-muted/50 rounded-md p-2 transition-colors"
                          >
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </button>
                          <button
                            onClick={() => {
                              const newDate = new Date(currentMonth);
                              newDate.setMonth(currentMonth.getMonth() + 1);
                              setCurrentMonth(newDate);
                            }}
                            className="p-2 hover:bg-muted rounded-md"
                          >
                            →
                          </button>
                        </div>
                      </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        captionLayout="dropdown"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Select Year</h3>
                        <Button variant="outline" size="sm" onClick={handleMonthClick}>
                          Back to Month
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 2 + i;
                          return (
                            <Button
                              key={year}
                              variant="outline"
                              className="h-12"
                              onClick={() => handleYearSelect(year)}
                            >
                              {year}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blocked Dates Management Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    Blocked Dates Management
                  </CardTitle>
                  <CardDescription>
                    Manage all blocked dates with reasons and edit capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Ranges */}
                  {blockedDateRanges.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Date Ranges</Label>
                      <div className="space-y-3">
                        {blockedDateRanges.map((range) => (
                          <div key={range.id} className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{range.name}</h4>
                                  <Badge variant={range.type === 'full' ? 'destructive' : 'secondary'}>
                                    {range.type === 'full' ? 'Full Block' : 'Partial Block'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(range.startDate).toLocaleDateString()} - {new Date(range.endDate).toLocaleDateString()} ({range.dates.length} days)
                                </div>
                                <div className="text-sm">
                                  <strong>Reason:</strong> {range.reason}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Created: {new Date(range.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRange(range)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteRange(range.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Dates */}
                  {blockedDates.filter(b => !b.rangeId).length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Individual Dates</Label>
                      <div className="space-y-2">
                        {blockedDates.filter(b => !b.rangeId).map((block) => (
                          <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{new Date(block.date).toLocaleDateString()}</span>
                                <Badge variant={block.type === 'full' ? 'destructive' : 'secondary'}>
                                  {block.type === 'full' ? 'Full Block' : 'Partial Block'}
                                </Badge>
                              </div>
                              {block.reason && (
                                <div className="text-sm text-muted-foreground">
                                  <strong>Reason:</strong> {block.reason}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBlock(block)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBlock(block.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {blockedDates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No blocked dates</p>
                      <p className="text-sm">Click on calendar dates or use range/bulk blocking to add blocked dates</p>
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Calendar Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded" />
                <span className="text-sm">Partially Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-400 rounded" />
                <span className="text-sm">Fully Blocked</span>
              </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded" style={{ textDecoration: 'line-through' }} />
                    <span className="text-sm">Future Blocked (Beyond {futureOrderLimit} days)</span>
                  </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚙️ Current Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Future Order Limit:</span>
                <Badge variant="outline">{futureOrderLimit} days</Badge>
              </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available Until:</span>
                    <Badge variant="outline">
                      {(() => {
                        const today = new Date();
                        const futureLimitDate = new Date(today);
                        futureLimitDate.setDate(today.getDate() + futureOrderLimit);
                        return futureLimitDate.toLocaleDateString();
                      })()}
                    </Badge>
                  </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Blocked Dates:</span>
                <Badge variant="outline">{blockedDates.length}</Badge>
              </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date Ranges:</span>
                    <Badge variant="outline">{blockedDateRanges.length}</Badge>
                  </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚫 Recent Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blockedDates.slice(0, 5).map((block) => (
                  <div key={block.id} className="flex items-center justify-between text-sm">
                    <span>{new Date(block.date).toLocaleDateString()}</span>
                    <Badge variant={block.type === 'full' ? 'destructive' : 'secondary'}>
                      {block.type === 'full' ? 'Full' : 'Partial'}
                    </Badge>
                  </div>
                ))}
                {blockedDates.length === 0 && (
                  <p className="text-muted-foreground text-sm">No blocked dates</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="range" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5" />
                Block Date Range
              </CardTitle>
              <CardDescription>
                Select a range of dates to block multiple days at once. Perfect for holidays, maintenance periods, or extended closures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Select Date Range</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range)}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Range Summary</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      {dateRange.from && dateRange.to ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">From:</span>
                            <span className="font-medium">{dateRange.from.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">To:</span>
                            <span className="font-medium">{dateRange.to.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Days:</span>
                            <Badge variant="outline">{getRangeDays()} days</Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Select a date range to see details</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Block Type</Label>
                    <Select value={rangeBlockType} onValueChange={(value: 'full' | 'partial') => setRangeBlockType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">🚫 Full Block (All services unavailable)</SelectItem>
                        <SelectItem value="partial">⚠️ Partial Block (Block specific timeslots)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Reason for Blocking</Label>
                    <Input
                      placeholder="e.g., Christmas Holiday, Maintenance, etc."
                      value={rangeReason}
                      onChange={(e) => setRangeReason(e.target.value)}
                    />
                  </div>

                  {rangeBlockType === 'partial' && (
                    <div>
                      <Label className="text-sm font-medium">Select Timeslots to Block</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {timeslots.map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-2">
                            <Switch
                              id={`range-timeslot-${slot.id}`}
                              checked={rangeSelectedTimeslots.includes(slot.id)}
                              onCheckedChange={() => handleRangeTimeslotToggle(slot.id)}
                            />
                            <Label htmlFor={`range-timeslot-${slot.id}`} className="text-sm">
                              {slot.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBlockDateRange}
                    disabled={!dateRange.from || !dateRange.to}
                    className="w-full"
                  >
                    🚫 Block Date Range ({getRangeDays()} days)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Bulk Block Dates
              </CardTitle>
              <CardDescription>
                Block multiple specific dates by entering them as comma-separated values. Perfect for blocking specific holidays or events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
                    <Label className="text-sm font-medium">Enter Dates</Label>
                    <Textarea
                      placeholder="Enter dates as DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD format, separated by commas\nExample: 25/12/2024, 26/12/2024, 01/01/2025"
                      value={bulkDates}
                      onChange={(e) => setBulkDates(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Block Type</Label>
                    <Select value={rangeBlockType} onValueChange={(value: 'full' | 'partial') => setRangeBlockType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">🚫 Full Block (All services unavailable)</SelectItem>
                  <SelectItem value="partial">⚠️ Partial Block (Block specific timeslots)</SelectItem>
                </SelectContent>
              </Select>
            </div>

                  <div>
                    <Label className="text-sm font-medium">Reason for Blocking</Label>
                    <Input
                      placeholder="e.g., Holiday Season, Special Events, etc."
                      value={rangeReason}
                      onChange={(e) => setRangeReason(e.target.value)}
                    />
                  </div>

                  {rangeBlockType === 'partial' && (
                    <div>
                      <Label className="text-sm font-medium">Select Timeslots to Block</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {timeslots.map((slot) => (
                          <div key={slot.id} className="flex items-center space-x-2">
                            <Switch
                              id={`bulk-timeslot-${slot.id}`}
                              checked={rangeSelectedTimeslots.includes(slot.id)}
                              onCheckedChange={() => handleRangeTimeslotToggle(slot.id)}
                            />
                            <Label htmlFor={`bulk-timeslot-${slot.id}`} className="text-sm">
                              {slot.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBulkBlockDates}
                    disabled={!bulkDates.trim()}
                    className="w-full"
                  >
                    🚫 Block {getValidBulkDates().length} Dates
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Valid Dates Found</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50 max-h-48 overflow-y-auto">
                      {getValidBulkDates().length > 0 ? (
                        <div className="space-y-1">
                          {getValidBulkDates().map((date, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{date.toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-xs">
                                {getDateStatus(date) === 'available' ? 'Available' : 
                                 getDateStatus(date) === 'blocked' ? 'Blocked' : 
                                 getDateStatus(date) === 'partial' ? 'Partial' : 'Future Blocked'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No valid dates found</p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p><strong>Note:</strong> Invalid dates will be ignored. Dates beyond the future order limit ({futureOrderLimit} days) will be automatically blocked.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Date Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDateInfo ? 'Edit Blocked Date' : 'Block Date'}
            </DialogTitle>
            <DialogDescription>
              {selectedDateInfo ? 'Modify the blocking settings for this date.' : 'Configure blocking settings for the selected date.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Input
                  id="date"
                  value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="blockType" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select value={blockType} onValueChange={(value: 'full' | 'partial') => setBlockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">🚫 Full Block</SelectItem>
                    <SelectItem value="partial">⚠️ Partial Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <div className="col-span-3">
                <Input
                  id="reason"
                  placeholder="e.g., Holiday, Maintenance, etc."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
            </div>
            {blockType === 'partial' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Timeslots</Label>
                <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                  {timeslots.map((slot) => (
                    <div key={slot.id} className="flex items-center space-x-2">
                      <Switch
                        id={`timeslot-${slot.id}`}
                        checked={selectedTimeslots.includes(slot.id)}
                        onCheckedChange={() => handleTimeslotToggle(slot.id)}
                      />
                      <Label htmlFor={`timeslot-${slot.id}`} className="text-sm">
                        {slot.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                Cancel
              </Button>
            <Button onClick={handleSaveEdit}>
              {selectedDateInfo ? 'Update' : 'Block Date'}
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Range Dialog */}
      <Dialog open={isEditRangeDialogOpen} onOpenChange={setIsEditRangeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Blocked Date Range</DialogTitle>
            <DialogDescription>
              Modify the blocking settings for this date range.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Range</Label>
              <div className="col-span-3">
                <Input
                  value={editingRange ? `${editingRange.startDate} to ${editingRange.endDate}` : ''}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRangeType" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select value={rangeBlockType} onValueChange={(value: 'full' | 'partial') => setRangeBlockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">🚫 Full Block</SelectItem>
                    <SelectItem value="partial">⚠️ Partial Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRangeReason" className="text-right">
                Reason
              </Label>
              <div className="col-span-3">
                <Input
                  id="editRangeReason"
                  placeholder="e.g., Holiday, Maintenance, etc."
                  value={rangeReason}
                  onChange={(e) => setRangeReason(e.target.value)}
                />
              </div>
            </div>
            {rangeBlockType === 'partial' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Timeslots</Label>
                <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                  {timeslots.map((slot) => (
                    <div key={slot.id} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-range-timeslot-${slot.id}`}
                        checked={rangeSelectedTimeslots.includes(slot.id)}
                        onCheckedChange={() => handleRangeTimeslotToggle(slot.id)}
                      />
                      <Label htmlFor={`edit-range-timeslot-${slot.id}`} className="text-sm">
                        {slot.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRangeEdit}>
              Update Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}