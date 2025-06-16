# 🏪 Shopify App Store Migration Plan

## 🎯 **Current Status**
- **App Type**: Single-tenant MVP with manual Shopify API integration
- **Storage**: File-based + Railway environment variables  
- **Authentication**: Simple admin login (not App Store compliant)
- **Target**: Multi-tenant SaaS app for Shopify App Store

---

## 🚀 **Phase 1: Database Foundation** (CRITICAL - Week 1-2)

### **1.1 Database Setup**
```bash
# Add database dependencies
npm install prisma @prisma/client postgresql
npm install -D prisma

# Initialize Prisma
npx prisma init
```

### **1.2 Database Schema Design**
```sql
-- Core multi-tenant schema
CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  shop_domain VARCHAR(255) UNIQUE NOT NULL,
  access_token VARCHAR(255) NOT NULL,
  scope VARCHAR(500),
  installed_at TIMESTAMP DEFAULT NOW(),
  uninstalled_at TIMESTAMP NULL,
  plan VARCHAR(50) DEFAULT 'free',
  webhook_verified BOOLEAN DEFAULT false
);

CREATE TABLE timeslots (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  max_orders INTEGER DEFAULT 10,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shop_id, key)
);
```

### **1.3 Data Migration Scripts**
- Convert current file-based storage to database
- Migrate existing timeslots, blocked dates, settings
- Preserve user configurations during transition

---

## 🔐 **Phase 2: OAuth Implementation** (CRITICAL - Week 2-3)

### **2.1 Shopify Partner App Setup**
1. **Create Shopify Partner Account**
2. **Register App in Partner Dashboard**
   - App URL: `https://your-app.com`
   - Allowed redirection URLs: `https://your-app.com/auth/callback`
   - Webhook endpoint: `https://your-app.com/api/webhooks`

### **2.2 OAuth Flow Implementation**
```javascript
// OAuth installation flow
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  const scopes = 'read_orders,write_products,read_customers,write_script_tags';
  const redirectUri = `${process.env.HOST}/auth/callback`;
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Store nonce in session for security
  req.session.nonce = nonce;
  
  const installUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}&` +
    `scope=${scopes}&` +
    `redirect_uri=${redirectUri}&` +
    `state=${nonce}`;
    
  res.redirect(installUrl);
});

