# 📺 Traditional & Streaming Media Implementation Plan
## Billboard, TV, Radio, and Streaming Television Advertising

---

## 🎯 **OVERVIEW**

This plan outlines the implementation of traditional and streaming media advertising management for TNR Business Solutions. This will enable clients to manage billboard, TV, radio, and streaming television campaigns alongside their digital marketing efforts.

---

## 📊 **CURRENT SYSTEM ANALYSIS**

### **Existing Infrastructure**
- ✅ CRM System (clients, leads, orders)
- ✅ Email Campaign Management
- ✅ Social Media Automation
- ✅ Analytics Tracking
- ✅ Database (Neon PostgreSQL)
- ✅ Admin Dashboard
- ✅ API Architecture

### **Integration Points**
- Campaign management system (extend existing)
- Client/lead management (link campaigns)
- Analytics dashboard (add media metrics)
- Order management (track media purchases)

---

## 🏗️ **PHASE 1: DATABASE SCHEMA**

### **1.1 Media Campaigns Table**
```sql
CREATE TABLE IF NOT EXISTS media_campaigns (
  id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  client_id TEXT,
  client_name TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'billboard', 'tv', 'radio', 'streaming'
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'completed', 'cancelled'
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  spent REAL DEFAULT 0,
  target_audience TEXT,
  geographic_target TEXT, -- Location/region
  content_description TEXT,
  creative_assets TEXT, -- JSON array of asset URLs
  tracking_url TEXT,
  phone_number TEXT, -- Call tracking number
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.2 Media Vendors Table**
```sql
CREATE TABLE IF NOT EXISTS media_vendors (
  id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'billboard', 'tv', 'radio', 'streaming'
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  pricing_model TEXT, -- 'per_spot', 'per_month', 'per_impression', 'cpm'
  base_rate REAL,
  minimum_budget REAL,
  coverage_area TEXT, -- Geographic coverage
  demographics TEXT, -- Target demographics
  ratings TEXT, -- TV/Radio ratings if applicable
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.3 Media Placements Table**
```sql
CREATE TABLE IF NOT EXISTS media_placements (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  placement_name TEXT NOT NULL,
  media_type TEXT NOT NULL,
  
  -- Billboard specific
  location_address TEXT,
  location_coordinates TEXT, -- lat, lng
  board_size TEXT, -- '14x48', '10x36', etc.
  board_type TEXT, -- 'digital', 'static', 'mobile'
  traffic_count INTEGER,
  visibility_score INTEGER, -- 1-10
  
  -- TV/Radio specific
  station_name TEXT,
  station_call_sign TEXT, -- e.g., 'KDKA', 'WTAE'
  time_slot TEXT, -- 'morning_drive', 'prime_time', etc.
  program_name TEXT,
  spot_duration INTEGER, -- seconds
  spots_per_week INTEGER,
  cpm REAL, -- Cost per thousand impressions
  
  -- Streaming specific
  platform_name TEXT, -- 'Hulu', 'YouTube TV', 'Roku', etc.
  ad_format TEXT, -- 'pre-roll', 'mid-roll', 'banner', etc.
  targeting_criteria TEXT, -- JSON
  
  -- Common fields
  start_date TEXT,
  end_date TEXT,
  total_cost REAL,
  impressions INTEGER,
  reach INTEGER,
  frequency REAL,
  status TEXT DEFAULT 'pending',
  performance_data TEXT, -- JSON for metrics
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.4 Media Creative Assets Table**
```sql
CREATE TABLE IF NOT EXISTS media_creative_assets (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  placement_id TEXT,
  asset_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'script'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- For video/audio in seconds
  dimensions TEXT, -- '1920x1080', etc.
  format TEXT, -- 'mp4', 'jpg', 'mp3', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **1.5 Media Performance Metrics Table**
```sql
CREATE TABLE IF NOT EXISTS media_performance_metrics (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  placement_id TEXT,
  metric_date TEXT NOT NULL,
  media_type TEXT NOT NULL,
  
  -- Common metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  frequency REAL DEFAULT 0,
  cost REAL DEFAULT 0,
  
  -- Digital/Streaming specific
  clicks INTEGER DEFAULT 0,
  click_through_rate REAL DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  
  -- Call tracking (for billboard/TV/Radio)
  calls INTEGER DEFAULT 0,
  call_duration REAL DEFAULT 0,
  
  -- Website tracking
  website_visits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0,
  
  -- Calculated metrics
  cpm REAL DEFAULT 0, -- Cost per thousand impressions
  cpc REAL DEFAULT 0, -- Cost per click
  cpa REAL DEFAULT 0, -- Cost per acquisition
  
  metadata TEXT, -- JSON for additional data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 **PHASE 2: USER INTERFACE**

### **2.1 Media Campaign Dashboard**
**File**: `admin-media-campaigns.html`

**Features**:
- Campaign list view with filters (status, media type, client, date range)
- Campaign creation wizard
- Campaign performance overview
- Quick stats cards (active campaigns, total spend, ROI)
- Calendar view for scheduled campaigns

**Sections**:
1. **Campaign Overview**
   - Active campaigns count
   - Total budget allocated
   - Total spend
   - Upcoming campaigns
   - Performance summary

2. **Campaign List**
   - Table with columns: Name, Client, Type, Status, Dates, Budget, Spend, ROI
   - Filters: Status, Media Type, Client, Date Range
   - Actions: View, Edit, Duplicate, Archive

3. **Quick Actions**
   - Create New Campaign
   - Import from CSV
   - Export Report
   - View Calendar

### **2.2 Campaign Creation Wizard**
**Multi-step form**:

**Step 1: Basic Information**
- Campaign name
- Client selection (from CRM)
- Campaign description
- Media type selection (Billboard, TV, Radio, Streaming)

**Step 2: Budget & Timeline**
- Total budget
- Start date
- End date
- Geographic targeting

**Step 3: Media Selection**
- Vendor selection (filtered by media type)
- Placement selection
- Time slots (for TV/Radio)
- Frequency/spots per week

**Step 4: Creative Assets**
- Upload images/videos/audio
- Asset specifications
- Approval workflow

**Step 5: Tracking Setup**
- Call tracking number
- Landing page URL
- UTM parameters
- Conversion goals

**Step 6: Review & Submit**
- Summary of all selections
- Budget breakdown
- Estimated reach/impressions
- Submit for approval

### **2.3 Vendor Management Interface**
**File**: `admin-media-vendors.html`

**Features**:
- Vendor directory
- Add/edit vendor information
- Pricing comparison
- Coverage area maps
- Performance history
- Contact management

### **2.4 Performance Analytics Dashboard**
**File**: `admin-media-analytics.html`

**Features**:
- Real-time performance metrics
- Campaign comparison charts
- ROI analysis
- Geographic performance maps
- Time-based trends
- Export reports

---

## 🔌 **PHASE 3: API INTEGRATIONS**

### **3.1 Billboard APIs**

#### **Outdoor Advertising Networks**
- **Lamar Advertising API** (if available)
- **Clear Channel Outdoor API** (if available)
- **JCDecaux API** (if available)
- **Custom vendor APIs**

**Implementation**:
- Vendor-specific integration handlers
- Inventory checking
- Booking/reservation system
- Performance data retrieval

### **3.2 TV Advertising APIs**

#### **Broadcast TV**
- **Nielsen API** - Ratings and audience data
- **TVB (Television Bureau of Advertising) API** - Market data
- **Station-specific APIs** (if available)

**Implementation**:
- Station inventory checking
- Ratings integration
- Spot scheduling
- Performance tracking

### **3.3 Radio Advertising APIs**

#### **Radio Networks**
- **iHeartMedia API** (if available)
- **Cumulus Media API** (if available)
- **Entercom/Audacy API** (if available)
- **Nielsen Audio API** - Ratings data

**Implementation**:
- Station inventory
- Time slot booking
- Ratings integration
- Performance metrics

### **3.4 Streaming Television APIs**

#### **Streaming Platforms**
- **Google Ads (YouTube TV)** - Already integrated
- **Hulu Ad Manager API**
- **Roku Advertising API**
- **Samsung Ads API**
- **The Trade Desk API** - Programmatic advertising
- **Magnite API** - SSP platform

**Implementation**:
- Campaign creation
- Targeting setup
- Budget management
- Performance tracking
- Real-time bidding (RTB) integration

---

## 📱 **PHASE 4: TRACKING & ANALYTICS**

### **4.1 Call Tracking**
- **Integration**: Twilio, CallRail, or custom solution
- **Features**:
  - Unique phone numbers per campaign
  - Call recording (with consent)
  - Call analytics (duration, outcome)
  - Call attribution to campaigns

### **4.2 Website Tracking**
- **UTM Parameters**: Automatic generation
- **Google Analytics**: Event tracking
- **Conversion Tracking**: Goal setup
- **Attribution Modeling**: Multi-touch attribution

### **4.3 Performance Metrics**
- **Impressions**: Estimated or actual
- **Reach**: Unique audience
- **Frequency**: Average exposures
- **CPM**: Cost per thousand impressions
- **ROI**: Return on investment
- **CPA**: Cost per acquisition

### **4.4 Reporting**
- **Daily/Weekly/Monthly Reports**
- **Campaign Performance Reports**
- **Client Reports** (white-label)
- **Vendor Performance Reports**
- **ROI Analysis Reports**

---

## 🛠️ **PHASE 5: TECHNICAL IMPLEMENTATION**

### **5.1 Database Methods** (`database.js`)

```javascript
// Media Campaigns
async createMediaCampaign(campaignData)
async getMediaCampaigns(filters)
async getMediaCampaign(campaignId)
async updateMediaCampaign(campaignId, updates)
async deleteMediaCampaign(campaignId)

// Media Vendors
async createMediaVendor(vendorData)
async getMediaVendors(mediaType)
async getMediaVendor(vendorId)
async updateMediaVendor(vendorId, updates)

// Media Placements
async createMediaPlacement(placementData)
async getMediaPlacements(campaignId)
async updateMediaPlacement(placementId, updates)

// Performance Metrics
async saveMediaMetrics(metricsData)
async getMediaMetrics(campaignId, dateRange)
async getMediaPerformanceSummary(campaignId)
```

### **5.2 API Handlers**

#### **`server/handlers/media-campaigns-api.js`**
- GET `/api/media/campaigns` - List campaigns
- POST `/api/media/campaigns` - Create campaign
- GET `/api/media/campaigns/:id` - Get campaign
- PUT `/api/media/campaigns/:id` - Update campaign
- DELETE `/api/media/campaigns/:id` - Delete campaign

#### **`server/handlers/media-vendors-api.js`**
- GET `/api/media/vendors` - List vendors
- POST `/api/media/vendors` - Create vendor
- GET `/api/media/vendors/:id` - Get vendor
- PUT `/api/media/vendors/:id` - Update vendor

#### **`server/handlers/media-placements-api.js`**
- GET `/api/media/placements` - List placements
- POST `/api/media/placements` - Create placement
- GET `/api/media/placements/:id` - Get placement
- PUT `/api/media/placements/:id` - Update placement

#### **`server/handlers/media-analytics-api.js`**
- GET `/api/media/analytics` - Get analytics
- POST `/api/media/analytics` - Save metrics
- GET `/api/media/analytics/:campaignId` - Campaign analytics

#### **`server/handlers/media-creative-api.js`**
- POST `/api/media/creative/upload` - Upload asset
- GET `/api/media/creative/:id` - Get asset
- DELETE `/api/media/creative/:id` - Delete asset

### **5.3 Integration Handlers**

#### **`server/handlers/media-billboard-api.js`**
- Billboard vendor integrations
- Inventory checking
- Booking management

#### **`server/handlers/media-tv-api.js`**
- TV station integrations
- Ratings data
- Spot scheduling

#### **`server/handlers/media-radio-api.js`**
- Radio station integrations
- Time slot booking
- Ratings integration

#### **`server/handlers/media-streaming-api.js`**
- Streaming platform integrations
- Campaign management
- Performance tracking

---

## 📋 **PHASE 6: WORKFLOW AUTOMATION**

### **6.1 Campaign Lifecycle**
1. **Draft** → Campaign created, not yet active
2. **Pending Approval** → Awaiting client/vendor approval
3. **Scheduled** → Approved, waiting for start date
4. **Active** → Currently running
5. **Completed** → Campaign ended
6. **Cancelled** → Campaign cancelled

### **6.2 Automated Workflows**
- **Campaign Start Notifications**: Email client when campaign goes live
- **Performance Alerts**: Notify if metrics drop below threshold
- **Budget Alerts**: Warn when approaching budget limit
- **End-of-Campaign Reports**: Auto-generate and send reports
- **Vendor Reminders**: Payment reminders, creative deadlines

### **6.3 Integration with Existing Systems**
- **CRM Integration**: Link campaigns to clients/leads
- **Email Campaigns**: Promote media campaigns via email
- **Social Media**: Announce campaigns on social platforms
- **Order Management**: Create orders for media purchases

---

## 💰 **PHASE 7: BILLING & FINANCIAL MANAGEMENT**

### **7.1 Budget Tracking**
- Campaign budget allocation
- Real-time spend tracking
- Budget alerts
- Over-budget prevention

### **7.2 Vendor Payments**
- Payment scheduling
- Invoice tracking
- Payment history
- Vendor payment terms

### **7.3 Client Billing**
- Client invoicing
- Payment tracking
- Revenue reporting
- Profit margin analysis

---

## 🎬 **PHASE 8: CREATIVE ASSET MANAGEMENT**

### **8.1 Asset Library**
- Upload and store creative assets
- Version control
- Approval workflow
- Asset specifications by media type

### **8.2 Content Generation Tools**
- **Billboard Design Templates**
- **TV Commercial Scripts**
- **Radio Spot Scripts**
- **Streaming Ad Templates**

### **8.3 Asset Specifications**
- **Billboard**: Sizes, formats, resolution
- **TV**: Video formats, durations, aspect ratios
- **Radio**: Audio formats, durations, file sizes
- **Streaming**: Video formats, interactive elements

---

## 📊 **PHASE 9: REPORTING & ANALYTICS**

### **9.1 Campaign Reports**
- Performance summary
- Budget vs. spend
- ROI analysis
- Reach and frequency
- Geographic performance

### **9.2 Client Reports**
- White-label reports
- Customizable templates
- Automated delivery
- PDF/Excel export

### **9.3 Vendor Reports**
- Vendor performance comparison
- Cost analysis
- Coverage analysis
- Recommendation engine

---

## 🚀 **PHASE 10: IMPLEMENTATION TIMELINE**

### **Sprint 1 (Week 1-2): Foundation**
- ✅ Database schema creation
- ✅ Basic API endpoints
- ✅ Campaign list view
- ✅ Vendor management

### **Sprint 2 (Week 3-4): Campaign Management**
- ✅ Campaign creation wizard
- ✅ Campaign editing
- ✅ Status management
- ✅ Basic analytics

### **Sprint 3 (Week 5-6): Integrations**
- ✅ Billboard vendor integrations
- ✅ TV/Radio integrations (basic)
- ✅ Streaming platform integrations
- ✅ Call tracking setup

### **Sprint 4 (Week 7-8): Analytics & Reporting**
- ✅ Performance metrics tracking
- ✅ Analytics dashboard
- ✅ Report generation
- ✅ Client reporting

### **Sprint 5 (Week 9-10): Advanced Features**
- ✅ Workflow automation
- ✅ Budget management
- ✅ Creative asset management
- ✅ Advanced analytics

### **Sprint 6 (Week 11-12): Testing & Refinement**
- ✅ End-to-end testing
- ✅ Performance optimization
- ✅ UI/UX improvements
- ✅ Documentation

---

## 🔐 **PHASE 11: SECURITY & COMPLIANCE**

### **11.1 Data Security**
- Encrypted storage of financial data
- Secure API communications
- Access control and permissions
- Audit logging

### **11.2 Compliance**
- **FCC Regulations**: Radio/TV advertising compliance
- **FTC Guidelines**: Truth in advertising
- **GDPR/CCPA**: Data privacy (if applicable)
- **Industry Standards**: Advertising industry best practices

---

## 💡 **PHASE 12: FUTURE ENHANCEMENTS**

### **12.1 AI-Powered Features**
- **Campaign Optimization**: AI-driven budget allocation
- **Audience Targeting**: Predictive audience analysis
- **Creative Testing**: A/B testing automation
- **Performance Prediction**: Forecast campaign results

### **12.2 Advanced Integrations**
- **Programmatic Advertising**: Real-time bidding
- **DSP Integration**: Demand-side platforms
- **DMP Integration**: Data management platforms
- **Attribution Modeling**: Advanced multi-touch attribution

### **12.3 Mobile App**
- Campaign management on mobile
- Real-time notifications
- Performance monitoring
- Quick approvals

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Database**
- [ ] Create `media_campaigns` table
- [ ] Create `media_vendors` table
- [ ] Create `media_placements` table
- [ ] Create `media_creative_assets` table
- [ ] Create `media_performance_metrics` table
- [ ] Add indexes for performance
- [ ] Create database methods

### **API Endpoints**
- [ ] Media campaigns API
- [ ] Media vendors API
- [ ] Media placements API
- [ ] Media analytics API
- [ ] Media creative API
- [ ] Billboard integration API
- [ ] TV integration API
- [ ] Radio integration API
- [ ] Streaming integration API

### **User Interface**
- [ ] Media campaigns dashboard
- [ ] Campaign creation wizard
- [ ] Campaign detail view
- [ ] Vendor management interface
- [ ] Analytics dashboard
- [ ] Creative asset library
- [ ] Reporting interface

### **Integrations**
- [ ] Call tracking setup
- [ ] Website tracking setup
- [ ] Google Analytics integration
- [ ] Billboard vendor APIs
- [ ] TV station APIs
- [ ] Radio station APIs
- [ ] Streaming platform APIs

### **Features**
- [ ] Budget tracking
- [ ] Performance metrics
- [ ] Automated reporting
- [ ] Workflow automation
- [ ] Asset management
- [ ] Client billing

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- Campaign creation time: < 10 minutes
- API response time: < 500ms
- Report generation: < 30 seconds
- System uptime: 99.9%

### **Business Metrics**
- Client satisfaction: > 90%
- Campaign ROI tracking: 100%
- Vendor management efficiency: 50% time saved
- Report automation: 80% reduction in manual work

---

## 📞 **SUPPORT & RESOURCES**

### **Vendor Resources**
- Billboard vendors: Local outdoor advertising companies
- TV stations: Local broadcast networks
- Radio stations: Local radio networks
- Streaming platforms: Hulu, Roku, YouTube TV, etc.

### **API Documentation**
- Platform-specific API docs
- Integration guides
- Rate limits and quotas
- Best practices

---

**Status**: 📋 Planning Phase  
**Priority**: High  
**Estimated Timeline**: 12 weeks  
**Team Size**: 2-3 developers

