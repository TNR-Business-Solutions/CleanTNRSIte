# Automated Test Suite

## Overview
Comprehensive test suite based on Puppeteer Lighthouse Flow recording. Tests all critical user flows and validates functionality.

## Installation
```bash
npm install
```

## Running Tests

### Basic Run
```bash
npm run test:suite
```

### Run in Loop (Until All Pass)
```bash
npm run test:suite:loop
```

Or directly:
```bash
node test-runner-with-logs.js
```

## Environment Variables

- `TEST_URL` - Base URL to test (default: https://www.tnrbusinesssolutions.com)
- `HEADLESS` - Run browser in headless mode (default: true)
- `ADMIN_PASSWORD` - Admin password for login tests (default: TNR2024!)
- `VERCEL_TOKEN` - Vercel API token for log fetching (optional)
- `VERCEL_PROJECT_ID` - Vercel project ID (default: tnr-business-solutions)

## Test Coverage

### Authentication
- ✅ Admin Login
- ✅ Session Management

### CRM APIs
- ✅ GET /api/crm/clients
- ✅ GET /api/crm/leads
- ✅ GET /api/crm/orders
- ✅ GET /api/crm/stats
- ✅ DELETE /api/crm/clients (path-based)
- ✅ DELETE /api/crm/clients?clientId=xxx (query param)
- ✅ DELETE /api/crm/leads (path-based and query param)

### Settings
- ✅ GET /api/settings
- ✅ POST /api/settings

### Social Media
- ✅ GET /api/social/tokens
- ✅ Pinterest OAuth (501 Not Implemented - expected)

### Page Loads
- ✅ Admin Dashboard
- ✅ CRM Page
- ✅ Campaigns Page
- ✅ Analytics Page
- ✅ Settings Page
- ✅ Orders Page
- ✅ Social Media Dashboard
- ✅ Wix Dashboard

## Test Results

Results are saved as JSON files:
- `test-results-iteration-{N}-{timestamp}.json` - Individual iteration results
- `test-summary-{timestamp}.json` - Final summary with all iterations

## Continuous Testing

The test suite runs in a loop until all tests pass (max 10 iterations by default). Each iteration:
1. Runs all tests
2. Analyzes failures
3. Suggests fixes
4. Waits 5 seconds
5. Repeats

## Vercel Logs Integration

To enable Vercel log fetching:
1. Get your Vercel API token from https://vercel.com/account/tokens
2. Set `VERCEL_TOKEN` environment variable
3. Set `VERCEL_PROJECT_ID` if different from default

The test suite will fetch recent deployment logs and analyze them for errors.

## Troubleshooting

### Tests Failing
1. Check test results JSON files for detailed error messages
2. Review Vercel logs if token is configured
3. Check network connectivity to test URL
4. Verify admin credentials are correct

### Puppeteer Issues
- Ensure Chrome/Chromium is installed
- Try running with `HEADLESS=false` to see browser
- Check system resources (memory, CPU)

### API Errors
- Verify all environment variables are set
- Check API endpoints are accessible
- Review server logs for detailed errors

## Next Steps

1. Add more test cases for:
   - Email campaigns
   - Social media posting
   - Wix integration
   - Order management

2. Integrate with CI/CD:
   - GitHub Actions
   - Vercel deployment hooks
   - Automated reporting

3. Performance testing:
   - Load testing
   - Response time validation
   - Resource usage monitoring

