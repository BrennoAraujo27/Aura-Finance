const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive'
};

const server = http.createServer((req, res) => {
  // 1. Restringe a apenas métodos seguros de leitura
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('405 Método não permitido');
  }

  // 2. Extrai pathname seguro desconsiderando query string e decodificando URI
  let safePathname;
  try {
    const parsedUrl = url.parse(req.url);
    safePathname = decodeURI(parsedUrl.pathname || '/');
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Requisição inválida');
  }

  if (safePathname === '/') safePathname = '/index.html';

  // 3. Normaliza e resolve o caminho absoluto seguro
  const targetPath = path.resolve(PUBLIC_DIR, '.' + safePathname);

  // 4. Prevenção de Path Traversal (Directory Traversal Attack)
  if (!targetPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Acesso Negado');
  }

  // 5. Prevenção de vazamento de arquivos sensíveis do sistema/código
  const baseName = path.basename(targetPath).toLowerCase();
  if (baseName.startsWith('.') || baseName === 'server.js' || baseName.endsWith('.md')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Acesso Negado');
  }

  // 6. Cabeçalhos de Segurança HTTP (Defesa em Profundidade)
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(targetPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, securityHeaders));
      return res.end('404 Não Encontrado');
    }

    const responseHeaders = Object.assign({
      'Content-Type': contentType,
      'Content-Length': stats.size
    }, securityHeaders);

    if (ext === '.apk') {
      responseHeaders['Content-Disposition'] = 'attachment; filename="aura-wealth.apk"';
    }

    res.writeHead(200, responseHeaders);
    if (req.method === 'HEAD') {
      return res.end();
    }
    fs.createReadStream(targetPath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Aura Wealth] Servidor com proteção de segurança rodando na porta ${PORT}`);
});
