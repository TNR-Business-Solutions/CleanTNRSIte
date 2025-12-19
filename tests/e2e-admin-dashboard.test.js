/**
 * End-to-End Tests for TNR Admin Dashboard V2
 * Tests complete user flows using Puppeteer
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let browser;
let page;

describe('Admin Dashboard E2E Tests', () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Authentication Flow', () => {
    test('should load admin login page', async () => {
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      
      const title = await page.title();
      expect(title).toContain('Admin Login');
      
      // Check for login form elements
      const usernameInput = await page.$('#username');
      const passwordInput = await page.$('#password');
      const loginButton = await page.$('button[type="submit"]');
      
      expect(usernameInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(loginButton).toBeTruthy();
    }, 30000);

    test('should reject invalid credentials', async () => {
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      
      await page.type('#username', 'wronguser');
      await page.type('#password', 'wrongpass');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      const errorMessage = await page.$eval('.error-message, .alert-danger', el => el.textContent).catch(() => null);
      expect(errorMessage).toBeTruthy();
    }, 30000);

    test('should successfully login with valid credentials', async () => {
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      
      await page.type('#username', ADMIN_USERNAME);
      await page.type('#password', ADMIN_PASSWORD);
      
      // Click login and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('button[type="submit"]')
      ]);
      
      // Should be redirected to dashboard
      const url = page.url();
      expect(url).toContain('admin-dashboard');
      
      // Check for session token in localStorage
      const sessionToken = await page.evaluate(() => localStorage.getItem('adminSession'));
      expect(sessionToken).toBeTruthy();
    }, 30000);
  });

  describe('Dashboard Features', () => {
    beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      await page.type('#username', ADMIN_USERNAME);
      await page.type('#password', ADMIN_PASSWORD);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('button[type="submit"]')
      ]);
    });

    test('should load dashboard with stats', async () => {
      // Wait for dashboard to load
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      
      // Check for stat cards
      const statsCards = await page.$$('.stat-card, .dashboard-stat');
      expect(statsCards.length).toBeGreaterThan(0);
    }, 30000);

    test('should display platforms connected', async () => {
      await page.waitForSelector('.platform-card, .platforms-grid', { timeout: 10000 });
      
      const platforms = await page.$$('.platform-card');
      expect(platforms.length).toBeGreaterThan(0);
    }, 30000);

    test('should load activity log', async () => {
      // Wait for activity log section
      await page.waitForSelector('#activityLog, .activity-log', { timeout: 10000 });
      
      const activityLogVisible = await page.$eval('#activityLog, .activity-log', el => 
        el.offsetHeight > 0
      ).catch(() => false);
      
      expect(activityLogVisible).toBe(true);
    }, 30000);

    test('should handle logout', async () => {
      // Find and click logout button
      const logoutButton = await page.$('#logoutBtn, button:contains("Logout")');
      
      if (logoutButton) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Should clear session
        const sessionToken = await page.evaluate(() => localStorage.getItem('adminSession'));
        expect(sessionToken).toBeFalsy();
      }
    }, 30000);
  });

  describe('API Integration', () => {
    beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      await page.type('#username', ADMIN_USERNAME);
      await page.type('#password', ADMIN_PASSWORD);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('button[type="submit"]')
      ]);
    });

    test('should make authenticated API calls', async () => {
      // Intercept API requests
      const apiRequests = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push({
            url: request.url(),
            headers: request.headers()
          });
        }
      });
      
      // Trigger an API call by waiting for dashboard to load
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Check that API requests include Authorization header
      const authenticatedRequests = apiRequests.filter(req => 
        req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      );
      
      expect(authenticatedRequests.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should redirect to login if not authenticated', async () => {
      // Clear any existing session
      await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access dashboard directly
      await page.goto(`${BASE_URL}/admin-dashboard-v2.html`, { waitUntil: 'networkidle0' });
      
      // Should be redirected to login
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toContain('login');
    }, 30000);

    test('should handle network errors gracefully', async () => {
      // Login first
      await page.goto(`${BASE_URL}/admin-login.html`, { waitUntil: 'networkidle0' });
      await page.type('#username', ADMIN_USERNAME);
      await page.type('#password', ADMIN_PASSWORD);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('button[type="submit"]')
      ]);
      
      // Block API requests to simulate network failure
      await page.setOfflineMode(true);
      
      // Wait a bit
      await page.waitForTimeout(2000);
      
      // Dashboard should still be visible, not crash
      const dashboardVisible = await page.$('.dashboard-container').then(el => !!el);
      expect(dashboardVisible).toBe(true);
      
      await page.setOfflineMode(false);
    }, 30000);
  });
});

