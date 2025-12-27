/**
 * Weekly Post Scheduler for Multiple Platforms
 * Automates posts to GMB, Instagram, Facebook, LinkedIn, and X
 * For TNR Business Solutions - December 2025 Week
 */

class WeeklyPostScheduler {
  constructor(config = {}) {
    this.platforms = ['gmb', 'instagram', 'facebook', 'linkedin', 'x'];
    this.week = config.week || this.getCurrentWeek();
    this.year = config.year || new Date().getFullYear();
    this.dbEndpoint = config.dbEndpoint || '/api/posts';
    this.posts = [];
    this.schedules = {};
  }

  /**
   * Get current week number and start date
   */
  getCurrentWeek() {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - first) / 86400000;
    return Math.ceil((pastDaysOfYear + first.getDay() + 1) / 7);
  }

  /**
   * Get week start date (Monday)
   */
  getWeekStartDate(week) {
    const jan4 = new Date(this.year, 0, 4);
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - jan4.getDay() + 1);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
    return weekStart;
  }

  /**
   * This Week's Posts - December 2025 (Week 52)
   * Core content strategy with platform-specific variations
   */
  getWeeklyPostsContent() {
    return {
      week: this.week,
      year: this.year,
      theme: 'Year-End Success Stories & 2026 Prep',
      posts: [
        {
          id: 'dec-27-success',
          title: 'Client Success: 250% Traffic Growth in 2025',
          baseContent: 'One of our clients increased their website traffic by 250% this year using our SEO and content strategy. See how they did it!',
          platforms: {
            gmb: {
              content: 'Client Success: 250% Traffic Growth in 2025! One of our local business clients increased their website traffic by 250% this year using our SEO and content strategy. What are your 2025 wins?',
              cta: 'Read Case Study',
              link: 'https://www.tnrbusinesssolutions.com/testimonials.html',
              image: 'case-study-1.jpg',
              scheduledTime: '2025-12-27 10:00' // Saturday 10 AM
            },
            instagram: {
              content: '250% Traffic Growth! 🚀 One of our clients crushed it in 2025. From struggling to get noticed online to getting 250% more website visitors. This is what strategic SEO, content marketing, and consistency can do! 💪 Curious how we did it? Link in bio! 👆',
              hashtags: '#SmallBizWins #DigitalMarketing #SEOSuccess #GreensburgPA #2025Growth',
              scheduledTime: '2025-12-27 09:00'
            },
            facebook: {
              content: 'Case Study: How Our Client Achieved 250% Traffic Growth in 2025\n\nThis Greensburg business owner was frustrated with their online visibility. Sound familiar?\n\nHere\'s what we did:\n✅ Implemented comprehensive SEO strategy\n✅ Created consistent blog content\n✅ Optimized Google Business Profile\n✅ Built social media presence\n\nResult: 250% traffic increase, 3x more leads!\n\nReady to see similar results for YOUR business in 2026? Let\'s talk!',
              cta: 'Get Your Free Strategy Session',
              link: 'https://www.tnrbusinesssolutions.com/contact.html?offer=2026-strategy',
              image: 'case-study-1.jpg',
              scheduledTime: '2025-12-27 11:00'
            },
            linkedin: {
              content: 'Success Story: 250% Traffic Growth in 2025\n\nOne of our clients just achieved a remarkable milestone—a 250% increase in website traffic throughout 2025. Here\'s how consistent digital marketing strategy pays off:\n\n🎯 Strategic SEO optimization\n📝 Valuable content creation\n🔍 Google Business Profile mastery\n📱 Multi-platform engagement\n\nThe lesson? Digital growth isn\'t luck—it\'s strategy, consistency, and the right partnerships.\n\nIs your business ready for 2026 success? Let\'s connect.\n\n#DigitalMarketing #SEO #SmallBusiness #GrowthStrategy #2025Success #Greensburg',
              cta: 'View Case Study',
              link: 'https://www.tnrbusinesssolutions.com/testimonials.html',
              scheduledTime: '2025-12-27 14:00'
            },
            x: {
              content: '🚀 Case Study: Our client grew website traffic 250% in 2025!\n\nHow? Strategic SEO + consistent content + smart digital marketing\n\nNo shortcuts. Just results.\n\nReady for YOUR breakthrough in 2026? Let\'s talk →',
              scheduledTime: '2025-12-27 15:00'
            }
          }
        },
        {
          id: 'dec-29-newyear',
          title: '2026 Digital Marketing Roadmap Planning',
          baseContent: 'Don\'t start 2026 without a digital marketing plan. Here\'s what successful businesses are planning.',
          platforms: {
            gmb: {
              content: '2026 Digital Marketing Roadmap: What Successful Businesses Are Planning\n\n✅ SEO improvements\n✅ Content calendar (2x/week posts)\n✅ Google Business Profile optimization\n✅ Social media consistency\n✅ Email marketing campaigns\n\nGet ahead of the competition in 2026. Let\'s create your digital roadmap!',
              cta: 'Get Your 2026 Plan',
              link: 'https://www.tnrbusinesssolutions.com/contact.html',
              scheduledTime: '2025-12-29 09:00' // Monday 9 AM
            },
            instagram: {
              content: '2026 Planning Mode 📋✨\n\nWhile everyone\'s celebrating New Year\'s, smart business owners are already mapping their 2026 strategy!\n\nWhat should be on YOUR digital marketing roadmap?\n\n📊 SEO overhaul\n📝 Content strategy\n📱 Social presence\n💌 Email campaigns\n🎯 Lead generation\n\nNeed help planning? We\'ve got the blueprint! 👇',
              hashtags: '#NewYearPlanning #SmallBiz #DigitalStrategy #2026Goals #SmallBizTips',
              scheduledTime: '2025-12-29 10:00'
            },
            facebook: {
              content: 'Is Your Digital Marketing Ready for 2026?\n\nThe new year is the PERFECT time to level up your online presence. Here\'s what we\'re recommending to ALL our clients:\n\n✅ SEO Audit & Improvements (Better rankings = More traffic)\n✅ Content Calendar (Consistent posts = Engaged audience)\n✅ Google My Business Optimization (Local visibility is KEY)\n✅ Email Marketing Setup (Your best customers = Email list)\n✅ Social Media Strategy (Build your community)\n\nNot sure where to start? We offer FREE consultations to assess your current situation and create a custom roadmap.\n\nWhat\'s your biggest digital marketing challenge heading into 2026? Comment below!',
              cta: 'Schedule Free Consultation',
              link: 'https://www.tnrbusinesssolutions.com/contact.html?offer=free-consultation',
              scheduledTime: '2025-12-29 11:00'
            },
            linkedin: {
              content: '2026 Digital Marketing Checklist for Business Growth\n\nAs we approach 2026, many business leaders are asking: "What should we prioritize for growth?"\n\nBased on our experience with 100+ clients, here\'s the winning combination:\n\n1️⃣ SEO Foundation (Organic traffic = sustainable growth)\n2️⃣ Content Strategy (Establish thought leadership)\n3️⃣ Local Presence (Google Business Profile optimization)\n4️⃣ Email Marketing (Your most valuable asset)\n5️⃣ Social Engagement (Build community, not just followers)\n\nThe businesses that succeed in 2026 aren\'t doing ONE of these things—they\'re executing ALL of them consistently.\n\nWhat\'s your biggest priority for 2026 growth?\n\n#DigitalMarketing #BusinessGrowth #ContentStrategy #SEO #2026Planning',
              cta: 'Let\'s Discuss Your 2026 Strategy',
              link: 'https://www.tnrbusinesssolutions.com/contact.html',
              scheduledTime: '2025-12-29 14:00'
            },
            x: {
              content: '2026 Digital Marketing Playbook:\n\n✅ SEO (own your search rankings)\n✅ Content (build your authority)\n✅ Email (nurture your best customers)\n✅ Social (engage your community)\n✅ Local (dominate your market)\n\nDon\'t coast into 2026. Plan your growth.\n\nLet\'s talk strategy →',
              scheduledTime: '2025-12-29 15:00'
            }
          }
        },
        {
          id: 'dec-31-newyear',
          title: 'Happy New Year 2026! Let\'s Make It Your Best Year Yet',
          baseContent: 'New year, new opportunities. We\'re excited to help your business thrive in 2026!',
          platforms: {
            gmb: {
              content: '🎉 Happy New Year 2026!\n\nWe\'re thrilled to kick off another year of helping Greensburg and Westmoreland County businesses grow!\n\nWhether you need:\n✅ Digital marketing\n✅ Business insurance\n✅ Website improvements\n✅ Lead generation\n\nWe\'re here to help. Let\'s make 2026 your biggest year yet!',
              cta: 'Start Your 2026 Growth',
              link: 'https://www.tnrbusinesssolutions.com/contact.html',
              scheduledTime: '2025-12-31 10:00' // Wednesday 10 AM
            },
            instagram: {
              content: '🎆 Happy 2026! 🎉\n\nNew Year, New Opportunities! ✨\n\nWe\'re ready to help YOUR business shine in 2026. Whether it\'s boosting your online presence, growing your leads, or protecting your business with smart insurance—we\'ve got you! 💪\n\nWhat\'s your #1 goal for 2026? Let us know below! 👇\n\nHere\'s to growth, success, and crushing your goals! 🚀',
              hashtags: '#NewYear #2026Goals #SmallBiz #SmallBizOwner #GreenburgPA #Digital Marketing',
              scheduledTime: '2025-12-31 09:00'
            },
            facebook: {
              content: '✨ Happy New Year 2026! ✨\n\nWhat a year 2025 was! We\'re so grateful for all our amazing clients and the opportunity to help grow so many successful businesses.\n\nAs we head into 2026, we\'re excited about what\'s possible:\n\n🚀 More website traffic\n💰 More quality leads\n📈 More revenue growth\n🏆 More success stories\n\nWhether you need help with:\n• Digital Marketing (SEO, Social Media, Content)\n• Insurance (Auto, Home, Business, Life)\n• Web Design\n• Lead Generation\n• Or anything in between...\n\nWe\'re here and ready to make 2026 your best year ever!\n\nWhat\'s your biggest business goal for 2026? Let\'s work together to make it happen! 🎯',
              cta: 'Let\'s Connect for 2026',
              link: 'https://www.tnrbusinesssolutions.com/contact.html',
              scheduledTime: '2025-12-31 12:00'
            },
            linkedin: {
              content: 'Welcome to 2026: The Year of Strategic Growth\n\nAs we enter a new year, many business leaders are setting ambitious goals. The question is: do you have a plan to achieve them?\n\nOver the past several years, we\'ve noticed that successful businesses aren\'t those with the biggest budgets—they\'re the ones with:\n\n✅ A clear digital strategy\n✅ Consistent content and messaging\n✅ Strong online presence\n✅ Systems and automation\n✅ The right partnerships\n\nIf you\'re serious about growth in 2026, it\'s time to lock in your strategy now—not in March when competitors are catching up.\n\nAt TNR Business Solutions, we specialize in helping Greensburg and Westmoreland County businesses break through revenue plateaus and achieve predictable growth.\n\nWe\'d love to help. Let\'s schedule a brief conversation about your goals.\n\nHere\'s to your success in 2026!\n\n#NewYear #BusinessGrowth #DigitalStrategy #SmallBusiness #2026Goals #Leadership',
              cta: 'Schedule Your 2026 Strategy Call',
              link: 'https://www.tnrbusinesssolutions.com/contact.html',
              scheduledTime: '2025-12-31 15:00'
            },
            x: {
              content: '🎆 Happy 2026! \n\nHere\'s what we know: Your 2026 success depends on decisions you make RIGHT NOW.\n\nNeed a digital strategy overhaul? We\'re ready to help.\n\nLet\'s make it a great year →',
              scheduledTime: '2025-12-31 16:00'
            }
          }
        }
      ]
    };
  }

  /**
   * Format post for each platform
   */
  formatPostForPlatform(post, platform) {
    const platformConfig = post.platforms[platform];
    if (!platformConfig) return null;

    return {
      id: `${post.id}-${platform}`,
      platform: platform,
      title: post.title,
      ...platformConfig,
      baseContent: post.baseContent
    };
  }

  /**
   * Generate this week's posting schedule
   */
  generateWeeklySchedule() {
    const weekContent = this.getWeeklyPostsContent();
    const schedule = {
      week: this.week,
      year: this.year,
      generated: new Date().toISOString(),
      platforms: {}
    };

    // Initialize each platform
    this.platforms.forEach(platform => {
      schedule.platforms[platform] = [];
    });

    // Add each post to relevant platforms
    weekContent.posts.forEach(post => {
      this.platforms.forEach(platform => {
        const formattedPost = this.formatPostForPlatform(post, platform);
        if (formattedPost) {
          schedule.platforms[platform].push(formattedPost);
        }
      });
    });

    this.schedules = schedule;
    return schedule;
  }

  /**
   * Get schedule for specific platform
   */
  getPlatformSchedule(platform) {
    if (!this.schedules.platforms) {
      this.generateWeeklySchedule();
    }
    return this.schedules.platforms[platform] || [];
  }

  /**
   * Get all posts for this week
   */
  getAllWeeklyPosts() {
    if (!this.schedules.platforms) {
      this.generateWeeklySchedule();
    }
    return this.schedules;
  }

  /**
   * Submit posts to database/API for scheduling
   */
  async submitPostsToScheduler(platform = null) {
    const postsToSubmit = platform 
      ? this.getPlatformSchedule(platform)
      : this.getAllWeeklyPosts();

    try {
      const response = await fetch(this.dbEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          action: 'schedule_posts',
          posts: postsToSubmit,
          week: this.week,
          year: this.year,
          platform: platform,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Posts submitted for scheduling:`, result);
        return { success: true, data: result };
      } else {
        console.error('❌ Failed to submit posts:', result);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Error submitting posts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log posts for manual review in admin dashboard
   */
  logPostsForReview() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════');
    console.log('📅 WEEKLY POST SCHEDULER - Week ' + this.week + ', ' + this.year);
    console.log('═══════════════════════════════════════════════════════\n');

    const schedule = this.getAllWeeklyPosts();
    
    this.platforms.forEach(platform => {
      console.log(`\n📱 ${platform.toUpperCase()} Posts:`);
      console.log('─────────────────────────────────');
      
      schedule.platforms[platform].forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Time: ${post.scheduledTime}`);
        console.log(`   Content: ${post.content.substring(0, 100)}...`);
        if (post.cta) console.log(`   CTA: ${post.cta}`);
        if (post.hashtags) console.log(`   Hashtags: ${post.hashtags}`);
      });
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ READY TO POST! Use submitPostsToScheduler() to schedule.');
    console.log('═══════════════════════════════════════════════════════\n');
  }

  /**
   * Get post count by platform
   */
  getPostCountByPlatform() {
    const schedule = this.getAllWeeklyPosts();
    const counts = {};

    this.platforms.forEach(platform => {
      counts[platform] = schedule.platforms[platform].length;
    });

    return counts;
  }

  /**
   * Export posts as JSON for backup
   */
  exportPostsAsJSON() {
    const schedule = this.getAllWeeklyPosts();
    return JSON.stringify(schedule, null, 2);
  }

  /**
   * Save to LocalStorage for offline access
   */
  saveToLocalStorage() {
    const schedule = this.getAllWeeklyPosts();
    localStorage.setItem(`weekly_posts_w${this.week}_${this.year}`, JSON.stringify(schedule));
    console.log('✅ Posts saved to localStorage');
  }
}

// Initialize and auto-expose for console access
const weeklyScheduler = new WeeklyPostScheduler();

// Auto-generate schedule on load
weeklyScheduler.generateWeeklySchedule();

// Expose to console for testing
console.log('📅 Weekly Post Scheduler loaded!');
console.log('Available commands:');
console.log('  weeklyScheduler.getAllWeeklyPosts()  - View all posts');
console.log('  weeklyScheduler.getPlatformSchedule("instagram")  - View platform schedule');
console.log('  weeklyScheduler.logPostsForReview()  - Pretty print posts');
console.log('  weeklyScheduler.getPostCountByPlatform()  - Count posts by platform');
console.log('  weeklyScheduler.submitPostsToScheduler()  - Submit to database');
console.log('  weeklyScheduler.saveToLocalStorage()  - Save offline');
console.log('  weeklyScheduler.exportPostsAsJSON()  - Export as JSON');
