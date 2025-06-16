export interface DeliveryData {
  type: 'delivery' | 'collection' | 'express';
  date: Date;
  timeslot: {
    name: string;
    startTime: string;
    endTime: string;
  };
  location?: {
    id: string;
    name: string;
    address: string;
  };
  postalCode?: string;
  fee?: number;
}

export interface TagMappingSettings {
  deliveryTag: string;
  collectionTag: string;
  expressTag: string;
  enableTagging: boolean;
  separator: string;
}

/**
 * Generate simplified, clean tags for Shopify orders
 * Only 3 essential tags: Type, Date, Timeslot
 */
export function generateDeliveryTags(
  deliveryData: DeliveryData,
  tagSettings?: TagMappingSettings
): string[] {
  const tags: string[] = [];
  
  // Default tag settings if not provided
  const settings = {
    deliveryTag: 'Delivery',
    collectionTag: 'Collection', 
    expressTag: 'Express',
    enableTagging: true,
    separator: ',',
    ...tagSettings
  };

  if (!settings.enableTagging) {
    return [];
  }

  // 1. Delivery Type Tag
  switch (deliveryData.type) {
    case 'delivery':
      tags.push(settings.deliveryTag);
      break;
    case 'collection':
      tags.push(settings.collectionTag);
      break;
    case 'express':
      tags.push(settings.expressTag);
      break;
  }

  // 2. Date Tag (dd/mm/yyyy format)
  const dateTag = deliveryData.date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
  tags.push(dateTag);

  // 3. Timeslot Tag (hh:mm-hh:mm format)
  const timeslotTag = `${deliveryData.timeslot.startTime}-${deliveryData.timeslot.endTime}`;
  tags.push(timeslotTag);

  return tags;
}

/**
 * Generate comprehensive delivery notes for order processing
 */
export function generateDeliveryNotes(deliveryData: DeliveryData): string {
  const notes: string[] = [];
  
  notes.push('=== DELIVERY INFORMATION ===');
  notes.push(`Type: ${deliveryData.type.charAt(0).toUpperCase() + deliveryData.type.slice(1)}`);
  notes.push(`Date: ${deliveryData.date.toLocaleDateString('en-GB')}`);
  notes.push(`Timeslot: ${deliveryData.timeslot.name}`);
  notes.push(`Time Window: ${deliveryData.timeslot.startTime} - ${deliveryData.timeslot.endTime}`);
  
  if (deliveryData.type === 'collection' && deliveryData.location) {
    notes.push(`Collection Location: ${deliveryData.location.name}`);
    notes.push(`Address: ${deliveryData.location.address}`);
    notes.push(`Location ID: ${deliveryData.location.id}`);
  } else if (deliveryData.type !== 'collection' && deliveryData.postalCode) {
    notes.push(`Delivery Postal Code: ${deliveryData.postalCode}`);
    notes.push(`Delivery Area: ${deliveryData.postalCode.substring(0, 2)}`);
  }
  
  if (deliveryData.fee && deliveryData.fee > 0) {
    notes.push(`Express Delivery Fee: $${deliveryData.fee.toFixed(2)}`);
  }
  
  // Add generated tags for reference
  const tags = generateDeliveryTags(deliveryData);
  notes.push(`Generated Tags: ${tags.join(', ')}`);
  
  notes.push(`Scheduled: ${new Date().toISOString()}`);
  notes.push('=== END DELIVERY INFO ===');
  
  return notes.join('\n');
}

/**
 * Generate cart attributes for Shopify integration
 */
export function generateCartAttributes(deliveryData: DeliveryData): Record<string, string> {
  const tags = generateDeliveryTags(deliveryData);
  const notes = generateDeliveryNotes(deliveryData);
  
  const attributes: Record<string, string> = {
    'delivery_date': deliveryData.date.toISOString().split('T')[0],
    'delivery_timeslot': deliveryData.timeslot.name,
    'delivery_timeslot_start': deliveryData.timeslot.startTime,
    'delivery_timeslot_end': deliveryData.timeslot.endTime,
    'delivery_type': deliveryData.type,
    'delivery_tags': tags.join(','),
    'delivery_notes': notes,
    'delivery_widget_version': 'v1.15.2',
    'delivery_timestamp': new Date().toISOString()
  };

  // Add fee information if applicable
  if (deliveryData.fee && deliveryData.fee > 0) {
    attributes['delivery_fee'] = deliveryData.fee.toString();
  }

  // Add location-specific attributes
  if (deliveryData.type === 'collection' && deliveryData.location) {
    attributes['delivery_location_name'] = deliveryData.location.name;
    attributes['delivery_location_address'] = deliveryData.location.address;
    attributes['delivery_location_id'] = deliveryData.location.id;
  } else if (deliveryData.type !== 'collection' && deliveryData.postalCode) {
    attributes['delivery_postal_code'] = deliveryData.postalCode;
    attributes['delivery_postal_area'] = deliveryData.postalCode.substring(0, 2);
  }

  return attributes;
}

/**
 * Example usage and tag generation preview
 */
export function getTaggingExamples(): Array<{
  title: string;
  description: string;
  deliveryData: DeliveryData;
  expectedTags: string[];
}> {
  return [
    {
      title: 'Morning Delivery',
      description: 'Standard delivery during morning hours',
      deliveryData: {
        type: 'delivery',
        date: new Date('2024-12-20'),
        timeslot: {
          name: 'Morning Delivery',
          startTime: '10:00',
          endTime: '14:00'
        },
        postalCode: '123456'
      },
      expectedTags: ['Delivery', '20/12/2024', '10:00-14:00']
    },
    {
      title: 'Store Collection',
      description: 'Customer pickup from main store',
      deliveryData: {
        type: 'collection',
        date: new Date('2024-12-20'),
        timeslot: {
          name: 'Store Collection',
          startTime: '14:00',
          endTime: '16:00'
        },
        location: {
          id: '1',
          name: 'Windflower Florist',
          address: '123 Main Street'
        }
      },
      expectedTags: ['Collection', '20/12/2024', '14:00-16:00']
    },
    {
      title: 'Express Delivery',
      description: 'Premium express delivery with fee',
      deliveryData: {
        type: 'express',
        date: new Date('2024-12-20'),
        timeslot: {
          name: 'Express Morning',
          startTime: '10:30',
          endTime: '11:30'
        },
        postalCode: '123456',
        fee: 25.00
      },
      expectedTags: ['Express', '20/12/2024', '10:30-11:30']
    }
  ];
} 