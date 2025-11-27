/**
 * Threads OAuth Callback Handler
 * Handles the OAuth callback from Threads and exchanges code for access token
 */

const axios = require('axios');
const { stateStore, THREADS_APP_ID, THREADS_APP_SECRET, THREADS_REDIRECT_URI } = require('./auth-threads');
const TNRDatabase = require('../../database');

// Threads token endpoint
const THREADS_TOKEN_URL = 'https://graph.threads.net/oauth/access_token';
const THREADS_USER_URL = 'https://graph.threads.net/v1.0/me';

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
  try {
    console.log('🔄 Exchanging authorization code for Threads access token');

    const response = await axios.post(THREADS_TOKEN_URL, {
      client_id: THREADS_APP_ID,
      client_secret: THREADS_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: THREADS_REDIRECT_URI,
      code: code
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('✅ Successfully obtained Threads access token');
    return response.data;
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Threads user profile
 */
async function getUserProfile(accessToken) {
  try {
    console.log('🔍 Fetching Threads user profile');

    const response = await axios.get(THREADS_USER_URL, {
      params: {
        fields: 'id,username,name,threads_profile_picture_url,threads_biography',
        access_token: accessToken
      },
      timeout: 10000
    });

    console.log('✅ Successfully fetched Threads profile');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Threads profile:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Exchange short-lived token for long-lived token
 */
async function getLongLivedToken(shortLivedToken) {
  try {
    console.log('🔄 Exchanging for long-lived token');

    const response = await axios.get('https://graph.threads.net/access_token', {
      params: {
        grant_type: 'th_exchange_token',
        client_secret: THREADS_APP_SECRET,
        access_token: shortLivedToken
      },
      timeout: 10000
    });

    console.log('✅ Successfully obtained long-lived token');
    console.log(`   Expires in: ${response.data.expires_in} seconds (${Math.floor(response.data.expires_in / 86400)} days)`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting long-lived token:', error.response?.data || error.message);
    // Return short-lived token if exchange fails
    return {
      access_token: shortLivedToken,
      token_type: 'bearer',
      expires_in: 3600
    };
  }
}

/**
 * Save Threads token to database
 */
async function saveThreadsToken(tokenData, userProfile) {
  try {
    const db = new TNRDatabase();
    await db.initialize();

    const expiresAt = Date.now() + (tokenData.expires_in * 1000);

    await db.saveSocialMediaToken({
      platform: 'threads',
      access_token: tokenData.access_token,
      refresh_token: null, // Threads doesn't use refresh tokens
      token_type: tokenData.token_type || 'bearer',
      expires_at: expiresAt,
      user_id: userProfile.id,
      user_name: userProfile.username,
      page_name: userProfile.name || userProfile.username,
      page_id: userProfile.id,
      additional_data: JSON.stringify({
        profile_picture: userProfile.threads_profile_picture_url,
        biography: userProfile.threads_biography
      })
    });

    console.log(`✅ Saved Threads token to database for user: ${userProfile.username}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving Threads token:', error);
    return false;
  }
}

/**
 * Handle Threads OAuth callback
 */
module.exports = async (req, res) => {
  try {
    console.log('🎯 Threads OAuth callback received');

    const { code, state, error, error_description } = req.query;

    // Handle authorization errors
    if (error) {
      console.error('❌ Threads authorization error:', error);
      return res.redirect(`/admin-dashboard-v2.html?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      throw new Error('Missing authorization code');
    }

    if (!state) {
      throw new Error('Missing state parameter');
    }

    // Verify state token (CSRF protection)
    const stateData = stateStore.get(state);
    if (!stateData) {
      throw new Error('Invalid or expired state token');
    }

    // Remove used state token
    stateStore.delete(state);

    console.log('✅ State validated');

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get long-lived token (60 days)
    const longLivedToken = await getLongLivedToken(tokenData.access_token);

    // Get user profile
    const userProfile = await getUserProfile(longLivedToken.access_token);

    // Save token to database
    await saveThreadsToken(longLivedToken, userProfile);

    console.log('🎉 Threads OAuth flow completed successfully!');
    console.log(`   User: ${userProfile.username} (${userProfile.name})`);

    // Redirect to success page
    const successUrl = new URL(stateData.returnUrl, `https://${req.headers.host}`);
    successUrl.searchParams.append('success', 'true');
    successUrl.searchParams.append('platform', 'threads');
    successUrl.searchParams.append('username', userProfile.username);

    res.redirect(successUrl.toString());

  } catch (error) {
    console.error('❌ Error in Threads OAuth callback:', error);

    // Redirect to error page
    const errorUrl = new URL('/admin-dashboard-v2.html', `https://${req.headers.host}`);
    errorUrl.searchParams.append('error', error.message || 'Threads authentication failed');

    res.redirect(errorUrl.toString());
  }
};

