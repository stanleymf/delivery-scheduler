# 🚀 RAILWAY BACKEND INTEGRATION - Automated Fee Product Creation

## 🎯 **OVERVIEW**
When admin creates express timeslot → System creates Shopify fee product → Widget uses correct product

---

## 📋 **STEP-BY-STEP IMPLEMENTATION**

### **STEP 1: Environment Variables**
Add to your Railway environment variables:

```env
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01
```

**How to get Shopify Admin Access Token:**
1. Shopify Admin → Apps → App and sales channel settings
2. Develop apps → Create an app
3. Configure Admin API scopes: `write_products`, `read_products`
4. Install app and copy Admin API access token

### **STEP 2: Create Shopify Integration Module**

Create `src/services/shopify-integration.js`:

```javascript
const SHOPIFY_CONFIG = {
    shop: process.env.SHOPIFY_SHOP_DOMAIN,
    accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01'
};

async function createFeeProduct(feeAmount, timeslotId, timeslotName) {
    const productData = {
        product: {
            title: `Express Delivery Fee - $${feeAmount}`,
            body_html: `<p>Express delivery fee for ${timeslotName} timeslot.</p>`,
            vendor: 'Delivery Scheduler',
            product_type: 'Service',
            handle: `express-delivery-fee-${feeAmount.toString().replace('.', '-')}-${timeslotId}`,
            tags: ['delivery-fee', 'auto-generated'],
            status: 'active',
            // Each fee amount = separate product with single default variant
            variants: [{
                price: feeAmount.toString(),
                inventory_management: null, // Don't track inventory
                inventory_policy: 'continue', // Allow selling when out of stock
                requires_shipping: false, // Digital service
                taxable: true,
                sku: `EXPRESS-FEE-${timeslotId}`,
                weight: 0
            }]
        }
    };

    try {
        const response = await fetch(`https://${SHOPIFY_CONFIG.shop}/admin/api/${SHOPIFY_CONFIG.apiVersion}/products.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('✅ Fee product created:', result.product.id);
        
        return {
            productId: result.product.id,
            variantId: result.product.variants[0].id,
            handle: result.product.handle,
            price: result.product.variants[0].price
        };

    } catch (error) {
        console.error('❌ Failed to create fee product:', error);
        throw error;
    }
}

async function deleteFeeProduct(productId) {
    try {
        const response = await fetch(`https://${SHOPIFY_CONFIG.shop}/admin/api/${SHOPIFY_CONFIG.apiVersion}/products/${productId}.json`, {
            method: 'DELETE',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken
            }
        });

        return response.ok;
    } catch (error) {
        console.error('❌ Error deleting fee product:', error);
        return false;
    }
}

module.exports = {
    createFeeProduct,
    deleteFeeProduct
};
```

### **STEP 3: Update Database Schema**

Add fee product fields to your timeslot model:

```javascript
// In your timeslot schema/model
const timeslotSchema = {
    // ... existing fields
    fee: Number,
    feeProductId: String,      // Shopify product ID
    feeVariantId: String,      // Shopify variant ID  
    feeProductHandle: String,  // Shopify product handle
    // ... other fields
};
```

### **STEP 4: Update Timeslot Creation Endpoint**

Modify your timeslot creation API:

```javascript
// In your timeslot controller/route
const { createFeeProduct, deleteFeeProduct } = require('../services/shopify-integration');