// OAuth callback handler
app.get('/auth/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;
  
  // Verify HMAC and state for security
  if (!verifyHmac(req.query) || state !== req.session.nonce) {
    return res.status(400).send('Invalid request');
  }
  
  // Exchange code for access token
  const accessToken = await exchangeCodeForToken(shop, code);
  
  // Store shop in database
  await storeShopInDatabase(shop, accessToken);
  
  // Redirect to app dashboard
  res.redirect(`/dashboard?shop=${shop}`);
});
```

### **2.3 Remove Manual Authentication**
- Replace current admin login with OAuth
- Remove manual API key entry forms
- Update all authentication middleware

---

## 🏗️ **Phase 3: Multi-Tenant Architecture** (HIGH - Week 3-4)

### **3.1 Shop Context Middleware**
```javascript
// Add shop context to all requests
app.use('/api', async (req, res, next) => {
  const shopDomain = req.get('X-Shopify-Shop-Domain') || req.query.shop;
  
  if (!shopDomain) {
    return res.status(400).json({ error: 'Shop domain required' });
  }
  
  const shop = await findShopByDomain(shopDomain);
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }
  
  req.shop = shop;
  next();
});
```

### **3.2 Data Isolation**
- Modify all data operations to include shop_id
- Update API endpoints to be shop-specific
- Ensure no cross-shop data leakage

### **3.3 Frontend Updates**
- Add shop context to React app
- Update all API calls to include shop parameter
- Handle multi-shop scenarios in UI

---

## 🎪 **Phase 4: App Store Compliance** (MEDIUM - Week 4-5)

### **4.1 Required Webhooks**
```javascript
const requiredWebhooks = [
  'app/uninstalled',           // MANDATORY for App Store
  'customers/data_request',    // GDPR compliance
  'customers/redact',          // GDPR compliance  
  'shop/redact',              // GDPR compliance
  'orders/create',            // App functionality
  'orders/updated'            // App functionality
];
```

### **4.2 GDPR Compliance**
- Implement customer data deletion endpoints
- Add privacy policy and terms of service
- Handle shop data redaction requests

### **4.3 App Uninstall Handling**
```javascript
app.post('/api/webhooks/app/uninstalled', (req, res) => {
  const shop = req.get('X-Shopify-Shop-Domain');
  
  // Mark shop as uninstalled (don't delete data immediately)
  await markShopUninstalled(shop);
  
  // Schedule data deletion after retention period
  scheduleDataDeletion(shop, 30); // 30 days retention
  
  res.status(200).send('OK');
});
```

---

## 💰 **Phase 5: Billing Integration** (OPTIONAL - Week 5-6)

### **5.1 Shopify Billing API**
```javascript
// Create recurring charge
const createBillingCharge = async (shop, plan) => {
  const charge = {
    recurring_application_charge: {
      name: `Delivery Scheduler ${plan}`,
      price: plan === 'pro' ? 29.99 : 9.99,
      return_url: `${process.env.HOST}/billing/callback?shop=${shop}`,
      trial_days: 7
    }
  };
  
  return await shopifyAPI.post(`/admin/api/2024-01/recurring_application_charges.json`, charge);
};
```

---

## 📋 **Phase 6: App Store Submission** (Week 6-7)

### **6.1 Pre-Submission Checklist**
- [ ] OAuth flow working correctly
- [ ] Multi-tenant data isolation verified
- [ ] All required webhooks implemented
- [ ] GDPR endpoints functional
- [ ] App uninstall handling working
- [ ] Security audit completed
- [ ] Performance testing done

### **6.2 App Store Listing**
- App description and screenshots
- Feature list and pricing model
- Support documentation
- Privacy policy and terms

### **6.3 Review Process**
- Technical review (1-2 weeks)
- Functional review (1-2 weeks)  
- Address reviewer feedback
- Final approval and launch

---

## 🔧 **Technical Debt & Cleanup**

### **Remove Legacy Code**
- [ ] Remove file-based storage system
- [ ] Remove Railway environment variable persistence
- [ ] Remove manual authentication system
- [ ] Clean up single-tenant code patterns

### **Database Migration**
- [ ] Create migration scripts for existing users
- [ ] Test data integrity during migration
- [ ] Backup and recovery procedures

---

## 📊 **Success Metrics**

### **Technical Milestones**
- [ ] Database fully operational
- [ ] OAuth flow 100% functional
- [ ] Multi-tenant isolation verified
- [ ] App Store compliance achieved
- [ ] Performance benchmarks met

### **Business Milestones**
- [ ] App submitted to Shopify App Store
- [ ] First external merchant installation
- [ ] Positive app store reviews
- [ ] Revenue generation from subscriptions

---

## ⏱️ **Timeline Summary**

| Phase | Duration | Priority | Deliverable |
|-------|----------|----------|-------------|
| Phase 1 | Week 1-2 | CRITICAL | Database foundation |
| Phase 2 | Week 2-3 | CRITICAL | OAuth implementation |
| Phase 3 | Week 3-4 | HIGH | Multi-tenant architecture |
| Phase 4 | Week 4-5 | MEDIUM | App Store compliance |
| Phase 5 | Week 5-6 | OPTIONAL | Billing integration |
| Phase 6 | Week 6-7 | HIGH | App Store submission |

**Total Estimated Time: 6-7 weeks for full App Store readiness**

---

## 🚨 **Critical Decisions Needed**

1. **Database Choice**: PostgreSQL (recommended) vs MySQL vs MongoDB
2. **Hosting**: Keep Railway or migrate to AWS/GCP for better database support
3. **Billing Model**: Free vs Freemium vs Paid-only
4. **Feature Scope**: Which features to include in v1.0 App Store submission

---

## 💡 **Next Immediate Actions**

1. **Start with Phase 1**: Set up PostgreSQL database and Prisma ORM
2. **Design database schema** for multi-tenant architecture  
3. **Create migration scripts** to move from file-based to database storage
4. **Test multi-tenant data isolation** thoroughly before proceeding

The current app has excellent core functionality - the architectural changes are the main requirement for App Store success! 🚀 