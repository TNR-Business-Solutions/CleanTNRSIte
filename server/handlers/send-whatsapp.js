/**
 * Send WhatsApp Message - Vercel Serverless Function
 * Sends messages via WhatsApp Business API
 */

const axios = require('axios');

// WhatsApp API Configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '834327523105302';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Send text message
 */
async function sendTextMessage(to, text) {
  try {
    console.log(`📤 Sending text message to ${to}`);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: text
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Message sent successfully');
    console.log(`   Message ID: ${response.data.messages[0].id}`);

    return {
      success: true,
      message_id: response.data.messages[0].id,
      wa_id: response.data.contacts[0].wa_id
    };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send template message
 */
async function sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
  try {
    console.log(`📤 Sending template message to ${to}`);
    console.log(`   Template: ${templateName} (${languageCode})`);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Template message sent successfully');
    console.log(`   Message ID: ${response.data.messages[0].id}`);

    return {
      success: true,
      message_id: response.data.messages[0].id,
      wa_id: response.data.contacts[0].wa_id
    };
  } catch (error) {
    console.error('❌ Error sending template message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send image message
 */
async function sendImageMessage(to, imageUrl, caption = '') {
  try {
    console.log(`📤 Sending image message to ${to}`);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'image',
        image: {
          link: imageUrl,
          caption: caption
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Image message sent successfully');

    return {
      success: true,
      message_id: response.data.messages[0].id,
      wa_id: response.data.contacts[0].wa_id
    };
  } catch (error) {
    console.error('❌ Error sending image message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Mark message as read
 */
async function markAsRead(messageId) {
  try {
    console.log(`✅ Marking message ${messageId} as read`);

    await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return { success: true };
  } catch (error) {
    console.error('❌ Error marking message as read:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send WhatsApp message handler
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
    const { to, type, text, templateName, languageCode, components, imageUrl, caption, messageId } = req.body;

    // Validate access token
    if (!WHATSAPP_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Missing configuration',
        message: 'WhatsApp access token not configured'
      });
    }

    // Validate recipient
    if (!to && type !== 'markAsRead') {
      return res.status(400).json({
        success: false,
        error: 'Missing recipient',
        message: 'Recipient phone number is required'
      });
    }

    // Handle different message types
    let result;

    switch (type) {
      case 'text':
        if (!text) {
          return res.status(400).json({
            success: false,
            error: 'Missing text',
            message: 'Text content is required'
          });
        }
        result = await sendTextMessage(to, text);
        break;

      case 'template':
        if (!templateName) {
          return res.status(400).json({
            success: false,
            error: 'Missing template name',
            message: 'Template name is required'
          });
        }
        result = await sendTemplateMessage(to, templateName, languageCode, components);
        break;

      case 'image':
        if (!imageUrl) {
          return res.status(400).json({
            success: false,
            error: 'Missing image URL',
            message: 'Image URL is required'
          });
        }
        result = await sendImageMessage(to, imageUrl, caption);
        break;

      case 'markAsRead':
        if (!messageId) {
          return res.status(400).json({
            success: false,
            error: 'Missing message ID',
            message: 'Message ID is required'
          });
        }
        result = await markAsRead(messageId);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid message type',
          message: `Message type must be one of: text, template, image, markAsRead`
        });
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      ...result
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);

    // Handle specific API errors
    if (error.response?.data) {
      const apiError = error.response.data.error;
      return res.status(error.response.status || 500).json({
        success: false,
        error: apiError?.message || 'Failed to send WhatsApp message',
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

