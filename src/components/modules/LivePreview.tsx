import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Eye, Truck, Building, Zap, MapPin, AlertCircle, CheckCircle, Tag } from "lucide-react";
import { mockSettings, mockTimeslots, mockBlockedDates, mockBlockedDateRanges, isPostalCodeBlocked, formatTimeRange, type BlockedDate, type BlockedDateRange, type TagMapping } from "@/lib/mockData";

type DeliveryType = 'delivery' | 'collection' | 'express';
type WidgetStep = 'type-selection' | 'postal-validation' | 'location-selection' | 'date-selection' | 'timeslot-selection' | 'confirmation';

export function LivePreview() {
  const [currentStep, setCurrentStep] = useState<WidgetStep>('type-selection');
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [isPostalValid, setIsPostalValid] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeslot, setSelectedTimeslot] = useState("");

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