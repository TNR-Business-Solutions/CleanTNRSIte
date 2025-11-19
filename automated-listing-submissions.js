// TNR Business Solutions - Automated Business Listing Submissions
// This script provides direct links and instructions for submitting to major directories

const businessInfo = {
  name: "TNR Business Solutions",
  owner: "Roy Turner",
  email: "roy.turner@tnrbusinesssolutions.com",
  phone: "412-499-2987",
  address: "418 Concord Avenue, Greensburg, PA 15601",
  website: "https://www.tnrbusinesssolutions.com",
  services: "Digital Marketing, SEO, Web Design, Insurance Services",
  serviceAreas: "Greensburg, PA and Westmoreland County"
};

const listingPlatforms = {
  // PRIORITY 1: CRITICAL PLATFORMS
  google: {
    name: "Google Business Profile",
    url: "https://business.google.com/create",
    priority: 1,
    instructions: [
      "1. Go to https://business.google.com/create",
      "2. Sign in with your Google account",
      "3. Enter business name: TNR Business Solutions",
      "4. Add address: 418 Concord Avenue, Greensburg, PA 15601",
      "5. Add phone: 412-499-2987",
      "6. Add website: https://www.tnrbusinesssolutions.com",
      "7. Select categories: Digital Marketing Agency, Insurance Agency",
      "8. Add business hours and photos",
      "9. Verify your business with phone or postcard"
    ]
  },
  
  bing: {
    name: "Bing Places for Business",
    url: "https://www.bing.com/business",
    priority: 1,
    instructions: [
      "1. Go to https://www.bing.com/business",
      "2. Sign in with Microsoft account",
      "3. Click 'Add a business'",
      "4. Enter all business information",
      "5. Verify with phone or email"
    ]
  },
  
  yelp: {
    name: "Yelp for Business",
    url: "https://biz.yelp.com",
    priority: 1,
    instructions: [
      "1. Go to https://biz.yelp.com",
      "2. Click 'Get Started'",
      "3. Enter business name and address",
      "4. Complete business profile",
      "5. Add photos and services"
    ]
  },
  
  bbb: {
    name: "Better Business Bureau",
    url: "https://www.bbb.org/get-accredited",
    priority: 1,
    instructions: [
      "1. Go to https://www.bbb.org/get-accredited",
      "2. Click 'Get Started'",
      "3. Enter business information",
      "4. Complete accreditation process",
      "5. Pay accreditation fee (varies by location)"
    ]
  },
  
  // PRIORITY 2: MAJOR DIRECTORIES
  yellowpages: {
    name: "Yellow Pages",
    url: "https://www.yellowpages.com/upgrade",
    priority: 2,
    instructions: [
      "1. Go to https://www.yellowpages.com/upgrade",
      "2. Search for your business",
      "3. Claim existing listing or create new one",
      "4. Complete business profile"
    ]
  },
  
  superpages: {
    name: "Superpages",
    url: "https://www.superpages.com",
    priority: 2,
    instructions: [
      "1. Go to https://www.superpages.com",
      "2. Click 'Add Business'",
      "3. Enter business information",
      "4. Complete profile"
    ]
  },
  
  whitepages: {
    name: "Whitepages",
    url: "https://www.whitepages.com/business",
    priority: 2,
    instructions: [
      "1. Go to https://www.whitepages.com/business",
      "2. Search for your business",
      "3. Claim or add business listing"
    ]
  },
  
  // PRIORITY 3: LOCAL DIRECTORIES
  local: {
    name: "Local.com",
    url: "https://www.local.com",
    priority: 3,
    instructions: [
      "1. Go to https://www.local.com",
      "2. Click 'Add Business'",
      "3. Enter business information"
    ]
  },
  
  manta: {
    name: "Manta",
    url: "https://www.manta.com",
    priority: 3,
    instructions: [
      "1. Go to https://www.manta.com",
      "2. Click 'Add Your Business'",
      "3. Complete business profile"
    ]
  },
  
  // PRIORITY 4: INDUSTRY DIRECTORIES
  clutch: {
    name: "Clutch.co",
    url: "https://clutch.co/profile/add",
    priority: 4,
    instructions: [
      "1. Go to https://clutch.co/profile/add",
      "2. Create account",
      "3. Complete company profile",
      "4. Add services and case studies"
    ]
  },
  
  goodfirms: {
    name: "GoodFirms",
    url: "https://www.goodfirms.co/register",
    priority: 4,
    instructions: [
      "1. Go to https://www.goodfirms.co/register",
      "2. Create account",
      "3. Complete company profile",
      "4. Add services and portfolio"
    ]
  },
  
  designrush: {
    name: "DesignRush",
    url: "https://www.designrush.com/agency/add",
    priority: 4,
    instructions: [
      "1. Go to https://www.designrush.com/agency/add",
      "2. Create account",
      "3. Complete agency profile",
      "4. Add services and portfolio"
    ]
  }
};

