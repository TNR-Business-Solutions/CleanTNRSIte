/**
 * Post to Threads - Vercel Serverless Function
 * Creates a thread (text post) on Threads using the access token from database
 */

const axios = require('axios');
const TNRDatabase = require('../../database');

// Threads API endpoint
const THREADS_API_URL = 'https://graph.threads.net/v1.0';

/**
 * Create a Threads post (text only)
 */
async function createThreadsPost(userId, accessToken, text) {
  try {
    console.log('📝 Creating Threads post for user:', userId);

    // Step 1: Create media container
    const containerResponse = await axios.post(
      `${THREADS_API_URL}/${userId}/threads`,
      {
        media_type: 'TEXT',
        text: text
      },
      {
        params: {
          access_token: accessToken
        },
        timeout: 10000
      }
    );

    const containerId = containerResponse.data.id;
    console.log('✅ Media container created:', containerId);

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `${THREADS_API_URL}/${userId}/threads_publish`,
      {
        creation_id: containerId
      },
      {
        params: {
          access_token: accessToken
        },
        timeout: 10000
      }
    );

    const threadId = publishResponse.data.id;
    console.log('✅ Thread published successfully:', threadId);

    return {
      success: true,
      thread_id: threadId,
      container_id: containerId
    };
  } catch (error) {
    console.error('❌ Error creating Threads post:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a Threads post with image
 */
async function createThreadsPostWithImage(userId, accessToken, text, imageUrl) {
  try {
    console.log('📷 Creating Threads post with image for user:', userId);

    // Step 1: Create media container with image
    const containerResponse = await axios.post(
      `${THREADS_API_URL}/${userId}/threads`,
      {
        media_type: 'IMAGE',
        image_url: imageUrl,
        text: text
      },
      {
        params: {
          access_token: accessToken
        },
        timeout: 10000
      }
    );

    const containerId = containerResponse.data.id;
    console.log('✅ Media container created:', containerId);

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `${THREADS_API_URL}/${userId}/threads_publish`,
      {
        creation_id: containerId
      },
      {
        params: {
          access_token: accessToken
        },
        timeout: 10000
      }
    );

    const threadId = publishResponse.data.id;
    console.log('✅ Thread with image published successfully:', threadId);

    return {
      success: true,
      thread_id: threadId,
      container_id: containerId
    };
  } catch (error) {
    console.error('❌ Error creating Threads post with image:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Post to Threads handler
 */
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
    const { accessToken, text, imageUrl, useDatabaseToken = true } = req.body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing text',
        message: 'Text is required for Threads posts'
      });
    }

    // Threads character limit
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Threads posts must be 500 characters or less'
      });
    }

    // Try to get token from database
    let token = accessToken;
    let userId = null;

    if (useDatabaseToken) {
      try {
        const db = new TNRDatabase();
        await db.initialize();

        const tokens = await db.getSocialMediaTokens('threads');
        const threadsToken = tokens[0];

        if (threadsToken && threadsToken.access_token) {
          token = threadsToken.access_token;
          userId = threadsToken.user_id;
          console.log('✅ Using token from database for Threads user:', threadsToken.user_name);
        } else {
          console.log('⚠️  No Threads token found in database');
        }
      } catch (dbError) {
        console.warn('⚠️  Database error, using provided token:', dbError.message);
      }
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing access token',
        message: 'No Threads access token found. Please connect your Threads account.'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing user ID',
        message: 'Threads user ID not found. Please reconnect your account.'
      });
    }

    // Create the post
    let result;
    if (imageUrl) {
      result = await createThreadsPostWithImage(userId, token, text, imageUrl);
    } else {
      result = await createThreadsPost(userId, token, text);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully posted to Threads',
      thread_id: result.thread_id,
      platform: 'threads'
    });

  } catch (error) {
    console.error('❌ Error posting to Threads:', error);

    // Handle specific API errors
    if (error.response?.data) {
      const apiError = error.response.data.error;
      return res.status(error.response.status || 500).json({
        success: false,
        error: apiError?.message || 'Failed to post to Threads',
        code: apiError?.code,
        details: apiError
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