async function createTimeslot(req, res) {
    try {
        const { name, startTime, endTime, type, fee, maxOrders } = req.body;
        
        // Create timeslot in database
        const timeslot = await TimeslotModel.create({
            name,
            startTime,
            endTime,
            type,
            fee: fee || 0,
            maxOrders
        });

        // If express timeslot with fee, create Shopify product
        if (type === 'express' && fee && fee > 0) {
            try {
                console.log(`🛍️ Creating fee product for: ${name} ($${fee})`);
                
                const feeProduct = await createFeeProduct(fee, timeslot.id, name);
                
                // Update timeslot with fee product info
                await TimeslotModel.findByIdAndUpdate(timeslot.id, {
                    feeProductId: feeProduct.productId,
                    feeVariantId: feeProduct.variantId,
                    feeProductHandle: feeProduct.handle
                });

                console.log('✅ Timeslot created with fee product');
                
                res.json({
                    success: true,
                    timeslot: {
                        ...timeslot.toObject(),
                        feeProductId: feeProduct.productId,
                        feeVariantId: feeProduct.variantId
                    },
                    message: `Express timeslot created with $${fee} fee product`
                });

            } catch (feeError) {
                console.error('⚠️ Fee product creation failed:', feeError);
                
                res.json({
                    success: true,
                    timeslot: timeslot.toObject(),
                    warning: 'Timeslot created but fee product creation failed',
                    error: feeError.message
                });
            }
        } else {
            res.json({
                success: true,
                timeslot: timeslot.toObject(),
                message: 'Timeslot created successfully'
            });
        }

    } catch (error) {
        console.error('❌ Error creating timeslot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function deleteTimeslot(req, res) {
    try {
        const { id } = req.params;
        
        const timeslot = await TimeslotModel.findById(id);
        if (!timeslot) {
            return res.status(404).json({ success: false, error: 'Timeslot not found' });
        }

        // Delete fee product if exists
        if (timeslot.feeProductId) {
            try {
                await deleteFeeProduct(timeslot.feeProductId);
                console.log('✅ Fee product deleted');
            } catch (error) {
                console.error('⚠️ Failed to delete fee product:', error);
            }
        }

        // Delete timeslot
        await TimeslotModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Timeslot and fee product deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting timeslot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    createTimeslot,
    deleteTimeslot
};
```

### **STEP 5: Update Widget API Response**

Include fee product info in widget API:

```javascript
// In your widget timeslots endpoint
async function getTimeslots(req, res) {
    try {
        const timeslots = await TimeslotModel.find({
            // your filtering logic
        });

        const formattedTimeslots = timeslots.map(slot => ({
            id: slot.id,
            name: slot.name,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            fee: slot.fee || 0,
            maxOrders: slot.maxOrders,
            available_slots: slot.maxOrders - (slot.bookings || 0),
            // Include fee product information for widget
            feeVariantId: slot.feeVariantId || null,
            feeProductHandle: slot.feeProductHandle || null
        }));

        res.json({
            success: true,
            timeslots: formattedTimeslots
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] Add Shopify environment variables to Railway
- [ ] Create Shopify private app with product permissions
- [ ] Update database schema with fee product fields
- [ ] Test Shopify API connection

### **After Deployment:**
- [ ] Create test express timeslot with fee
- [ ] Verify fee product appears in Shopify admin
- [ ] Test widget with new timeslot
- [ ] Confirm correct cart total

---

## 🎯 **COMPLETE WORKFLOW**

### **Admin Experience:**
1. **Creates express timeslot** with $25 fee in Railway dashboard
2. **System automatically creates** "Express Delivery Fee - $25" in Shopify
3. **Success message** confirms both timeslot and product created
4. **Zero manual work** required

### **Customer Experience:**
1. **Selects express timeslot** in widget
2. **Widget automatically adds** correct $25 fee product to cart
3. **Cart total shows** $25 fee immediately
4. **Seamless checkout** with accurate pricing

### **Developer Experience:**
1. **One-time setup** of Shopify integration
2. **Automatic product management** - no manual intervention
3. **Robust error handling** - graceful fallbacks
4. **Clean, maintainable code**

---

## 🔧 **TESTING**

### **Test Scenarios:**
1. **Create express timeslot** → Verify product created in Shopify
2. **Update timeslot fee** → Verify product price updated  
3. **Delete timeslot** → Verify product removed from Shopify
4. **Widget selection** → Verify correct fee added to cart
5. **API failure** → Verify graceful fallback to cart notes

This creates a **fully automated, professional system** that scales with your business! 🎉 