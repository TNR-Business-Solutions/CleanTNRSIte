/**
 * Automated GMB (Google My Business) Post Scheduler
 * Generates and schedules weekly posts to Google Business Profile
 * Helps maintain consistent local SEO presence
 */

class GMBPostScheduler {
  constructor(config = {}) {
    this.apiEndpoint = config.apiEndpoint || '/api/gmb/schedule-post';
    this.businessId = config.businessId;
    this.weeklyTopics = config.weeklyTopics || this.getDefaultTopics();
    this.postTimes = config.postTimes || ['Monday 9:00 AM', 'Wednesday 2:00 PM', 'Friday 10:00 AM'];
    this.autoSchedule = config.autoSchedule !== false;
    
    if (this.autoSchedule) {
      this.init();
    }
  }

  init() {
    console.log('GMB Post Scheduler initialized');
    this.checkScheduledPosts();
  }

  getDefaultTopics() {
    return [
      {
        category: 'tip',
        topics: [
          {
            title: '5 Signs Your Business Needs Better Insurance Coverage',
            content: 'Protect your business from unexpected risks. Here are key indicators...',
            cta: 'Get a Free Coverage Review',
            link: '/business-insurance.html'
          },
          {
            title: 'Top 3 SEO Mistakes Local Businesses Make',
            content: 'Avoid these common SEO pitfalls that hurt your Google rankings...',
            cta: 'Free SEO Audit',
            link: '/seo-services.html'
          },
          {
            title: 'How to Choose the Right Auto Insurance in PA',
            content: 'Pennsylvania insurance requirements explained simply...',
            cta: 'Compare Quotes',
            link: '/auto-insurance.html'
          }
        ]
      },
      {
        category: 'offer',
        topics: [
          {
            title: 'FREE Business Insurance Checklist',
            content: 'Download our comprehensive 2024 Business Insurance Checklist. Ensure you have the right coverage!',
            cta: 'Download Now',
            link: '/lead-magnet.html'
          },
          {
            title: 'Limited Time: Free Website Audit',
            content: 'Get a complete analysis of your website\'s SEO, speed, and conversion potential. No obligation!',
            cta: 'Claim Your Audit',
            link: '/contact.html?offer=free-audit'
          }
        ]
      },
      {
        category: 'update',
        topics: [
          {
            title: 'New Service: Social Media Management Packages',
            content: 'We now offer complete social media management for local businesses. Save time and grow your audience!',
            cta: 'Learn More',
            link: '/social-media.html'
          },
          {
            title: 'Serving Westmoreland County Since 2020',
            content: 'Proud to support local businesses in Greensburg, Latrobe, Irwin, and beyond!',
            cta: 'About Us',
            link: '/about.html'
          }
        ]
      },
      {
        category: 'success_story',
        topics: [
          {
            title: 'Client Success: Local Restaurant Doubled Foot Traffic',
            content: 'See how we helped a Greensburg restaurant increase customers by 100% with targeted digital marketing.',
            cta: 'Read Case Study',
            link: '/testimonials.html'
          },
          {
            title: 'Insurance Savings: $15K Saved for Local Contractor',
            content: 'We found better coverage at a lower price for a Westmoreland County contractor. You could save too!',
            cta: 'Get Your Quote',
            link: '/business-insurance.html'
          }
        ]
      },
      {
        category: 'event',
        topics: [
          {
            title: 'Free Small Business Workshop - January 2024',
            content: 'Join us for a free workshop on digital marketing strategies. Limited seats available!',
            cta: 'Register Now',
            link: '/contact.html?event=workshop'
          }
        ]
      }
    ];
  }

  // Generate a post for the current week
  generateWeeklyPost() {
    const week = this.getWeekNumber();
    const categoryIndex = week % this.weeklyTopics.length;
    const category = this.weeklyTopics[categoryIndex];
    
    const topicIndex = week % category.topics.length;
    const topic = category.topics[topicIndex];

    return {
      category: category.category,
      ...topic,
      scheduledDate: this.getNextPostDate(),
      createdAt: new Date().toISOString()
    };
  }

  getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  }

  getNextPostDate() {
    const now = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Get next scheduled day
    for (const postTime of this.postTimes) {
      const [day, time] = postTime.split(' ');
      const targetDay = daysOfWeek.indexOf(day);
      const currentDay = now.getDay();
      
      let daysUntilPost = targetDay - currentDay;
      if (daysUntilPost <= 0) {
        daysUntilPost += 7;
      }
      
      const postDate = new Date(now);
      postDate.setDate(postDate.getDate() + daysUntilPost);
      
      // Parse time
      const [hours, minutes] = this.parseTime(time);
      postDate.setHours(hours, minutes, 0, 0);
      
      if (postDate > now) {
        return postDate.toISOString();
      }
    }
    
    // Default to tomorrow 9 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString();
  }

  parseTime(timeString) {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return [hours, minutes || 0];
  }

  async schedulePost(post) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: this.businessId,
          post: post
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule post');
      }

      const result = await response.json();
      console.log('GMB post scheduled:', result);
      
      // Track in analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'gmb_post_scheduled', {
          'event_category': 'automation',
          'event_label': post.category
        });
      }

      return result;
    } catch (error) {
      console.error('Error scheduling GMB post:', error);
      return { success: false, error: error.message };
    }
  }

  async checkScheduledPosts() {
    try {
      const response = await fetch(`${this.apiEndpoint}/list`);
      if (response.ok) {
        const posts = await response.json();
        console.log('Scheduled posts:', posts);
        return posts;
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      return [];
    }
  }

  // Manual trigger to schedule next week's posts
  async scheduleWeeklyPosts() {
    const posts = [];
    
    for (let i = 0; i < this.postTimes.length; i++) {
      const post = this.generateWeeklyPost();
      const result = await this.schedulePost(post);
      posts.push(result);
    }
    
    return posts;
  }

  // Generate post preview without scheduling
  previewPost() {
    const post = this.generateWeeklyPost();
    return {
      ...post,
      preview: this.formatPostPreview(post)
    };
  }

  formatPostPreview(post) {
    return `
${post.title}

${post.content}

${post.cta} → ${window.location.origin}${post.link}

#GreensburgPA #WestmorelandCounty #LocalBusiness #DigitalMarketing #Insurance
    `.trim();
  }

  // Get performance stats
  async getPostPerformance() {
    try {
      const response = await fetch(`${this.apiEndpoint}/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching post performance:', error);
      return null;
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GMBPostScheduler;
}

// Auto-initialize for admin dashboard
if (typeof window !== 'undefined' && window.location.pathname.includes('admin')) {
  window.gmbScheduler = new GMBPostScheduler({
    businessId: 'tnr-business-solutions-greensburg',
    autoSchedule: false // Manual control in admin panel
  });
}
