/**
 * Wix SEO Keywords Suggestions Extension Endpoint
 * Handles requests from Wix for keyword suggestions
 * 
 * Wix will call this endpoint with:
 * GET /api/wix/seo-keywords?instanceId=xxx&pageId=xxx&countryCode=US
 */

const keywordsModule = require('../../server/handlers/wix-seo-keywords');
const { getToken } = require('../../server/handlers/wix-token-manager');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get instance ID from query or body
    const instanceId = req.query.instanceId || req.body.instanceId;
    
    if (!instanceId) {
      return res.status(400).json({
        error: 'Missing instanceId parameter'
      });
    }

    // Verify token exists
    const token = await getToken(instanceId);
    if (!token) {
      return res.status(401).json({
        error: 'Invalid instance ID. Please reconnect your Wix site.'
      });
    }

    // Get quota info
    const quotaInfo = await keywordsModule.getQuotaInfo(instanceId);
    
    // Check if quota is exceeded
    if (quotaInfo.quotaEnabled && quotaInfo.quota.remaining <= 0) {
      return res.status(403).json({
        error: 'Quota exceeded',
        quota: quotaInfo.quota,
        upgradeUrl: 'https://www.tnrbusinesssolutions.com/packages.html'
      });
    }

    // Get keyword suggestions
    const params = {
      pageId: req.query.pageId || req.body.pageId,
      pageTitle: req.query.pageTitle || req.body.pageTitle,
      pageContent: req.body.pageContent,
      countryCode: req.query.countryCode || req.body.countryCode || 'US',
      language: req.query.language || req.body.language || 'en',
      maxResults: parseInt(req.query.maxResults || req.body.maxResults || 10)
    };

    const suggestions = await keywordsModule.getKeywordSuggestions(instanceId, params);
    
    // Update quota usage
    await keywordsModule.updateQuotaUsage(instanceId, 1);

    // Return response with quota info
    return res.json({
      keywords: suggestions.keywords,
      quota: quotaInfo.quota,
      metadata: suggestions.metadata
    });

  } catch (error) {
    console.error('❌ Error in SEO keywords endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

