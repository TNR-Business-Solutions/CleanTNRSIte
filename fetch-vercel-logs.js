/**
 * Fetch and analyze Vercel logs for debugging
 */

const https = require('https');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'tnr-business-solutions';

if (!VERCEL_TOKEN) {
  console.log('⚠️ VERCEL_TOKEN not set. Set it to fetch logs.');
  console.log('Get token from: https://vercel.com/account/tokens');
  process.exit(1);
}

// Fetch recent deployments
function fetchDeployments() {
  return new Promise((resolve, reject) => {
    const url = `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=5`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const deployments = JSON.parse(data);
          resolve(deployments.deployments || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Fetch logs for a deployment
function fetchLogs(deploymentId) {
  return new Promise((resolve, reject) => {
    const url = `https://api.vercel.com/v2/deployments/${deploymentId}/events?limit=100`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const logs = JSON.parse(data);
          resolve(logs);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching recent deployments...');
  const deployments = await fetchDeployments();
  
  if (deployments.length === 0) {
    console.log('No deployments found');
    return;
  }
  
  console.log(`Found ${deployments.length} recent deployments`);
  
  // Get logs for most recent deployment
  const latest = deployments[0];
  console.log(`\nFetching logs for deployment: ${latest.uid}`);
  console.log(`Created: ${new Date(latest.createdAt).toISOString()}`);
  
  const logs = await fetchLogs(latest.uid);
  
  // Filter for errors
  const errors = logs.filter(log => 
    log.type === 'stderr' || 
    (log.payload && (
      log.payload.includes('Error') ||
      log.payload.includes('DELETE') ||
      log.payload.includes('clientId')
    ))
  );
  
  console.log(`\nFound ${errors.length} relevant log entries:`);
  errors.slice(0, 20).forEach(log => {
    console.log(`\n[${log.type}] ${log.payload}`);
  });
}

main().catch(console.error);

