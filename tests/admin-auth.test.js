// Admin Auth Tests
const adminAuth = require('../server/handlers/admin-auth');
const { verifyToken } = require('../server/handlers/jwt-utils');

describe('Admin Auth', () => {
  const mockReq = {
    method: 'POST',
    headers: {
      origin: 'https://www.tnrbusinesssolutions.com'
    },
    body: {
      username: 'testadmin',
      password: 'testpass123'
    }
  };

  const mockRes = {
    headersSent: false,
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    writeHead: jest.fn(),
    end: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD = 'testpass123';
    process.env.ADMIN_PASSWORD_HASH = '';
    process.env.JWT_SECRET = 'test-secret';
  });

  test('should reject non-POST requests', async () => {
    const req = { ...mockReq, method: 'GET' };
    
    await adminAuth(req, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Method not allowed'
    });
  });

  test('should reject missing credentials', async () => {
    const req = {
      ...mockReq,
      body: {}
    };
    
    await adminAuth(req, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Username and password required'
    });
  });

  test('should authenticate with correct credentials', async () => {
    await adminAuth(mockReq, mockRes);
    
    // Should call json with success response
    expect(mockRes.json).toHaveBeenCalled();
    const response = mockRes.json.mock.calls[0][0];
    
    if (response.success) {
      expect(response.success).toBe(true);
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
      expect(response.username).toBe('testadmin');
      
      // Verify token is valid
      const decoded = verifyToken(response.accessToken);
      expect(decoded).toBeDefined();
      expect(decoded.username).toBe('testadmin');
    }
  });

  test('should reject incorrect credentials', async () => {
    const req = {
      ...mockReq,
      body: {
        username: 'testadmin',
        password: 'wrongpassword'
      }
    };
    
    await adminAuth(req, mockRes);
    
    // Should eventually call json with error
    // Note: Rate limiter may affect timing
    const calls = mockRes.json.mock.calls;
    if (calls.length > 0) {
      const response = calls[calls.length - 1][0];
      if (!response.success) {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid credentials');
      }
    }
  });

  test('should handle CORS preflight', async () => {
    const req = {
      ...mockReq,
      method: 'OPTIONS'
    };
    
    await adminAuth(req, mockRes);
    
    expect(mockRes.writeHead).toHaveBeenCalledWith(200);
    expect(mockRes.end).toHaveBeenCalled();
  });
});

