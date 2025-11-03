// Post to Facebook - Vercel Serverless Function
// Creates a post on a Facebook Page using the Page Access Token

const axios = require('axios');

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
    const { pageAccessToken, message, pageId, imageUrl } = req.body;

    // Validate required fields
    if (!pageAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing page access token',
        message: 'Please provide a valid Facebook Page Access Token'
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
    let targetPageId = pageId;
    
    if (!targetPageId) {
      // Get page info from token
      const pageInfoResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
        params: {
          access_token: pageAccessToken,
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
          access_token: pageAccessToken
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
          access_token: pageAccessToken
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
      
      return res.status(400).json({
        success: false,
        error: 'Facebook API Error',
        message: fbError.message || 'Failed to post to Facebook',
        errorType: fbError.type,
        errorCode: fbError.code,
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

