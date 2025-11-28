// Test helper utilities

/**
 * Create a mock request object
 */
function createMockRequest(options = {}) {
  const {
    method = 'GET',
    url = '/api/test',
    body = {},
    headers = {},
    query = {}
  } = options;

  return {
    method,
    url,
    body,
    headers: {
      'content-type': 'application/json',
      origin: 'https://www.tnrbusinesssolutions.com',
      ...headers
    },
    query,
    connection: {
      remoteAddress: '127.0.0.1'
    }
  };
}

/**
 * Create a mock response object
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    headersSent: false,
    setHeader: jest.fn((key, value) => {
      res.headers[key] = value;
    }),
    writeHead: jest.fn((statusCode, headers) => {
      res.statusCode = statusCode;
      if (headers) {
        Object.assign(res.headers, headers);
      }
      res.headersSent = true;
    }),
    end: jest.fn((data) => {
      if (data) {
        try {
          res.body = JSON.parse(data);
        } catch (e) {
          res.body = data;
        }
      }
      res.headersSent = true;
    }),
    status: jest.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn((data) => {
      res.body = data;
      res.headersSent = true;
      return res;
    })
  };
  return res;
}

/**
 * Wait for async operations
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract JSON from response
 */
function getResponseBody(res) {
  if (typeof res.body === 'string') {
    try {
      return JSON.parse(res.body);
    } catch (e) {
      return res.body;
    }
  }
  return res.body;
}

module.exports = {
  createMockRequest,
  createMockResponse,
  wait,
  getResponseBody
};

