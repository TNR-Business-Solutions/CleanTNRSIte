// Integration tests for admin authentication

const adminAuth = require('../../server/handlers/admin-auth');
const { createMockRequest, createMockResponse, getResponseBody } = require('../utils/test-helpers');
const { verifyToken } = require('../../server/handlers/jwt-utils');

describe('Admin Authentication Integration', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest({
      method: 'POST',
      body: {
        username: process.env.ADMIN_USERNAME || 'testadmin',
        password: process.env.ADMIN_PASSWORD || 'testpass123'
      }
    });
    res = createMockResponse();
  });

  test('should authenticate valid credentials', async () => {
    await adminAuth(req, res);

    expect(res.statusCode).toBe(200);
    const body = getResponseBody(res);
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body).toHaveProperty('expiresIn');
  });

  test('should return JWT tokens on successful auth', async () => {
    await adminAuth(req, res);

    const body = getResponseBody(res);
    const accessToken = body.accessToken;
    const decoded = verifyToken(accessToken);
    
    expect(decoded).toBeDefined();
    expect(decoded.username).toBe(req.body.username);
    expect(decoded.role).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    req.body.password = 'wrongpassword';
    await adminAuth(req, res);

    expect(res.statusCode).toBe(401);
    const body = getResponseBody(res);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid credentials');
  });

  test('should reject missing username', async () => {
    req.body.username = '';
    await adminAuth(req, res);

    expect(res.statusCode).toBe(400);
    const body = getResponseBody(res);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Username and password required');
  });

  test('should reject missing password', async () => {
    req.body.password = '';
    await adminAuth(req, res);

    expect(res.statusCode).toBe(400);
    const body = getResponseBody(res);
    expect(body.success).toBe(false);
  });

  test('should handle OPTIONS preflight', async () => {
    req.method = 'OPTIONS';
    await adminAuth(req, res);

    expect(res.statusCode).toBe(200);
  });

  test('should reject non-POST methods', async () => {
    req.method = 'GET';
    await adminAuth(req, res);

    expect(res.statusCode).toBe(405);
    const body = getResponseBody(res);
    expect(body.error).toBe('Method not allowed');
  });
});

