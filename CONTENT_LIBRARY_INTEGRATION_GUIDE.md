# 📚 Content Library - Integration Guide

## Overview

The Content Library is a centralized repository for managing reusable content across all posting and editing modules. It allows you to:

- ✅ **Save Content**: Store posts, emails, blog content, and more
- ✅ **Reuse Content**: Insert saved content into any module
- ✅ **Organize by Category**: Categorize content (Social Media, Email, Blog, etc.)
- ✅ **Tag Content**: Add tags for easy searching
- ✅ **Track Usage**: See how often content is used
- ✅ **Export/Import**: Backup and share content libraries

---

## Accessing the Content Library

### Direct Access
Navigate to: `/content-library.html`

### From Modules
- **Social Media Dashboard**: Click "📚 Content Library" button next to any content generator
- **Wix Content Manager**: Click "📚 Content Library" button in Pages tab
- **Email Campaigns**: Click "📚 Insert from Library" button above email content field

---

## Features

### 1. Content Management

#### Add Content
1. Click **"➕ Add Content"**
2. Fill in:
   - **Title** (required)
   - **Category** (required): Social Media, Email, Blog, Website, Advertising, General
   - **Platforms** (optional): Select one or more platforms
   - **Content** (required): Use rich text editor
   - **Tags** (optional): Comma-separated tags
   - **Notes** (optional): Internal notes
3. Click **"💾 Save Content"**

#### Edit Content
1. Find content in the grid
2. Click **"✏️ Edit"**
3. Modify fields
4. Click **"💾 Save Content"**

#### Delete Content
1. Find content in the grid
2. Click **"🗑️ Delete"**
3. Confirm deletion

---

### 2. Using Content in Modules

#### From Social Media Dashboard
1. Click **"📚 Content Library"** button
2. Content library opens in new window
3. Click **"📋 Use"** on desired content
4. Content is automatically inserted into the textarea
5. Edit if needed, then post

#### From Email Campaigns
1. Click **"📚 Insert from Library"** button
2. Content library opens
3. Click **"📋 Use"** on desired content
4. Content is inserted into email HTML field
5. Edit if needed, then send

#### From Wix Content Manager
1. Click **"📚 Content Library"** button
2. Content library opens
3. Click **"📋 Use"** on desired content
4. Content is inserted into page/blog editor
5. Edit if needed, then save

---

### 3. Search and Filter

#### Search
- Type in the search bar to search titles, content, and tags
- Press Enter or click "🔍 Search"

#### Filter by Category
- Click category filter chips
- View: All Categories, Social Media, Email, Blog, etc.

#### Filter by Platform
- Click platform filter chips
- View: All Platforms, Facebook, Instagram, Twitter, etc.

#### Filter by Type
- Filter by regular content or templates

---

### 4. Content Templates

#### Create Template
1. Click **"📝 Create Template"**
2. Fill in content (same as regular content)
3. Templates are marked for easy reuse

#### Use Template
- Templates appear in the library with a special badge
- Use like regular content

---

### 5. Export/Import

#### Export Library
1. Click **"📥 Export Library"**
2. JSON file downloads with all content
3. Use for backup or sharing

#### Import Library
1. Click **"📤 Import Library"**
2. Select JSON file
3. All content is imported
4. Duplicates are handled automatically

---

## Integration Points

### Social Media Dashboard
- **Facebook Content Generator**: Content Library button
- **Instagram Content Generator**: Content Library button
- **LinkedIn Content Generator**: Content Library button
- **Twitter/X Content Generator**: Content Library button
- **Nextdoor Content Generator**: Content Library button
- **Post Scheduler**: Insert from Library button

### Email Campaigns
- **Email HTML Content**: Insert from Library button
- Content is inserted as HTML

### Wix Content Manager
- **Page Content Editor**: Content Library button
- **Blog Post Editor**: Content Library button
- Content is inserted as HTML

---

## API Endpoints

### GET /api/content-library
List all content items
- Query params: `q` (search), `category`, `platform`, `isTemplate`

### GET /api/content-library/{id}
Get specific content item

### POST /api/content-library
Create or update content
- Body: `{ title, category, platforms, content, tags, notes, isTemplate }`

### DELETE /api/content-library/{id}
Delete content item

### PUT /api/content-library/{id}
Increment usage count

---

## Best Practices

### Organizing Content
- **Use Categories**: Always assign a category
- **Add Tags**: Use descriptive tags for easy searching
- **Platform Tags**: Tag content with applicable platforms
- **Regular Cleanup**: Remove unused content periodically

### Content Creation
- **Write Reusable Content**: Create content that can be adapted
- **Use Variables**: For email campaigns, use `{{name}}`, `{{company}}`
- **Keep Notes**: Add notes about when/where to use content
- **Version Control**: Create new versions instead of overwriting

### Workflow
1. Create content in Content Library
2. Use in appropriate module
3. Customize for specific use case
4. Save customized version back to library if reusable

---

## Technical Details

### Storage
- Content is stored in `content_library` table in database
- Supports rich text (HTML) content
- Tracks usage statistics
- Maintains creation/update timestamps

### Cross-Module Communication
- Uses `sessionStorage` for target identification
- Uses `localStorage` for content transfer
- Uses `StorageEvent` for cross-window communication
- Automatically strips HTML when inserting into plain textareas

### Rich Text Editor
- Uses Quill.js for rich text editing
- Supports formatting, links, images
- Converts to HTML for storage
- Strips HTML when inserting into plain text fields

---

## Troubleshooting

### Content Not Inserting
- Check that target textarea ID is correct
- Verify content library window is not blocked
- Check browser console for errors
- Try refreshing the page

### Content Formatting Issues
- Rich text content is stored as HTML
- Plain textareas receive stripped HTML (text only)
- Rich text editors receive full HTML

### Search Not Working
- Clear filters and try again
- Check search term spelling
- Verify content has matching tags

---

## Future Enhancements

Planned features:
- ✨ Content versioning
- ✨ Content scheduling
- ✨ A/B testing
- ✨ Content analytics
- ✨ Team collaboration
- ✨ Content approval workflow
- ✨ Bulk operations
- ✨ Content templates with variables

---

*Last updated: November 30, 2025*

