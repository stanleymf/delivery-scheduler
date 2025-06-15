# 🚀 Railway Shopify API Persistence Setup
## For Automated Fee Product Creation

### 🎯 **OVERVIEW**
Your Railway deployment already has comprehensive data persistence! This guide covers the additional Shopify API credentials needed for automated fee product creation.

---

## ✅ **EXISTING PERSISTENCE (ALREADY WORKING)**

Your system already persists:
- **Admin Dashboard Credentials**: `VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD`
- **Shopify Connection Settings**: `SHOPIFY_CREDENTIALS_JSON`
- **User Configuration Data**: `USER_DATA_JSON`
- **Login Sessions**: `SESSIONS_JSON`

**How it works:**
1. Data is saved to files every 5 minutes
2. On shutdown, data is saved gracefully
3. Server logs show Railway environment variable commands
4. You copy these commands to Railway dashboard

---

## 🔧 **ADDITIONAL VARIABLES NEEDED FOR AUTOMATION**

For automated Shopify product creation, add these to Railway:

### **Required Shopify API Variables**
```env
# Shopify Admin API (for creating fee products)
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-railway-app.railway.app
```

### **Optional Configuration**
```env
# Fee Product Settings
FEE_PRODUCT_PREFIX=Express Delivery Fee
FEE_PRODUCT_VENDOR=Delivery Scheduler
FEE_PRODUCT_TYPE=service

# Automation Settings
AUTO_CREATE_FEE_PRODUCTS=true
AUTO_CLEANUP_UNUSED_PRODUCTS=false
```

---

## 📋 **STEP-BY-STEP SETUP**

### **Step 1: Get Shopify Admin API Token**

1. **Go to Shopify Admin** → Apps → App and sales channel settings
2. **Click "Develop apps"** → Create an app
3. **Configure Admin API scopes:**
   - `write_products` (create fee products)
   - `read_products` (check existing products)
   - `write_inventory` (manage product availability)
4. **Install app** and copy the **Admin API access token**

### **Step 2: Add Variables to Railway**

1. **Go to Railway Dashboard** → Your project → Variables tab
2. **Add each variable** with the values from Step 1
3. **Click Save** - Railway will auto-redeploy

### **Step 3: Verify Setup**

Check your Railway deployment logs for:
```
📊 Environment Check:
   - Shopify Admin API: ✅ Connected
   - Webhook URL: ✅ Configured
   - Fee Product Creation: ✅ Enabled
```

---

## 🔄 **HOW PERSISTENCE WORKS**

### **Automatic Backup System**
Your server automatically:
- **Saves data every 5 minutes** to prevent loss
- **Logs Railway commands** when data changes
- **Gracefully saves on shutdown**

### **Example Log Output**
When you save Shopify settings, you'll see:
```
💾 Saved credentials to file for 1 users
💡 To persist credentials across Railway restarts, set environment variable:
   SHOPIFY_CREDENTIALS_JSON={"admin":{"shopDomain":"your-shop.myshopify.com",...}}
```

### **Copy to Railway**
1. **Copy the JSON value** from the log
2. **Go to Railway** → Variables
3. **Update `SHOPIFY_CREDENTIALS_JSON`** with the new value
4. **Save** - Railway redeploys automatically

---

## 🛡️ **SECURITY BEST PRACTICES**

### **Environment Variables Are Secure**
- ✅ **Encrypted in Railway**
- ✅ **Not visible in logs**
- ✅ **Separate from code repository**

### **Access Token Security**
- 🔒 **Use minimal scopes** (only `write_products`, `read_products`)
- 🔄 **Rotate tokens regularly**
- 📝 **Monitor API usage** in Shopify admin

### **Webhook Security**
- 🔐 **HTTPS only** (Railway provides SSL)
- 🎯 **Specific endpoints** (not wildcard)
- 📊 **Request validation** (built into system)

---

## 🚀 **AUTOMATION WORKFLOW**

Once setup is complete:

1. **Admin creates express timeslot** → System detects fee amount
2. **System calls Shopify API** → Creates fee product automatically
3. **Product details saved** → Persisted to Railway environment
4. **Widget updated** → Uses correct product for fees
5. **Customer selects express** → Fee added as line item with correct price

---

## 🔍 **TROUBLESHOOTING**

### **"API credentials not found"**
- Check `SHOPIFY_ADMIN_ACCESS_TOKEN` is set in Railway
- Verify token has correct scopes in Shopify admin

### **"Product creation failed"**
- Check `write_products` scope is enabled
- Verify shop domain format: `store.myshopify.com`

### **"Webhook not receiving data"**
- Check `WEBHOOK_BASE_URL` matches your Railway domain
- Verify webhooks are registered in Shopify admin

### **Data lost after restart**
- Check Railway logs for persistence commands
- Copy JSON values to environment variables
- Verify variable names match exactly

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Shopify Admin API token obtained
- [ ] All environment variables set in Railway
- [ ] Railway deployment successful
- [ ] Shopify connection test passes
- [ ] Fee product creation test works
- [ ] Webhook endpoints responding
- [ ] Data persistence confirmed

---

## 📞 **NEXT STEPS**

Your persistence system is ready! The next phase is:
1. **Test Shopify API connection** in admin dashboard
2. **Create first express timeslot** to trigger automation
3. **Verify fee product creation** in Shopify admin
4. **Test widget integration** with new products

**Your data will persist across all Railway restarts! 🎉** 