const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Proxy request to avoid CORS
const proxyRequest = (targetUrl, extraHeaders, callback) => {
  const target = new url.URL(targetUrl);
  const options = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + target.search,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'LazyAutomation/1.0',
      ...extraHeaders,
    }
  };

  const protocol = target.protocol === 'https:' ? https : http;
  const req = protocol.request(options, (res) => {
    callback(res.statusCode, res.headers);
    res.on('data', (chunk) => {});
    res.on('end', () => {});
  });

  req.on('error', (e) => {
    callback(0, {});
  });

  req.end();
};

const server = http.createServer((req, res) => {
  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Proxy endpoint for testing connections
  if (req.url.startsWith('/api/proxy/')) {
    const target = decodeURIComponent(req.url.replace('/api/proxy/', ''));
    
    try {
      new URL(target); // Validate URL
      
      // Forward Authorization header if present
      const headers = {};
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
      
      proxyRequest(target, headers, (status, headers) => {
        res.writeHead(status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ status, success: status >= 200 && status < 400 }));
      });
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid URL' }));
    }
    return;
  }

  let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve index.html for SPA routing
        fs.readFile(path.join(BUILD_DIR, 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
