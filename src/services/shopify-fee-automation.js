// 🚀 Shopify Fee Product Automation Service
// Automatically creates, updates, and manages fee products for express delivery

class ShopifyFeeAutomation {
  constructor(credentials) {
    this.shop = credentials.shopDomain;
    this.accessToken = credentials.accessToken;
    this.apiVersion = credentials.apiVersion || '2024-01';
    this.baseUrl = `https://${this.shop}/admin/api/${this.apiVersion}`;
    
    // Fee product configuration
    this.feeProductConfig = {
      vendor: 'Delivery Scheduler',
      product_type: 'service',
      tags: ['delivery-fee', 'express-delivery', 'auto-generated'],
      published: true,
      requires_shipping: false,
      taxable: false
    };
  }

  // 🎯 Main automation function - creates fee products for express timeslots
  async automateExpressTimeslots(timeslots) {
    console.log('🤖 Starting express timeslot automation...');
    
    const results = {
      created: [],
      updated: [],
      errors: [],
      summary: {}
    };

    try {
      // Extract unique fee amounts from express timeslots
      const feeAmounts = this.extractFeeAmounts(timeslots);
      console.log(`💰 Found ${feeAmounts.length} unique fee amounts:`, feeAmounts);

      // Process each fee amount
      for (const feeAmount of feeAmounts) {
        try {
          const result = await this.ensureFeeProduct(feeAmount);
          if (result.created) {
            results.created.push(result);
          } else if (result.updated) {
            results.updated.push(result);
          }
        } catch (error) {
          console.error(`❌ Error processing fee $${feeAmount}:`, error);
          results.errors.push({
            feeAmount,
            error: error.message
          });
        }
      }

      // Generate summary
      results.summary = {
        totalFeeAmounts: feeAmounts.length,
        productsCreated: results.created.length,
        productsUpdated: results.updated.length,
        errors: results.errors.length,
        success: results.errors.length === 0
      };

      console.log('✅ Express timeslot automation completed:', results.summary);
      return results;

    } catch (error) {
      console.error('❌ Express timeslot automation failed:', error);
      throw error;
    }
  }

  // 💰 Extract unique fee amounts from timeslots
  extractFeeAmounts(timeslots) {
    const feeAmounts = new Set();
    
    timeslots.forEach(timeslot => {
      if (timeslot.type === 'express' && timeslot.fee && timeslot.fee > 0) {
        feeAmounts.add(timeslot.fee);
      }
    });

    return Array.from(feeAmounts).sort((a, b) => a - b);
  }

  // 🏭 Ensure fee product exists (create or update)
  async ensureFeeProduct(feeAmount) {
    console.log(`🔍 Checking fee product for $${feeAmount}...`);

    try {
      // Check if product already exists
      const existingProduct = await this.findFeeProduct(feeAmount);
      
      if (existingProduct) {
        console.log(`✅ Fee product exists for $${feeAmount}:`, existingProduct.title);
        
        // Update if needed
        const updateResult = await this.updateFeeProductIfNeeded(existingProduct, feeAmount);
        return {
          updated: true,
          product: updateResult,
          feeAmount,
          variantId: updateResult.variants[0].id
        };
      } else {
        // Create new product
        console.log(`🏭 Creating new fee product for $${feeAmount}...`);
        const newProduct = await this.createFeeProduct(feeAmount);
        
        return {
          created: true,
          product: newProduct,
          feeAmount,
          variantId: newProduct.variants[0].id
        };
      }
    } catch (error) {
      console.error(`❌ Error ensuring fee product for $${feeAmount}:`, error);
      throw error;
    }
  }

  // 🔍 Find existing fee product by amount
  async findFeeProduct(feeAmount) {
    try {
      const productTitle = this.generateProductTitle(feeAmount);
      const searchQuery = `title:${productTitle}`;
      
      const response = await this.shopifyRequest('GET', '/products.json', {
        limit: 10,
        fields: 'id,title,variants,tags,vendor,product_type',
        title: productTitle
      });

      const products = response.products || [];
      
      // Find exact match by title and tags
      const feeProduct = products.find(product => 
        product.title === productTitle &&
        product.tags.includes('delivery-fee') &&
        product.vendor === this.feeProductConfig.vendor
      );

      return feeProduct || null;
    } catch (error) {
      console.error(`❌ Error finding fee product for $${feeAmount}:`, error);
      return null;
    }
  }

  // 🏭 Create new fee product
  async createFeeProduct(feeAmount) {
    const productData = {
      product: {
        title: this.generateProductTitle(feeAmount),
        body_html: this.generateProductDescription(feeAmount),
        vendor: this.feeProductConfig.vendor,
        product_type: this.feeProductConfig.product_type,
        tags: this.feeProductConfig.tags.join(', '),
        published: this.feeProductConfig.published,
        variants: [{
          title: 'Default',
          price: feeAmount.toFixed(2),
          inventory_management: null,
          inventory_policy: 'continue',
          requires_shipping: this.feeProductConfig.requires_shipping,
          taxable: this.feeProductConfig.taxable,
          weight: 0,
          weight_unit: 'kg'
        }],
        options: [{
          name: 'Title',
          values: ['Default']
        }],
        images: [] // Could add delivery icon later
      }
    };

    console.log(`🏭 Creating Shopify product:`, productData.product.title);
    
    const response = await this.shopifyRequest('POST', '/products.json', productData);
    
    if (response.product) {
      console.log(`✅ Created fee product: ${response.product.title} (ID: ${response.product.id})`);
      return response.product;
    } else {
      throw new Error('Failed to create product - no product in response');
    }
  }

