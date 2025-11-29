# 📺 Traditional Media Technical Specification
## Detailed Implementation Guide for Billboard, TV, Radio, and Streaming

---

## 🗄️ **DATABASE SCHEMA DETAILS**

### **Media Campaigns Table**
```sql
CREATE TABLE IF NOT EXISTS media_campaigns (
  id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  client_id TEXT,
  client_name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK(media_type IN ('billboard', 'tv', 'radio', 'streaming')),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_approval', 'scheduled', 'active', 'completed', 'cancelled')),
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  spent REAL DEFAULT 0,
  target_audience TEXT,
  geographic_target TEXT,
  content_description TEXT,
  creative_assets TEXT,
  tracking_url TEXT,
  phone_number TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_campaigns_client ON media_campaigns(client_id);
CREATE INDEX idx_media_campaigns_type ON media_campaigns(media_type);
CREATE INDEX idx_media_campaigns_status ON media_campaigns(status);
CREATE INDEX idx_media_campaigns_dates ON media_campaigns(start_date, end_date);
```

### **Media Vendors Table**
```sql
CREATE TABLE IF NOT EXISTS media_vendors (
  id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK(media_type IN ('billboard', 'tv', 'radio', 'streaming')),
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  pricing_model TEXT,
  base_rate REAL,
  minimum_budget REAL,
  coverage_area TEXT,
  demographics TEXT,
  ratings TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_vendors_type ON media_vendors(media_type);
CREATE INDEX idx_media_vendors_active ON media_vendors(is_active);
```

### **Media Placements Table**
```sql
CREATE TABLE IF NOT EXISTS media_placements (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  vendor_id TEXT NOT NULL,
  placement_name TEXT NOT NULL,
  media_type TEXT NOT NULL,
  
  -- Billboard fields
  location_address TEXT,
  location_coordinates TEXT,
  board_size TEXT,
  board_type TEXT,
  traffic_count INTEGER,
  visibility_score INTEGER,
  daily_impressions INTEGER,
  
  -- TV/Radio fields
  station_name TEXT,
  station_call_sign TEXT,
  network TEXT,
  time_slot TEXT,
  program_name TEXT,
  spot_duration INTEGER,
  spots_per_week INTEGER,
  cpm REAL,
  ratings_points REAL,
  
  -- Streaming fields
  platform_name TEXT,
  ad_format TEXT,
  targeting_criteria TEXT,
  device_targeting TEXT,
  
  -- Common fields
  start_date TEXT,
  end_date TEXT,
  total_cost REAL,
  impressions INTEGER,
  reach INTEGER,
  frequency REAL,
  status TEXT DEFAULT 'pending',
  performance_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES media_campaigns(id),
  FOREIGN KEY (vendor_id) REFERENCES media_vendors(id)
);

CREATE INDEX idx_media_placements_campaign ON media_placements(campaign_id);
CREATE INDEX idx_media_placements_vendor ON media_placements(vendor_id);
CREATE INDEX idx_media_placements_type ON media_placements(media_type);
```

---

## 🔌 **API ENDPOINTS**

### **Campaign Management**
```
GET    /api/media/campaigns              - List all campaigns
GET    /api/media/campaigns/:id          - Get campaign details
POST   /api/media/campaigns              - Create new campaign
PUT    /api/media/campaigns/:id          - Update campaign
DELETE /api/media/campaigns/:id          - Delete campaign
POST   /api/media/campaigns/:id/activate - Activate campaign
POST   /api/media/campaigns/:id/pause    - Pause campaign
```

### **Vendor Management**
```
GET    /api/media/vendors                 - List vendors
GET    /api/media/vendors/:id             - Get vendor details
POST   /api/media/vendors                 - Add vendor
PUT    /api/media/vendors/:id             - Update vendor
DELETE /api/media/vendors/:id             - Delete vendor
GET    /api/media/vendors/type/:type      - Get vendors by media type
```

### **Placement Management**
```
GET    /api/media/placements              - List placements
GET    /api/media/placements/:id          - Get placement details
POST   /api/media/placements              - Create placement
PUT    /api/media/placements/:id          - Update placement
DELETE /api/media/placements/:id         - Delete placement
GET    /api/media/placements/campaign/:campaignId - Get placements for campaign
```

### **Analytics & Performance**
```
GET    /api/media/analytics               - Get analytics data
GET    /api/media/analytics/:campaignId   - Get campaign analytics
POST   /api/media/analytics               - Save performance metrics
GET    /api/media/analytics/summary       - Get summary metrics
GET    /api/media/analytics/roi           - Get ROI analysis
```

### **Creative Assets**
```
GET    /api/media/creative                - List assets
GET    /api/media/creative/:id            - Get asset
POST   /api/media/creative/upload         - Upload asset
DELETE /api/media/creative/:id            - Delete asset
GET    /api/media/creative/campaign/:campaignId - Get campaign assets
```

---

## 🎯 **PLATFORM-SPECIFIC IMPLEMENTATIONS**

### **1. Billboard Advertising**

