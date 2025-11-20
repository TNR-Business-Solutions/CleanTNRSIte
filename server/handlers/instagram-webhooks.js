/**
 * Instagram API Webhooks Handler
 * Handles webhook events from Instagram Business API
 */

const crypto = require('crypto');

// Instagram Configuration
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'tnr_instagram_verify_2024';
const META_APP_SECRET = process.env.META_APP_SECRET || '8bb683dbc591772f9fe6dada7e2d792b';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || 'faf897f06f8cdfccdcd3eabc2d4f3c24';

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(req, body) {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.warn('⚠️  No signature provided in Instagram webhook request');
    return false;
  }

  try {
    // Use Instagram app secret first, fallback to Meta app secret
    const appSecret = INSTAGRAM_APP_SECRET || META_APP_SECRET;
    
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error('❌ Instagram webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error.message);
    return false;
  }
}

/**
 * Process Instagram webhook event
 */
async function processWebhookEvent(event) {
  const { object, entry } = event;

  console.log(`📥 Instagram webhook received: ${object}`);

  try {
    for (const item of entry || []) {
      const { id, time, changes, messaging } = item;

      // Handle different object types
      if (object === 'instagram') {
        for (const change of changes || []) {
          await handleInstagramChange(item, change);
        }
      }

      // Handle messaging (Instagram DMs)
      if (messaging) {
        await handleMessagingEvent(item, messaging);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error processing Instagram webhook event:', error);
    throw error;
  }
}

/**
 * Handle Instagram changes
 */
async function handleInstagramChange(item, change) {
  const { field, value } = change;

  console.log(`📸 Instagram event: ${field}`);

  switch (field) {
    case 'comments':
      await handleCommentEvent(value);
      break;

    case 'mentions':
      await handleMentionEvent(value);
      break;

    case 'story_insights':
      await handleStoryInsights(value);
      break;

    case 'live_comments':
      await handleLiveComments(value);
      break;

    default:
      console.log(`⚠️  Unknown Instagram field: ${field}`);
  }
}

/**
 * Handle Instagram comment events
 */
async function handleCommentEvent(value) {
  const { id, media, text, from, parent_id } = value;

  console.log(`💬 Instagram comment on media: ${media?.id}`);
  console.log(`   From: ${from?.username} (${from?.id})`);
  console.log(`   Text: ${text}`);
  console.log(`   Comment ID: ${id}`);

  if (parent_id) {
    console.log(`   Reply to: ${parent_id}`);
  }

  // TODO: Save comment to database
  // TODO: Auto-reply if needed
  // TODO: Moderate comment (hide/unhide)
  // TODO: Send notification to admin
}

/**
 * Handle Instagram mention events
 */
async function handleMentionEvent(value) {
  const { media_id, comment_id } = value;

  console.log(`@️⃣ Instagram mention`);
  console.log(`   Media ID: ${media_id}`);
  console.log(`   Comment ID: ${comment_id}`);

  // TODO: Fetch mention details
  // TODO: Respond to mention
  // TODO: Save to database
}

/**
 * Handle Instagram story insights
 */
async function handleStoryInsights(value) {
  const { media_id, impressions, reach, taps_forward, taps_back, exits } = value;

  console.log(`📊 Instagram story insights`);
  console.log(`   Media ID: ${media_id}`);
  console.log(`   Impressions: ${impressions}`);
  console.log(`   Reach: ${reach}`);

  // TODO: Save insights to database
  // TODO: Generate analytics report
}

/**
 * Handle Instagram live comments
 */
async function handleLiveComments(value) {
  const { id, from, text, timestamp } = value;

  console.log(`🔴 Instagram live comment`);
  console.log(`   From: ${from?.username}`);
  console.log(`   Text: ${text}`);

  // TODO: Display live comment
  // TODO: Moderate if needed
}

/**
 * Handle Instagram messaging events (DMs)
 */
async function handleMessagingEvent(item, messaging) {
  console.log(`💬 Instagram DM event for: ${item.id}`);

  for (const message of messaging || []) {
    const { sender, recipient, timestamp, message: msg, postback, read } = message;

    if (msg) {
      console.log(`📨 DM from ${sender.id}`);
      
      if (msg.text) {
        console.log(`   Text: ${msg.text}`);
      }

      if (msg.attachments) {
        console.log(`   Attachments: ${msg.attachments.length}`);
        // TODO: Handle media attachments
      }

      if (msg.quick_reply) {
        console.log(`   Quick reply: ${msg.quick_reply.payload}`);
      }

      // TODO: Save message to database
      // TODO: Send auto-reply if needed
      // TODO: Create ticket/conversation
    }

    if (postback) {
      console.log(`🔘 Postback: ${postback.payload}`);
      console.log(`   Title: ${postback.title}`);
      // TODO: Handle button clicks
    }

    if (read) {
      console.log(`✅ Message read by ${sender.id}`);
      // TODO: Update message status
    }
  }
}

/**
 * Instagram Webhook endpoint handler
 */
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      console.log('🔐 Instagram webhook verification request received');
      console.log(`   Mode: ${mode}`);
      console.log(`   Token: ${token}`);
      console.log(`   Challenge: ${challenge}`);

      // Verify the token
      if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
        console.log('✅ Instagram webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.error('❌ Instagram webhook verification failed');
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Handle webhook events (POST request)
    if (req.method === 'POST') {
      console.log('📥 Instagram webhook event received');

      // Read request body
      let rawBody = req.body;
      let bodyString = '';

      if (!rawBody || (typeof rawBody === 'object' && Object.keys(rawBody).length === 0)) {
        if (req.on && typeof req.on === 'function') {
          bodyString = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => {
              data += chunk.toString('utf8');
            });
            req.on('end', () => {
              resolve(data);
            });
            req.on('error', reject);
          });
          rawBody = JSON.parse(bodyString);
        } else {
          console.error('❌ Cannot read request body');
          return res.status(400).json({ error: 'Invalid request body' });
        }
      } else if (typeof rawBody === 'string') {
        bodyString = rawBody;
        rawBody = JSON.parse(bodyString);
      } else {
        bodyString = JSON.stringify(rawBody);
      }

      // Verify webhook signature
      if (!verifyWebhookSignature(req, bodyString)) {
        console.error('❌ Instagram webhook signature verification failed');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      console.log('✅ Webhook signature verified');

      // Log webhook details
      console.log('📦 Webhook event:', {
        object: rawBody.object,
        entryCount: rawBody.entry?.length || 0
      });

      // Process webhook event
      await processWebhookEvent(rawBody);

      // Return success response (Instagram expects 200)
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Instagram webhook handler error:', error);
    console.error('   Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

