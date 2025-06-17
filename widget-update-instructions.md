# 🔄 **Shopify Widget Update Instructions**

## **The Problem**
Your Shopify cart page is showing old widget data because the liquid code is using the old widget script without cache-busting.

## **The Solution**

### **Step 1: Update Your Cart Page Liquid Code**

Replace your existing widget code in your Shopify theme's `cart.liquid` template with the new code from `shopify-cart-widget-integration.liquid`.

### **Key Changes Made:**

#### **❌ OLD Code (What you probably have):**
```liquid
<script src="https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js"></script>
```

#### **✅ NEW Code (What you need):**
```liquid
<script>
  const widgetVersion = '1.8.0';
  const timestamp = new Date().getTime();
  
  const script = document.createElement('script');
  script.src = `https://delivery-scheduler-widget.stanleytan92.workers.dev/widget.js?v=${widgetVersion}&t=${timestamp}`;
  script.async = true;
  
  script.onload = function() {
    console.log('✅ Delivery Scheduler Widget v' + widgetVersion + ' loaded successfully');
  };
  
  document.head.appendChild(script);
</script>
```

### **Why This Fixes The Issue:**

1. **Cache-Busting**: `?v=1.8.0&t=${timestamp}` prevents browser caching
2. **Version Control**: Forces load of the new v1.8.0 widget
3. **Dynamic Loading**: Creates script element programmatically
4. **Error Handling**: Shows fallback if widget fails to load

## **Step 2: Implementation**

1. **Go to your Shopify Admin**
2. **Navigate**: Online Store → Themes → Actions → Edit Code
3. **Find**: `templates/cart.liquid` (or wherever your widget code is)
4. **Replace**: The old widget script with the new code from `shopify-cart-widget-integration.liquid`
5. **Save**: The template

## **Step 3: Verify The Fix**

1. **Clear browser cache** (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **Visit your cart page**
3. **Open browser console** (`F12`)
4. **Look for**: `"✅ Delivery Scheduler Widget v1.8.0 loaded successfully"`
5. **Test the widget**: Should now show your synced dashboard data

## **Step 4: Sync Your Dashboard Data (Optional)**

If you want to sync your real admin dashboard settings:

1. Go to: https://delivery-scheduler.pages.dev/sync-to-widget.html
2. Click "Load Local Data" → "Sync to Widget" → "Test Widget"

## **What You Should See After The Update:**

- ✅ Browser console shows "Widget v1.8.0 loaded"
- ✅ Widget displays your admin dashboard timeslots
- ✅ Widget shows your collection locations
- ✅ Data stays synced when you update admin dashboard

## **Still Having Issues?**

If the widget still shows old data:

1. **Try incognito mode** to test without cache
2. **Check browser console** for any error messages
3. **Verify script loads**: Network tab should show the widget.js loading
4. **Test different browser**: Rule out browser-specific cache issues

The new widget v1.8.0 has aggressive cache-busting headers and will force refresh every time! 