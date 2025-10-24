// /app/api/debug/sse-status/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authResult = await auth();
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated: !!authResult.userId,
        userId: authResult.userId || null,
        sessionId: authResult.sessionId || null,
      },
      database: {
        connected: false,
        userExists: false,
        userEmail: null as string | null,
      },
      sse: {
        endpointAvailable: true,
        ready: false,
      }
    };

    // Verificar conexión a BD
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.database.connected = true;
    } catch (error) {
      console.error('Database connection error:', error);
    }

    // Si está autenticado, verificar que el usuario existe en BD
    if (authResult.userId) {
      try {
        const usuario = await prisma.usuario.findUnique({
          where: { clerk_id: authResult.userId },
          select: { 
            id: true, 
            email: true,
            clerk_id: true,
          }
        });

        if (usuario) {
          diagnostics.database.userExists = true;
          diagnostics.database.userEmail = usuario.email || null;
          diagnostics.sse.ready = true;
        }
      } catch (error) {
        console.error('User lookup error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      recommendations: getRecommendations(diagnostics)
    });

  } catch (error) {
    console.error('Diagnostic endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run diagnostics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRecommendations(diagnostics: any): string[] {
  const recommendations: string[] = [];

  if (!diagnostics.auth.isAuthenticated) {
    recommendations.push('🔐 No estás autenticado. Inicia sesión con Clerk.');
  }

  if (!diagnostics.database.connected) {
    recommendations.push('🗄️ No hay conexión con la base de datos. Verifica DATABASE_URL en .env');
  }

  if (diagnostics.auth.isAuthenticated && !diagnostics.database.userExists) {
    recommendations.push(
      `👤 Tu usuario de Clerk (${diagnostics.auth.userId}) no existe en la base de datos. ` +
      'Necesitas crear el registro en la tabla Usuario con este clerk_id.'
    );
  }

  if (diagnostics.sse.ready) {
    recommendations.push('✅ Todo está listo para SSE. Si aún no conecta, revisa los logs del servidor.');
  }

  return recommendations;
}
