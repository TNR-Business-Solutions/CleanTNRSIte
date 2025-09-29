const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle root path
  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  }

  // Construct file path
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || 'text/plain';

  // Check if file exists
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The file <code>${pathname}</code> was not found.</p>
            <p><a href="/">← Back to Home</a></p>
          </body>
        </html>
      `);
      return;
    }

    // File found, serve it
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache', // Prevent caching for development
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('🚀 TNR Clean Site Server Started!');
  console.log('================================================');
  console.log(`📍 Clean site running at: http://localhost:${PORT}`);
  console.log(`🏠 Homepage: http://localhost:${PORT}`);
  console.log(`🎨 Web Design: http://localhost:${PORT}/web-design.html`);
  console.log(`🔍 SEO Services: http://localhost:${PORT}/seo-services.html`);
  console.log(`📦 Packages: http://localhost:${PORT}/packages.html`);
  console.log('================================================');
  console.log('✨ Clean, simplified structure with Army Green cards!');
  console.log('🎯 Compare with main site at http://localhost:3000');
  console.log('================================================');
  console.log('Press Ctrl+C to stop the server');
});
