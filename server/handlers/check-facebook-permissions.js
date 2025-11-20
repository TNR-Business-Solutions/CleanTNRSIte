/**
 * Check Facebook Permissions - Vercel Serverless Function
 * Validates Facebook token permissions and provides detailed status
 */

const axios = require('axios');
const TNRDatabase = require('../../database');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse request body if POST
    let body = req.body || {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        body = {};
      }
    }
    
    const { pageAccessToken, pageId, useDatabaseToken = true } = body;

    // Try to get token from database first
    let accessToken = pageAccessToken;
    let targetPageId = pageId;
    let tokenSource = 'provided';

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();
        
        // Get Facebook token from database
        const token = await db.getSocialMediaToken('facebook', pageId || null);
        
        if (token && token.access_token) {
          accessToken = token.access_token;
          targetPageId = token.page_id;
          tokenSource = 'database';
          console.log('✅ Using token from database for:', token.page_name || token.page_id);
        }
      } catch (dbError) {
        console.warn('⚠️ Database error:', dbError.message);
      }
    }

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'No access token',
        message: 'Please connect your Facebook account',
        action: 'reconnect',
        reconnectUrl: '/api/auth/meta'
      });
    }

    // Check token permissions and page access
    const permissionsResponse = await axios.get('https://graph.facebook.com/v19.0/me/permissions', {
      params: {
        access_token: accessToken
      },
      timeout: 10000
    });

    const permissions = permissionsResponse.data.data;
    const grantedPermissions = permissions
      .filter(p => p.status === 'granted')
      .map(p => p.permission);

    // Required permissions for posting
    const requiredPermissions = [
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_show_list'
    ];

    const missingPermissions = requiredPermissions.filter(
      p => !grantedPermissions.includes(p)
    );

    // Get user info
    let userInfo;
    try {
      const userResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email'
        },
        timeout: 10000
      });
      userInfo = userResponse.data;
    } catch (error) {
      userInfo = { error: 'Unable to fetch user info' };
    }

    // Get pages the user manages
    let pages = [];
    let selectedPage = null;
    try {
      const pagesResponse = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,category,tasks'
        },
        timeout: 10000
      });
      
      pages = pagesResponse.data.data.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        hasToken: !!page.access_token,
        canPost: page.tasks?.includes('CREATE_CONTENT') || page.tasks?.includes('MODERATE'),
        tasks: page.tasks || []
      }));

      if (targetPageId) {
        selectedPage = pages.find(p => p.id === targetPageId);
      } else if (pages.length > 0) {
        selectedPage = pages[0]; // Use first page as default
      }
    } catch (error) {
      console.error('Error fetching pages:', error.message);
    }

    // Check token expiration
    let tokenInfo;
    try {
      const debugResponse = await axios.get('https://graph.facebook.com/v19.0/debug_token', {
        params: {
          input_token: accessToken,
          access_token: accessToken
        },
        timeout: 10000
      });
      tokenInfo = debugResponse.data.data;
    } catch (error) {
      tokenInfo = { error: 'Unable to debug token' };
    }

    // Determine overall status
    const isValid = missingPermissions.length === 0 && pages.length > 0;
    const canPost = isValid && (selectedPage?.canPost || false);

    return res.status(200).json({
      success: true,
      status: {
        valid: isValid,
        canPost: canPost,
        tokenSource: tokenSource,
        needsReconnect: !isValid
      },
      user: userInfo,
      permissions: {
        granted: grantedPermissions,
        required: requiredPermissions,
        missing: missingPermissions
      },
      pages: {
        count: pages.length,
        list: pages,
        selected: selectedPage
      },
      token: tokenInfo ? {
        isValid: tokenInfo.is_valid,
        expiresAt: tokenInfo.expires_at,
        expiresIn: tokenInfo.expires_at ? Math.floor((tokenInfo.expires_at * 1000 - Date.now()) / 1000) : null,
        appId: tokenInfo.app_id,
        userId: tokenInfo.user_id,
        scopes: tokenInfo.scopes || []
      } : null,
      recommendations: [
        ...( missingPermissions.length > 0 ? [
          {
            type: 'error',
            message: `Missing required permissions: ${missingPermissions.join(', ')}`,
            action: 'Reconnect your Facebook account to grant missing permissions',
            actionUrl: '/api/auth/meta'
          }
        ] : []),
        ...(pages.length === 0 ? [
          {
            type: 'error',
            message: 'No Facebook Pages found',
            action: 'Create a Facebook Page or ensure you have Page admin access',
            actionUrl: 'https://www.facebook.com/pages/create'
          }
        ] : []),
        ...(selectedPage && !selectedPage.canPost ? [
          {
            type: 'warning',
            message: `You don't have posting permissions on ${selectedPage.name}`,
            action: 'Request admin or editor role on this Page',
            actionUrl: `https://www.facebook.com/${selectedPage.id}/settings/?tab=admin_roles`
          }
        ] : []),
        ...(tokenInfo && tokenInfo.expires_in && tokenInfo.expires_in < 604800 ? [
          {
            type: 'warning',
            message: 'Your access token expires soon',
            action: 'Reconnect your account to refresh the token',
            actionUrl: '/api/auth/meta'
          }
        ] : [])
      ]
    });

  } catch (error) {
    console.error('Permission check error:', error.message);
    console.error('Error details:', error.response?.data);

    // Handle specific error cases
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      
      return res.status(400).json({
        success: false,
        error: 'Facebook API Error',
        message: fbError.message || 'Failed to check permissions',
        errorType: fbError.type,
        errorCode: fbError.code,
        action: fbError.code === 190 ? 'reconnect' : 'retry',
        reconnectUrl: '/api/auth/meta',
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

