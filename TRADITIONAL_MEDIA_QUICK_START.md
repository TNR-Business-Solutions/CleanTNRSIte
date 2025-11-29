# 🚀 Traditional Media Quick Start Guide
## Getting Started with Billboard, TV, Radio, and Streaming Advertising

---

## 📋 **OVERVIEW**

This guide provides a quick start for implementing traditional and streaming media advertising management. Follow these steps to get up and running quickly.

---

## ⚡ **QUICK START (30 Minutes)**

### **Step 1: Database Setup (5 minutes)**

Add these tables to your database:

```sql
-- Run these in your Neon database or SQLite
-- See TRADITIONAL_MEDIA_TECHNICAL_SPEC.md for full schema
```

**Or use the database methods** (will be added to `database.js`):
- `createMediaCampaign()`
- `getMediaCampaigns()`
- `createMediaVendor()`
- `createMediaPlacement()`

### **Step 2: Create Basic API Handler (10 minutes)**

Create `server/handlers/media-campaigns-api.js`:

```javascript
const TNRDatabase = require('../../database');
const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');

module.exports = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) return;
  setCorsHeaders(res, origin);

  const db = new TNRDatabase();
  await db.initialize();

  if (req.method === 'GET') {
    const campaigns = await db.getMediaCampaigns();
    return res.status(200).json({ success: true, campaigns });
  }

  if (req.method === 'POST') {
    // Create campaign logic
  }
  // ... other methods
};
```

### **Step 3: Add Route (2 minutes)**

Add to `api/[...all].js`:

```javascript
if (route.startsWith("media/campaigns") || route === "media/campaigns") {
  const handler = require("../server/handlers/media-campaigns-api");
  return await handler(req, res);
}
```

### **Step 4: Create Basic Dashboard (10 minutes)**

Create `admin-media-campaigns.html` with:
- Campaign list view
- Create campaign button
- Basic filters
- Status indicators

### **Step 5: Test (3 minutes)**

1. Create a test campaign via API
2. View in dashboard
3. Verify database storage

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Week 1: Foundation**
1. ✅ Database schema
2. ✅ Basic API endpoints
3. ✅ Campaign list view
4. ✅ Create campaign form

### **Week 2: Core Features**
1. ✅ Campaign detail view
2. ✅ Vendor management
3. ✅ Placement creation
4. ✅ Basic analytics

### **Week 3: Integrations**
1. ✅ Call tracking setup
2. ✅ Website tracking
3. ✅ Performance metrics
4. ✅ Reporting

### **Week 4: Advanced**
1. ✅ Platform APIs
2. ✅ Automated workflows
3. ✅ Advanced analytics
4. ✅ Client reporting

---

## 📊 **SAMPLE DATA STRUCTURE**

### **Billboard Campaign Example**
```json
{
  "campaign_name": "Summer Insurance Promotion",
  "client_name": "ABC Insurance",
  "media_type": "billboard",
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "budget": 5000,
  "placements": [
    {
      "location": "Route 30, Greensburg",
      "board_size": "14x48",
      "daily_impressions": 45000,
      "cost": 5000
    }
  ]
}
```

### **TV Campaign Example**
```json
{
  "campaign_name": "Holiday Insurance Special",
  "client_name": "XYZ Insurance",
  "media_type": "tv",
  "start_date": "2024-11-15",
  "end_date": "2024-12-31",
  "budget": 15000,
  "placements": [
    {
      "station": "KDKA",
      "time_slot": "prime_time",
      "spots_per_week": 10,
      "spot_duration": 30,
      "cpm": 25.00
    }
  ]
}
```

---

## 🔗 **INTEGRATION CHECKLIST**

### **Billboard**
- [ ] Vendor contact information
- [ ] Location data (Google Maps)
- [ ] Traffic count data
- [ ] Creative asset upload
- [ ] Performance tracking

### **TV**
- [ ] Station partnerships
- [ ] Nielsen ratings integration
- [ ] Time slot booking
- [ ] Video asset management
- [ ] Performance metrics

### **Radio**
- [ ] Station partnerships
- [ ] Nielsen Audio integration
- [ ] Time slot booking
- [ ] Audio asset management
- [ ] Performance metrics

### **Streaming**
- [ ] Platform API access
- [ ] Campaign creation APIs
- [ ] Targeting setup
- [ ] Performance tracking
- [ ] Budget management

---

## 📞 **NEXT STEPS**

1. **Review Implementation Plan**: `TRADITIONAL_MEDIA_IMPLEMENTATION_PLAN.md`
2. **Review Technical Spec**: `TRADITIONAL_MEDIA_TECHNICAL_SPEC.md`
3. **Start with Database**: Create tables
4. **Build MVP**: Basic campaign management
5. **Add Integrations**: One platform at a time
6. **Expand Features**: Based on client needs

---

**Ready to start? Begin with Phase 1: Database Schema!**

