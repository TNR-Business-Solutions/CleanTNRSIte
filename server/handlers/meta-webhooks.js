/**
 * Meta (Facebook/Instagram) Webhooks Handler
 * Handles webhook events from Facebook and Instagram
 */

const crypto = require('crypto');

// Meta App Configuration
const META_APP_SECRET = process.env.META_APP_SECRET || '8bb683dbc591772f9fe6dada7e2d792b';
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'tnr_meta_webhook_verify_2024';

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(req, body) {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.error('❌ No signature provided in webhook request');
    return false;
  }

  try {
    // Calculate expected signature
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', META_APP_SECRET)
      .update(body)
      .digest('hex');

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      console.error('   Expected:', expectedSignature.substring(0, 20) + '...');
      console.error('   Received:', signature.substring(0, 20) + '...');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error.message);
    return false;
  }
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event) {
  const { object, entry } = event;

  console.log(`📥 Meta webhook received: ${object}`);

  try {
    // Process each entry in the event
    for (const item of entry || []) {
      const { id, time, changes, messaging } = item;

      // Handle different object types
      switch (object) {
        case 'page':
          await handlePageEvent(item, changes);
          break;

        case 'instagram':
          await handleInstagramEvent(item, changes);
          break;

        case 'user':
          await handleUserEvent(item, changes);
          break;

        default:
          console.log(`⚠️  Unknown webhook object type: ${object}`);
      }

      // Handle messaging (Messenger/Instagram DMs)
      if (messaging) {
        await handleMessagingEvent(item, messaging);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error processing webhook event:', error);
    throw error;
  }
}

/**
 * Handle Facebook Page events
 */
async function handlePageEvent(item, changes) {
  console.log(`📄 Facebook Page event for page: ${item.id}`);

  for (const change of changes || []) {
    const { field, value } = change;

    switch (field) {
      case 'feed':
        console.log(`📰 Feed update:`, value);
        // TODO: Handle feed posts, comments, reactions
        break;

      case 'comments':
        console.log(`💬 Comment:`, value);
        // TODO: Handle comments
        break;

      case 'reactions':
        console.log(`👍 Reaction:`, value);
        // TODO: Handle reactions
        break;

      case 'mention':
        console.log(`@️⃣ Mention:`, value);
        // TODO: Handle mentions
        break;

      default:
        console.log(`⚠️  Unknown page field: ${field}`);
    }
  }
}

/**
 * Handle Instagram events
 */
async function handleInstagramEvent(item, changes) {
  console.log(`📸 Instagram event for account: ${item.id}`);

  for (const change of changes || []) {
    const { field, value } = change;

    switch (field) {
      case 'comments':
        console.log(`💬 Instagram comment:`, value);
        // TODO: Handle Instagram comments
        break;

      case 'mentions':
        console.log(`@️⃣ Instagram mention:`, value);
        // TODO: Handle Instagram mentions
        break;

      case 'story_insights':
        console.log(`📊 Story insights:`, value);
        // TODO: Handle story insights
        break;

      default:
        console.log(`⚠️  Unknown Instagram field: ${field}`);
    }
  }
}

/**
 * Handle User events
 */
async function handleUserEvent(item, changes) {
  console.log(`👤 User event for user: ${item.id}`);

  for (const change of changes || []) {
    const { field, value } = change;
    console.log(`   Field: ${field}`, value);
  }
}

/**
 * Handle Messenger/Instagram DM events
 */
async function handleMessagingEvent(item, messaging) {
  console.log(`💬 Messaging event for: ${item.id}`);

  for (const message of messaging || []) {
    const { sender, recipient, timestamp, message: msg, postback, read } = message;

    if (msg) {
      console.log(`📨 Message from ${sender.id}: ${msg.text || '(media)'}`);
      // TODO: Handle incoming messages
      // TODO: Send auto-reply if needed
    }

    if (postback) {
      console.log(`🔘 Postback: ${postback.payload}`);
      // TODO: Handle button clicks
    }

    if (read) {
      console.log(`✅ Message read by ${sender.id}`);
      // TODO: Update message status
    }
  }
}

/**
 * Meta Webhook endpoint handler
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

      console.log('🔐 Webhook verification request received');
      console.log(`   Mode: ${mode}`);
      console.log(`   Token: ${token}`);
      console.log(`   Challenge: ${challenge}`);

      // Verify the token
      if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.error('❌ Webhook verification failed');
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Handle webhook events (POST request)
    if (req.method === 'POST') {
      console.log('📥 Webhook event received');

      // Read request body
      let rawBody = req.body;
      let bodyString = '';

      // If body is not already parsed, read it from stream
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
        console.error('❌ Webhook signature verification failed');
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

      // Return success response (Meta expects 200)
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Meta webhook handler error:', error);
    console.error('   Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