  // 🔄 Update fee product if needed
  async updateFeeProductIfNeeded(product, feeAmount) {
    const expectedPrice = feeAmount.toFixed(2);
    const currentPrice = product.variants[0].price;
    
    if (currentPrice !== expectedPrice) {
      console.log(`🔄 Updating price: $${currentPrice} → $${expectedPrice}`);
      
      const updateData = {
        product: {
          id: product.id,
          variants: [{
            id: product.variants[0].id,
            price: expectedPrice
          }]
        }
      };
      
      const response = await this.shopifyRequest('PUT', `/products/${product.id}.json`, updateData);
      return response.product;
    }
    
    return product;
  }

  // 📝 Generate product title
  generateProductTitle(feeAmount) {
    return `Express Delivery Fee - $${feeAmount.toFixed(2)}`;
  }

  // 📝 Generate product description
  generateProductDescription(feeAmount) {
    return `
      <p><strong>Express Delivery Service Fee</strong></p>
      <p>Additional fee for express delivery service: <strong>$${feeAmount.toFixed(2)}</strong></p>
      <p><em>This fee is automatically added when customers select express delivery options.</em></p>
      <p>🚚 <strong>Express Delivery Benefits:</strong></p>
      <ul>
        <li>Priority processing</li>
        <li>Faster delivery times</li>
        <li>Enhanced tracking</li>
        <li>Premium service</li>
      </ul>
      <p><small>Automatically managed by Delivery Scheduler system.</small></p>
    `.trim();
  }

  // 🗑️ Clean up unused fee products
  async cleanupUnusedFeeProducts(activeFeeAmounts) {
    console.log('🧹 Starting cleanup of unused fee products...');
    
    try {
      // Get all delivery fee products
      const allFeeProducts = await this.getAllFeeProducts();
      console.log(`📊 Found ${allFeeProducts.length} existing fee products`);
      
      const cleanupResults = {
        deleted: [],
        kept: [],
        errors: []
      };
      
      for (const product of allFeeProducts) {
        try {
          const productFeeAmount = this.extractFeeAmountFromProduct(product);
          
          if (!activeFeeAmounts.includes(productFeeAmount)) {
            // Delete unused product
            await this.deleteFeeProduct(product.id);
            cleanupResults.deleted.push({
              id: product.id,
              title: product.title,
              feeAmount: productFeeAmount
            });
            console.log(`🗑️ Deleted unused fee product: ${product.title}`);
          } else {
            cleanupResults.kept.push({
              id: product.id,
              title: product.title,
              feeAmount: productFeeAmount
            });
          }
        } catch (error) {
          console.error(`❌ Error processing product ${product.id}:`, error);
          cleanupResults.errors.push({
            product: product.title,
            error: error.message
          });
        }
      }
      
      console.log(`✅ Cleanup completed: ${cleanupResults.deleted.length} deleted, ${cleanupResults.kept.length} kept`);
      return cleanupResults;
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  // 📋 Get all fee products
  async getAllFeeProducts() {
    try {
      const response = await this.shopifyRequest('GET', '/products.json', {
        limit: 250,
        vendor: this.feeProductConfig.vendor,
        product_type: this.feeProductConfig.product_type
      });
      
      return (response.products || []).filter(product => 
        product.tags.includes('delivery-fee')
      );
    } catch (error) {
      console.error('❌ Error getting fee products:', error);
      return [];
    }
  }

  // 💰 Extract fee amount from product title
  extractFeeAmountFromProduct(product) {
    const match = product.title.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // 🗑️ Delete fee product
  async deleteFeeProduct(productId) {
    await this.shopifyRequest('DELETE', `/products/${productId}.json`);
  }

  // 🌐 Make Shopify API request
  async shopifyRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data);
      const separator = endpoint.includes('?') ? '&' : '?';
      const fullUrl = `${url}${separator}${params}`;
      return this.makeRequest(fullUrl, { ...options, method: 'GET' });
    }

    return this.makeRequest(url, options);
  }

  // 🔗 Make HTTP request with error handling
  async makeRequest(url, options) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error ${response.status}: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error(`❌ Shopify API request failed:`, error);
      throw error;
    }
  }

  // 📊 Get automation status
  async getAutomationStatus() {
    try {
      const allFeeProducts = await this.getAllFeeProducts();
      
      return {
        totalFeeProducts: allFeeProducts.length,
        feeProducts: allFeeProducts.map(product => ({
          id: product.id,
          title: product.title,
          price: product.variants[0]?.price || '0.00',
          variantId: product.variants[0]?.id,
          feeAmount: this.extractFeeAmountFromProduct(product),
          created: product.created_at,
          updated: product.updated_at
        })),
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting automation status:', error);
      return {
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
}

module.exports = ShopifyFeeAutomation; 