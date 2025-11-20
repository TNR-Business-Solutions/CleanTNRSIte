// Post to Facebook - Vercel Serverless Function
// Creates a post on a Facebook Page using the Page Access Token from database

const axios = require('axios');
const TNRDatabase = require('../../database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Parse request body if it's a string (Vercel sometimes sends unparsed body)
    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        });
      }
    }
    
    const { pageAccessToken, message, pageId, imageUrl, useDatabaseToken = true } = body || {};

    // Try to get token from database first, fallback to request body
    let accessToken = pageAccessToken;
    let targetPageId = pageId;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();
        
        // Get Facebook token from database
        const token = await db.getSocialMediaToken('facebook', pageId || null);
        
        if (token && token.access_token) {
          accessToken = token.access_token;
          if (!targetPageId && token.page_id) {
            targetPageId = token.page_id;
          }
          console.log('✅ Using token from database for page:', token.page_name || token.page_id);
        } else {
          console.log('⚠️ No token found in database, using provided token or falling back');
        }
      } catch (dbError) {
        console.warn('⚠️ Database error, using provided token:', dbError.message);
        // Continue with provided token if database fails
      }
    }

    // Validate required fields
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing page access token',
        message: 'Please provide a valid Facebook Page Access Token or connect your account via OAuth',
        help: 'Connect your Facebook account at /api/auth/meta or provide pageAccessToken in request'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Missing message',
        message: 'Please provide post content'
      });
    }

    // If pageId not provided, get it from the token
    if (!targetPageId) {
      // Get page info from token
      const pageInfoResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name'
        },
        timeout: 10000
      });
      
      targetPageId = pageInfoResponse.data.id;
      console.log('Auto-detected Page ID:', targetPageId, 'Name:', pageInfoResponse.data.name);
    }

    // Create the post (with or without image)
    let postResponse;
    
    if (imageUrl) {
      // Post with image using /photos endpoint
      console.log('Creating Facebook photo post...');
      postResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${targetPageId}/photos`,
        {
          url: imageUrl,
          caption: message,
          access_token: accessToken
        },
        {
          timeout: 15000
        }
      );
    } else {
      // Text-only post using /feed endpoint
      console.log('Creating Facebook text post...');
      postResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${targetPageId}/feed`,
        {
          message: message,
          access_token: accessToken
        },
        {
          timeout: 15000
        }
      );
    }

    console.log('Post created successfully:', postResponse.data);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Post published to Facebook successfully!',
      postId: postResponse.data.id,
      postUrl: `https://www.facebook.com/${postResponse.data.id.replace('_', '/posts/')}`,
      data: postResponse.data
    });

  } catch (error) {
    console.error('Facebook posting error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific error cases
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      
      // Provide actionable error messages
      let userMessage = fbError.message || 'Failed to post to Facebook';
      let action = 'retry';
      let actionUrl = null;

      // Handle specific error codes
      if (fbError.code === 200 || fbError.type === 'OAuthException') {
        userMessage = '❌ Permissions Error: Your Facebook account needs to be reconnected with the correct permissions.';
        action = 'reconnect';
        actionUrl = '/api/auth/meta';
      } else if (fbError.code === 190) {
        userMessage = '❌ Token Expired: Please reconnect your Facebook account.';
        action = 'reconnect';
        actionUrl = '/api/auth/meta';
      } else if (fbError.code === 100) {
        userMessage = '❌ Invalid Parameters: Please check your post content and try again.';
      } else if (fbError.code === 368) {
        userMessage = '❌ Page Access: You don\'t have permission to post on this Page. Please ensure you\'re a Page admin or editor.';
        action = 'check_page_role';
      }
      
      return res.status(400).json({
        success: false,
        error: 'Facebook API Error',
        message: userMessage,
        originalMessage: fbError.message,
        errorType: fbError.type,
        errorCode: fbError.code,
        action: action,
        actionUrl: actionUrl,
        help: action === 'reconnect' 
          ? 'Click the "Reconnect Facebook" button to grant the required permissions'
          : 'Please check your Facebook Page settings and permissions',
        details: fbError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

