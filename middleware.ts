// middleware.ts - CON BYPASS PARA MIA/SAC
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas de API que la IA puede acceder
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// IPs internas permitidas (red Docker ia-sac-network)
const ALLOWED_IPS = ['172.17.', '172.19.', '127.0.0.1', '::1'];

function isInternalIP(ip: string | null): boolean {
  if (!ip) return false;
  return ALLOWED_IPS.some(prefix => ip.startsWith(prefix));
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 🛡️ INTERCEPTOR PARA MIA/SAC
  const aiSecret = req.headers.get('x-ai-secret');
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
                   || req.headers.get('x-real-ip') 
                   || (req as any).ip 
                   || '';

  // Si la petición va a la API, trae el secreto correcto Y viene de IP interna
  if (isApiRoute(req) && aiSecret === process.env.AI_TOOL_SECRET) {
    // Verificación adicional de IP (opcional pero recomendado)
    if (isInternalIP(clientIP)) {
      // Log para auditoría (opcional)
      console.log(`[MIA/SAC] API access from ${clientIP} to ${req.nextUrl.pathname}`);
      return NextResponse.next();
    } else {
      console.warn(`[MIA/SAC] Rejected: Invalid IP ${clientIP} for ${req.nextUrl.pathname}`);
      return NextResponse.json(
        { error: 'Acceso no autorizado desde esta IP' },
        { status: 403 }
      );
    }
  }

  // Si no es la IA, Clerk sigue con su flujo normal
}, {
  clockSkewInMs: 300000, // 5 minutos de tolerancia
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};