#### **Vendor Types**
- **Digital Billboards**: Rotating ads, real-time updates
- **Static Billboards**: Traditional printed ads
- **Mobile Billboards**: Vehicle-mounted displays
- **Transit Advertising**: Bus, subway, airport displays

#### **Key Metrics**
- **Traffic Count**: Daily vehicle/pedestrian traffic
- **Visibility Score**: 1-10 rating
- **Demographics**: Audience composition
- **Location Value**: Prime vs. secondary locations

#### **Integration Points**
- Google Maps API for location data
- Traffic data APIs
- Vendor management systems
- Creative asset upload (high-res images)

### **2. TV Advertising**

#### **Station Types**
- **Network Affiliates**: ABC, CBS, NBC, FOX
- **Cable Networks**: ESPN, CNN, Discovery, etc.
- **Local Stations**: Independent broadcasters
- **Syndicated Programming**: National shows

#### **Time Slots**
- **Morning Drive**: 6 AM - 10 AM
- **Daytime**: 10 AM - 4 PM
- **Early Fringe**: 4 PM - 7 PM
- **Prime Time**: 7 PM - 11 PM
- **Late Night**: 11 PM - 2 AM

#### **Key Metrics**
- **Ratings Points**: Nielsen ratings
- **Share**: Percentage of viewing audience
- **CPM**: Cost per thousand impressions
- **Reach & Frequency**: Audience metrics

#### **Integration Points**
- Nielsen API (ratings data)
- Station inventory systems
- TVB (Television Bureau of Advertising) data
- Video asset management

### **3. Radio Advertising**

#### **Station Formats**
- **News/Talk**: Information and discussion
- **Music Formats**: Country, Rock, Pop, etc.
- **Sports**: Play-by-play and sports talk
- **Business**: Financial and business news

#### **Time Slots**
- **Morning Drive**: 6 AM - 10 AM (highest listenership)
- **Midday**: 10 AM - 3 PM
- **Afternoon Drive**: 3 PM - 7 PM
- **Evening**: 7 PM - 12 AM
- **Overnight**: 12 AM - 6 AM

#### **Key Metrics**
- **AQH (Average Quarter Hour)**: Listeners per 15 minutes
- **Cume**: Cumulative unique listeners
- **Time Spent Listening**: Average duration
- **CPM**: Cost per thousand listeners

#### **Integration Points**
- Nielsen Audio API
- Station traffic systems
- Audio asset management
- Script generation tools

### **4. Streaming Television**

#### **Platforms**
- **Hulu**: Ad-supported streaming
- **YouTube TV**: Live TV streaming
- **Roku**: Connected TV platform
- **Samsung TV Plus**: Free ad-supported TV
- **Pluto TV**: Free streaming service
- **Tubi**: Free ad-supported streaming
- **Peacock**: NBCUniversal streaming

#### **Ad Formats**
- **Pre-roll**: Before content
- **Mid-roll**: During content
- **Post-roll**: After content
- **Banner Ads**: Overlay ads
- **Interactive Ads**: Clickable content

#### **Targeting Options**
- **Demographics**: Age, gender, income
- **Geographic**: Location-based
- **Behavioral**: Viewing habits
- **Contextual**: Content-based
- **Device**: Smart TV, mobile, tablet

#### **Integration Points**
- Platform-specific APIs
- Programmatic advertising (DSP)
- Real-time bidding (RTB)
- Video asset management
- Performance tracking APIs

---

## 📊 **TRACKING & ATTRIBUTION**

### **Call Tracking**
```javascript
// Integration with Twilio or CallRail
{
  campaignId: "campaign-123",
  phoneNumber: "+1-412-499-2987",
  trackingNumber: "+1-412-XXX-XXXX", // Unique per campaign
  callRecording: true,
  callAnalytics: {
    duration: 120,
    outcome: "qualified_lead",
    callerId: "masked",
    timestamp: "2024-11-28T10:00:00Z"
  }
}
```

### **Website Tracking**
```javascript
// UTM Parameters
{
  utm_source: "billboard_campaign_123",
  utm_medium: "outdoor",
  utm_campaign: "summer_promotion",
  utm_content: "location_downtown",
  utm_term: "insurance_services"
}
```

### **Conversion Tracking**
- **Google Analytics Events**
- **Facebook Pixel Events**
- **Custom Conversion Goals**
- **Multi-touch Attribution**

---

## 💻 **CODE EXAMPLES**

### **Create Media Campaign**
```javascript
// POST /api/media/campaigns
{
  campaign_name: "Summer Insurance Promotion",
  client_id: "client-123",
  client_name: "ABC Insurance",
  media_type: "billboard",
  start_date: "2024-06-01",
  end_date: "2024-08-31",
  budget: 5000,
  target_audience: "Adults 25-54, Homeowners",
  geographic_target: "Greensburg, PA and surrounding areas",
  content_description: "Promote home insurance with summer safety tips",
  tracking_url: "https://tnrbusinesssolutions.com/summer-promo",
  phone_number: "+1-412-499-2987"
}
```

