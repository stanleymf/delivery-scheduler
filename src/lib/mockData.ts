export interface BlockedPostalCode {
  id: string;
  code: string;
  type: 'postal' | 'area';
}

export interface Timeslot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: 'delivery' | 'collection' | 'express';
  maxOrders: number;
  cutoffTime: string;
  cutoffDay: 'same' | 'previous';
  assignedDays: string[];
  parentTimeslotId?: string; // For express slots
}

export interface BlockedDate {
  id: string;
  date: string;
  type: 'full' | 'partial';
  blockedTimeslots?: string[];
  reason?: string;
  rangeId?: string; // For grouping dates in ranges
}

export interface BlockedDateRange {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'full' | 'partial';
  blockedTimeslots?: string[];
  reason: string;
  createdAt: string;
  dates: string[]; // Array of individual dates in this range
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  image?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface CollectionLocation {
  id: string;
  name: string;
  address: string;
}

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

export interface Settings {
  futureOrderLimit: number;
  collectionLocations: CollectionLocation[];
  theme: 'light' | 'dark';
  tagMapping: TagMappingSettings;
}

// Mock data
export const mockBlockedCodes: BlockedPostalCode[] = [
  { id: '1', code: '018956', type: 'postal' },
  { id: '2', code: '018957', type: 'postal' },
  { id: '3', code: '01', type: 'area' },
  { id: '4', code: '02', type: 'area' },
];

export const mockTimeslots: Timeslot[] = [
  {
    id: '1',
    name: 'Morning Delivery',
    startTime: '10:00',
    endTime: '14:00',
    type: 'delivery',
    maxOrders: 50,
    cutoffTime: '08:00',
    cutoffDay: 'same',
    assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  {
    id: '2',
    name: 'Afternoon Delivery',
    startTime: '14:00',
    endTime: '18:00',
    type: 'delivery',
    maxOrders: 40,
    cutoffTime: '22:00',
    cutoffDay: 'previous',
    assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  },
  {
    id: '3',
    name: 'Evening Delivery',
    startTime: '18:00',
    endTime: '22:00',
    type: 'delivery',
    maxOrders: 30,
    cutoffTime: '22:00',
    cutoffDay: 'previous',
    assignedDays: ['friday', 'saturday', 'sunday'],
  },
  {
    id: '4',
    name: 'Store Collection',
    startTime: '09:00',
    endTime: '21:00',
    type: 'collection',
    maxOrders: 100,
    cutoffTime: '08:00',
    cutoffDay: 'same',
    assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  {
    id: '5',
    name: 'Express Morning',
    startTime: '11:00',
    endTime: '13:00',
    type: 'express',
    maxOrders: 10,
    cutoffTime: '09:00',
    cutoffDay: 'same',
    assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    parentTimeslotId: '1',
  },
  {
    id: '6',
    name: 'Express Afternoon',
    startTime: '15:00',
    endTime: '17:00',
    type: 'express',
    maxOrders: 8,
    cutoffTime: '20:00',
    cutoffDay: 'previous',
    assignedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    parentTimeslotId: '2',
  },
];

export const mockBlockedDates: BlockedDate[] = [
  { id: '1', date: '2024-12-25', type: 'full', reason: 'Christmas Day - Store Closed' },
  { id: '2', date: '2024-01-01', type: 'full', reason: 'New Year Day - Store Closed' },
  { id: '3', date: '2024-02-14', type: 'partial', blockedTimeslots: ['3'], reason: 'Valentine\'s Day - Limited Evening Delivery' },
  { id: '4', date: '2024-12-24', type: 'full', reason: 'Christmas Eve - Store Closed', rangeId: 'range-1' },
  { id: '5', date: '2024-12-26', type: 'full', reason: 'Boxing Day - Store Closed', rangeId: 'range-1' },
];

export const mockBlockedDateRanges: BlockedDateRange[] = [
  {
    id: 'range-1',
    name: 'Christmas Holiday Period',
    startDate: '2024-12-24',
    endDate: '2024-12-26',
    type: 'full',
    reason: 'Christmas Holiday - Store Closed for 3 Days',
    createdAt: '2024-01-15T10:30:00Z',
    dates: ['2024-12-24', '2024-12-25', '2024-12-26']
  },
  {
    id: 'range-2',
    name: 'Chinese New Year',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    type: 'full',
    reason: 'Chinese New Year Holiday - Limited Operations',
    createdAt: '2024-01-20T14:15:00Z',
    dates: ['2024-02-10', '2024-02-11', '2024-02-12']
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Valentine\'s Rose Bouquet',
    handle: 'valentines-rose-bouquet',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop',
    dateRangeStart: '2024-02-10',
    dateRangeEnd: '2024-02-16',
  },
  {
    id: '2',
    title: 'Spring Tulip Arrangement',
    handle: 'spring-tulip-arrangement',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
    dateRangeStart: '2024-03-01',
    dateRangeEnd: '2024-05-31',
  },
  {
    id: '3',
    title: 'Classic White Lilies',
    handle: 'classic-white-lilies',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=300&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Sunflower Delight',
    handle: 'sunflower-delight',
    image: 'https://images.unsplash.com/photo-1597848212624-e6ec2d17d05a?w=300&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'Mother\'s Day Special',
    handle: 'mothers-day-special',
    image: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=300&h=300&fit=crop',
    dateRangeStart: '2024-05-05',
    dateRangeEnd: '2024-05-15',
  },
];

export const mockSettings: Settings = {
  futureOrderLimit: 10,
  collectionLocations: [
    {
      id: '1',
      name: 'Main Store',
      address: '123 Orchard Road, Singapore 238858',
    },
    {
      id: '2',
      name: 'Marina Bay Branch',
      address: '456 Marina Bay Sands, Singapore 018956',
    },
    {
      id: '3',
      name: 'Sentosa Outlet',
      address: '789 Sentosa Gateway, Singapore 098269',
    },
  ],
  theme: 'light',
  tagMapping: {
    mappings: [
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
    ],
    enableTagging: true,
    prefix: '',
    separator: ',',
  },
};

// Helper functions
export const getTimeslotsByType = (type: 'delivery' | 'collection' | 'express') => {
  return mockTimeslots.filter(slot => slot.type === type);
};

export const getExpressTimeslots = () => {
  return mockTimeslots.filter(slot => slot.type === 'express');
};

export const getGlobalTimeslots = () => {
  return mockTimeslots.filter(slot => slot.type === 'delivery' || slot.type === 'collection');
};

export const getProductsWithDateRestrictions = () => {
  return mockProducts.filter(product => product.dateRangeStart && product.dateRangeEnd);
};

export const isPostalCodeBlocked = (postalCode: string): boolean => {
  const areaCode = postalCode.substring(0, 2);
  return mockBlockedCodes.some(
    blocked => 
      (blocked.type === 'postal' && blocked.code === postalCode) ||
      (blocked.type === 'area' && blocked.code === areaCode)
  );
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = Number.parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getDayName = (day: string): string => {
  const days: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  return days[day] || day;
};

// Persistence functions for localStorage
const STORAGE_KEYS = {
  TIMESLOTS: 'delivery-scheduler-timeslots',
  BLOCKED_DATES: 'delivery-scheduler-blocked-dates',
  BLOCKED_DATE_RANGES: 'delivery-scheduler-blocked-date-ranges',
  SETTINGS: 'delivery-scheduler-settings',
  PRODUCTS: 'delivery-scheduler-products',
  BLOCKED_CODES: 'delivery-scheduler-blocked-codes'
};

// Load data from localStorage with fallback to mock data
export const loadTimeslots = (): Timeslot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMESLOTS);
    return stored ? JSON.parse(stored) : mockTimeslots;
  } catch (error) {
    console.error('Error loading timeslots from localStorage:', error);
    return mockTimeslots;
  }
};

export const saveTimeslots = (timeslots: Timeslot[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMESLOTS, JSON.stringify(timeslots));
  } catch (error) {
    console.error('Error saving timeslots to localStorage:', error);
  }
};

