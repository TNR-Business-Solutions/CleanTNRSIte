/**
 * Wix Token Testing Endpoint
 * Tests if the stored token works with Wix APIs
 */

const axios = require('axios');
const { clientTokensDB } = require('./auth-wix-callback');

module.exports = async (req, res) => {
  try {
    const { instanceId } = req.body;
    
    if (!instanceId) {
      return res.status(400).json({ error: 'Missing instanceId' });
    }
    
    console.log(`🔍 Testing token for instance: ${instanceId}`);
    
    // Get client data
    let clientData = clientTokensDB.get(instanceId);
    
    if (!clientData) {
      // Try loading from database
      const tokenManager = require('./wix-token-manager');
      const dbToken = await tokenManager.getToken(instanceId);
      
      if (dbToken) {
        clientData = {
          instanceId: dbToken.instanceId,
          accessToken: dbToken.accessToken,
          refreshToken: dbToken.refreshToken,
          expiresAt: dbToken.expiresAt,
          metadata: dbToken.metadata || {},
        };
        clientTokensDB.set(instanceId, clientData);
      }
    }
    
    if (!clientData) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const token = clientData.accessToken;
    const metasiteId = clientData.metadata?.metasiteId || instanceId;
    
    console.log(`   Token length: ${token.length}`);
    console.log(`   Token preview: ${token.substring(0, 50)}...`);
    console.log(`   Token type: ${token.startsWith('OAUTH2.') ? 'JWT' : token.startsWith('eyJ') ? 'JWT' : 'OAuth'}`);
    console.log(`   Metasite ID: ${metasiteId}`);
    
    // Test 1: Try a simple Wix API call
    console.log(`\n🧪 Test 1: GET /v3/sites/${metasiteId}`);
    
    try {
      const siteResponse = await axios.get(`https://www.wixapis.com/v3/sites/${metasiteId}`, {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'wix-site-id': metasiteId,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Site API works!`);
      console.log(`   Site response:`, JSON.stringify(siteResponse.data, null, 2).substring(0, 300));
      
      return res.json({
        success: true,
        tokenType: token.startsWith('OAUTH2.') ? 'JWT' : 'OAuth',
        metasiteId,
        siteApiWorks: true,
        siteData: siteResponse.data
      });
      
    } catch (error) {
      console.log(`❌ Site API failed`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}`);
      
      // Test 2: Try stores API
      console.log(`\n🧪 Test 2: POST /stores/v1/products/query`);
      
      try {
        const productsResponse = await axios.post(
          'https://www.wixapis.com/stores/v1/products/query',
          { query: {} },
          {
            headers: {
              'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
              'wix-site-id': metasiteId,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Stores API works!`);
        console.log(`   Products found: ${productsResponse.data.products?.length || 0}`);
        
        return res.json({
          success: true,
          tokenType: token.startsWith('OAUTH2.') ? 'JWT' : 'OAuth',
          metasiteId,
          siteApiWorks: false,
          siteApiError: error.response?.data,
          storesApiWorks: true,
          productsCount: productsResponse.data.products?.length || 0
        });
        
      } catch (error2) {
        console.log(`❌ Stores API also failed`);
        console.log(`   Status: ${error2.response?.status}`);
        console.log(`   Error: ${JSON.stringify(error2.response?.data, null, 2)}`);
        
        return res.json({
          success: false,
          tokenType: token.startsWith('OAUTH2.') ? 'JWT' : 'OAuth',
          metasiteId,
          siteApiWorks: false,
          siteApiError: error.response?.data,
          storesApiWorks: false,
          storesApiError: error2.response?.data,
          diagnosis: {
            possibleIssues: [
              'Token type mismatch (JWT instance token vs OAuth access token)',
              'Incorrect metasite ID',
              'Missing app permissions',
              'Token not authorized for REST API'
            ],
            recommendations: [
              'Ensure OAuth flow returns proper access_token',
              'Verify app permissions in Wix Developer dashboard',
              'Check if token exchange is completing correctly',
              'Try reconnecting with fresh OAuth flow'
            ]
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Token test error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

