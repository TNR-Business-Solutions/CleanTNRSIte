/**
 * Automated Testing Script
 * Runs complete testing loop automatically
 */

const { spawn, execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let serverProcess = null;

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function killExistingServers() {
  log('\n🔪 Killing existing Node processes...', 'yellow');
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    } else {
      execSync('killall node', { stdio: 'ignore' });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('✅ Existing servers stopped', 'green');
  } catch (error) {
    log('ℹ️  No existing servers to stop', 'yellow');
  }
}

async function disablePostgres() {
  log('\n🔧 Configuring for local testing (SQLite)...', 'cyan');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('POSTGRES_URL=')) {
      envContent = envContent.replace(
        /^POSTGRES_URL=/gm,
        '# POSTGRES_URL='
      );
      fs.writeFileSync(envPath, envContent);
      log('✅ Disabled Postgres (using SQLite for local testing)', 'green');
    }
  }
}

async function startServer() {
  log('\n🚀 Starting server...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'server', 'index.js');
    
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, 'server'),
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('HTTP server listening')) {
        log('✅ Server started successfully!', 'green');
        resolve();
      }
      if (output.includes('Error')) {
        console.log(output);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    serverProcess.on('error', (error) => {
      log(`❌ Server startup error: ${error.message}`, 'red');
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolve(); // Resolve anyway, we'll check if it's actually up
    }, 10000);
  });
}

async function waitForServer(maxAttempts = 10) {
  log('\n⏳ Waiting for server to be ready...', 'yellow');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(BASE_URL, { timeout: 2000 });
      if (response.status === 200) {
        log('✅ Server is responding!', 'green');
        return true;
      }
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  log('❌ Server failed to respond', 'red');
  return false;
}

async function runTests() {
  log('\n📊 Running automated tests...', 'cyan');
  log('=' .repeat(80), 'cyan');
  
  const testScript = path.join(__dirname, 'test-all-integrations.js');
  
  return new Promise((resolve) => {
    const testProcess = spawn('node', [testScript], {
      stdio: 'inherit'
    });

    testProcess.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function displayNextSteps() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🎯 AUTOMATED SETUP COMPLETE', 'cyan');
  log('='.repeat(80), 'cyan');
  
  log('\n📋 Server is running on http://localhost:3000', 'green');
  
  log('\n🔗 Quick Access Links:', 'yellow');
  log('   Admin Dashboard:  http://localhost:3000/admin-dashboard-v2.html');
  log('   Social Dashboard: http://localhost:3000/social-media-automation-dashboard.html');
  log('   Wix Dashboard:    http://localhost:3000/wix-client-dashboard.html');
  
  log('\n✅ Next: Complete OAuth Flows', 'yellow');
  log('   1. Wix:      http://localhost:3000/api/auth/wix');
  log('   2. Facebook: http://localhost:3000/api/auth/meta');
  log('   3. LinkedIn: http://localhost:3000/api/auth/linkedin');
  log('   4. Twitter:  http://localhost:3000/api/auth/twitter');
  
  log('\n🧪 After OAuth, test features:', 'yellow');
  log('   - Post to Facebook/Instagram');
  log('   - Run Wix SEO Audit');
  log('   - Sync Wix E-commerce');
  
  log('\n⌨️  Press Ctrl+C to stop the server\n', 'yellow');
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🤖 AUTOMATED INTEGRATION TESTING', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    // Step 1: Clean up
    await killExistingServers();
    
    // Step 2: Configure for local testing
    await disablePostgres();
    
    // Step 3: Start server
    await startServer();
    
    // Step 4: Wait for server
    const serverReady = await waitForServer();
    
    if (!serverReady) {
      log('\n❌ Server failed to start. Check for errors above.', 'red');
      process.exit(1);
    }
    
    // Step 5: Run tests
    await runTests();
    
    // Step 6: Display next steps
    await displayNextSteps();
    
    // Keep process running
    process.on('SIGINT', () => {
      log('\n\n🛑 Shutting down...', 'yellow');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(0);
    });
    
    // Keep alive
    await new Promise(() => {});
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