// Function to generate submission checklist
function generateSubmissionChecklist() {
  console.log("🚀 TNR Business Solutions - Business Listing Submission Checklist");
  console.log("=" .repeat(80));
  console.log(`Business: ${businessInfo.name}`);
  console.log(`Owner: ${businessInfo.owner}`);
  console.log(`Phone: ${businessInfo.phone}`);
  console.log(`Address: ${businessInfo.address}`);
  console.log(`Website: ${businessInfo.website}`);
  console.log("=" .repeat(80));
  
  // Sort by priority
  const sortedPlatforms = Object.entries(listingPlatforms)
    .sort(([,a], [,b]) => a.priority - b.priority);
  
  sortedPlatforms.forEach(([key, platform], index) => {
    console.log(`\n${index + 1}. ${platform.name} (Priority ${platform.priority})`);
    console.log(`   URL: ${platform.url}`);
    console.log("   Instructions:");
    platform.instructions.forEach(instruction => {
      console.log(`   ${instruction}`);
    });
    console.log("   Status: ⏳ Pending");
  });
}

// Function to generate NAP consistency checklist
function generateNAPChecklist() {
  console.log("\n📋 NAP CONSISTENCY CHECKLIST");
  console.log("=" .repeat(50));
  console.log("Ensure these details are IDENTICAL across all platforms:");
  console.log(`✅ Name: ${businessInfo.name}`);
  console.log(`✅ Address: ${businessInfo.address}`);
  console.log(`✅ Phone: ${businessInfo.phone}`);
  console.log(`✅ Website: ${businessInfo.website}`);
  console.log("\n⚠️  IMPORTANT: Any variation in NAP can hurt SEO rankings!");
}

// Function to generate review request template
function generateReviewRequest() {
  console.log("\n📝 REVIEW REQUEST TEMPLATE");
  console.log("=" .repeat(50));
  console.log("Subject: Thank you for choosing TNR Business Solutions!");
  console.log("\nDear [Client Name],");
  console.log("\nThank you for choosing TNR Business Solutions for your [service type].");
  console.log("We hope you're satisfied with our work and the results we've delivered.");
  console.log("\nIf you're happy with our services, we would greatly appreciate a quick");
  console.log("review on Google. Your feedback helps other local businesses discover our services.");
  console.log("\nGoogle Review Link: https://g.page/r/[YOUR_GOOGLE_BUSINESS_ID]/review");
  console.log("\nThank you for your time and for being a valued client!");
  console.log("\nBest regards,");
  console.log("Roy Turner");
  console.log("TNR Business Solutions");
  console.log("412-499-2987");
}

// Function to generate social media checklist
function generateSocialMediaChecklist() {
  console.log("\n📱 SOCIAL MEDIA SETUP CHECKLIST");
  console.log("=" .repeat(50));
  
  const socialPlatforms = [
    {
      name: "Facebook Business",
      url: "https://www.facebook.com/business",
      instructions: [
        "1. Go to https://www.facebook.com/business",
        "2. Click 'Create Account'",
        "3. Choose 'Business' account type",
        "4. Complete business profile",
        "5. Add cover photo and profile picture",
        "6. Post regular updates"
      ]
    },
    {
      name: "LinkedIn Company Page",
      url: "https://www.linkedin.com/company",
      instructions: [
        "1. Go to https://www.linkedin.com/company",
        "2. Click 'Create Company Page'",
        "3. Enter company information",
        "4. Upload logo and banner",
        "5. Add company description",
        "6. Invite employees to follow"
      ]
    },
    {
      name: "Twitter Business",
      url: "https://business.twitter.com",
      instructions: [
        "1. Go to https://business.twitter.com",
        "2. Create business account",
        "3. Complete profile",
        "4. Add profile picture and header",
        "5. Start tweeting about your services"
      ]
    },
    {
      name: "Instagram Business",
      url: "https://business.instagram.com",
      instructions: [
        "1. Convert personal account to business",
        "2. Or create new business account",
        "3. Complete business profile",
        "4. Add bio with contact info",
        "5. Post relevant content regularly"
      ]
    }
  ];
  
  socialPlatforms.forEach((platform, index) => {
    console.log(`\n${index + 1}. ${platform.name}`);
    console.log(`   URL: ${platform.url}`);
    console.log("   Instructions:");
    platform.instructions.forEach(instruction => {
      console.log(`   ${instruction}`);
    });
  });
}

// Main execution
console.log("🎯 TNR Business Solutions - Business Listing Distribution Tool");
console.log("=" .repeat(80));

generateSubmissionChecklist();
generateNAPChecklist();
generateReviewRequest();
generateSocialMediaChecklist();

console.log("\n🚀 NEXT STEPS:");
console.log("1. Start with Google Business Profile (most important)");
console.log("2. Set up Bing Places and Yelp");
console.log("3. Create social media profiles");
console.log("4. Submit to industry directories");
console.log("5. Monitor and maintain all listings");
console.log("\n💡 TIP: Complete 2-3 listings per day to avoid overwhelming yourself!");
console.log("\n📊 Track your progress and monitor results regularly!");

// Export for use in other scripts
module.exports = {
  businessInfo,
  listingPlatforms,
  generateSubmissionChecklist,
  generateNAPChecklist,
  generateReviewRequest,
  generateSocialMediaChecklist
};
