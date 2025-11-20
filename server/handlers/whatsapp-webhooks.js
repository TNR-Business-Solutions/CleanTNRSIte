/**
 * WhatsApp Business API Webhooks Handler
 * Handles webhook events from WhatsApp Business API
 */

const crypto = require('crypto');

// WhatsApp Configuration
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'tnr_whatsapp_verify_2024';
const META_APP_SECRET = process.env.META_APP_SECRET || '8bb683dbc591772f9fe6dada7e2d792b';

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(req, body) {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    console.warn('⚠️  No signature provided in WhatsApp webhook request');
    return false;
  }

  try {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', META_APP_SECRET)
      .update(body)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error('❌ WhatsApp webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error.message);
    return false;
  }
}

/**
 * Process WhatsApp webhook event
 */
async function processWebhookEvent(event) {
  const { object, entry } = event;

  console.log(`📥 WhatsApp webhook received: ${object}`);

  try {
    for (const item of entry || []) {
      const { id, changes } = item;

      for (const change of changes || []) {
        const { field, value } = change;

        if (field === 'messages') {
          await handleMessageEvent(value);
        } else if (field === 'message_template_status_update') {
          await handleTemplateStatusUpdate(value);
        } else {
          console.log(`⚠️  Unknown WhatsApp field: ${field}`);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook event:', error);
    throw error;
  }
}

/**
 * Handle incoming message events
 */
async function handleMessageEvent(value) {
  const { messaging_product, metadata, contacts, messages, statuses } = value;

  console.log(`💬 WhatsApp message event for business account: ${metadata?.phone_number_id}`);

  // Handle incoming messages
  if (messages && messages.length > 0) {
    for (const message of messages) {
      await handleIncomingMessage(message, metadata, contacts);
    }
  }

  // Handle message status updates (sent, delivered, read, failed)
  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      await handleMessageStatus(status, metadata);
    }
  }
}

/**
 * Handle incoming message
 */
async function handleIncomingMessage(message, metadata, contacts) {
  const { from, id, timestamp, type, text, image, video, document, audio, location, contacts: messageContacts } = message;

  // Get contact info
  const contact = contacts?.[0];
  const contactName = contact?.profile?.name || from;

  console.log(`📨 Message from ${contactName} (${from})`);
  console.log(`   Type: ${type}`);
  console.log(`   ID: ${id}`);

  // Handle different message types
  switch (type) {
    case 'text':
      console.log(`   Text: ${text?.body}`);
      // TODO: Process text message
      // TODO: Send auto-reply if needed
      break;

    case 'image':
      console.log(`   Image ID: ${image?.id}`);
      console.log(`   Caption: ${image?.caption || '(no caption)'}`);
      // TODO: Download and process image
      break;

    case 'video':
      console.log(`   Video ID: ${video?.id}`);
      // TODO: Download and process video
      break;

    case 'document':
      console.log(`   Document: ${document?.filename}`);
      // TODO: Download and process document
      break;

    case 'audio':
      console.log(`   Audio ID: ${audio?.id}`);
      // TODO: Download and process audio
      break;

    case 'location':
      console.log(`   Location: ${location?.latitude}, ${location?.longitude}`);
      // TODO: Process location
      break;

    case 'contacts':
      console.log(`   Contacts: ${messageContacts?.length} contact(s)`);
      // TODO: Process contacts
      break;

    default:
      console.log(`   Unknown message type: ${type}`);
  }

  // TODO: Save message to database
  // TODO: Trigger workflows/automations
  // TODO: Send notification to admin
}

/**
 * Handle message status updates
 */
async function handleMessageStatus(status, metadata) {
  const { id, status: messageStatus, timestamp, recipient_id, conversation, pricing } = status;

  console.log(`📊 Message status update: ${id} → ${messageStatus}`);
  console.log(`   Recipient: ${recipient_id}`);
  console.log(`   Timestamp: ${new Date(parseInt(timestamp) * 1000).toISOString()}`);

  if (conversation) {
    console.log(`   Conversation: ${conversation.id} (${conversation.origin?.type})`);
  }

  if (pricing) {
    console.log(`   Pricing: ${pricing.pricing_model} - ${pricing.category}`);
  }

  // Update message status in database
  // TODO: Update message delivery status
}

/**
 * Handle template status updates
 */
async function handleTemplateStatusUpdate(value) {
  const { message_template_id, message_template_name, message_template_language, event } = value;

  console.log(`📋 Template status update: ${message_template_name} (${message_template_language})`);
  console.log(`   Event: ${event}`);
  console.log(`   Template ID: ${message_template_id}`);

  // TODO: Update template status in database
}

/**
 * WhatsApp Webhook endpoint handler
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

      console.log('🔐 WhatsApp webhook verification request received');
      console.log(`   Mode: ${mode}`);
      console.log(`   Token: ${token}`);

      // Verify the token
      if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ WhatsApp webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.error('❌ WhatsApp webhook verification failed');
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Handle webhook events (POST request)
    if (req.method === 'POST') {
      console.log('📥 WhatsApp webhook event received');

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
        console.error('❌ WhatsApp webhook signature verification failed');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      console.log('✅ Webhook signature verified');

      // Process webhook event
      await processWebhookEvent(rawBody);

      // Return success response (WhatsApp expects 200)
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ WhatsApp webhook handler error:', error);
    console.error('   Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

