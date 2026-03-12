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

// Proxy request to avoid CORS - supports GET and POST
const proxyRequest = (targetUrl, method, extraHeaders, body, callback) => {
  const target = new url.URL(targetUrl);
  const options = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + target.search,
    method: method || 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'LazyAutomation/1.0',
      ...extraHeaders,
    },
    timeout: 30000, // 30 second timeout for AI requests
  };

  const protocol = target.protocol === 'https:' ? https : http;
  const req = protocol.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(res.statusCode, res.headers, data);
    });
  });

  req.on('error', (e) => {
    callback(502, {}, JSON.stringify({ error: 'Bad Gateway', message: e.message }));
  });

  req.on('timeout', () => {
    req.destroy();
    callback(504, {}, JSON.stringify({ error: 'Gateway Timeout' }));
  });

  if (body) {
    req.write(body);
  }
  req.end();
};

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Proxy endpoint for API calls (supports GET and POST)
  if (req.url.startsWith('/api/proxy/')) {
    const target = decodeURIComponent(req.url.replace('/api/proxy/', ''));
    
    try {
      new URL(target); // Validate URL
      
      // Get request method
      const method = req.method;
      
      // Forward Authorization header if present
      const headers = {};
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
      
      // Read body for POST/PUT requests
      let body = null;
      if (method === 'POST' || method === 'PUT') {
        body = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => data += chunk);
          req.on('end', () => resolve(data));
        });
      }
      
      proxyRequest(target, method, headers, body, (status, responseHeaders, data) => {
        // Try to parse as JSON, otherwise send as text
        let parsedData;
        let contentType = 'text/plain';
        
        try {
          parsedData = JSON.parse(data);
          contentType = 'application/json';
        } catch {
          parsedData = data;
        }
        
        res.writeHead(status, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        res.end(typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData));
      });
    } catch (e) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Invalid URL', message: e.message }));
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
