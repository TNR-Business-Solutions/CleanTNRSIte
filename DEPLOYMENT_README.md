# Deployment Guide - TNR Business Solutions

## ✅ Recent Updates Completed

### CRM Enhancements
- ✅ Added new database columns: `businessType`, `businessName`, `businessAddress`, `interest`
- ✅ Safe database migrations (non-destructive ALTER TABLE)
- ✅ Enhanced filtering and sorting API for clients/leads
- ✅ CSV lead importer with preview
- ✅ Live tel: and mailto: links in dashboard

### Email Marketing Campaigns
- ✅ Campaign API with rate-limited sending (1 email/sec, max 10 concurrent)
- ✅ Audience selection using CRM filters
- ✅ Personalization support ({{name}}, {{company}}, {{email}})
- ✅ Pooled Nodemailer sending with conservative limits

## 🚀 Vercel Deployment

### Prerequisites
1. Vercel account (https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. Environment variables configured (see below)

### Step 1: Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=roy.turner@tnrbusinesssolutions.com
SMTP_PASS=your_app_password_here
BUSINESS_EMAIL=roy.turner@tnrbusinesssolutions.com
BUSINESS_PHONE=412-499-2987
BUSINESS_ADDRESS=418 Concord Avenue, Greensburg, PA 15601
```

**Important for Gmail:**
- Use an App Password, not your regular password
- Enable 2-Factor Authentication
- Generate App Password: https://myaccount.google.com/apppasswords

### Step 2: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (will prompt for configuration)
vercel

# Deploy to production
vercel --prod
```

### Step 3: Verify Deployment

After deployment, verify:
1. ✅ Admin dashboard loads: `https://your-domain.vercel.app/admin-dashboard.html`
2. ✅ CRM API works: `https://your-domain.vercel.app/api/crm/clients`
3. ✅ Campaign API works: `https://your-domain.vercel.app/api/campaigns/audience?type=leads`
4. ✅ Form submissions work: Submit a test form

### Important Notes

#### SQLite Database
- SQLite database file (`tnr_database.db`) is created in `/tmp` on Vercel
- Data persists only within each serverless function execution
- **For production persistence, consider:**
  - Moving to a managed database (Vercel Postgres, Supabase, etc.)
  - Using Vercel KV for simple storage
  - Or keeping SQLite on a persistent file system

#### Rate Limiting
- Email campaigns use conservative rate limits:
  - 1 email per second
  - Max 10 concurrent connections
- Large campaigns will take time to send (100 emails = ~100 seconds)
- This prevents SMTP throttling and maintains deliverability

#### CSV Import
- Currently supports paste-based and file upload
- File upload reads entire CSV into memory
- Large CSV files (>10MB) may require chunked processing

## 📋 Testing Checklist

Before going live, test:

- [ ] Admin login works
- [ ] View clients/leads from database
- [ ] Add new client manually
- [ ] Import CSV leads
- [ ] Filter and sort clients/leads
- [ ] Preview campaign audience
- [ ] Send test campaign to 1 recipient
- [ ] Verify email delivery
- [ ] Check tel: and mailto: links work
- [ ] Form submissions create leads

## 🔧 Troubleshooting

### Emails Not Sending
- Check SMTP credentials in Vercel environment variables
- Verify App Password is correct (not regular password)
- Check Vercel function logs: `vercel logs`

### Database Not Persisting
- SQLite on serverless may not persist between function calls
- Consider upgrading to managed database for production

### Campaign Sends Failing
- Check rate limits aren't too aggressive for your SMTP provider
- Verify all recipients have valid email addresses
- Check Vercel function timeout (max 10s on free tier, extend if needed)

## 📞 Support

For deployment issues:
1. Check Vercel dashboard logs
2. Verify environment variables
3. Test SMTP connection locally first
4. Review function execution logs in Vercel dashboard

---

**Last Updated:** Campaign system and CRM enhancements deployed
**Version:** 2.0

