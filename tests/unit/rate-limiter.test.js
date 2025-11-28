// Unit tests for rate limiter

const { rateLimiter, getClientId } = require('../../server/handlers/rate-limiter');
const { createMockRequest, createMockResponse } = require('../utils/test-helpers');

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks();
  });

  describe('getClientId', () => {
    test('should use IP address for unauthenticated requests', () => {
      const req = createMockRequest({
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });
      const clientId = getClientId(req);
      expect(clientId).toContain('ip:');
    });

    test('should use username for authenticated requests', () => {
      const req = createMockRequest({
        user: {
          username: 'testuser'
        }
      });
      const clientId = getClientId(req);
      expect(clientId).toBe('user:testuser');
    });
  });

  describe('rateLimiter', () => {
    test('should allow requests within limit', (done) => {
      const limiter = rateLimiter('api');
      const req = createMockRequest();
      const res = createMockResponse();
      
      let callCount = 0;
      const next = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          expect(res.statusCode).not.toBe(429);
          done();
        }
      });

      limiter(req, res, next);
    });

    test('should set rate limit headers', (done) => {
      const limiter = rateLimiter('api');
      const req = createMockRequest();
      const res = createMockResponse();
      
      const next = jest.fn(() => {
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
        done();
      });

      limiter(req, res, next);
    });
  });
});

