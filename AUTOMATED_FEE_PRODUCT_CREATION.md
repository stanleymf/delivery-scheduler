# 🚀 AUTOMATED FEE PRODUCT CREATION SYSTEM

## 🎯 **COMPLETE WORKFLOW**

### **ADMIN CREATES TIMESLOT** → **SHOPIFY PRODUCT CREATED** → **CUSTOMER USES WIDGET**

---

## 🔧 **BACKEND IMPLEMENTATION**

### **1. Shopify Admin API Integration**

Add to your Railway backend:

```javascript
// shopify-integration.js
const SHOPIFY_CONFIG = {
    shop: process.env.SHOPIFY_SHOP_DOMAIN, // e.g., 'your-store.myshopify.com'
    accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: '2024-01'
};

// Create fee product when timeslot is saved
async function createFeeProduct(feeAmount, timeslotId, timeslotName) {
    const productData = {
        product: {
            title: `Express Delivery Fee - $${feeAmount}`,
            body_html: `<p>Express delivery fee for ${timeslotName} timeslot.</p><p>This fee will be automatically applied when customers select express delivery options.</p>`,
            vendor: 'Delivery Scheduler',
            product_type: 'Service',
            handle: `express-delivery-fee-${feeAmount.toString().replace('.', '-')}`,
            tags: ['delivery-fee', 'auto-generated', `timeslot-${timeslotId}`],
            status: 'active',
            variants: [{
                price: feeAmount.toString(),
                inventory_management: null, // Don't track inventory
                inventory_policy: 'continue', // Allow selling when out of stock
                requires_shipping: false,
                taxable: true,
                sku: `EXPRESS-FEE-${feeAmount.toString().replace('.', '-')}`,
                weight: 0,
                weight_unit: 'kg'
            }],
            options: [{
                name: 'Title',
                values: ['Default Title']
            }],
            metafields: [
                {
                    namespace: 'delivery_scheduler',
                    key: 'timeslot_id',
                    value: timeslotId.toString(),
                    type: 'single_line_text_field'
                },
                {
                    namespace: 'delivery_scheduler', 
                    key: 'fee_amount',
                    value: feeAmount.toString(),
                    type: 'number_decimal'
                },
                {
                    namespace: 'delivery_scheduler',
                    key: 'auto_generated',
                    value: 'true',
                    type: 'boolean'
                }
            ]
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
            handle: result.product.handle
        };

    } catch (error) {
        console.error('❌ Failed to create fee product:', error);
        throw error;
    }
}

// Update existing fee product
async function updateFeeProduct(productId, newFeeAmount, timeslotName) {
    const updateData = {
        product: {
            id: productId,
            title: `Express Delivery Fee - $${newFeeAmount}`,
            body_html: `<p>Express delivery fee for ${timeslotName} timeslot.</p><p>This fee will be automatically applied when customers select express delivery options.</p>`,
            handle: `express-delivery-fee-${newFeeAmount.toString().replace('.', '-')}`,
            variants: [{
                price: newFeeAmount.toString()
            }]
        }
    };

    try {
        const response = await fetch(`https://${SHOPIFY_CONFIG.shop}/admin/api/${SHOPIFY_CONFIG.apiVersion}/products/${productId}.json`, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Shopify API Error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('✅ Fee product updated:', result.product.id);
        return result.product;

    } catch (error) {
        console.error('❌ Failed to update fee product:', error);
        throw error;
    }
}

// Delete fee product
async function deleteFeeProduct(productId) {
    try {
        const response = await fetch(`https://${SHOPIFY_CONFIG.shop}/admin/api/${SHOPIFY_CONFIG.apiVersion}/products/${productId}.json`, {
            method: 'DELETE',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken
            }
        });

        if (response.ok) {
            console.log('✅ Fee product deleted:', productId);
            return true;
        } else {
            console.error('❌ Failed to delete fee product:', response.status);
            return false;
        }

    } catch (error) {
        console.error('❌ Error deleting fee product:', error);
        return false;
    }
}

module.exports = {
    createFeeProduct,
    updateFeeProduct,
    deleteFeeProduct
};
```

### **2. Enhanced Timeslot Management**

Update your timeslot creation/update endpoints:

```javascript
// timeslot-controller.js
const { createFeeProduct, updateFeeProduct, deleteFeeProduct } = require('./shopify-integration');

