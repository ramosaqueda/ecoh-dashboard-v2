import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Configuración según ambiente
const isProduction = process.env.NODE_ENV === 'production';
const FICHAB_BASE_URL = isProduction 
  ? 'http://host.docker.internal:8443'
  : 'https://balanceador-qa.minpublico.cl';
const FICHAB_ENDPOINT = '/fichab/Caso/datosGenerales';

// Función para hacer petición HTTP/HTTPS
function fetchFichab(url: string, options: {
  method: string;
  headers: Record<string, string>;
  body: string;
}): Promise<{ status: number; statusText: string; text: () => Promise<string> }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const transport = isHttps ? https : http;
    
    const req = transport.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: options.method,
      headers: {
        ...options.headers,
        'Content-Length': Buffer.byteLength(options.body)
      },
      ...(isHttps && { rejectUnauthorized: false })
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode || 500,
          statusText: res.statusMessage || 'Unknown',
          text: () => Promise.resolve(data)
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.write(options.body);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruc, ciSession, serverId } = body;

    if (!ruc || !ciSession || !serverId) {
      return NextResponse.json(
        { message: 'Faltan parámetros requeridos (ruc, ciSession, serverId)' },
        { status: 400 }
      );
    }

    const params = `ruc=${encodeURIComponent(ruc)}`;
    const cookieHeader = `SERVERID=${serverId}; ci_session=${ciSession}`;
    const fullUrl = `${FICHAB_BASE_URL}${FICHAB_ENDPOINT}`;

    console.log(`[FICHAB] Consultando Caso/datosGenerales para RUC: ${ruc}`);

    const response = await fetchFichab(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://balanceador-qa.minpublico.cl',
        'Referer': 'https://balanceador-qa.minpublico.cl/fichab/Caso',
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: params
    });

    console.log(`[FICHAB] Response status: ${response.status}`);

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { message: 'Sesión FICHAB no válida o expirada' },
        { status: 401 }
      );
    }

    if (response.status >= 400) {
      console.error(`Error FICHAB: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { message: `Error del servicio FICHAB: ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json({ success: true, data });
    } catch (e) {
      console.warn('FICHAB devolvió HTML/Texto:', text.substring(0, 200));
      return NextResponse.json({ 
        success: true, 
        data: { html: text, raw: true }
      });
    }

  } catch (error) {
    console.error('Error en proxy FICHAB Caso:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al consultar FICHAB' },
      { status: 500 }
    );
  }
}
