// Script to get variant ID for Express Delivery Fee product
// Run this in your browser console on any Shopify store page

async function getExpressDeliveryVariantId() {
    try {
        // Get all products
        const response = await fetch('/admin/api/2023-10/products.json?title=Express Delivery Fee');
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
            const product = data.products[0];
            const variant = product.variants[0];
            
            console.log('🎯 Express Delivery Fee Product Found!');
            console.log('Product ID:', product.id);
            console.log('Variant ID:', variant.id);
            console.log('Price:', variant.price);
            console.log('SKU:', variant.sku);
            
            return variant.id;
        } else {
            console.log('❌ Express Delivery Fee product not found');
            console.log('Make sure you created a product with title "Express Delivery Fee"');
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        console.log('💡 Try Method 1 (Shopify Admin URL) instead');
        return null;
    }
}

// Run the function
getExpressDeliveryVariantId(); 