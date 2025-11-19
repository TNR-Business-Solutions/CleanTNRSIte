# TNR Business Solutions - Complete Social Media Setup Guide

## 🚀 Overview
This guide will help you connect TNR Business Solutions to all major social media platforms for automated posting and management.

## 📋 Prerequisites
- Admin access to TNR Business Solutions
- Business accounts on all platforms
- Developer accounts where required

## 🔗 Platform Setup Instructions

### 1. LinkedIn Setup
**Purpose**: Professional networking and B2B marketing

**Steps**:
1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Create a new app or use existing "Automation" app
3. Request "w_member_social" permission for posting
4. Generate OAuth 2.0 access token
5. Copy the access token to the setup page

**Required Permissions**:
- `w_member_social` - Post content on behalf of the user

**API Endpoints Used**:
- Profile: `https://api.linkedin.com/v2/people/~`
- Posts: `https://api.linkedin.com/v2/ugcPosts`

### 2. Facebook Setup
**Purpose**: Social media marketing and community building

**Steps**:
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create a new app or use existing app
3. Add "Facebook Login" and "Pages" products
4. Generate Page Access Token
5. Copy the Page Access Token to the setup page

**Required Permissions**:
- `pages_manage_posts` - Manage posts on pages
- `pages_read_engagement` - Read page insights

**API Endpoints Used**:
- Posts: `https://graph.facebook.com/v18.0/{page-id}/feed`

### 3. Instagram Setup
**Purpose**: Visual content marketing

**Steps**:
1. Connect Instagram Business Account to Facebook Page
2. Use the same Facebook Page Access Token (Instagram uses Facebook's API)
3. Instagram will automatically work with Facebook token

**Required Permissions**:
- Same as Facebook (Instagram uses Facebook's API)

**API Endpoints Used**:
- Posts: `https://graph.facebook.com/v18.0/{instagram-account-id}/media`

### 4. Twitter Setup
**Purpose**: Real-time updates and engagement

**Steps**:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use existing app
3. Generate API Key, API Secret, Access Token, and Access Token Secret
4. Copy all credentials to the setup page

**Required Permissions**:
- Read and write access
- Tweet posting permissions

**API Endpoints Used**:
- Posts: `https://api.twitter.com/2/tweets`

### 5. Buffer Setup (Optional)
**Purpose**: Advanced scheduling and analytics

**Steps**:
1. Go to [Buffer Developers](https://buffer.com/developers/apps)
2. Create a new app
3. Generate Access Token
4. Copy the Access Token to the setup page

**Required Permissions**:
- Read and write access to connected social accounts

## 🛠️ Technical Implementation

### API Integration Files
- `social-media-api-integration.js` - Main API integration class
- `admin-linkedin-proxy.js` - LinkedIn proxy server (port 3002)
- `tnr-social-media-setup.html` - Setup interface

### Security Features
- All API calls require admin authentication
- Tokens stored in localStorage (encrypted in production)
- Proxy server prevents CORS issues
- Admin-only access to sensitive endpoints

### Error Handling
- Comprehensive error messages
- Connection testing before posting
- Fallback mechanisms for failed posts
- Detailed logging for debugging

## 📊 Content Management

### Content Types Supported
- Service promotion posts
- Industry-specific content
- Educational content
- Social proof posts
- Behind-the-scenes content
- Seasonal campaigns
- Crisis management posts

### Industry Templates
- Blue Collar (Construction, Manufacturing, etc.)
- White Collar (Professional Services, etc.)
- E-Business (Online Retail, SaaS, etc.)
- Service Industry (Restaurants, Salons, etc.)
- Retail (Physical Stores, etc.)
- Healthcare (Medical Practices, etc.)
- Real Estate (Agents, Brokers, etc.)

### Content Options (4 per industry)
1. **Direct Promotion** - Straightforward service promotion
2. **Educational** - Informative, value-driven content
3. **Social Proof** - Testimonials and success stories
4. **Behind Scenes** - Process and team insights

## 🚀 Getting Started

### Step 1: Access Setup Page
1. Go to `http://localhost:5000/tnr-social-media-setup.html`
2. Or access through admin dashboard

### Step 2: Configure Each Platform
1. Follow the step-by-step instructions for each platform
2. Test each connection before proceeding
3. Save settings when complete

### Step 3: Test All Connections
1. Click "Test All Connections" button
2. Verify all platforms are connected
3. Check for any error messages

### Step 4: Start Automating
1. Go to the social media dashboard
2. Generate content using templates
3. Schedule posts across all platforms
4. Monitor performance and engagement

## 📈 Monitoring and Analytics

### Built-in Analytics
- Post performance tracking
- Engagement metrics
- Click-through rates
- Reach and impressions

### Reporting Features
- Weekly performance reports
- Monthly analytics summaries
- ROI tracking
- Client-specific reports

## 🔧 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure proxy server is running
2. **Authentication Failures**: Check token validity
3. **Permission Errors**: Verify app permissions
4. **Rate Limiting**: Implement proper delays

### Support Resources
- Platform-specific documentation
- API status pages
- Error code references
- Community forums

## 🎯 Best Practices

### Content Strategy
- Post consistently across all platforms
- Use platform-specific formatting
- Include relevant hashtags
- Engage with comments and messages

### Technical Best Practices
- Test connections regularly
- Monitor API rate limits
- Keep tokens secure
- Backup settings regularly

### Business Growth
- Track which content performs best
- A/B test different approaches
- Scale successful campaigns
- Adapt to platform algorithm changes

## 📞 Support

For technical support or questions:
- Email: roy.turner@tnrbusinesssolutions.com
- Phone: (412) 499-2987
- Website: www.tnrbusinesssolutions.com

## 🔄 Updates and Maintenance

### Regular Tasks
- Update API tokens before expiration
- Monitor platform policy changes
- Test connections monthly
- Review and update content templates

### Version Control
- All changes tracked in Git
- Regular backups of settings
- Rollback capability for issues
- Documentation updates

---

**Last Updated**: January 8, 2025
**Version**: 1.0
**Status**: Production Ready
