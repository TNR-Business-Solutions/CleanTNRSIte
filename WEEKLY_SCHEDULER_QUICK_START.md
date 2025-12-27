# Weekly Post Scheduler - Quick Start Guide

## 🎯 What You Have

You already have a **complete social media automation framework** in place:
- `social-media-automation-dashboard.html` - Full management interface
- `posts-management.html` - Post tracking and analytics
- `social-media-content-templates.html` - Massive template library
- `gmb-post-scheduler.js` - GMB automation
- **NEW:** `weekly-post-scheduler.js` - Weekly scheduler for all 5 platforms

## 📱 This Week's Posts (Dec 27 - Dec 31, 2025)

### **Saturday, Dec 27 - Success Story Post**
**Theme:** Client wins / Case studies
- **GMB:** Client success story with CTA
- **Instagram:** Visual success story with hashtags
- **Facebook:** Detailed case study with results
- **LinkedIn:** Professional success story
- **X/Twitter:** Short, punchy version

### **Monday, Dec 29 - 2026 Planning Post**
**Theme:** New year strategy prep
- **GMB:** 2026 roadmap checklist
- **Instagram:** Planning tips with visuals
- **Facebook:** Consultative approach
- **LinkedIn:** Thought leadership angle
- **X:** Quick planning checklist

### **Wednesday, Dec 31 - Happy New Year Post**
**Theme:** New year, new opportunities
- **GMB:** New Year greeting + services
- **Instagram:** Celebratory with goals theme
- **Facebook:** Community-focused message
- **LinkedIn:** Professional growth angle
- **X:** Inspirational/motivational

---

## 🚀 How to Use

### **Option 1: Manual Dashboard Upload (Recommended)**
1. Go to: `social-media-automation-dashboard.html`
2. Open browser developer console (F12)
3. Paste this code:
```javascript
const posts = weeklyScheduler.getAllWeeklyPosts();
console.log(posts);
// Copy output and paste into dashboard
```

### **Option 2: View in Console**
1. Open `weekly-post-scheduler.js` in browser console
2. Run: `weeklyScheduler.logPostsForReview()`
3. See all posts formatted for each platform

### **Option 3: Check Individual Platform**
```javascript
// View just Instagram posts
weeklyScheduler.getPlatformSchedule('instagram');

// View just Facebook posts  
weeklyScheduler.getPlatformSchedule('facebook');

// View LinkedIn posts
weeklyScheduler.getPlatformSchedule('linkedin');
```

### **Option 4: Get Post Count**
```javascript
weeklyScheduler.getPostCountByPlatform();
// Returns: { gmb: 3, instagram: 3, facebook: 3, linkedin: 3, x: 3 }
```

### **Option 5: Auto-Submit to Database**
```javascript
// Submit all posts
weeklyScheduler.submitPostsToScheduler();

// Or submit to specific platform
weeklyScheduler.submitPostsToScheduler('instagram');
```

---

## 📊 Post Breakdown

| Date | Theme | Platforms | Posts |
|------|-------|-----------|-------|
| Dec 27 | Success Story | GMB, IG, FB, LI, X | 3 variations |
| Dec 29 | 2026 Planning | GMB, IG, FB, LI, X | 3 variations |
| Dec 31 | Happy New Year | GMB, IG, FB, LI, X | 3 variations |
| **Total** | | **5 platforms** | **15 posts** |

---

## 🎯 Scheduled Times

### **Saturday, December 27**
- GMB: 10:00 AM
- Instagram: 09:00 AM
- Facebook: 11:00 AM
- LinkedIn: 2:00 PM
- X: 3:00 PM

### **Monday, December 29**
- GMB: 9:00 AM
- Instagram: 10:00 AM
- Facebook: 11:00 AM
- LinkedIn: 2:00 PM
- X: 3:00 PM

### **Wednesday, December 31**
- GMB: 10:00 AM
- Instagram: 9:00 AM
- Facebook: 12:00 PM
- LinkedIn: 3:00 PM
- X: 4:00 PM

