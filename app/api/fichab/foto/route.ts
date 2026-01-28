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
const FICHAB_ENDPOINT = '/fichab/SRCI/fotoSujeto';

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
    const { rut, ciSession, serverId } = await request.json();

    if (!rut) {
      return NextResponse.json(
        { error: 'RUT es requerido' },
        { status: 400 }
      );
    }

    if (!ciSession) {
      return NextResponse.json(
        { error: 'Sesión no configurada' },
        { status: 401 }
      );
    }

    const serverIdValue = serverId || '1';
    const body = `rut=${encodeURIComponent(rut)}`;
    const fullUrl = `${FICHAB_BASE_URL}${FICHAB_ENDPOINT}`;

    console.log(`[FICHAB] Consultando foto para RUT: ${rut}`);

    const response = await fetchFichab(fullUrl, {
      method: 'POST',
      headers: {
        'Host': 'balanceador-qa.minpublico.cl',
        'Cookie': `SERVERID=${serverIdValue}; ci_session=${ciSession}`,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://balanceador-qa.minpublico.cl',
        'Referer': 'https://balanceador-qa.minpublico.cl/fichab/Sujeto'
      },
      body: body
    });

    console.log(`[FICHAB] Response status: ${response.status}`);

    if (response.status >= 400) {
      return NextResponse.json(
        { error: 'Error en FICHAB', message: response.statusText },
        { status: response.status }
      );
    }

    const text = await response.text();

    // Validar si es la respuesta de "no encontrada"
    try {
      if (text.includes('personaNoEncontrada') || text.includes('"success":true')) {
        const json = JSON.parse(text);
        if (json.data && typeof json.data === 'string' && json.data.includes('personaNoEncontrada')) {
          return NextResponse.json({
            success: false,
            error: 'Fotografía no encontrada'
          });
        }
      }
    } catch (e) {
      // Ignorar error de parseo si no es JSON
    }

    if (!text.startsWith('data:image')) {
      if (text.length < 100) {
        console.log("Respuesta no reconocida Fichab Foto:", text);
        return NextResponse.json({
          success: false,
          error: 'Formato de respuesta desconocido'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: text
    });

  } catch (error) {
    console.error('Error consultando FICHAB:', error);
    return NextResponse.json(
      { 
        error: 'Error interno',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