### **Create Billboard Placement**
```javascript
// POST /api/media/placements
{
  campaign_id: "campaign-123",
  vendor_id: "vendor-456",
  placement_name: "Route 30 Digital Billboard",
  media_type: "billboard",
  location_address: "123 Route 30, Greensburg, PA 15601",
  location_coordinates: "40.3014,-79.5389",
  board_size: "14x48",
  board_type: "digital",
  traffic_count: 45000,
  visibility_score: 9,
  daily_impressions: 45000,
  start_date: "2024-06-01",
  end_date: "2024-08-31",
  total_cost: 5000,
  status: "scheduled"
}
```

### **Save Performance Metrics**
```javascript
// POST /api/media/analytics
{
  campaign_id: "campaign-123",
  placement_id: "placement-789",
  metric_date: "2024-06-15",
  media_type: "billboard",
  impressions: 45000,
  reach: 35000,
  frequency: 1.3,
  cost: 166.67,
  website_visits: 125,
  calls: 8,
  conversions: 3,
  cpm: 3.70,
  cpa: 55.56
}
```

---

## 🔗 **INTEGRATION PARTNERS**

### **Billboard Networks**
- **Lamar Advertising**: https://www.lamar.com
- **Clear Channel Outdoor**: https://www.clearchanneloutdoor.com
- **JCDecaux**: https://www.jcdecaux.com
- **Outfront Media**: https://www.outfront.com

### **TV Networks**
- **Nielsen**: Ratings and audience data
- **TVB**: Television Bureau of Advertising
- **Local Stations**: Direct partnerships
- **Cable Networks**: National advertising

### **Radio Networks**
- **iHeartMedia**: https://www.iheartmedia.com
- **Cumulus Media**: https://www.cumulusmedia.com
- **Audacy**: https://www.audacy.com
- **Nielsen Audio**: Ratings data

### **Streaming Platforms**
- **Hulu Ad Manager**: https://advertising.hulu.com
- **Roku Advertising**: https://advertising.roku.com
- **Samsung Ads**: https://www.samsungads.com
- **YouTube TV**: Google Ads integration
- **The Trade Desk**: Programmatic platform
- **Magnite**: SSP platform

---

## 📈 **ANALYTICS DASHBOARD FEATURES**

### **Campaign Overview**
- Total campaigns (active, scheduled, completed)
- Total budget vs. spend
- Overall ROI
- Top performing campaigns
- Upcoming campaigns calendar

### **Performance Metrics**
- Impressions over time
- Reach and frequency charts
- Cost efficiency (CPM, CPC, CPA)
- Conversion tracking
- Geographic performance maps

### **Comparison Tools**
- Campaign vs. campaign
- Vendor vs. vendor
- Media type comparison
- Time period comparison

### **ROI Analysis**
- Revenue attribution
- Cost per acquisition
- Lifetime value analysis
- Multi-channel attribution

---

## 🎨 **CREATIVE ASSET SPECIFICATIONS**

### **Billboard**
- **Digital**: 1920x1080 (Full HD), 3840x2160 (4K)
- **Static**: 300 DPI minimum
- **Formats**: JPG, PNG, PDF
- **Aspect Ratio**: 14:48 (standard), 10:36 (junior)

### **TV Commercial**
- **Resolution**: 1920x1080 (HD), 3840x2160 (4K)
- **Frame Rate**: 29.97 fps (NTSC), 25 fps (PAL)
- **Format**: MP4 (H.264), MOV (ProRes)
- **Duration**: 15s, 30s, 60s
- **Audio**: Stereo, 48kHz

### **Radio Spot**
- **Format**: MP3, WAV
- **Bitrate**: 128kbps minimum, 320kbps preferred
- **Sample Rate**: 44.1kHz or 48kHz
- **Duration**: 15s, 30s, 60s
- **Channels**: Mono or Stereo

### **Streaming Ad**
- **Resolution**: 1920x1080 (HD)
- **Format**: MP4 (H.264 or H.265)
- **Duration**: 6s, 15s, 30s
- **File Size**: Platform-specific limits
- **Interactive Elements**: Clickable CTAs

---

## 🚀 **QUICK START IMPLEMENTATION**

### **Phase 1: MVP (Minimum Viable Product)**
1. Database schema (5 tables)
2. Basic campaign CRUD operations
3. Simple dashboard UI
4. Vendor management
5. Basic reporting

### **Phase 2: Core Features**
1. Campaign creation wizard
2. Placement management
3. Performance tracking
4. Analytics dashboard
5. Call tracking integration

### **Phase 3: Advanced Features**
1. Platform integrations
2. Automated reporting
3. Budget management
4. Creative asset library
5. Advanced analytics

---

## 📋 **REQUIREMENTS CHECKLIST**

### **Must Have**
- [ ] Campaign creation and management
- [ ] Vendor directory
- [ ] Budget tracking
- [ ] Performance metrics
- [ ] Basic reporting

### **Should Have**
- [ ] Platform API integrations
- [ ] Call tracking
- [ ] Automated workflows
- [ ] Advanced analytics
- [ ] Client reporting

### **Nice to Have**
- [ ] AI-powered optimization
- [ ] Programmatic advertising
- [ ] Mobile app
- [ ] Real-time bidding
- [ ] Predictive analytics

---

**Next Steps**: Review plan, prioritize features, begin Phase 1 implementation

