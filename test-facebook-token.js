// Quick Facebook Token Tester
// Usage: node test-facebook-token.js YOUR_USER_ACCESS_TOKEN

const axios = require('axios');
const token = process.argv[2];

if (!token) {
  console.error('❌ Please provide a token: node test-facebook-token.js YOUR_TOKEN');
  process.exit(1);
}

async function testToken() {
  try {
    console.log('🔍 Testing token...\n');
    
    // Test 1: Get user info
    console.log('1️⃣ Testing /me endpoint...');
    const meResponse = await axios.get(`https://graph.facebook.com/v24.0/me`, {
      params: {
        fields: 'id,name,email',
        access_token: token
      }
    });
    console.log('✅ User:', meResponse.data);
    console.log('');
    
    // Test 2: Get managed pages
    console.log('2️⃣ Fetching managed Pages...');
    const pagesResponse = await axios.get(`https://graph.facebook.com/v24.0/me/accounts`, {
      params: {
        access_token: token,
        fields: 'id,name,access_token,category'
      }
    });
    const pages = pagesResponse.data;
    
    if (pages.data && pages.data.length > 0) {
      console.log(`✅ Found ${pages.data.length} Page(s):\n`);
      pages.data.forEach((page, index) => {
        console.log(`   ${index + 1}. ${page.name}`);
        console.log(`      Page ID: ${page.id}`);
        console.log(`      Page Access Token: ${page.access_token.substring(0, 20)}...`);
        console.log(`      Categories: ${page.category || 'N/A'}`);
        console.log('');
      });
      
      // Show the first page's full token (this is what you need!)
      console.log('📋 COPY THIS PAGE ACCESS TOKEN:');
      console.log('─'.repeat(60));
      console.log(pages.data[0].access_token);
      console.log('─'.repeat(60));
      console.log('\n💡 Paste this into your dashboard under "Page Access Token"');
      
    } else {
      console.log('⚠️  No Pages found. Make sure you have admin access to at least one Facebook Page.');
    }
    
    // Test 3: Check Instagram connection
    console.log('\n3️⃣ Checking Instagram Business Account connection...');
    if (pages.data && pages.data.length > 0) {
      const pageId = pages.data[0].id;
      const pageToken = pages.data[0].access_token;
      
      try {
        const igResponse = await axios.get(`https://graph.facebook.com/v24.0/${pageId}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: pageToken
          }
        });
        
        if (igResponse.data.instagram_business_account) {
          const igId = igResponse.data.instagram_business_account.id;
          console.log('✅ Instagram Business Account connected!');
          console.log(`   Instagram Account ID: ${igId}`);
          
          // Get IG details
          const igDetails = await axios.get(`https://graph.facebook.com/v24.0/${igId}`, {
            params: {
              fields: 'id,username,name,followers_count',
              access_token: pageToken
            }
          });
          console.log(`   Username: @${igDetails.data.username}`);
          console.log(`   Name: ${igDetails.data.name}`);
          console.log(`   Followers: ${igDetails.data.followers_count || 'N/A'}`);
        } else {
          console.log('⚠️  No Instagram Business Account connected to this Page.');
          console.log('   Go to Facebook Page Settings → Instagram to connect it.');
        }
      } catch (igError) {
        console.log('⚠️  Could not check Instagram:', igError.response?.data?.error?.message || igError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      console.error(`\nFacebook Error Details:`);
      console.error(`   Code: ${fbError.code}`);
      console.error(`   Message: ${fbError.message}`);
      console.error(`   Type: ${fbError.type}`);
      
      if (fbError.code === 190) {
        console.error('\n💡 This token is expired or invalid. Get a new one from:');
        console.error('   https://www.tnrbusinesssolutions.com/auth/meta');
      }
    }
    process.exit(1);
  }
}

testToken();
