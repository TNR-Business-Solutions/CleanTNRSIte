// Email Templates API
// Handles CRUD operations for email templates

const TNRDatabase = require('../../database');
const { parseQuery, parseBody, sendJson } = require('./http-utils');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const db = new TNRDatabase();
  await db.initialize();

  try {
    // GET - List all templates or get specific template
    if (req.method === 'GET') {
      const query = parseQuery(req);
      const templateId = query.templateId;
      const category = query.category;

      if (templateId) {
        const template = await db.getEmailTemplate(templateId);
        if (!template) {
          sendJson(res, 404, {
            success: false,
            error: 'Template not found'
          });
          return;
        }
        sendJson(res, 200, {
          success: true,
          template: template
        });
        return;
      }

      const templates = await db.getEmailTemplates(category || null);

      sendJson(res, 200, {
        success: true,
        templates: templates
      });
      return;
    }

    // POST - Create or update template
    if (req.method === 'POST') {
      const templateData = await parseBody(req);

      if (!templateData.templateName || !templateData.subject || !templateData.htmlContent) {
        sendJson(res, 400, {
          success: false,
          error: 'templateName, subject, and htmlContent are required'
        });
        return;
      }

      const template = await db.saveEmailTemplate(templateData);

      sendJson(res, 200, {
        success: true,
        template: template,
        message: templateData.id ? 'Template updated successfully' : 'Template created successfully'
      });
      return;
    }

    // DELETE - Remove template
    if (req.method === 'DELETE') {
      const query = parseQuery(req);
      const { templateId } = query;

      if (!templateId) {
        sendJson(res, 400, {
          success: false,
          error: 'templateId is required'
        });
        return;
      }

      await db.deleteEmailTemplate(templateId);

      sendJson(res, 200, {
        success: true,
        message: 'Template deleted successfully'
      });
      return;
    }

    sendJson(res, 405, {
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Email Templates API error:', error);
    sendJson(res, 500, {
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

