// Post to LinkedIn - Vercel Serverless Function
// Creates a post on LinkedIn using the access token from database

const axios = require('axios');
const TNRDatabase = require('../../database');

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { accessToken, content, useDatabaseToken = true } = req.body;

    // Try to get token from database first, fallback to request body
    let token = accessToken;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();
        
        // Get LinkedIn token from database (first available)
        const tokens = await db.getSocialMediaTokens('linkedin');
        const linkedinToken = tokens[0];
        
        if (linkedinToken && linkedinToken.access_token) {
          token = linkedinToken.access_token;
          console.log('✅ Using token from database for LinkedIn user:', linkedinToken.page_name || linkedinToken.user_id);
        } else {
          console.log('⚠️ No token found in database, using provided token or falling back');
        }
      } catch (dbError) {
        console.warn('⚠️ Database error, using provided token:', dbError.message);
        // Continue with provided token if database fails
      }
    }

    // Validate required fields
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing access token',
        message: 'Please provide a valid LinkedIn Access Token or connect your account via OAuth',
        help: 'Connect your LinkedIn account at /api/auth/linkedin or provide accessToken in request'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Missing content',
        message: 'Please provide post content'
      });
    }

    // LinkedIn requires UGC (User Generated Content) Posts API v2
    // Create UGC Post
    console.log('Creating LinkedIn post...');

    // Step 1: Get user's LinkedIn URN (unique resource name)
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      timeout: 10000
    });

    const userUrn = `urn:li:person:${profileResponse.data.id}`;

    // Step 2: Create UGC Post
    // LinkedIn requires specific format for UGC posts
    const ugcPost = {
      author: userUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const postResponse = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      ugcPost,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        timeout: 15000
      }
    );

    console.log('Post created successfully:', postResponse.data);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Post published to LinkedIn successfully!',
      postId: postResponse.data.id,
      postUrl: `https://www.linkedin.com/feed/update/${postResponse.data.id}`,
      data: postResponse.data
    });

  } catch (error) {
    console.error('LinkedIn posting error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific error cases
    if (error.response?.data) {
      const linkedinError = error.response.data;
      
      return res.status(400).json({
        success: false,
        error: 'LinkedIn API Error',
        message: linkedinError.message || linkedinError.errorDetails || 'Failed to post to LinkedIn',
        errorType: linkedinError.errorCode,
        details: linkedinError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