export const loadBlockedDates = (): BlockedDate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED_DATES);
    return stored ? JSON.parse(stored) : mockBlockedDates;
  } catch (error) {
    console.error('Error loading blocked dates from localStorage:', error);
    return mockBlockedDates;
  }
};

export const saveBlockedDates = (blockedDates: BlockedDate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_DATES, JSON.stringify(blockedDates));
  } catch (error) {
    console.error('Error saving blocked dates to localStorage:', error);
  }
};

export const loadBlockedDateRanges = (): BlockedDateRange[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED_DATE_RANGES);
    return stored ? JSON.parse(stored) : mockBlockedDateRanges;
  } catch (error) {
    console.error('Error loading blocked date ranges from localStorage:', error);
    return mockBlockedDateRanges;
  }
};

export const saveBlockedDateRanges = (blockedDateRanges: BlockedDateRange[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_DATE_RANGES, JSON.stringify(blockedDateRanges));
  } catch (error) {
    console.error('Error saving blocked date ranges to localStorage:', error);
  }
};

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : mockSettings;
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    return mockSettings;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

export const loadProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : mockProducts;
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return mockProducts;
  }
};

export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

export const loadBlockedCodes = (): BlockedPostalCode[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOCKED_CODES);
    return stored ? JSON.parse(stored) : mockBlockedCodes;
  } catch (error) {
    console.error('Error loading blocked codes from localStorage:', error);
    return mockBlockedCodes;
  }
};

export const saveBlockedCodes = (blockedCodes: BlockedPostalCode[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_CODES, JSON.stringify(blockedCodes));
  } catch (error) {
    console.error('Error saving blocked codes to localStorage:', error);
  }
};

// Clear all stored data (useful for reset functionality)
export const clearAllStoredData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
};

// Export storage keys for direct access if needed
export { STORAGE_KEYS };