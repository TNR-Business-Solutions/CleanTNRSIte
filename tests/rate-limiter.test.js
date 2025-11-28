// Rate Limiter Tests
const { rateLimiter, getClientId } = require('../server/handlers/rate-limiter');

describe('Rate Limiter', () => {
  describe('getClientId', () => {
    test('should use IP address when no user', () => {
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      };
      const clientId = getClientId(req);
      expect(clientId).toBe('ip:192.168.1.1');
    });

    test('should use username when authenticated', () => {
      const req = {
        headers: {},
        user: {
          username: 'testuser'
        }
      };
      const clientId = getClientId(req);
      expect(clientId).toBe('user:testuser');
    });

    test('should handle missing IP', () => {
      const req = {
        headers: {},
        connection: {}
      };
      const clientId = getClientId(req);
      expect(clientId).toContain('ip:');
    });
  });

  describe('rateLimiter', () => {
    test('should allow requests within limit', (done) => {
      const limiter = rateLimiter('api');
      let requestCount = 0;
      
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      };
      
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn(() => {
        requestCount++;
        if (requestCount === 5) {
          expect(next).toHaveBeenCalledTimes(5);
          done();
        }
      });
      
      // Make 5 requests (should all pass)
      for (let i = 0; i < 5; i++) {
        limiter(req, res, next);
      }
    });

    test('should block requests exceeding limit', (done) => {
      const limiter = rateLimiter('auth'); // 5 requests per 15 minutes
      let blocked = false;
      
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.2'
        }
      };
      
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          if (data.error === 'Rate limit exceeded') {
            blocked = true;
            expect(res.status).toHaveBeenCalledWith(429);
            done();
          }
        })
      };
      
      const next = jest.fn();
      
      // Make 6 requests (6th should be blocked)
      for (let i = 0; i < 6; i++) {
        limiter(req, res, next);
      }
    });

    test('should set rate limit headers', () => {
      const limiter = rateLimiter('api');
      
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.3'
        }
      };
      
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      limiter(req, res, next);
      
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });
  });
});

