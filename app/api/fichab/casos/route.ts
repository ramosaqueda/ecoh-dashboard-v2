// app/api/fichab/casos/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FICHAB_API_URL = 'https://balanceador-qa.minpublico.cl/fichab/Sujeto/casos';

// Función para hacer fetch ignorando certificados SSL inválidos
async function fetchIgnoreSSL(url: string, options: RequestInit): Promise<Response> {
  // Usamos undici directamente para tener control sobre TLS
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
          message: 'Debe configurar su sesión de FICHAB primero. Use el botón de configuración FICHAB.'
        },
        { status: 401 }
      );
    }

    const serverIdValue = serverId || '1';

    const response = await fetchIgnoreSSL(FICHAB_API_URL, {
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
            message: 'Su sesión en FICHAB ha expirado. Por favor, actualice su configuración de sesión.'
          },
          { status: 401 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          { 
            error: 'Sesión inválida',
            message: 'La sesión de FICHAB no es válida. Por favor, obtenga una nueva cookie de sesión.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Error en FICHAB',
          message: `Error ${response.status}: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      
      try {
        data = JSON.parse(text);
      } catch {
        data = { html: text, raw: true };
      }
    }

    return NextResponse.json({
      success: true,
      data
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
