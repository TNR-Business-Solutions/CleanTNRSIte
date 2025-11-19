# Analytics Feature Module

## Purpose
Performance analytics and reporting system for tracking business metrics and KPIs.

## Files
- `index.html` - Analytics main page
- `styles.css` - Analytics-specific styles
- `analytics.js` - Analytics JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities

## Features

### Overview Metrics
- **Total Clients** - Total number of clients with active count
- **Total Leads** - Total number of leads with new leads count
- **Conversion Rate** - Percentage of leads converted to clients
- **Total Revenue** - Total revenue with completed orders count

### Lead Sources
- Breakdown of leads by source
- Percentage distribution
- Top 5 lead sources displayed

### Business Types
- Breakdown of clients/leads by business type
- Count per business type
- Top 5 business types displayed

### Recent Activity
- New clients in last 30 days
- New leads in last 30 days
- Activity tracking over time

## API Endpoints Used
- `GET /api/analytics?type=all` - Get all analytics data

## Analytics Data Structure

```javascript
{
  overview: {
    totalClients: number,
    activeClients: number,
    totalLeads: number,
    newLeads: number,
    conversionRate: number,
    totalRevenue: number,
    completedOrders: number
  },
  leadSources: [
    {
      source: string,
      count: number,
      percentage: number
    }
  ],
  businessTypes: [
    {
      type: string,
      count: number
    }
  ],
  recentActivity: {
    newClients: number,
    newLeads: number
  }
}
```

## Usage
Navigate to `/admin/analytics/` to access the analytics feature.

## Auto-Refresh
The analytics page automatically refreshes every 5 minutes to show the latest data.

## Testing
1. Open `/admin/analytics/index.html` in browser
2. Verify analytics data loads correctly
3. Check overview metrics display
4. Verify lead sources breakdown
5. Verify business types breakdown
6. Check recent activity section
7. Test refresh button
8. Verify auto-refresh functionality

## Notes
- Revenue is formatted (K for thousands, M for millions)
- Only top 5 lead sources and business types are displayed
- Recent activity covers the last 30 days
- All data is fetched from the API endpoint

