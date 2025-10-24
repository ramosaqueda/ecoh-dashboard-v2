// middleware.ts - VERSIÓN CORREGIDA
import { clerkMiddleware } from '@clerk/nextjs/server';

// ⚠️ clockSkewInMs va AQUÍ dentro de clerkMiddleware()
export default clerkMiddleware({
  clockSkewInMs: 300000, // 5 minutos de tolerancia
});

// El config es SOLO para Next.js matcher
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};