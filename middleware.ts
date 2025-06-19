// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const middleware = clerkMiddleware(async (auth, req) => {
  const pathname = new URL(req.url).pathname;
  console.log('🌐 Ruta solicitada:', pathname);

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const resolvedAuth = typeof auth === 'function' ? await auth() : auth;
    console.log('👤 Auth resuelto:', resolvedAuth);

    if (!resolvedAuth?.userId) {
      console.log('❌ No hay userId, redirigiendo a home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Agregar el userId al header de la petición
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-clerk-user-id', resolvedAuth.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return NextResponse.next();
});

export default middleware;

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/api/admin/(.*)']
};
