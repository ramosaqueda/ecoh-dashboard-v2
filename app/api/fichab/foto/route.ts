import { NextRequest, NextResponse } from 'next/server';

const FICHAB_FOTO_URL = 'https://balanceador-qa.minpublico.cl/fichab/SRCI/fotoSujeto';
                        

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
        { error: 'Sesión no configurada' },
        { status: 401 }
      );
    }

    const serverIdValue = serverId || '1';

    const body = `rut=${encodeURIComponent(rut)}`;

    const response = await fetchIgnoreSSL(FICHAB_FOTO_URL, {
      method: 'POST',
      headers: {
        'Host': 'balanceador-qa.minpublico.cl',
        'Cookie': `SERVERID=${serverIdValue}; ci_session=${ciSession}`,
        'Content-Length': body.length.toString(),
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Accept-Language': 'es-419,es;q=0.9',
        'Sec-Ch-Ua': '"Not_A Brand";v="99", "Chromium";v="142"',
        'Sec-Ch-Ua-Mobile': '?0',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://balanceador-qa.minpublico.cl',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://balanceador-qa.minpublico.cl/fichab/Sujeto',
        'Accept-Encoding': 'gzip, deflate, br',
        'Priority': 'u=1, i',
        'Connection': 'keep-alive'
      },
      body: body
    });

    

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Error en FICHAB', message: response.statusText },
            { status: response.status }
        );
    }

    const text = await response.text();
    // La respuesta viene como "data:image/jpg;base64,..."
    // Simplemente devolvemos el texto
    
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
