import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Eye, Truck, Building, Zap, MapPin, AlertCircle, CheckCircle, Tag, Store, Copy, AlertTriangle, Globe, ChevronDown, ChevronRight, ShoppingCart, Package } from "lucide-react";
import { loadSettings, loadTimeslots, loadBlockedDates, loadBlockedDateRanges, isPostalCodeBlocked, formatTimeRange, type BlockedDate, type BlockedDateRange, type TagMapping } from "@/lib/mockData";
import { format, addDays, startOfDay, isAfter, isBefore } from 'date-fns';
import { saveSettings } from '@/lib/mockData';

type DeliveryType = 'delivery' | 'collection' | 'express';
type WidgetStep = 'type-selection' | 'postal-validation' | 'location-selection' | 'date-selection' | 'timeslot-selection' | 'confirmation';

export function LivePreview() {
  // Load data from localStorage with fallback to mock data
  const mockSettings = loadSettings();
  const mockTimeslots = loadTimeslots();
  const mockBlockedDates = loadBlockedDates();
  const mockBlockedDateRanges = loadBlockedDateRanges();

  const [currentStep, setCurrentStep] = useState<WidgetStep>('type-selection');
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [isPostalValid, setIsPostalValid] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeslot, setSelectedTimeslot] = useState("");

  // Collapsible states for integration instructions
  const [isProductPageOpen, setIsProductPageOpen] = useState(false);
  const [isCartPageOpen, setIsCartPageOpen] = useState(false);

  const collectionLocations = mockSettings.collectionLocations;
  const timeslots = mockTimeslots;

  const handleTypeSelection = (type: DeliveryType) => {
    setSelectedType(type);
    if (type === 'collection') {
      setCurrentStep('location-selection');
    } else {
      setCurrentStep('postal-validation');
    }
  };

  const handlePostalValidation = () => {
    if (postalCode.length === 6 && /^\d{6}$/.test(postalCode)) {
      const isBlocked = isPostalCodeBlocked(postalCode);
      setIsPostalValid(!isBlocked);
      if (!isBlocked) {
        setCurrentStep('date-selection');
      }
    }
  };

  const handleLocationSelection = () => {
    if (selectedLocation) {
      setCurrentStep('date-selection');
    }
  };

  const handleDateSelection = () => {
    if (selectedDate) {
      setCurrentStep('timeslot-selection');
    }
  };

  const handleTimeslotSelection = () => {
    if (selectedTimeslot) {
      setCurrentStep('confirmation');
    }
  };

  const resetWidget = () => {
    setCurrentStep('type-selection');
    setSelectedType(null);
    setPostalCode("");
    setIsPostalValid(null);
    setSelectedLocation("");
    setSelectedDate(undefined);
    setSelectedTimeslot("");
  };

  const getAvailableTimeslots = () => {
    if (!selectedType || !selectedDate) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const baseTimeslots = timeslots.filter(slot => slot.type === selectedType);
    
    // Check for blocked timeslots on this specific date
    const blockedTimeslots = new Set<string>();
    
    // Check individual date blocks
    const blockedDate = mockBlockedDates.find(b => b.date === dateStr);
    if (blockedDate && blockedDate.type === 'partial' && blockedDate.blockedTimeslots) {
      blockedDate.blockedTimeslots.forEach(timeslotId => blockedTimeslots.add(timeslotId));
    }
    
    // Check date range blocks
    const blockedRange = mockBlockedDateRanges.find(range => 
      range.dates.includes(dateStr)
    );
    if (blockedRange && blockedRange.type === 'partial' && blockedRange.blockedTimeslots) {
      blockedRange.blockedTimeslots.forEach(timeslotId => blockedTimeslots.add(timeslotId));
    }
    
    // Filter out blocked timeslots
    return baseTimeslots.filter(slot => !blockedTimeslots.has(slot.id));
  };

  const getDateStatus = (date: Date): 'available' | 'blocked' | 'partial' | 'future-blocked' => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date is beyond future order limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureOrderLimit = mockSettings.futureOrderLimit;
    const futureLimitDate = new Date(today);
    futureLimitDate.setDate(today.getDate() + futureOrderLimit);
    
    if (date > futureLimitDate) {
      return 'future-blocked';
    }
    
    // Check individual date blocks
    const blockedDate = mockBlockedDates.find(b => b.date === dateStr);
    if (blockedDate) {
      return blockedDate.type === 'full' ? 'blocked' : 'partial';
    }
    
    // Check date range blocks
    const blockedRange = mockBlockedDateRanges.find(range => 
      range.dates.includes(dateStr)
    );
    if (blockedRange) {
      return blockedRange.type === 'full' ? 'blocked' : 'partial';
    }
    
    return 'available';
  };

  const calendarModifiers = {
    blocked: (date: Date) => getDateStatus(date) === 'blocked',
    partial: (date: Date) => getDateStatus(date) === 'partial',
    'future-blocked': (date: Date) => getDateStatus(date) === 'future-blocked',
  };

  const calendarModifiersStyles = {
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
      textDecoration: 'line-through'
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    // Check if date is beyond future order limit (30 days by default)
    const futureOrderLimit = mockSettings.futureOrderLimit;
    const futureLimitDate = new Date(today);
    futureLimitDate.setDate(today.getDate() + futureOrderLimit);
    if (date > futureLimitDate) return false;
    
    // Check if date is blocked individually
    const blockedDate = mockBlockedDates.find(b => b.date === dateStr);
    if (blockedDate) {
      // If it's a full block, the date is not available
      if (blockedDate.type === 'full') return false;
      // If it's a partial block, the date is available but some timeslots might be blocked
      // We'll handle this in the timeslot selection
    }
    
    // Check if date is part of a blocked date range
    const blockedRange = mockBlockedDateRanges.find(range => 
      range.dates.includes(dateStr)
    );
    if (blockedRange) {
      // If it's a full block range, the date is not available
      if (blockedRange.type === 'full') return false;
      // If it's a partial block range, the date is available but some timeslots might be blocked
    }
    
    return true;
  };

  const generateOrderTags = (): string[] => {
    if (!mockSettings.tagMapping.enableTagging) return [];
    
    const tags: string[] = [];
    const { mappings, prefix, separator } = mockSettings.tagMapping;
    
    // Generate tags based on customer selections
    mappings.forEach((mapping: TagMapping) => {
      if (!mapping.enabled) return;
      
      let tagValue = '';
      
      switch (mapping.type) {
        case 'delivery':
          if (selectedType === 'delivery') {
            tagValue = mapping.tag;
          }
          break;
        case 'collection':
          if (selectedType === 'collection') {
            tagValue = mapping.tag;
          }
          break;
        case 'express':
          if (selectedType === 'express') {
            tagValue = mapping.tag;
          }
          break;
        case 'timeslot':
          if (selectedTimeslot) {
            const timeslot = timeslots.find(t => t.id === selectedTimeslot);
            if (timeslot) {
              // Format as hh:mm-hh:mm (24-hour format)
              tagValue = `${timeslot.startTime}-${timeslot.endTime}`;
            }
          }
          break;
        case 'date':
          if (selectedDate) {
            // Format as dd/mm/yyyy
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            tagValue = `${day}/${month}/${year}`;
          }
          break;
      }
      
      if (tagValue) {
        tags.push(prefix + tagValue);
      }
    });
    
    return tags;
  };

  const getGeneratedTags = () => {
    const tags = generateOrderTags();
    if (tags.length === 0) return 'No tags generated (tagging disabled)';
    return tags.join(mockSettings.tagMapping.separator);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="w-6 h-6 text-olive" />
        <div>
          <h1 className="text-2xl font-bold">Live Preview</h1>
          <p className="text-muted-foreground">Preview how the customer widget will appear on your Shopify store</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👁️ Customer Widget Preview
              </CardTitle>
              <CardDescription>
                This is how customers will interact with the delivery/collection selector on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 min-h-[500px]">
                {/* Widget Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">🌸 Delivery & Collection</h3>
                  <p className="text-sm text-gray-600">Choose your preferred option</p>
                </div>

                {/* Step 1: Type Selection */}
                {currentStep === 'type-selection' && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <Button
                        variant="outline"
                        className="h-16 flex items-center justify-start gap-3 text-left"
                        onClick={() => handleTypeSelection('delivery')}
                      >
                        <Truck className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium">🚚 Delivery</div>
                          <div className="text-sm text-muted-foreground">We'll deliver to your address</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-16 flex items-center justify-start gap-3 text-left"
                        onClick={() => handleTypeSelection('collection')}
                      >
                        <Building className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="font-medium">🏢 Collection</div>
                          <div className="text-sm text-muted-foreground">Pick up from our store</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-16 flex items-center justify-start gap-3 text-left"
                        onClick={() => handleTypeSelection('express')}
                      >
                        <Zap className="w-6 h-6 text-amber-600" />
                        <div>
                          <div className="font-medium">⚡ Express Delivery</div>
                          <div className="text-sm text-muted-foreground">Fast delivery with premium timing</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Postal Code Validation */}
                {currentStep === 'postal-validation' && (
                  <div className="space-y-4">
                    <Button variant="ghost" onClick={resetWidget} className="mb-4">
                      ← Back
                    </Button>
                    <div>
                      <Label htmlFor="postal">Enter your postal code</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="postal"
                          placeholder="e.g., 018956"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          maxLength={6}
                          className={isPostalValid === false ? "border-red-500" : ""}
                        />
                        <Button 
                          onClick={handlePostalValidation}
                          disabled={postalCode.length !== 6}
                          className="bg-olive hover:bg-olive/90 text-olive-foreground"
                        >
                          Check
                        </Button>
                      </div>
                      {isPostalValid === false && (
                        <div className="flex items-center gap-2 mt-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Sorry, we don't deliver to this postal code</span>
                        </div>
                      )}
                      {isPostalValid === true && (
                        <div className="flex items-center gap-2 mt-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Great! We deliver to your area</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Location Selection */}
                {currentStep === 'location-selection' && (
                  <div className="space-y-4">
                    <Button variant="ghost" onClick={resetWidget} className="mb-4">
                      ← Back
                    </Button>
                    <div>
                      <Label htmlFor="location">Choose collection location</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {collectionLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div>
                                <div className="font-medium">{location.name}</div>
                                <div className="text-sm text-muted-foreground">{location.address}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Show selected location details */}
                      {selectedLocation && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-green-800">
                                {collectionLocations.find(l => l.id === selectedLocation)?.name}
                              </div>
                              <div className="text-sm text-green-700">
                                {collectionLocations.find(l => l.id === selectedLocation)?.address}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedLocation && (
                        <Button 
                          onClick={handleLocationSelection}
                          className="w-full mt-4 bg-olive hover:bg-olive/90 text-olive-foreground"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Date Selection */}
                {currentStep === 'date-selection' && (
                  <div className="space-y-4">
                    <Button variant="ghost" onClick={() => setCurrentStep(selectedType === 'collection' ? 'location-selection' : 'postal-validation')} className="mb-4">
                      ← Back
                    </Button>
                    <div>
                      <Label>Choose your preferred date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => !isDateAvailable(date)}
                        modifiers={calendarModifiers}
                        modifiersStyles={calendarModifiersStyles}
                        className="rounded-md border mt-2"
                      />
                      {selectedDate && (
                        <Button 
                          onClick={handleDateSelection}
                          className="w-full mt-4 bg-olive hover:bg-olive/90 text-olive-foreground"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Timeslot Selection */}
                {currentStep === 'timeslot-selection' && (
                  <div className="space-y-4">
                    <Button variant="ghost" onClick={() => setCurrentStep('date-selection')} className="mb-4">
                      ← Back
                    </Button>
                    <div>
                      <Label>Choose your time slot</Label>
                      <div className="space-y-2 mt-2">
                        {getAvailableTimeslots().map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeslot === slot.id ? "default" : "outline"}
                            className="w-full justify-between h-auto p-4"
                            onClick={() => setSelectedTimeslot(slot.id)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{slot.name}</div>
                              <div className="text-sm opacity-70">{formatTimeRange(slot.startTime, slot.endTime)}</div>
                            </div>
                            <Badge variant="secondary">{slot.maxOrders - 15} slots left</Badge>
                          </Button>
                        ))}
                      </div>
                      {selectedTimeslot && (
                        <Button 
                          onClick={handleTimeslotSelection}
                          className="w-full mt-4 bg-olive hover:bg-olive/90 text-olive-foreground"
                        >
                          Confirm Selection
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Confirmation */}
                {currentStep === 'confirmation' && (
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Selection Complete!</h3>
                      <p className="text-sm text-gray-600 mt-2">Your delivery preferences have been saved</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-left">
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {selectedType === 'delivery' ? '🚚 Delivery' : selectedType === 'collection' ? '🏢 Collection' : '⚡ Express'}</div>
                        {selectedType !== 'collection' && <div><strong>Postal Code:</strong> {postalCode}</div>}
                        {selectedType === 'collection' && (
                          <div>
                          <div><strong>Location:</strong> {collectionLocations.find(l => l.id === selectedLocation)?.name}</div>
                            <div><strong>Address:</strong> {collectionLocations.find(l => l.id === selectedLocation)?.address}</div>
                          </div>
                        )}
                        <div><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</div>
                        <div><strong>Time:</strong> {timeslots.find(t => t.id === selectedTimeslot)?.name}</div>
                      </div>
                    </div>
                    
                    {/* Generated Tags Section */}
                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Shopify Order Tags</span>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <code className="text-sm text-blue-700 break-all">
                          {getGeneratedTags()}
                        </code>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        These tags will be automatically added to the Shopify order
                      </p>
                    </div>
                    
                    <Button 
                      onClick={resetWidget}
                      variant="outline"
                      className="w-full"
                    >
                      Start Over
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔧 Widget Configuration</CardTitle>
              <CardDescription>
                Current settings that affect the widget behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available Services</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">🚚 Delivery ({timeslots.filter(t => t.type === 'delivery').length} slots)</Badge>
                  <Badge variant="outline">🏢 Collection ({timeslots.filter(t => t.type === 'collection').length} slots)</Badge>
                  <Badge variant="outline">⚡ Express ({timeslots.filter(t => t.type === 'express').length} slots)</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Collection Locations</Label>
                <div className="space-y-1">
                  {collectionLocations.map((location) => (
                    <div key={location.id} className="text-sm text-muted-foreground">
                      📍 {location.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Blocked Areas</Label>
                <div className="text-sm text-muted-foreground">
                  Postal codes starting with 01, 02 and specific codes are blocked
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Calendar Legend</Label>
                <div className="space-y-2">
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
                    <span className="text-sm">Future Blocked (Beyond {mockSettings.futureOrderLimit} days)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Blocked Dates</Label>
                <div className="text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div><strong>Individual Blocks:</strong> {mockBlockedDates.length} dates</div>
                    <div><strong>Date Ranges:</strong> {mockBlockedDateRanges.length} ranges</div>
                    <div><strong>Future Order Limit:</strong> {mockSettings.futureOrderLimit} days</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Order Tag Mapping
                </Label>
                <div className="text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div><strong>Tagging Enabled:</strong> {mockSettings.tagMapping.enableTagging ? 'Yes' : 'No'}</div>
                    {mockSettings.tagMapping.enableTagging && (
                      <>
                        <div><strong>Active Mappings:</strong> {mockSettings.tagMapping.mappings.filter(m => m.enabled).length} of {mockSettings.tagMapping.mappings.length}</div>
                        <div><strong>Tag Prefix:</strong> {mockSettings.tagMapping.prefix || 'None'}</div>
                        <div><strong>Tag Separator:</strong> "{mockSettings.tagMapping.separator}"</div>
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <strong>Example Tags:</strong><br />
                          {mockSettings.tagMapping.mappings
                            .filter(m => m.enabled)
                            .map(m => m.tag)
                            .join(mockSettings.tagMapping.separator)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-olive" />
                🚀 Add Widget to Your Shopify Store
              </CardTitle>
              <CardDescription>
                Integrate the delivery scheduler widget that's fully synced with your admin dashboard settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sync Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-800">Widget Sync Status: LIVE</span>
                </div>
                <p className="text-sm text-green-700">
                  Your widget is now fully synced with this admin dashboard. Any changes you make to timeslots, 
                  collection locations, or blocked dates will automatically appear in the customer widget.
                </p>
              </div>

              {/* Prerequisites */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-olive text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h4 className="font-semibold">Prerequisites</h4>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Shopify store with theme editing access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Widget deployed and synced with admin dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Configure your timeslots and settings above</span>
                  </div>
                </div>
              </div>

              {/* Integration Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-olive text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h4 className="font-semibold">Choose Integration Location</h4>
                </div>
                
                {/* Product Page Integration */}
                <div className="ml-8 border rounded-lg">
                  <button
                    onClick={() => setIsProductPageOpen(!isProductPageOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-olive" />
                      <div>
                        <h5 className="font-semibold">Product Page Integration</h5>
                        <p className="text-sm text-muted-foreground">Individual product delivery scheduling</p>
                      </div>
                    </div>
                    {isProductPageOpen ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isProductPageOpen && (
                    <div className="px-4 pb-4 space-y-4 border-t bg-gray-50/50">
                      <div className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Add this code to your product page template (usually <code className="bg-muted px-1 rounded">sections/product-form.liquid</code> or <code className="bg-muted px-1 rounded">templates/product.liquid</code>):
                        </p>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                          <pre>{`<!-- Delivery Scheduler Widget (Synced with Admin Dashboard) -->
<div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}">
</div>

<!-- Widget Script (v1.3.0 - Synced) -->
<script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"></script>`}</pre>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const code = `<!-- Delivery Scheduler Widget (Synced with Admin Dashboard) -->
<div id="delivery-scheduler-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}">
</div>

<!-- Widget Script (v1.3.0 - Synced) -->
<script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"></script>`;
                            navigator.clipboard.writeText(code);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Product Page Code
                        </Button>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h6 className="font-semibold text-blue-800 text-sm mb-2">✨ Features:</h6>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Individual product delivery scheduling with product context</li>
                            <li>• Real-time sync with your admin dashboard settings</li>
                            <li>• Automatic timeslot availability and blocked date handling</li>
                            <li>• Postal code validation for delivery areas</li>
                            <li>• Collection location selection for pickup orders</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Page Integration */}
                <div className="ml-8 border rounded-lg">
                  <button
                    onClick={() => setIsCartPageOpen(!isCartPageOpen)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-olive" />
                      <div>
                        <h5 className="font-semibold">Cart Page Integration</h5>
                        <p className="text-sm text-muted-foreground">Unified delivery for entire cart</p>
                      </div>
                    </div>
                    {isCartPageOpen ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isCartPageOpen && (
                    <div className="px-4 pb-4 space-y-4 border-t bg-gray-50/50">
                      <div className="space-y-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Add this code to your cart page template (usually <code className="bg-muted px-1 rounded">templates/cart.liquid</code> or <code className="bg-muted px-1 rounded">sections/cart-drawer.liquid</code>):
                        </p>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                          <pre>{`<!-- Delivery Scheduler Widget for Cart (Synced with Admin Dashboard) -->
<div id="delivery-scheduler-cart-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-cart-mode="true"
     data-cart-items="{{ cart.items | json | escape }}">
</div>

<!-- Widget Script (v1.3.0 - Synced) -->
<script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"></script>`}</pre>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const code = `<!-- Delivery Scheduler Widget for Cart (Synced with Admin Dashboard) -->
<div id="delivery-scheduler-cart-widget" 
     data-delivery-scheduler 
     data-shop-domain="{{ shop.domain }}"
     data-cart-mode="true"
     data-cart-items="{{ cart.items | json | escape }}">
</div>

<!-- Widget Script (v1.3.0 - Synced) -->
<script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"></script>`;
                            navigator.clipboard.writeText(code);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Cart Page Code
                        </Button>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h6 className="font-semibold text-green-800 text-sm mb-2">✨ Features:</h6>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Unified delivery selection for entire cart contents</li>
                            <li>• Optimized checkout flow with delivery preferences</li>
                            <li>• Real-time sync with admin dashboard configuration</li>
                            <li>• Automatic order tagging for delivery management</li>
                            <li>• Reduces checkout abandonment with clear delivery options</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Testing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-olive text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h4 className="font-semibold">Test Integration</h4>
                </div>
                <div className="ml-8 space-y-3">
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <h6 className="font-semibold text-sm mb-2">🧪 Testing Checklist</h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Visit your chosen page (product or cart) on your Shopify store</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Verify the delivery scheduler widget appears and loads correctly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Test delivery type selection (Delivery vs Collection)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Verify timeslots match your admin dashboard configuration</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Test blocked dates are properly excluded</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                        <span>Complete a test order and verify delivery tags are applied</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h6 className="font-semibold text-blue-800 text-sm mb-2">💡 Pro Tip</h6>
                    <p className="text-sm text-blue-700">
                      Open your browser's developer console (F12) to see real-time sync logs and debug any issues. 
                      The widget logs all data fetching and configuration steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Configuration */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-olive" />
                  Advanced Configuration (Optional)
                </h5>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Add these optional attributes for additional customization:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{`data-theme="light"           <!-- "light" or "dark" -->
data-locale="en"             <!-- Language code -->
data-currency="{{ shop.currency }}"  <!-- Currency display -->
data-container-class="my-widget"     <!-- Custom CSS class -->`}</pre>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div><strong>data-theme:</strong> Widget appearance</div>
                    <div><strong>data-locale:</strong> Language localization</div>
                    <div><strong>data-currency:</strong> Price formatting</div>
                    <div><strong>data-container-class:</strong> Custom styling</div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <h5 className="font-semibold text-yellow-800">Troubleshooting</h5>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <div><strong>Widget not appearing:</strong> Check browser console for errors and verify script URL</div>
                      <div><strong>API errors:</strong> Ensure Shopify credentials are configured in admin dashboard</div>
                      <div><strong>Styling issues:</strong> Widget inherits your theme's CSS - add custom styles if needed</div>
                      <div><strong>Cart mode issues:</strong> Verify cart.items data is properly passed to the widget</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget URLs */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h5 className="font-semibold text-blue-800">Widget Resources</h5>
                    <div className="text-sm text-blue-700 space-y-1 font-mono">
                      <div><strong>Widget:</strong> https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js</div>
                      <div><strong>Health:</strong> https://delivery-scheduler-widget.stanleytan92.workers.dev/health</div>
                      <div><strong>Docs:</strong> https://delivery-scheduler-widget.stanleytan92.workers.dev/widget-docs</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📱 Integration Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Shopify Integration:</strong> The widget will be embedded in your theme and automatically sync with your product catalog
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Order Processing:</strong> Selected delivery details are automatically added to Shopify orders
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-olive rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Real-time Updates:</strong> Availability reflects current timeslot quotas and blocked dates
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}