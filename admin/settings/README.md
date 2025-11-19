# Settings Feature Module

## Purpose
System settings and business information configuration.

## Files
- `index.html` - Settings main page
- `styles.css` - Settings-specific styles
- `settings.js` - Settings JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities

## Features

### Business Information
- Business Name
- Business Email
- Business Phone
- Business Address

### Settings Management
- Save settings to API
- Fallback to localStorage
- Reset to default values
- Form validation

## API Endpoints Used
- `GET /api/settings` - Get settings
- `POST /api/settings` - Save settings

## Usage
Navigate to `/admin/settings/` to access the settings feature.

## Default Values
- Business Name: TNR Business Solutions
- Business Email: roy.turner@tnrbusinesssolutions.com
- Business Phone: (412) 499-2987
- Business Address: 418 Concord Avenue, Greensburg, PA 15601

## Testing
1. Open `/admin/settings/index.html` in browser
2. Modify settings
3. Click "Save Settings"
4. Verify settings are saved
5. Test reset functionality

