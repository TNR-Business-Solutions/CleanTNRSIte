/**
 * Wix Token Diagnostic Tool
 * Checks what token we have and how Wix API responds
 */

const axios = require('axios');

const INSTANCE_ID = 'a4890371-c6da-46f4-a830-9e19df999cf8';
const BASE_URL = 'https://www.tnrbusinesssolutions.com';

async function diagnoseToken() {
  console.log('🔍 WIX TOKEN DIAGNOSTIC\n');
  
  try {
    // Step 1: Get client details from our API
    console.log('Step 1: Fetching client token from database...');
    const response = await axios.post(`${BASE_URL}/api/wix`, {
      action: 'getClientDetails',
      instanceId: INSTANCE_ID
    });
    
    if (!response.data.success) {
      console.error('❌ Failed to get client details:', response.data.error);
      return;
    }
    
    const client = response.data.client;
    console.log('✅ Client found:');
    console.log(`   Instance ID: ${client.instanceId}`);
    console.log(`   Original Instance ID: ${client.originalInstanceId}`);
    console.log(`   Metadata Metasite ID: ${client.metadataMetasiteId}`);
    console.log(`   Token valid: ${client.hasValidToken}`);
    console.log(`   Expires: ${new Date(client.expiresAt).toLocaleString()}`);
    console.log('');
    
    // Step 2: Try to get the actual token (we can't do this from frontend, but we can check the format)
    console.log('Step 2: Testing Wix API calls...\n');
    
    // Test 1: Try to get site pages
    console.log('Test 1: GET /v1/pages');
    try {
      const pagesResponse = await axios.post(`${BASE_URL}/api/wix`, {
        action: 'getPages',
        instanceId: INSTANCE_ID
      });
      console.log('✅ Pages API works!');
      console.log(`   Response:`, JSON.stringify(pagesResponse.data, null, 2).substring(0, 200));
    } catch (error) {
      console.log('❌ Pages API failed:');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      console.log(`   Status: ${error.response?.status}`);
      if (error.response?.data) {
        console.log(`   Details:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    console.log('');
    
    // Test 2: Try to get products
    console.log('Test 2: GET /stores/v1/products/query');
    try {
      const productsResponse = await axios.post(`${BASE_URL}/api/wix`, {
        action: 'getProducts',
        instanceId: INSTANCE_ID
      });
      console.log('✅ Products API works!');
      console.log(`   Products found: ${productsResponse.data.data?.products?.length || 0}`);
    } catch (error) {
      console.log('❌ Products API failed:');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      console.log(`   Status: ${error.response?.status}`);
    }
    console.log('');
    
    // Test 3: Deep token analysis
    console.log('Test 3: Deep Token Analysis');
    try {
      const testResponse = await axios.post(`${BASE_URL}/api/wix/test-token`, {
        instanceId: INSTANCE_ID
      });
      console.log('✅ Token analysis complete:');
      console.log(`   Token type: ${testResponse.data.tokenType}`);
      console.log(`   Metasite ID: ${testResponse.data.metasiteId}`);
      console.log(`   Site API: ${testResponse.data.siteApiWorks ? '✅ Works' : '❌ Failed'}`);
      if (testResponse.data.storesApiWorks !== undefined) {
        console.log(`   Stores API: ${testResponse.data.storesApiWorks ? '✅ Works' : '❌ Failed'}`);
      }
      if (testResponse.data.diagnosis) {
        console.log('\n   📋 Possible Issues:');
        testResponse.data.diagnosis.possibleIssues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
    } catch (error) {
      console.log('❌ Token analysis failed:');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    console.log('');
    
    // Summary
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`Instance ID: ${INSTANCE_ID}`);
    console.log(`Token status: ${client.hasValidToken ? 'Valid' : 'Expired'}`);
    console.log(`Metasite ID in metadata: ${client.metadataMetasiteId}`);
    console.log('');
    console.log('💡 POSSIBLE ISSUES:');
    console.log('1. Token type mismatch (JWT vs OAuth token)');
    console.log('2. Incorrect metasite ID being used');
    console.log('3. Missing Wix app permissions');
    console.log('4. Token not authorized for REST API');
    console.log('');
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('1. Check Vercel logs for actual Wix API error response');
    console.log('2. Verify Wix app has correct permissions');
    console.log('3. Try reconnecting with fresh OAuth');
    console.log('4. Check if Wix changed their API authentication');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

diagnoseToken();

