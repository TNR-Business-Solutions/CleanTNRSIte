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

    // Handle specific error cases
    if (error.response?.data) {
      const twitterError = error.response.data;
      
      return res.status(400).json({
        success: false,
        error: 'Twitter/X API Error',
        message: twitterError.detail || twitterError.title || 'Failed to post to Twitter/X',
        errorType: twitterError.type,
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