// Create timeslot with automatic fee product creation
async function createTimeslot(req, res) {
    try {
        const { name, startTime, endTime, type, fee, maxOrders, cutoffTime } = req.body;
        
        // Create timeslot in database first
        const timeslot = await TimeslotModel.create({
            name,
            startTime,
            endTime,
            type,
            fee: fee || 0,
            maxOrders,
            cutoffTime,
            createdAt: new Date()
        });

        // If this is an express timeslot with a fee, create Shopify product
        if (type === 'express' && fee && fee > 0) {
            try {
                console.log(`🛍️ Creating fee product for timeslot: ${name} ($${fee})`);
                
                const feeProduct = await createFeeProduct(fee, timeslot.id, name);
                
                // Update timeslot with fee product information
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
                        feeVariantId: feeProduct.variantId,
                        feeProductHandle: feeProduct.handle
                    },
                    message: `Timeslot created successfully with $${fee} fee product`
                });

            } catch (feeError) {
                console.error('⚠️ Failed to create fee product, but timeslot saved:', feeError);
                
                res.json({
                    success: true,
                    timeslot: timeslot.toObject(),
                    warning: 'Timeslot created but fee product creation failed. Fee will be handled via cart notes.',
                    error: feeError.message
                });
            }
        } else {
            // Regular timeslot without fee
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

// Update timeslot with fee product management
async function updateTimeslot(req, res) {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, type, fee, maxOrders, cutoffTime } = req.body;
        
        // Get existing timeslot
        const existingTimeslot = await TimeslotModel.findById(id);
        if (!existingTimeslot) {
            return res.status(404).json({ success: false, error: 'Timeslot not found' });
        }

        // Update timeslot data
        const updatedTimeslot = await TimeslotModel.findByIdAndUpdate(id, {
            name,
            startTime,
            endTime,
            type,
            fee: fee || 0,
            maxOrders,
            cutoffTime,
            updatedAt: new Date()
        }, { new: true });

        // Handle fee product changes
        if (type === 'express' && fee && fee > 0) {
            if (existingTimeslot.feeProductId) {
                // Update existing fee product
                try {
                    await updateFeeProduct(existingTimeslot.feeProductId, fee, name);
                    console.log('✅ Fee product updated');
                } catch (updateError) {
                    console.error('⚠️ Failed to update fee product:', updateError);
                }
            } else {
                // Create new fee product
                try {
                    const feeProduct = await createFeeProduct(fee, id, name);
                    await TimeslotModel.findByIdAndUpdate(id, {
                        feeProductId: feeProduct.productId,
                        feeVariantId: feeProduct.variantId,
                        feeProductHandle: feeProduct.handle
                    });
                    console.log('✅ New fee product created');
                } catch (createError) {
                    console.error('⚠️ Failed to create fee product:', createError);
                }
            }
        } else if (existingTimeslot.feeProductId) {
            // Remove fee product if no longer needed
            try {
                await deleteFeeProduct(existingTimeslot.feeProductId);
                await TimeslotModel.findByIdAndUpdate(id, {
                    $unset: {
                        feeProductId: 1,
                        feeVariantId: 1,
                        feeProductHandle: 1
                    }
                });
                console.log('✅ Fee product removed');
            } catch (deleteError) {
                console.error('⚠️ Failed to delete fee product:', deleteError);
            }
        }

        res.json({
            success: true,
            timeslot: updatedTimeslot,
            message: 'Timeslot updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating timeslot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Delete timeslot with fee product cleanup
async function deleteTimeslot(req, res) {
    try {
        const { id } = req.params;
        
        const timeslot = await TimeslotModel.findById(id);
        if (!timeslot) {
            return res.status(404).json({ success: false, error: 'Timeslot not found' });
        }

        // Delete associated fee product if exists
        if (timeslot.feeProductId) {
            try {
                await deleteFeeProduct(timeslot.feeProductId);
                console.log('✅ Associated fee product deleted');
            } catch (deleteError) {
                console.error('⚠️ Failed to delete fee product:', deleteError);
            }
        }

        // Delete timeslot
        await TimeslotModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Timeslot and associated fee product deleted successfully'
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
    updateTimeslot,
    deleteTimeslot
};
```

### **3. Enhanced Widget API Response**

Update your widget API to include fee product information:

```javascript
// widget-api.js
async function getTimeslots(req, res) {
    try {
        const { delivery_type, date } = req.query;
        
        const timeslots = await TimeslotModel.find({
            type: delivery_type,
            // Add your date filtering logic here
        });

        // Format timeslots for widget with fee product info
        const formattedTimeslots = timeslots.map(slot => ({
            id: slot.id,
            name: slot.name,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type,
            fee: slot.fee || 0,
            maxOrders: slot.maxOrders,
            available_slots: slot.maxOrders - (slot.bookings || 0),
            // Include fee product information
            feeVariantId: slot.feeVariantId || null,
            feeProductHandle: slot.feeProductHandle || null,
            feeProductId: slot.feeProductId || null
        }));

        res.json({
            success: true,
            timeslots: formattedTimeslots
        });

    } catch (error) {
        console.error('❌ Error fetching timeslots:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    getTimeslots
};
```

---

## 🎨 **FRONTEND WIDGET UPDATES**

The widget needs to use the fee variant ID from the API:

```javascript
// Update the widget's addDynamicFeeToCart function
async function addDynamicFeeToCart(feeAmount, timeslotName, deliveryDate) {
    if (feeAmount <= 0) {
        console.log('⚠️ Zero fee amount - skipping fee addition');
        return false;
    }

    try {
        console.log(`💰 Adding dynamic fee: $${feeAmount}`);

        // First, remove any existing fee items
        await removeFeeFromCart();

        // Get the selected timeslot with fee product info
        const selectedSlot = widgetData.timeslots.find(s => s.id === selectedTimeslot);
        
        if (selectedSlot && selectedSlot.feeVariantId) {
            // Use the specific fee variant ID from the timeslot
            console.log(`🎯 Using timeslot-specific fee variant: ${selectedSlot.feeVariantId}`);
            
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{
                        id: selectedSlot.feeVariantId, // Use timeslot's fee variant ID
                        quantity: 1,
                        properties: {
                            '_delivery_fee': 'true',
                            '_fee_amount': feeAmount.toString(),
                            '_delivery_date': deliveryDate,
                            '_delivery_timeslot': timeslotName,
                            '_timeslot_id': selectedSlot.id
                        }
                    }]
                })
            });

            if (response.ok) {
                console.log('✅ Timeslot-specific fee product added successfully');
                return true;
            } else {
                console.log('❌ Failed to add timeslot-specific fee product');
            }
        }

        // Fallback to generic fee product lookup
        const feeVariantId = await getFeeVariantId(feeAmount);
        
        if (feeVariantId) {
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{
                        id: feeVariantId,
                        quantity: 1,
                        properties: {
                            '_delivery_fee': 'true',
                            '_fee_amount': feeAmount.toString(),
                            '_delivery_date': deliveryDate,
                            '_delivery_timeslot': timeslotName
                        }
                    }]
                })
            });

            if (response.ok) {
                console.log('✅ Generic fee product added successfully');
                return true;
            }
        }

        // Final fallback - cart notes
        console.log('💡 Adding fee information to cart notes for manual processing');
        await addFeeToCartNotes(feeAmount, timeslotName, deliveryDate);
        return true;

    } catch (error) {
        console.log('❌ Error adding dynamic fee:', error);
        return false;
    }
}
```

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Backend Setup**
1. Add Shopify Admin API credentials to Railway environment variables
2. Deploy updated timeslot management endpoints
3. Update widget API to include fee product information

### **2. Database Migration**
Add fee product fields to timeslot schema:
```javascript
// Add to your timeslot model
feeProductId: String,
feeVariantId: String, 
feeProductHandle: String
```

### **3. Admin Dashboard Updates**
Update your admin interface to show fee product creation status:
- ✅ "Fee product created successfully"
- ⚠️ "Fee product creation failed - manual processing required"

### **4. Widget Deployment**
Deploy updated widget with enhanced fee handling

---

## 🎯 **RESULT**

**Complete automation:**
1. **Admin creates** express timeslot with $25 fee
2. **System automatically creates** "Express Delivery Fee - $25" product in Shopify
3. **Customer selects** express timeslot in widget
4. **Widget adds** $25 fee product to cart
5. **Cart total shows** correct amount immediately
6. **No manual work** required!

This creates a **seamless, professional experience** for both admins and customers! 🎉 