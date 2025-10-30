# Quick Guide: Consolidate TNR Vercel Projects

## 🎯 Goal
Keep only **`tnr-business-solutions`** (www.tnrbusinesssolutions.com) and delete all duplicates.

## 📋 Current Projects Found:
1. ✅ **tnr-business-solutions** ← KEEP THIS ONE
2. ❌ **tnr-legal-deploy** ← DELETE
3. ❌ **clean-site** ← DELETE  
4. ❌ **tnr-legal-simple** ← DELETE

## 🚀 Quick Steps (Vercel Dashboard)

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Delete Each Duplicate Project

For each project to delete (`tnr-legal-deploy`, `clean-site`, `tnr-legal-simple`):

1. Click on the project name
2. Go to **Settings** (gear icon)
3. Scroll to bottom → **Danger Zone**
4. Click **"Delete Project"**
5. Type project name to confirm
6. Click **"Delete"**

### 3. Verify Main Project

After deleting duplicates:
1. Go to **`tnr-business-solutions`** project
2. Check **Settings → Domains** 
3. Verify `www.tnrbusinesssolutions.com` is listed
4. Test the site works

## ✅ Done!

After consolidation:
- ✅ Single project: `tnr-business-solutions`
- ✅ One deployment for everything
- ✅ Unified `vercel.json` configuration
- ✅ All content accessible from main domain

## ⚠️ Important Notes

- Legal pages are **already in the main site** (privacy-policy.html, terms-conditions.html)
- No separate deployment needed
- All code/config is already merged
- Just need to remove duplicate projects from dashboard

