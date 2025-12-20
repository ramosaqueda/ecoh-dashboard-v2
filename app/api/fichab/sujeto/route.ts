import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const FICHAB_SUJETO_URL = 'https://balanceador-qa.minpublico.cl/fichab/Sujeto/buscarDatosPersonalesSujeto';

// Función para hacer fetch ignorando certificados SSL inválidos
async function fetchIgnoreSSL(url: string, options: RequestInit): Promise<Response> {
  const { fetch: undiciFetch, Agent } = await import('undici');
  
  const agent = new Agent({
    connect: {
      rejectUnauthorized: false
    }
  });

  return undiciFetch(url, {
    ...options,
    dispatcher: agent
  }) as unknown as Response;
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
        { 
          error: 'Sesión no configurada',
          message: 'Debe configurar su sesión de FICHAB primero.'
        },
        { status: 401 }
      );
    }

    const serverIdValue = serverId || '1';

    const response = await fetchIgnoreSSL(FICHAB_SUJETO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://balanceador-qa.minpublico.cl',
        'Referer': 'https://balanceador-qa.minpublico.cl/fichab/Sujeto',
        'Cookie': `SERVERID=${serverIdValue}; ci_session=${ciSession}`
      },
      body: `rut=${encodeURIComponent(rut)}`
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { 
              error: 'Sesión expirada',
              message: 'Su sesión en FICHAB ha expirado.'
            },
            { status: 401 }
          );
        }
        return NextResponse.json(
            { error: 'Error en FICHAB', message: response.statusText },
            { status: response.status }
        );
    }

    const text = await response.text();
    let htmlContent = text;

    // Intentar parsear si viene como JSON
    try {
        const json = JSON.parse(text);
        if (json.bloque_registrocivil) {
            htmlContent = json.bloque_registrocivil;
        }
    } catch (e) {
        // No es JSON, usar el texto directo
    }

    const $ = cheerio.load(htmlContent);
    
    const nombreSujeto = $('#tdNombreSujeto').text().trim();
    const nacionalidadCodigo = $('#tdNacSujetoImp').text().trim();

    if (!nombreSujeto) {
        return NextResponse.json({
            success: false,
            message: 'No se encontraron datos para el RUT ingresado'
        });
    }

    return NextResponse.json({
        success: true,
        data: {
            nombreSujeto,
            nacionalidadCodigo
        }
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
