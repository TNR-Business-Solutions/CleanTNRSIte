# Wix Webhook Setup - Blog Category Created

## Webhook Configuration

### Callback URL
Add this URL in the Wix Developer Dashboard:

```
https://www.tnrbusinesssolutions.com/api/wix/webhooks
```

## Setup Steps

1. **Go to Wix Developer Dashboard**
   - Navigate to your app: TNRBusinessSolutions AUTOTOOL
   - Go to: **Develop** → **Extensions** → **Webhooks**

2. **Create Webhook for "Blog Category Created"**
   - Click **Create webhook**
   - Select event: **Blog Category Created**
   - Add callback URL: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
   - Click **Save**

3. **Test the Webhook (Optional)**
   - Use the "Test your code locally" option in Wix Developer Dashboard
   - Or create a blog category in a test Wix site to trigger the webhook

## Supported Blog Category Events

The webhook handler now supports:

- ✅ **blog.category.created** - When a blog category is created
- ✅ **blog.category.updated** - When a blog category is updated  
- ✅ **blog.category.deleted** - When a blog category is deleted

## What Happens When Webhook is Triggered

### Blog Category Created
- Logs the category creation event
- Extracts category data (ID, name, slug, description)
- Auto-optimizes category SEO (ready for future implementation)
- Updates database with category information

### Blog Category Updated
- Logs the category update event
- Refreshes SEO metadata for the category page
- Updates database with new category information

### Blog Category Deleted
- Logs the category deletion event
- Archives SEO data for the category
- Updates sitemap (ready for future implementation)

## Webhook Handler Format

The handler processes webhooks in two formats:

1. **Raw JSON Format** (standard)
   ```json
   {
     "eventType": "blog.category.created",
     "instanceId": "xxx-xxx-xxx",
     "data": {
       "categoryId": "xxx",
       "name": "Category Name",
       "slug": "category-slug"
     }
   }
   ```

2. **Wix SDK Format** (if using @wix/sdk)
   ```json
   {
     "data": {
       "eventType": "blog.category.created",
       "data": {...}
     },
     "metadata": {
       "instanceId": "xxx-xxx-xxx"
     }
   }
   ```

Both formats are automatically detected and processed.

## Verification

After setting up the webhook:

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Create a blog category in your Wix site
   - Look for: `📂 Blog category created:` in the logs

2. **Expected Log Output**
   ```
   📥 Webhook received: blog.category.created for instance: xxx-xxx-xxx
   📂 Blog category created: [category-id]
   ✅ Processed blog category creation: {...}
   ```

## Troubleshooting

### Webhook Not Receiving Events
- Verify the callback URL is correct: `https://www.tnrbusinesssolutions.com/api/wix/webhooks`
- Check that the webhook is enabled in Wix Developer Dashboard
- Verify the app has the necessary permissions for Blog API

### Webhook Returns 500 Error
- Check Vercel logs for error details
- Verify the webhook payload format matches expected structure
- Ensure database connection is working

### Webhook Returns 400 Error
- Verify the webhook payload is valid JSON
- Check that required fields (instanceId, eventType) are present

## Next Steps

After the webhook is working, you can extend the handlers to:

1. **Auto-optimize category SEO**
   - Generate meta descriptions
   - Optimize category page titles
   - Add structured data

2. **Sync to external systems**
   - Update sitemap
   - Notify SEO monitoring tools
   - Update analytics tracking

3. **Send notifications**
   - Email admin when category is created
   - Notify team of important category updates

## Production Status

✅ Webhook endpoint: Configured and ready
✅ Event handlers: Implemented for all blog category events
✅ Error handling: Included
✅ Logging: Comprehensive logging added
✅ Format support: Both raw JSON and Wix SDK formats

