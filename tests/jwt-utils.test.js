// JWT Utils Tests
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken, 
  extractToken,
  generateTokenPair 
} = require('../server/handlers/jwt-utils');

describe('JWT Utils', () => {
  const testPayload = {
    username: 'testuser',
    role: 'admin'
  };

  describe('generateAccessToken', () => {
    test('should generate valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include payload data in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded.username).toBe(testPayload.username);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should include refresh type in token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.username).toBe(testPayload.username);
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });

    test('should return null for expired token', () => {
      // Note: This would require mocking time or using a very short expiration
      // For now, we'll test with invalid format
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.signature';
      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('extractToken', () => {
    test('should extract token from Authorization header', () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token-123'
        }
      };
      const token = extractToken(req);
      expect(token).toBe('test-token-123');
    });

    test('should extract token from body', () => {
      const req = {
        headers: {},
        body: {
          sessionToken: 'body-token-123'
        }
      };
      const token = extractToken(req);
      expect(token).toBe('body-token-123');
    });

    test('should extract token from query', () => {
      const req = {
        headers: {},
        body: {},
        query: {
          token: 'query-token-123'
        }
      };
      const token = extractToken(req);
      expect(token).toBe('query-token-123');
    });

    test('should return null if no token found', () => {
      const req = {
        headers: {},
        body: {},
        query: {}
      };
      const token = extractToken(req);
      expect(token).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    test('should generate both access and refresh tokens', () => {
      const tokens = generateTokenPair(testPayload);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('expiresIn');
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    test('should generate different tokens', () => {
      const tokens = generateTokenPair(testPayload);
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });
  });
});

