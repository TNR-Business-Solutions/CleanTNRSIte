/**
 * Wix Admin Dashboard Comprehensive Test Suite
 * Tests all functionality of the admin dashboard and Wix integrations
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_CLIENT_ID = process.env.TEST_CLIENT_ID || 'shesallthatandmore';

// Test Results
const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    startTime: Date.now()
};

// Helper Functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = protocol.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Test Functions
async function testDashboardAccessibility() {
    log('Testing Dashboard Accessibility...');
    try {
        const response = await makeRequest(`${BASE_URL}/wix-client-dashboard.html`);
        if (response.status === 200) {
            testResults.passed.push('Dashboard Accessibility');
            log('Dashboard is accessible', 'success');
            return true;
        } else {
            testResults.failed.push('Dashboard Accessibility');
            log(`Dashboard returned status ${response.status}`, 'error');
            return false;
        }
    } catch (error) {
        testResults.failed.push('Dashboard Accessibility');
        log(`Dashboard accessibility test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testClientListAPI() {
    log('Testing Client List API...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/wix?action=listClients`);
        if (response.status === 200 && response.data.success) {
            testResults.passed.push('Client List API');
            log(`Found ${response.data.clients?.length || 0} clients`, 'success');
            return true;
        } else {
            testResults.failed.push('Client List API');
            log('Client list API failed', 'error');
            return false;
        }
    } catch (error) {
        testResults.failed.push('Client List API');
        log(`Client list API test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testSEOEndpoints(instanceId) {
    log('Testing SEO Endpoints...');
    const seoTests = [
        { action: 'getSiteSEO', name: 'Get Site SEO' },
        { action: 'auditSiteSEO', name: 'Audit Site SEO' },
        { action: 'getSitemapData', name: 'Get Sitemap Data' }
    ];

    let passed = 0;
    for (const test of seoTests) {
        try {
            const response = await makeRequest(`${BASE_URL}/api/wix?action=${test.action}&instanceId=${instanceId}`);
            if (response.status === 200) {
                testResults.passed.push(`SEO: ${test.name}`);
                log(`${test.name} - Success`, 'success');
                passed++;
            } else {
                testResults.failed.push(`SEO: ${test.name}`);
                log(`${test.name} - Failed (Status: ${response.status})`, 'error');
            }
        } catch (error) {
            testResults.failed.push(`SEO: ${test.name}`);
            log(`${test.name} - Error: ${error.message}`, 'error');
        }
    }
    return passed === seoTests.length;
}

async function testEcommerceEndpoints(instanceId) {
    log('Testing E-commerce Endpoints...');
    const ecommerceTests = [
        { action: 'getProducts', name: 'Get Products' },
        { action: 'getCollections', name: 'Get Collections' }
    ];

    let passed = 0;
    for (const test of ecommerceTests) {
        try {
            const response = await makeRequest(`${BASE_URL}/api/wix?action=${test.action}&instanceId=${instanceId}`);
            if (response.status === 200) {
                testResults.passed.push(`E-commerce: ${test.name}`);
                log(`${test.name} - Success`, 'success');
                passed++;
            } else {
                testResults.failed.push(`E-commerce: ${test.name}`);
                log(`${test.name} - Failed (Status: ${response.status})`, 'error');
            }
        } catch (error) {
            testResults.failed.push(`E-commerce: ${test.name}`);
            log(`${test.name} - Error: ${error.message}`, 'error');
        }
    }
    return passed === ecommerceTests.length;
}

async function testContentEndpoints(instanceId) {
    log('Testing Content Endpoints...');
    const contentTests = [
        { action: 'getPages', name: 'Get Pages' },
        { action: 'getBlogPosts', name: 'Get Blog Posts' }
    ];

    let passed = 0;
    for (const test of contentTests) {
        try {
            const response = await makeRequest(`${BASE_URL}/api/wix?action=${test.action}&instanceId=${instanceId}`);
            if (response.status === 200) {
                testResults.passed.push(`Content: ${test.name}`);
                log(`${test.name} - Success`, 'success');
                passed++;
            } else {
                testResults.warnings.push(`Content: ${test.name}`);
                log(`${test.name} - Warning (may not be implemented)`, 'warning');
            }
        } catch (error) {
            testResults.warnings.push(`Content: ${test.name}`);
            log(`${test.name} - Warning: ${error.message}`, 'warning');
        }
    }
    return true; // Content tests are optional
}

async function testOAuthEndpoints() {
    log('Testing OAuth Endpoints...');
    try {
        // Test OAuth initiation endpoint
        const response = await makeRequest(`${BASE_URL}/api/auth/wix?clientId=${TEST_CLIENT_ID}`);
        // OAuth should redirect, so we check for redirect status or 200
        if (response.status === 200 || response.status === 302 || response.status === 301) {
            testResults.passed.push('OAuth Initiation');
            log('OAuth initiation endpoint working', 'success');
            return true;
        } else {
            testResults.failed.push('OAuth Initiation');
            log(`OAuth initiation returned status ${response.status}`, 'error');
            return false;
        }
    } catch (error) {
        testResults.failed.push('OAuth Initiation');
        log(`OAuth test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testWebhookEndpoint() {
    log('Testing Webhook Endpoint...');
    try {
        // Test webhook endpoint exists (should return method not allowed for GET)
        const response = await makeRequest(`${BASE_URL}/api/wix/webhooks`);
        // Webhook should accept POST, GET might return 405 or handle differently
        if (response.status === 200 || response.status === 405 || response.status === 400) {
            testResults.passed.push('Webhook Endpoint');
            log('Webhook endpoint exists', 'success');
            return true;
        } else {
            testResults.failed.push('Webhook Endpoint');
            log(`Webhook endpoint returned status ${response.status}`, 'error');
            return false;
        }
    } catch (error) {
        testResults.failed.push('Webhook Endpoint');
        log(`Webhook test failed: ${error.message}`, 'error');
        return false;
    }
}

async function testSEOKeywordsExtension(instanceId) {
    log('Testing SEO Keywords Extension...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/wix?action=getQuotaInfo&instanceId=${instanceId}`);
        if (response.status === 200) {
            testResults.passed.push('SEO Keywords Extension');
            log('SEO Keywords Extension working', 'success');
            return true;
        } else {
            testResults.warnings.push('SEO Keywords Extension');
            log('SEO Keywords Extension may not be configured', 'warning');
            return false;
        }
    } catch (error) {
        testResults.warnings.push('SEO Keywords Extension');
        log(`SEO Keywords Extension test: ${error.message}`, 'warning');
        return false;
    }
}

// Main Test Runner
async function runAllTests() {
    log('🚀 Starting Wix Admin Dashboard Test Suite', 'info');
    log(`Base URL: ${BASE_URL}`, 'info');
    log(`Test Client ID: ${TEST_CLIENT_ID}`, 'info');
    console.log('');

    // Phase 1: Basic Accessibility Tests
    log('=== Phase 1: Basic Accessibility ===', 'info');
    await testDashboardAccessibility();
    await testClientListAPI();
    console.log('');

    // Phase 2: API Endpoint Tests
    log('=== Phase 2: API Endpoint Tests ===', 'info');
    await testOAuthEndpoints();
    await testWebhookEndpoint();
    console.log('');

    // Phase 3: Feature-Specific Tests (require instanceId)
    log('=== Phase 3: Feature-Specific Tests ===', 'info');
    log('Note: These tests require a connected client instance', 'warning');
    
    // Try to get a client instance ID
    try {
        const clientsResponse = await makeRequest(`${BASE_URL}/api/wix?action=listClients`);
        if (clientsResponse.data?.clients?.length > 0) {
            const instanceId = clientsResponse.data.clients[0].instanceId;
            log(`Using instance ID: ${instanceId}`, 'info');
            
            await testSEOEndpoints(instanceId);
            await testEcommerceEndpoints(instanceId);
            await testContentEndpoints(instanceId);
            await testSEOKeywordsExtension(instanceId);
        } else {
            log('No connected clients found. Skipping instance-specific tests.', 'warning');
            testResults.warnings.push('No connected clients for testing');
        }
    } catch (error) {
        log(`Could not get client list: ${error.message}`, 'warning');
        testResults.warnings.push('Could not retrieve client list');
    }
    console.log('');

    // Generate Report
    generateReport();
}

function generateReport() {
    const duration = ((Date.now() - testResults.startTime) / 1000).toFixed(2);
    
    console.log('');
    log('=== Test Results Summary ===', 'info');
    console.log('');
    log(`Total Tests: ${testResults.passed.length + testResults.failed.length + testResults.warnings.length}`, 'info');
    log(`✅ Passed: ${testResults.passed.length}`, 'success');
    log(`❌ Failed: ${testResults.failed.length}`, testResults.failed.length > 0 ? 'error' : 'success');
    log(`⚠️  Warnings: ${testResults.warnings.length}`, testResults.warnings.length > 0 ? 'warning' : 'success');
    log(`⏱️  Duration: ${duration}s`, 'info');
    console.log('');

    if (testResults.passed.length > 0) {
        console.log('✅ Passed Tests:');
        testResults.passed.forEach(test => console.log(`   - ${test}`));
        console.log('');
    }

    if (testResults.failed.length > 0) {
        console.log('❌ Failed Tests:');
        testResults.failed.forEach(test => console.log(`   - ${test}`));
        console.log('');
    }

    if (testResults.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        testResults.warnings.forEach(test => console.log(`   - ${test}`));
        console.log('');
    }

    // Overall Status
    if (testResults.failed.length === 0) {
        log('🎉 All critical tests passed!', 'success');
    } else {
        log('⚠️  Some tests failed. Please review and fix issues.', 'warning');
    }

    // Save results to file
    const fs = require('fs');
    const reportData = {
        timestamp: new Date().toISOString(),
        duration: duration,
        results: testResults,
        summary: {
            total: testResults.passed.length + testResults.failed.length + testResults.warnings.length,
            passed: testResults.passed.length,
            failed: testResults.failed.length,
            warnings: testResults.warnings.length
        }
    };

    fs.writeFileSync(
        `wix-dashboard-test-results-${Date.now()}.json`,
        JSON.stringify(reportData, null, 2)
    );
    log(`📄 Test results saved to: wix-dashboard-test-results-${Date.now()}.json`, 'info');
}

// Run tests
if (require.main === module) {
    runAllTests().catch(error => {
        log(`Fatal error: ${error.message}`, 'error');
        process.exit(1);
    });
}

module.exports = { runAllTests, testResults };

