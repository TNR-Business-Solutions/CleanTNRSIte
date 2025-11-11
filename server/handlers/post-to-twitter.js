// Post to Twitter/X - Vercel Serverless Function
// Creates a tweet on Twitter/X using the access token from database

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
    const { accessToken, text, useDatabaseToken = true } = req.body;

    // Try to get token from database first, fallback to request body
    let token = accessToken;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();
        
        // Get Twitter token from database (first available)
        const tokens = await db.getSocialMediaTokens('twitter');
        const twitterToken = tokens[0];
        
        if (twitterToken && twitterToken.access_token) {
          token = twitterToken.access_token;
          console.log('✅ Using token from database for Twitter user:', twitterToken.page_name || twitterToken.user_id);
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
        message: 'Please provide a valid Twitter/X Access Token or connect your account via OAuth',
        help: 'Connect your Twitter account at /api/auth/twitter or provide accessToken in request'
      });
    }

    // Use 'text' for Twitter API v2, 'content' for backward compatibility
    const tweetText = text || req.body.content;

    if (!tweetText) {
      return res.status(400).json({
        success: false,
        error: 'Missing tweet text',
        message: 'Please provide tweet content'
      });
    }

    // Twitter/X character limit: 280 characters
    if (tweetText.length > 280) {
      return res.status(400).json({
        success: false,
        error: 'Tweet too long',
        message: 'Tweet must be 280 characters or less',
        currentLength: tweetText.length
      });
    }

    // Create the tweet using Twitter API v2
    console.log('Creating Twitter/X tweet...');
    const tweetResponse = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: tweetText
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('Tweet created successfully:', tweetResponse.data);

    // Get tweet details for URL
    const tweetId = tweetResponse.data.data.id;

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Tweet published to Twitter/X successfully!',
      tweetId: tweetId,
      tweetUrl: `https://twitter.com/i/web/status/${tweetId}`,
      data: tweetResponse.data
    });

  } catch (error) {
    console.error('Twitter/X posting error:', error.message);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);

    // Handle specific error cases
    if (error.response?.data) {
      const twitterError = error.response.data;
      const statusCode = error.response.status;
      
      // Handle permission errors (403 Forbidden)
      if (statusCode === 403 || twitterError.detail?.includes('not permitted') || 
          twitterError.title?.includes('not permitted') || 
          twitterError.detail?.includes('Forbidden')) {
        return res.status(403).json({
          success: false,
          error: 'Permission Denied',
          message: 'Your Twitter/X token does not have write permissions. The token may be set to "Read Only" instead of "Read and Write".',
          errorType: 'permission_denied',
          help: {
            title: 'How to Fix This',
            steps: [
              '1. Go to X Developer Portal: https://developer.twitter.com/en/portal/dashboard',
              '2. Select your app',
              '3. Go to "Settings" → "User authentication settings"',
              '4. Under "App permissions", select "Read and Write"',
              '5. Click "Save"',
              '6. Go to "Keys and tokens" tab',
              '7. Regenerate your Bearer Token',
              '8. Copy the new Bearer Token and save it in the dashboard'
            ],
            solution: 'Your Bearer Token needs "Read and Write" permissions. Update your app settings in the X Developer Portal and regenerate the token.'
          },
          details: twitterError
        });
      }
      
      // Handle 401 Unauthorized (invalid/expired token)
      if (statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Your Twitter/X token is invalid or expired. Please reconnect your account or update your Bearer Token.',
          errorType: 'unauthorized',
          help: {
            title: 'How to Fix This',
            steps: [
              '1. Click "Connect Twitter/X" button in the dashboard',
              '2. Or manually save a new Bearer Token from X Developer Portal',
              '3. Make sure the token has "Read and Write" permissions'
            ]
          },
          details: twitterError
        });
      }
      
      // Generic Twitter API error
      return res.status(statusCode || 400).json({
        success: false,
        error: 'Twitter/X API Error',
        message: twitterError.detail || twitterError.title || 'Failed to post to Twitter/X',
        errorType: twitterError.type,
        statusCode: statusCode,
        details: twitterError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

