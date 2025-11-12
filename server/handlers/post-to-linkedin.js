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

    let linkedinToken = null;
    let storedUserId = null;
    
    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();
        
        // Get LinkedIn token from database (first available)
        const tokens = await db.getSocialMediaTokens('linkedin');
        linkedinToken = tokens[0];
        
        if (linkedinToken && linkedinToken.access_token) {
          token = linkedinToken.access_token;
          // Get stored user ID (page_id or user_id) to construct URN
          storedUserId = linkedinToken.page_id || linkedinToken.user_id;
          console.log('✅ Using token from database for LinkedIn user:', linkedinToken.page_name || linkedinToken.user_id);
          console.log('📋 Stored user ID:', storedUserId);
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
    // Try to use stored user ID first (avoids profile API call which requires profile scope)
    let userUrn;
    
    if (storedUserId && !storedUserId.startsWith('linkedin_user_')) {
      // We have a real LinkedIn user ID stored, use it directly
      userUrn = `urn:li:person:${storedUserId}`;
      console.log('✅ Using stored user ID to construct URN:', userUrn);
    } else {
      // Fallback: Try to fetch profile (may fail without profile scope, but worth trying)
      try {
        console.log('⚠️ No stored user ID found, attempting to fetch profile...');
        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          timeout: 10000
        });
        
        if (profileResponse.data && profileResponse.data.id) {
          userUrn = `urn:li:person:${profileResponse.data.id}`;
          console.log('✅ Successfully fetched profile, URN:', userUrn);
          
          // Update database with the user ID for future use
          if (linkedinToken && linkedinToken.id) {
            try {
              const db = new TNRDatabase();
              await db.initialize();
              await db.execute(
                'UPDATE social_media_tokens SET user_id = ?, page_id = ? WHERE id = ?',
                [profileResponse.data.id, profileResponse.data.id, linkedinToken.id]
              );
              console.log('✅ Updated database with user ID');
            } catch (updateError) {
              console.warn('⚠️ Could not update database with user ID:', updateError.message);
            }
          }
        } else {
          throw new Error('Profile response missing user ID');
        }
      } catch (profileError) {
        // Profile fetch failed (likely due to missing profile scope)
        console.warn('⚠️ Profile fetch failed (expected without profile scope):', profileError.message);
        
        // If we have a fallback user ID, try using it (though it may not work)
        if (storedUserId) {
          userUrn = `urn:li:person:${storedUserId}`;
          console.log('⚠️ Using fallback user ID (may not work):', userUrn);
        } else {
          // Last resort: throw error with helpful message
          throw new Error(
            'Unable to determine LinkedIn user ID. ' +
            'Please reconnect your LinkedIn account to refresh the token and user information. ' +
            'The profile API requires additional permissions that may not be available.'
          );
        }
      }
    }

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

    console.log('Creating UGC post with:', {
      author: userUrn,
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    });

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
    console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    console.error('Request config:', {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data ? JSON.parse(error.config.data) : null
    });
    console.error('Error stack:', error.stack);

    // Handle specific error cases
    if (error.response?.data) {
      const linkedinError = error.response.data;
      
      // Check if it's a user ID/URN issue
      if (error.message && error.message.includes('Unable to determine LinkedIn user ID')) {
        return res.status(400).json({
          success: false,
          error: 'LinkedIn User ID Missing',
          message: 'Unable to determine your LinkedIn user ID. Please reconnect your LinkedIn account.',
          help: {
            title: 'How to Fix This',
            steps: [
              '1. Go to the Social Media Automation Dashboard',
              '2. Click "💼 Connect LinkedIn" button',
              '3. Complete the OAuth authorization flow',
              '4. This will refresh your token and save your user ID',
              '5. Try posting again'
            ]
          },
          errorType: linkedinError.errorCode,
          details: linkedinError
        });
      }
      
      // Extract more detailed error information
      const errorMessage = linkedinError.message || 
                          linkedinError.errorDetails || 
                          linkedinError.error?.message ||
                          linkedinError.error ||
                          JSON.stringify(linkedinError);
      
      return res.status(400).json({
        success: false,
        error: 'LinkedIn API Error',
        message: errorMessage,
        errorType: linkedinError.errorCode || linkedinError.error?.errorCode,
        errorCode: linkedinError.errorCode,
        fullError: linkedinError,
        details: linkedinError
      });
    }

    // Handle non-API errors (like missing user ID)
    if (error.message && error.message.includes('Unable to determine LinkedIn user ID')) {
      return res.status(400).json({
        success: false,
        error: 'LinkedIn User ID Missing',
        message: error.message,
        help: {
          title: 'How to Fix This',
          steps: [
            '1. Go to the Social Media Automation Dashboard',
            '2. Click "💼 Connect LinkedIn" button',
            '3. Complete the OAuth authorization flow',
            '4. This will refresh your token and save your user ID',
            '5. Try posting again'
          ]
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

