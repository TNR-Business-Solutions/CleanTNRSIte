# Email Campaigns Feature Module

## Purpose
Email marketing campaign system for creating and sending personalized email campaigns to leads and clients.

## Files
- `index.html` - Campaigns main page
- `styles.css` - Campaigns-specific styles
- `campaigns.js` - Campaigns JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities

## Features

### Campaign Creation
- Subject line with personalization variables ({{name}}, {{company}}, {{email}})
- HTML email content editor
- Plain text fallback (auto-generated if not provided)
- Audience selection (Leads or Clients)
- Advanced filtering:
  - Search (name, email)
  - Status
  - Business Type
  - Source
  - Interest (for leads only)

### Campaign Sending
- Preview audience count before sending
- Send campaigns via SMTP
- Real-time sending status
- Success/failure reporting with counts
- Error logging

### Personalization
- Use `{{name}}` for recipient name
- Use `{{company}}` for company name
- Use `{{email}}` for email address
- Variables are automatically replaced when sending

## API Endpoints Used
- `GET /api/campaigns/audience?type=:type&...filters` - Get audience count
- `POST /api/campaigns/send` - Send campaign

## Usage
Navigate to `/admin/campaigns/` to access the campaigns feature.

## Example Campaign

**Subject:**
```
Welcome {{name}}! Let's Grow Your {{company}}
```

**HTML Content:**
```html
<h1>Hello {{name}}!</h1>
<p>Thank you for your interest in our services for {{company}}.</p>
<p>We'd love to help you grow your business!</p>
<p>Best regards,<br>TNR Business Solutions</p>
```

## Testing
1. Open `/admin/campaigns/index.html` in browser
2. Fill in campaign subject and HTML content
3. Select audience type (Leads or Clients)
4. Optionally add filters to target specific audience
5. Click "Preview Audience Count" to see how many recipients
6. Click "Send Campaign" to send
7. Review results

## Notes
- Campaigns use SMTP settings from environment variables
- Personalization variables are case-sensitive
- Plain text version is auto-generated from HTML if not provided
- Interest filter only appears when audience type is "Leads"

