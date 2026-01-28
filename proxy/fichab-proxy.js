// proxy/fichab-proxy.js
// Proxy para reenviar peticiones a FICHAB desde Docker
const http = require('http');
const https = require('https');
const { URL } = require('url');

const PROXY_PORT = 8443;
const FICHAB_HOST = 'balanceador-qa.minpublico.cl';

const server = http.createServer((req, res) => {
  // Log de la petición entrante
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Leer el body de la petición
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Construir la URL de destino
    const targetPath = req.url;
    
    // Copiar headers, pero cambiar el host
    const headers = { ...req.headers };
    headers['host'] = FICHAB_HOST;
    delete headers['connection'];
    
    // Opciones para la petición a FICHAB
    const options = {
      hostname: FICHAB_HOST,
      port: 443,
      path: targetPath,
      method: req.method,
      headers: headers,
      rejectUnauthorized: false // Ignorar certificados inválidos
    };

    console.log(`[Proxy] -> https://${FICHAB_HOST}${targetPath}`);

    // Hacer la petición a FICHAB
    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`[Proxy] <- ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
      
      // Copiar status y headers de la respuesta
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe de la respuesta
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy] Error: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Proxy Error', 
        message: err.message 
      }));
    });

    // Timeout de 30 segundos
    proxyReq.setTimeout(30000, () => {
      console.error('[Proxy] Timeout');
      proxyReq.destroy();
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Gateway Timeout', 
        message: 'FICHAB no respondió a tiempo' 
      }));
    });

    // Enviar el body si existe
    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           FICHAB Proxy Server                              ║
╠════════════════════════════════════════════════════════════╣
║  Escuchando en: http://0.0.0.0:${PROXY_PORT}                     ║
║  Destino:       https://${FICHAB_HOST}         ║
║                                                            ║
║  Desde Docker usar: http://host.docker.internal:${PROXY_PORT}    ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n[Proxy] Cerrando...');
  server.close(() => {
    console.log('[Proxy] Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
