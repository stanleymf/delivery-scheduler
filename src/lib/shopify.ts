export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyProductVariant[];
  images: ShopifyImage[];
  created_at: string;
  updated_at: string;
}

export interface ShopifyProductVariant {
  id: number;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
  weight: number;
  weight_unit: string;
}

export interface ShopifyImage {
  id: number;
  src: string;
  alt: string;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  tags: string[];
  line_items: ShopifyLineItem[];
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  customer?: ShopifyCustomer;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export class ShopifyAPI {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.baseUrl = `https://${config.shopDomain}/admin/api/${config.apiVersion}`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'X-Shopify-Access-Token': this.config.accessToken,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Products API
  async getProducts(limit: number = 50, page_info?: string): Promise<{ products: ShopifyProduct[]; next_page_info?: string }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(page_info && { page_info }),
    });

    const response = await this.makeRequest(`/products.json?${params}`);
    return response;
  }

  async getProduct(id: number): Promise<{ product: ShopifyProduct }> {
    return this.makeRequest(`/products/${id}.json`);
  }

  async updateProductTags(id: number, tags: string[]): Promise<{ product: ShopifyProduct }> {
    return this.makeRequest(`/products/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        product: {
          id,
          tags: tags.join(', '),
        },
      }),
    });
  }

  // Orders API
  async getOrders(limit: number = 50, status?: string): Promise<{ orders: ShopifyOrder[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(status && { status }),
    });

    return this.makeRequest(`/orders.json?${params}`);
  }

  async getOrder(id: number): Promise<{ order: ShopifyOrder }> {
    return this.makeRequest(`/orders/${id}.json`);
  }

  async updateOrderTags(id: number, tags: string[]): Promise<{ order: ShopifyOrder }> {
    return this.makeRequest(`/orders/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        order: {
          id,
          tags: tags.join(', '),
        },
      }),
    });
  }

  async createOrder(orderData: Partial<ShopifyOrder>): Promise<{ order: ShopifyOrder }> {
    return this.makeRequest('/orders.json', {
      method: 'POST',
      body: JSON.stringify({ order: orderData }),
    });
  }

  // Customers API
  async getCustomers(limit: number = 50): Promise<{ customers: ShopifyCustomer[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return this.makeRequest(`/customers.json?${params}`);
  }

  async getCustomer(id: number): Promise<{ customer: ShopifyCustomer }> {
    return this.makeRequest(`/customers/${id}.json`);
  }

  async updateCustomerTags(id: number, tags: string[]): Promise<{ customer: ShopifyCustomer }> {
    return this.makeRequest(`/customers/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        customer: {
          id,
          tags: tags.join(', '),
        },
      }),
    });
  }

  async createCustomer(customerData: Partial<ShopifyCustomer>): Promise<{ customer: ShopifyCustomer }> {
    return this.makeRequest('/customers.json', {
      method: 'POST',
      body: JSON.stringify({ customer: customerData }),
    });
  }

  // Tags API
  async getAllTags(): Promise<{ tags: string[] }> {
    return this.makeRequest('/tags.json');
  }

  async getProductTags(): Promise<{ tags: string[] }> {
    return this.makeRequest('/products/tags.json');
  }

  async getCustomerTags(): Promise<{ tags: string[] }> {
    return this.makeRequest('/customers/tags.json');
  }

  async getOrderTags(): Promise<{ tags: string[] }> {
    return this.makeRequest('/orders/tags.json');
  }
}

// Delivery-specific tag utilities
export const DELIVERY_TAGS = {
  EXPRESS_DELIVERY: 'express-delivery',
  SAME_DAY_DELIVERY: 'same-day-delivery',
  NEXT_DAY_DELIVERY: 'next-day-delivery',
  SCHEDULED_DELIVERY: 'scheduled-delivery',
  PICKUP_AVAILABLE: 'pickup-available',
  DELIVERY_AREA: 'delivery-area',
  TIME_SLOT: 'time-slot',
} as const;

export function addDeliveryTag(existingTags: string[], newTag: string): string[] {
  const tags = existingTags.filter(tag => !tag.startsWith('delivery-'));
  tags.push(newTag);
  return tags;
}

export function removeDeliveryTag(existingTags: string[], tagToRemove: string): string[] {
  return existingTags.filter(tag => tag !== tagToRemove);
}

export function hasDeliveryTag(tags: string[], tag: string): boolean {
  return tags.includes(tag);
} 