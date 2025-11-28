// Unit tests for CORS utilities

const { getAllowedOrigin, setCorsHeaders, handleCorsPreflight } = require('../../server/handlers/cors-utils');
const { createMockRequest, createMockResponse } = require('../utils/test-helpers');

describe('CORS Utils', () => {
  describe('getAllowedOrigin', () => {
    test('should allow production domain', () => {
      const origin = getAllowedOrigin('https://www.tnrbusinesssolutions.com');
      expect(origin).toBe('https://www.tnrbusinesssolutions.com');
    });

    test('should allow localhost in development', () => {
      process.env.NODE_ENV = 'development';
      const origin = getAllowedOrigin('http://localhost:5000');
      expect(origin).toBe('http://localhost:5000');
    });

    test('should reject unauthorized origin', () => {
      const origin = getAllowedOrigin('https://malicious-site.com');
      expect(origin).toBeNull();
    });

    test('should handle null origin', () => {
      const origin = getAllowedOrigin(null);
      expect(origin).toBeNull();
    });
  });

  describe('setCorsHeaders', () => {
    test('should set CORS headers for allowed origin', () => {
      const res = createMockResponse();
      setCorsHeaders(res, 'https://www.tnrbusinesssolutions.com');
      
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://www.tnrbusinesssolutions.com'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS, PATCH'
      );
    });

    test('should not set origin header for unauthorized origin', () => {
      const res = createMockResponse();
      setCorsHeaders(res, 'https://malicious-site.com');
      
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        'https://malicious-site.com'
      );
    });
  });

  describe('handleCorsPreflight', () => {
    test('should handle OPTIONS request', () => {
      const req = createMockRequest({ method: 'OPTIONS' });
      const res = createMockResponse();
      
      const handled = handleCorsPreflight(req, res);
      
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalled();
    });

    test('should not handle non-OPTIONS request', () => {
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();
      
      const handled = handleCorsPreflight(req, res);
      
      expect(handled).toBe(false);
    });
  });
});

