# 🔧 RAILWAY PERSISTENCE SOLUTION
## Stop Losing Data on Every Deploy!

### 🚨 **THE FRUSTRATING PROBLEM**
You're experiencing the classic Railway ephemeral filesystem issue:
- ❌ **Admin login credentials lost** on every deploy
- ❌ **Shopify API settings lost** on every deploy  
- ❌ **Mock blocked dates lost** on every deploy
- ❌ **All configuration lost** on every deploy
- 😤 **Have to re-enter everything** after each deploy

### ✅ **THE COMPLETE SOLUTION**

---

## 🚀 **OPTION 1: AUTOMATED FIX (RECOMMENDED)**

### **Step 1: Run the Fix Script**

```bash
# Run the comprehensive persistence fix
./scripts/fix-railway-persistence.sh
```

This script will:
- ✅ Set up Railway API token for automatic persistence
- ✅ Configure admin credentials permanently
- ✅ Set up Shopify API credentials (optional)
- ✅ Initialize all persistence variables
- ✅ Deploy with full persistence enabled

### **Step 2: Get Railway API Token**

When prompted, get your Railway API token:

1. **Go to**: https://railway.app/account/tokens
2. **Click**: "Create Token"
3. **Name**: "Auto Persistence"
4. **Copy**: The token (starts with `railway_`)
5. **Paste**: Into the script when prompted

### **Step 3: Verify Automatic Persistence**

After running the script:
1. **Login** to your admin dashboard
2. **Configure** Shopify settings
3. **Check Railway logs** for:
   ```
   ✅ Automatically updated Railway environment variable: SHOPIFY_CREDENTIALS_JSON
   ```
4. **Trigger redeploy** - your data should persist!

---

## 📋 **OPTION 2: MANUAL SETUP (IF SCRIPT FAILS)**

### **Step 1: Set Core Environment Variables**

```bash
# Admin credentials (set these now!)
railway variables --set "VITE_ADMIN_USERNAME=your_username"
railway variables --set "VITE_ADMIN_PASSWORD=your_secure_password"
railway variables --set "VITE_ADMIN_EMAIL=your_email@example.com"

# Initialize persistence variables
railway variables --set "SHOPIFY_CREDENTIALS_JSON={}"
railway variables --set "USER_DATA_JSON={}"
railway variables --set "SESSIONS_JSON={}"
```

### **Step 2: Optional - Enable Automatic Persistence**

```bash
# Get Railway API token from https://railway.app/account/tokens
railway variables --set "RAILWAY_TOKEN=railway_your_token_here"

# Project and environment IDs are already available as:
# RAILWAY_PROJECT_ID and RAILWAY_ENVIRONMENT_ID
```

### **Step 3: Optional - Set Shopify API Credentials**

```bash
# For automated fee product creation
railway variables --set "SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com"
railway variables --set "SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_token_here"
railway variables --set "SHOPIFY_API_VERSION=2024-01"
```

### **Step 4: Deploy and Configure**

```bash
# Deploy with persistence
railway up

# Then login and configure your system
# Watch logs for persistence commands if automatic mode isn't enabled
```

---

## 🔍 **HOW PERSISTENCE WORKS**

### **Automatic Mode (With Railway API Token)**
1. **You configure settings** in admin dashboard
2. **System automatically saves** to Railway environment variables
3. **Data persists** across all deployments
4. **No manual steps** required

### **Manual Mode (Without Railway API Token)**
1. **You configure settings** in admin dashboard
2. **System logs persistence commands** like:
   ```
   💡 To persist SHOPIFY_CREDENTIALS_JSON across Railway restarts, set environment variable:
      SHOPIFY_CREDENTIALS_JSON={"admin":{"shopDomain":"your-shop.myshopify.com",...}}
   ```
3. **You copy JSON values** from logs
4. **You update Railway variables** manually

---

## 🎯 **CURRENT STATUS CHECK**

Based on your Railway variables, here's what's working:

### ✅ **Already Working**
- `USER_DATA_JSON` - Your timeslots and settings are persisting
- `VITE_ADMIN_USERNAME` - Admin username is set
- `VITE_ADMIN_PASSWORD` - Admin password is set

### ❌ **Needs Fixing**
- `SHOPIFY_CREDENTIALS_JSON` - Empty (why Shopify settings are lost)
- `SESSIONS_JSON` - Empty (why you have to re-login)
- `RAILWAY_TOKEN` - Missing (why automatic persistence isn't working)

---

## 🔧 **QUICK FIX FOR YOUR CURRENT ISSUE**

### **Immediate Solution**

```bash
# Set Railway API token for automatic persistence
railway variables --set "RAILWAY_TOKEN=your_railway_token_from_dashboard"

# Set admin email (missing)
railway variables --set "VITE_ADMIN_EMAIL=admin@example.com"

# Redeploy
railway up
```

### **Then Test**
1. **Login** to admin dashboard
2. **Configure Shopify settings**
3. **Check logs** for automatic persistence messages
4. **Redeploy** to verify data persists

---

## 🚨 **TROUBLESHOOTING**

### **"Still losing Shopify credentials"**
- Check `SHOPIFY_CREDENTIALS_JSON` is being updated in Railway variables
- Look for "✅ Automatically updated" messages in logs
- Verify Railway API token is valid

### **"Still have to re-login"**
- Check `SESSIONS_JSON` is being updated
- Sessions expire after 24 hours (normal behavior)
- Admin credentials should auto-fill from environment

### **"Blocked dates still lost"**
- These are stored in `USER_DATA_JSON`
- Should be persisting (check Railway variables)
- May need to trigger manual save

### **"Automatic persistence not working"**
- Verify `RAILWAY_TOKEN` starts with `railway_`
- Check token has project access
- Look for API errors in logs

---

## 🎉 **SUCCESS INDICATORS**

### **You'll know it's working when:**
- ✅ **Admin credentials auto-fill** on login page
- ✅ **Shopify settings persist** after redeploy
- ✅ **Blocked dates survive** deployments
- ✅ **No re-configuration needed** after deploys
- ✅ **Logs show automatic updates** to Railway variables

---

## 📞 **NEXT STEPS**

1. **Run the fix script**: `./scripts/fix-railway-persistence.sh`
2. **Or set variables manually** using the commands above
3. **Test persistence** by redeploying
4. **Enjoy never losing data again!** 🎉

**Your Railway deployment will finally have persistent data! 🚀** 