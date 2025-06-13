import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Truck, Package } from "lucide-react";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";

interface DeliveryOption {
  id: string;
  name: string;
  type: 'delivery' | 'collection' | 'express';
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
}

interface CustomerWidgetProps {
  shopDomain: string;
  productId?: string;
  variantId?: string;
}

export function CustomerWidget({ shopDomain, productId, variantId }: CustomerWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'collection'>('delivery');
  const [postalCode, setPostalCode] = useState("");

  // Mock delivery options - in real implementation, these would come from your API
  const deliveryOptions: DeliveryOption[] = [
    {
      id: "morning",
      name: "Morning Delivery",
      type: "delivery",
      startTime: "10:00",
      endTime: "14:00",
      price: 0,
      available: true,
    },
    {
      id: "afternoon",
      name: "Afternoon Delivery",
      type: "delivery",
      startTime: "14:00",
      endTime: "18:00",
      price: 0,
      available: true,
    },
    {
      id: "evening",
      name: "Evening Delivery",
      type: "delivery",
      startTime: "18:00",
      endTime: "22:00",
      price: 5,
      available: true,
    },
    {
      id: "express",
      name: "Express Delivery",
      type: "delivery",
      startTime: "11:00",
      endTime: "13:00",
      price: 15,
      available: true,
    },
    {
      id: "collection",
      name: "Store Collection",
      type: "collection",
      startTime: "09:00",
      endTime: "21:00",
      price: -5,
      available: true,
    },
  ];

  const availableDates = [
    addDays(new Date(), 1),
    addDays(new Date(), 2),
    addDays(new Date(), 3),
    addDays(new Date(), 4),
    addDays(new Date(), 5),
  ];

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      startOfDay(availableDate).getTime() === startOfDay(date).getTime()
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(""); // Reset time slot when date changes
  };

  const handleDeliveryTypeChange = (type: 'delivery' | 'collection') => {
    setDeliveryType(type);
    setSelectedTimeSlot(""); // Reset time slot when type changes
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    return deliveryOptions.filter(option => 
      option.type === deliveryType && option.available
    );
  };

  const handleAddToCart = () => {
    if (!selectedDate || !selectedTimeSlot) return;

    const selectedOption = deliveryOptions.find(option => option.id === selectedTimeSlot);
    if (!selectedOption) return;

    // Create delivery preference data
    const deliveryPreference = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedOption.name,
      type: selectedOption.type,
      postalCode: postalCode,
      price: selectedOption.price,
    };

    // In a real implementation, this would be sent to Shopify via webhook or API
    console.log('Delivery preference:', deliveryPreference);
    
    // Add to cart logic would go here
    alert(`Added to cart with ${selectedOption.name} on ${format(selectedDate, 'MMM dd, yyyy')}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-olive" />
          Delivery Options
        </CardTitle>
        <CardDescription>
          Choose your preferred delivery date and time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Delivery Type</label>
          <div className="flex gap-2">
            <Button
              variant={deliveryType === 'delivery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeliveryTypeChange('delivery')}
              className="flex-1"
            >
              <Truck className="w-4 h-4 mr-2" />
              Delivery
            </Button>
            <Button
              variant={deliveryType === 'collection' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDeliveryTypeChange('collection')}
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-2" />
              Collection
            </Button>
          </div>
        </div>

        {/* Postal Code Input (for delivery) */}
        {deliveryType === 'delivery' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <input
              type="text"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive"
            />
          </div>
        )}

        {/* Date Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Date</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => !isDateAvailable(date)}
            className="rounded-md border"
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Time</label>
            <div className="space-y-2">
              {getAvailableTimeSlots().map((option) => (
                <div
                  key={option.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTimeSlot === option.id
                      ? 'border-olive bg-olive/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTimeSlot(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-olive" />
                      <span className="font-medium">{option.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {option.startTime} - {option.endTime}
                      </div>
                      <div className="text-sm font-medium">
                        {option.price > 0 ? `+$${option.price}` : option.price < 0 ? `-$${Math.abs(option.price)}` : 'Free'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedDate && selectedTimeSlot && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Delivery Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{format(selectedDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{deliveryOptions.find(opt => opt.id === selectedTimeSlot)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{deliveryType}</span>
              </div>
              {postalCode && (
                <div className="flex justify-between">
                  <span>Postal Code:</span>
                  <span>{postalCode}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!selectedDate || !selectedTimeSlot}
          className="w-full bg-olive hover:bg-olive/90 text-olive-foreground"
        >
          Add to Cart with Delivery
        </Button>

        {/* Integration Info */}
        <div className="text-xs text-gray-500 text-center">
          Powered by Delivery Scheduler v1.0.0
        </div>
      </CardContent>
    </Card>
  );
} 