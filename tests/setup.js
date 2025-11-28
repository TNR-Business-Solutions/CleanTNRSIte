// Jest Test Setup
// Configuration for running tests

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ADMIN_USERNAME = 'testadmin';
process.env.ADMIN_PASSWORD = 'testpass123';
process.env.ADMIN_PASSWORD_HASH = '$2b$10$testhashforbcryptverification';
process.env.POSTGRES_URL = ''; // Use SQLite for tests

// Increase timeout for async operations
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

module.exports = {};
