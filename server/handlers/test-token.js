// Test Facebook Token - Vercel Serverless Function
// Validates a Facebook Page Access Token and returns page information

const axios = require('axios');

module.exports = async (req, res) => {
  // Accept both GET and POST
  const pageAccessToken = req.method === 'POST' 
    ? req.body.pageAccessToken 
    : req.query.token;

  if (!pageAccessToken) {
    return res.status(400).json({
      success: false,
      error: 'Missing token',
      message: 'Please provide a Facebook Page Access Token as "pageAccessToken" in POST body or "token" in query string'
    });
  }

  try {
    console.log('Testing Facebook token...');

    // First, detect if this is a User token or Page token
    const detectResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name'
      },
      timeout: 10000
    });

    // Try to get more details to determine token type
    const detailsResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,category,fan_count,followers_count,instagram_business_account'
      },
      timeout: 10000
    }).catch(err => {
      // If category field fails, this is likely a User token
      if (err.response?.data?.error?.message?.includes('category')) {
        return { data: { ...detectResponse.data, isUserToken: true } };
      }
      throw err;
    });

    const pageInfo = detailsResponse.data;
    
    // Check if this is a User token (wrong type)
    if (pageInfo.isUserToken || !pageInfo.category) {
      return res.status(400).json({
        success: false,
        error: 'Wrong Token Type',
        message: 'This is a USER token, not a PAGE token!',
        help: {
          issue: 'You copied the Long-Lived User Token instead of the Page Access Token',
          solution: 'Please reconnect to Facebook OAuth and copy the "Page Access Token" (the one under your page name, not at the top)',
          reconnectUrl: '/auth/meta'
        },
        detectedTokenType: 'User Token',
        userInfo: {
          id: pageInfo.id,
          name: pageInfo.name
        }
      });
    }
    
    console.log('Token is valid for page:', pageInfo.name);

    // Get token debug info to check expiration
    let tokenDebugInfo = null;
    try {
      const debugResponse = await axios.get('https://graph.facebook.com/v19.0/debug_token', {
        params: {
          input_token: pageAccessToken,
          access_token: pageAccessToken
        },
        timeout: 10000
      });
      tokenDebugInfo = debugResponse.data.data;
      console.log('Token expires at:', tokenDebugInfo.expires_at ? new Date(tokenDebugInfo.expires_at * 1000) : 'Never');
    } catch (debugError) {
      console.warn('Could not fetch token debug info:', debugError.message);
    }

    // Check for Instagram connection
    let instagramInfo = null;
    if (pageInfo.instagram_business_account) {
      try {
        const igResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${pageInfo.instagram_business_account.id}`,
          {
            params: {
              access_token: pageAccessToken,
              fields: 'id,username,name,profile_picture_url,followers_count'
            },
            timeout: 10000
          }
        );
        instagramInfo = igResponse.data;
        console.log('Instagram account connected:', instagramInfo.username);
      } catch (igError) {
        console.warn('Could not fetch Instagram info:', igError.message);
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Token is valid!',
      page: {
        id: pageInfo.id,
        name: pageInfo.name,
        category: pageInfo.category,
        fanCount: pageInfo.fan_count,
        followersCount: pageInfo.followers_count,
        hasInstagram: !!pageInfo.instagram_business_account
      },
      instagram: instagramInfo ? {
        id: instagramInfo.id,
        username: instagramInfo.username,
        name: instagramInfo.name,
        followersCount: instagramInfo.followers_count,
        profilePicture: instagramInfo.profile_picture_url
      } : null,
      tokenInfo: {
        valid: true,
        canPost: true,
        scopes: tokenDebugInfo?.scopes?.join(', ') || 'Token has necessary permissions',
        expires_at: tokenDebugInfo?.expires_at || 0,
        data_access_expires_at: tokenDebugInfo?.data_access_expires_at || 0,
        is_valid: tokenDebugInfo?.is_valid !== false,
        issued_at: tokenDebugInfo?.issued_at || 0
      }
    });

  } catch (error) {
    console.error('Token validation error:', error.message);
    console.error('Error details:', error.response?.data);

    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      
      return res.status(400).json({
        success: false,
        error: 'Invalid Token',
        message: fbError.message || 'The provided token is invalid or expired',
        errorType: fbError.type,
        errorCode: fbError.code,
        details: fbError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred while validating the token'
    });
  }
};

