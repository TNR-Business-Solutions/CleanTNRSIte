# 📝 Wix Content Manager - User Guide

## Overview

The Wix Content Manager is a comprehensive tool for editing and managing content on Wix sites. It allows you to:

- ✅ **Manage Pages**: Create, edit, and delete pages
- ✅ **Manage Blog Posts**: Create, edit, and delete blog posts
- ✅ **View Collections**: Browse CMS collections and their items
- ✅ **Edit Content Elements**: View and edit page elements (coming soon)

---

## Accessing the Content Manager

### From Wix Client Dashboard

1. Go to **Wix Client Management Dashboard** (`/wix-client-dashboard.html`)
2. Find your client in the list
3. Click the **"📝 Content"** button
4. Or click **"Launch Content Manager"** in the features section

### Direct Access

Navigate to: `/wix-content-manager.html?instanceId=YOUR_INSTANCE_ID`

---

## Features

### 📄 Pages Management

#### View All Pages
- All pages are automatically loaded when you select a client
- Click **"🔄 Refresh"** to reload the page list

#### Add New Page
1. Click **"➕ Add New Page"**
2. Fill in the form:
   - **Page Title** (required)
   - **Page URL** (slug) - auto-generated if left empty
   - **Page Description**
   - **SEO Title**
   - **SEO Description**
   - **Page Content** (HTML)
3. Click **"💾 Save Page"**

#### Edit Existing Page
1. Find the page in the list
2. Click **"✏️ Edit"**
3. Modify the fields
4. Click **"💾 Save Page"**

#### Delete Page
1. Find the page in the list
2. Click **"🗑️ Delete"**
3. Confirm deletion

---

### 📰 Blog Posts Management

#### View All Blog Posts
- Switch to the **"📰 Blog Posts"** tab
- All blog posts are automatically loaded

#### Create New Blog Post
1. Click **"➕ New Blog Post"**
2. Fill in the form:
   - **Post Title** (required)
   - **Post URL** (slug) - auto-generated if left empty
   - **Excerpt**
   - **Content** (HTML, required)
   - **Featured Image URL**
   - **Category**
   - **Tags** (comma-separated)
   - **Publish Date**
   - **Status** (Published/Draft)
3. Click **"💾 Save Post"**

#### Edit Blog Post
1. Find the post in the list
2. Click **"✏️ Edit"**
3. Modify the fields
4. Click **"💾 Save Post"**

#### Delete Blog Post
1. Find the post in the list
2. Click **"🗑️ Delete"**
3. Confirm deletion

---

### 🗂️ Collections Management

#### View Collections
- Switch to the **"🗂️ Collections"** tab
- All CMS collections are displayed
- Shows collection name, ID, and item count

#### View Collection Items
1. Find the collection
2. Click **"👁️ View Items"**
3. Collection item viewer (coming soon)

---

### 🎨 Content Elements

#### View Page Elements
1. Switch to the **"🎨 Content Elements"** tab
2. Select a page from the dropdown
3. Click **"Load Elements"**
4. View all content elements on the page

#### Edit Elements
- Element editing (coming soon)

---

## API Endpoints

The Content Manager uses the following Wix API endpoints:

### Pages
- `GET /pages/v1/pages` - Get all pages
- `POST /pages/v1/pages` - Create new page
- `PATCH /pages/v1/pages/{pageId}` - Update page
- `DELETE /pages/v1/pages/{pageId}` - Delete page

### Blog Posts
- `GET /blog/v3/posts` - Get all blog posts
- `POST /blog/v3/posts` - Create new blog post
- `PATCH /blog/v3/posts/{postId}` - Update blog post
- `DELETE /blog/v3/posts/{postId}` - Delete blog post

### Collections
- `GET /wix-data/v2/collections` - Get all collections
- `GET /wix-data/v2/collections/{collectionId}/items` - Get collection items

---

## Tips & Best Practices

### Page Management
- **URL Slugs**: If you don't provide a URL, one will be auto-generated from the title
- **SEO Fields**: Always fill in SEO title and description for better search visibility
- **Content**: Use HTML for rich formatting in page content

### Blog Posts
- **Featured Images**: Use full URLs (https://...) for featured images
- **Tags**: Separate multiple tags with commas
- **Draft Status**: Use "Draft" to save work in progress before publishing
- **Publish Date**: Set future dates to schedule posts

### Collections
- Collections are read-only in this version
- Full CRUD operations for collection items (coming soon)

---

## Troubleshooting

### "Error loading pages"
- Check that the client is properly connected
- Verify the instance ID is correct
- Try refreshing the client connection

### "Failed to create page"
- Ensure all required fields are filled
- Check that the page title is unique
- Verify API permissions

### "Blog post not saving"
- Ensure content field is not empty
- Check that the post title is provided
- Verify publish date format

---

## Future Enhancements

Planned features:
- ✨ Rich text editor for content
- ✨ Image upload and management
- ✨ Collection item CRUD operations
- ✨ Element-level editing
- ✨ Bulk operations
- ✨ Content templates
- ✨ Version history
- ✨ Preview mode

---

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Wix API permissions
3. Ensure client is properly authenticated
4. Contact support if issues persist

---

*Last updated: November 30, 2025*

