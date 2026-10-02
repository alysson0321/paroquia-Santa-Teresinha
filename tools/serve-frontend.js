const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', 'paroquia-frontend');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.ico':'image/x-icon' };
http.createServer((req, res) => {
  const safe = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.resolve(root, safe);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  fs.stat(file, (err, stat) => {
    const target = !err && stat.isFile() ? file : path.join(root, 'index.html');
    fs.readFile(target, (readErr, data) => { if (readErr) return res.writeHead(404).end('Not found'); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' }); res.end(data); });
  });
}).listen(5500, () => console.log('Frontend em http://localhost:5500'));
