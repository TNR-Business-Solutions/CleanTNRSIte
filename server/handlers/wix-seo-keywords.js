/**
 * Wix SEO Keywords Suggestions Extension Handler
 * Provides keyword suggestions for Wix sites
 */

/**
 * Get keyword suggestions based on page content and context
 */
async function getKeywordSuggestions(instanceId, params) {
  try {
    const { 
      pageId, 
      pageTitle, 
      pageContent, 
      countryCode = 'US',
      language = 'en',
      maxResults = 10 
    } = params;

    console.log('🔍 Getting keyword suggestions:', {
      instanceId,
      pageId,
      countryCode,
      maxResults
    });

    // Get page content if pageId is provided
    let content = pageContent || '';
    let title = pageTitle || '';

    if (pageId && !content) {
      try {
        const { createWixClient } = require('./wix-api-client');
        const client = createWixClient(instanceId);
        const pageData = await client.get(`/v1/pages/${pageId}`);
        title = pageData.title || title;
        content = pageData.content || content;
      } catch (error) {
        console.warn('⚠️ Could not fetch page data:', error.message);
      }
    }

    // Generate keyword suggestions based on content
    const suggestions = generateKeywordSuggestions(title, content, countryCode, maxResults);

    return {
      success: true,
      keywords: suggestions,
      metadata: {
        pageId: pageId || null,
        countryCode,
        language,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error getting keyword suggestions:', error);
    throw error;
  }
}

/**
 * Generate keyword suggestions from content
 */
function generateKeywordSuggestions(title, content, countryCode, maxResults) {
  const suggestions = [];

  // Extract keywords from title
  if (title) {
    const titleWords = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    titleWords.forEach(word => {
      if (!suggestions.find(s => s.keyword === word)) {
        suggestions.push({
          keyword: word,
          searchVolume: Math.floor(Math.random() * 1000) + 100,
          competition: 'medium',
          relevance: 'high',
          source: 'title'
        });
      }
    });
  }

  // Extract keywords from content
  if (content) {
    const contentWords = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    // Get top words by frequency
    const topWords = Object.entries(contentWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults * 2)
      .map(([word, count]) => ({
        keyword: word,
        searchVolume: Math.floor(count * 50),
        competition: count > 5 ? 'high' : 'low',
        relevance: 'medium',
        source: 'content',
        frequency: count
      }));

    topWords.forEach(word => {
      if (!suggestions.find(s => s.keyword === word.keyword)) {
        suggestions.push(word);
      }
    });
  }

  // Add location-based keywords for US
  if (countryCode === 'US') {
    suggestions.push({
      keyword: 'local business',
      searchVolume: 500,
      competition: 'medium',
      relevance: 'high',
      source: 'location'
    });
  }

  // Sort by relevance and search volume
  suggestions.sort((a, b) => {
    const relevanceScore = { high: 3, medium: 2, low: 1 };
    const aScore = relevanceScore[a.relevance] * a.searchVolume;
    const bScore = relevanceScore[b.relevance] * b.searchVolume;
    return bScore - aScore;
  });

  return suggestions.slice(0, maxResults);
}

/**
 * Get quota information for a site
 */
async function getQuotaInfo(instanceId) {
  try {
    // Check if site has paid plan
    // In a real implementation, check database for subscription status
    const { getToken } = require('./wix-token-manager');
    const token = await getToken(instanceId);
    
    const hasPaidPlan = token?.metadata?.hasPaidPlan || false;
    const quotaUsed = token?.metadata?.quotaUsed || 0;
    const quotaLimit = hasPaidPlan ? 10000 : 100; // Free: 100, Paid: 10,000

    return {
      quotaEnabled: true,
      quota: {
        used: quotaUsed,
        limit: quotaLimit,
        remaining: Math.max(0, quotaLimit - quotaUsed),
        paidPlan: hasPaidPlan
      }
    };
  } catch (error) {
    console.error('❌ Error getting quota info:', error);
    return {
      quotaEnabled: false,
      quota: {
        used: 0,
        limit: 0,
        remaining: 0,
        paidPlan: false
      }
    };
  }
}

/**
 * Update quota usage
 */
async function updateQuotaUsage(instanceId, amount = 1) {
  try {
    const { getToken, saveToken } = require('./wix-token-manager');
    const token = await getToken(instanceId);
    
    if (token) {
      const quotaUsed = (token.metadata?.quotaUsed || 0) + amount;
      token.metadata = {
        ...token.metadata,
        quotaUsed,
        lastQuotaUpdate: new Date().toISOString()
      };
      
      await saveToken(token);
      console.log(`✅ Updated quota for ${instanceId}: ${quotaUsed}`);
    }
  } catch (error) {
    console.error('❌ Error updating quota:', error);
  }
}

module.exports = {
  getKeywordSuggestions,
  getQuotaInfo,
  updateQuotaUsage
};

