# Social Media Feature Module

## Purpose
Social media account management and authentication system for connecting and managing social media platforms.

## Files
- `index.html` - Social Media main page
- `styles.css` - Social Media-specific styles
- `social.js` - Social Media JavaScript functions

## Dependencies
- `admin/shared/header.html` - Admin header navigation
- `admin/shared/styles.css` - Shared admin styles
- `admin/shared/utils.js` - Common utilities

## Features

### Token Management
- View all connected social media accounts
- Test token validity
- Delete tokens
- Refresh token list
- Platform-specific icons and information

### Account Connection
- Connect Facebook/Instagram via OAuth
- Connect LinkedIn via OAuth
- Connect X (Twitter) via OAuth
- Direct links to authentication endpoints

### Dashboard Cards
- Social Media Dashboard link
- Content Templates link
- Post Scheduler link

## Supported Platforms

### Facebook
- Platform icon: 📘
- OAuth endpoint: `/api/auth/meta`
- Supports Facebook Pages

### Instagram
- Platform icon: 📷
- OAuth endpoint: `/api/auth/meta`
- Supports Instagram Business accounts
- Shows Instagram username and account ID

### LinkedIn
- Platform icon: 💼
- OAuth endpoint: `/api/auth/linkedin`
- Supports LinkedIn Pages

### X (Twitter)
- Platform icon: 🐦
- OAuth endpoint: `/api/auth/twitter`
- Supports Twitter accounts

## API Endpoints Used
- `GET /api/social/tokens` - Get all tokens
- `POST /api/social/tokens?action=test` - Test token validity
- `DELETE /api/social/tokens?tokenId=:id` - Delete token
- `GET /api/auth/meta` - Facebook/Instagram OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth
- `GET /api/auth/twitter` - Twitter OAuth

## Token Information Displayed
- Platform name
- Page/Account name
- Token status (Valid/Missing)
- Expiration date
- Created date
- Platform-specific details (e.g., Instagram username)

## Usage
Navigate to `/admin/social/` to access the social media feature.

## Testing
1. Open `/admin/social/index.html` in browser
2. Click "Connect Facebook/Instagram" to connect an account
3. View connected accounts in the tokens list
4. Click "🧪 Test" to verify token validity
5. Click "🗑️ Delete" to remove a token
6. Click "🔄 Refresh" to reload the token list

## Notes
- Tokens are stored in the database
- Token expiration is tracked and displayed
- Invalid tokens can be tested and reconnected
- Platform-specific information is displayed when available

