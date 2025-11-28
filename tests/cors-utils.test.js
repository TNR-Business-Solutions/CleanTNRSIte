// CORS Utils Tests
const { getAllowedOrigin, setCorsHeaders, handleCorsPreflight } = require('../server/handlers/cors-utils');

describe('CORS Utils', () => {
  describe('getAllowedOrigin', () => {
    test('should allow production domain', () => {
      const origin = 'https://www.tnrbusinesssolutions.com';
      expect(getAllowedOrigin(origin)).toBe(origin);
    });

    test('should allow localhost in development', () => {
      process.env.NODE_ENV = 'development';
      const origin = 'http://localhost:5000';
      expect(getAllowedOrigin(origin)).toBe(origin);
    });

    test('should reject unauthorized origin', () => {
      process.env.NODE_ENV = 'production';
      const origin = 'https://malicious-site.com';
      expect(getAllowedOrigin(origin)).toBeNull();
    });

    test('should handle null origin', () => {
      expect(getAllowedOrigin(null)).toBeNull();
    });
  });

  describe('setCorsHeaders', () => {
    test('should set CORS headers for allowed origin', () => {
      const res = {
        headersSent: false,
        setHeader: jest.fn()
      };
      const origin = 'https://www.tnrbusinesssolutions.com';
      
      setCorsHeaders(res, origin);
      
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', origin);
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });

    test('should not set headers if already sent', () => {
      const res = {
        headersSent: true,
        setHeader: jest.fn()
      };
      
      setCorsHeaders(res, 'https://www.tnrbusinesssolutions.com');
      
      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });

  describe('handleCorsPreflight', () => {
    test('should handle OPTIONS request', () => {
      const req = { method: 'OPTIONS' };
      const res = {
        headersSent: false,
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        end: jest.fn()
      };
      
      const result = handleCorsPreflight(req, res);
      
      expect(result).toBe(true);
      expect(res.writeHead).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    test('should return false for non-OPTIONS request', () => {
      const req = { method: 'POST' };
      const res = {
        headersSent: false,
        setHeader: jest.fn()
      };
      
      const result = handleCorsPreflight(req, res);
      
      expect(result).toBe(false);
    });
  });
});

