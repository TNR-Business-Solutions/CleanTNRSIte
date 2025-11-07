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
    
    const { pageAccessToken, message, imageUrl, pageId, instagramAccountId, useDatabaseToken = true } = body || {};

  // Try to get token from database first, fallback to request body
  let accessToken = pageAccessToken;
  let targetInstagramAccountId = instagramAccountId;

  if (useDatabaseToken) {
    try {
      const db = new TNRDatabase();
      await db.initialize();
      
      // Get Instagram token from database
      const token = await db.getSocialMediaToken('instagram', instagramAccountId || null);
      
      if (token && token.access_token) {
        accessToken = token.access_token;
        if (!targetInstagramAccountId && token.instagram_account_id) {
          targetInstagramAccountId = token.instagram_account_id;
        }
        console.log('✅ Using Instagram token from database:', token.instagram_username || token.page_id);
      } else {
        // Try Facebook token if Instagram not found (Instagram uses Facebook page tokens)
        const fbToken = await db.getSocialMediaToken('facebook', pageId || null);
        if (fbToken && fbToken.access_token) {
          accessToken = fbToken.access_token;
          if (fbToken.instagram_account_id) {
            targetInstagramAccountId = fbToken.instagram_account_id;
          }
          console.log('✅ Using Facebook token for Instagram:', fbToken.page_name || fbToken.page_id);
        } else {
          console.log('⚠️ No token found in database, using provided token');
        }
      }
    } catch (dbError) {
      console.warn('⚠️ Database error, using provided token:', dbError.message);
      // Continue with provided token if database fails
    }
  }

  if (!accessToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing pageAccessToken',
      message: 'Please provide a Facebook Page Access Token or connect your account via OAuth',
      help: 'Connect your Instagram account at /api/auth/meta or provide pageAccessToken in request'
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Missing message',
      message: 'Please provide post content'
    });
  }

  try {
    console.log('Starting Instagram post process...');
    
    // Step 1: Get the Facebook Page's Instagram Business Account ID
    // If we have Instagram account ID from database, use it directly
    let instagramAccountId = targetInstagramAccountId;
    
    if (!instagramAccountId) {
      // Get the Facebook Page's Instagram Business Account ID
      const pageResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
        params: {
          fields: 'id,name,instagram_business_account',
          access_token: accessToken
        },
        timeout: 10000
      });

      const pageData = pageResponse.data;
      console.log('Page data:', pageData);

      if (!pageData.instagram_business_account) {
        return res.status(400).json({
          success: false,
          error: 'No Instagram Account',
          message: 'This Facebook Page is not connected to an Instagram Business Account. Please connect your Instagram account in Facebook Page settings.',
          help: {
            steps: [
              '1. Go to your Facebook Page settings',
              '2. Click on "Instagram" in the left menu',
              '3. Connect your Instagram Business Account',
              '4. Make sure it\'s a Business or Creator account, not Personal'
            ]
          }
        });
      }

      instagramAccountId = pageData.instagram_business_account.id;
    }
    console.log('Instagram Account ID:', instagramAccountId);

    // Step 2: Check if this is an image post or text post
    if (imageUrl) {
      // Image post (requires 2-step process: create container, then publish)
      console.log('Creating Instagram image post...');
      
      // Step 2a: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
        {
          image_url: imageUrl,
          caption: message,
          access_token: accessToken
        },
        { timeout: 15000 }
      );

      const creationId = containerResponse.data.id;
      console.log('Media container created:', creationId);

      // Step 2b: Publish the container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken
        },
        { timeout: 15000 }
      );

      console.log('Instagram post published:', publishResponse.data);

      res.json({
        success: true,
        message: 'Successfully posted to Instagram!',
        postId: publishResponse.data.id,
        platform: 'instagram',
        type: 'image',
        instagramAccountId: instagramAccountId
      });

    } else {
      // Text-only post (Instagram doesn't support text-only posts natively)
      // We need to guide the user to add an image or use Facebook instead
      return res.status(400).json({
        success: false,
        error: 'Image Required',
        message: 'Instagram requires an image for all posts. Text-only posts are not supported.',
        help: {
          solution: 'Please provide an image URL, or post text-only content to Facebook instead.',
          note: 'Instagram posts must include at least one image or video.'
        }
      });
    }

  } catch (error) {
    console.error('Instagram posting error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific errors
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      
      return res.status(400).json({
        success: false,
        error: fbError.message,
        errorType: fbError.type,
        errorCode: fbError.code,
        message: 'Failed to post to Instagram. See error details above.',
        help: fbError.code === 190 ? 'Your token may have expired. Please reconnect Facebook OAuth.' : undefined
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'An unexpected error occurred while posting to Instagram.'
    });
  }
};