---

## 💡 Next Steps

### **Before Posting:**
1. ✅ Review all content in console
2. ✅ Check grammar/tone for each platform
3. ✅ Verify links work
4. ✅ Confirm image availability

### **To Schedule:**
1. **Option A:** Upload to `social-media-automation-dashboard.html`
2. **Option B:** Use `submitPostsToScheduler()` function
3. **Option C:** Manually post from each platform using formatted content

### **After Posting:**
1. Monitor engagement on each platform
2. Track clicks to website
3. Note what performs best
4. Use data for next week's adjustments

---

## 📌 Integration Points

Your existing files work seamlessly:

**Posts Management:**
- Track post performance
- Monitor engagement metrics
- Schedule future content

**Social Media Templates:**
- 2,246 line template library available
- Use as backup/variation content
- Reference for tone/style

**Admin Dashboard:**
- Real-time analytics
- Multi-platform management
- Performance tracking

---

## 🔧 Customization

### Edit Posts Directly in Code:
```javascript
// Modify specific post content
const posts = weeklyScheduler.getWeeklyPostsContent();
posts.posts[0].platforms.instagram.content = 'Your custom text here';

// Or edit scheduled times
posts.posts[0].platforms.facebook.scheduledTime = '2025-12-27 14:00';
```

### Add More Posts for Other Days:
```javascript
// Add to getWeeklyPostsContent() method
{
  id: 'jan-2-tips',
  title: 'Your New Post Title',
  baseContent: 'Base content here',
  platforms: {
    gmb: { content: '...', scheduledTime: '2026-01-02 09:00' },
    instagram: { content: '...', scheduledTime: '2026-01-02 10:00' },
    // ... other platforms
  }
}
```

---

## 📁 File Reference

| File | Purpose | Status |
|------|---------|--------|
| `weekly-post-scheduler.js` | This week's posts (NEW) | ✅ Ready |
| `social-media-automation-dashboard.html` | Management UI | ✅ Ready |
| `posts-management.html` | Post tracking | ✅ Ready |
| `social-media-content-templates.html` | Template library | ✅ Ready |
| `gmb-post-scheduler.js` | GMB only | ✅ Ready |

---

## ⚡ Quick Commands

```javascript
// Copy-paste these in browser console:

// View all this week's posts
weeklyScheduler.getAllWeeklyPosts()

// Pretty print for manual review
weeklyScheduler.logPostsForReview()

// Get count by platform
weeklyScheduler.getPostCountByPlatform()

// Export as downloadable JSON
weeklyScheduler.exportPostsAsJSON()

// Save offline
weeklyScheduler.saveToLocalStorage()

// Check Instagram posts only
weeklyScheduler.getPlatformSchedule('instagram')

// Check Facebook posts only
weeklyScheduler.getPlatformSchedule('facebook')
```

---

## 🎬 Implementation Video (Steps)

1. **Load the scheduler:** Add `<script src="weekly-post-scheduler.js"></script>` to your admin dashboard
2. **Review posts:** Run `weeklyScheduler.logPostsForReview()` in console
3. **Choose method:**
   - Manual: Copy/paste from console output
   - Auto: Run `submitPostsToScheduler()`
4. **Monitor:** Use `posts-management.html` to track performance

---

## 📞 Troubleshooting

**Q: Posts not showing in dashboard?**
A: Make sure `weekly-post-scheduler.js` is loaded BEFORE trying to access `weeklyScheduler` object.

**Q: Times not in my timezone?**
A: Times are set as examples. Adjust in code before submitting.

**Q: Want to edit a post?**
A: Edit directly in `getWeeklyPostsContent()` method, then regenerate with `weeklyScheduler.generateWeeklySchedule()`

**Q: Save for later?**
A: Use `weeklyScheduler.saveToLocalStorage()` to backup posts locally.

---

## ✅ You're All Set!

Your 15 posts for this week across 5 platforms are ready. Choose your posting method and start scheduling! 🚀
