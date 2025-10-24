import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 [DEBUG] Verificando autenticación...');
    
    const authObj = await auth();
    console.log('🔍 [DEBUG] Auth object:', {
      hasAuth: !!authObj,
      userId: authObj?.userId || 'NO USER ID',
      sessionId: authObj?.sessionId || 'NO SESSION ID',
    });

    const user = await currentUser();
    console.log('🔍 [DEBUG] Current user:', user ? 'FOUND' : 'NOT FOUND');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      auth: {
        hasAuth: !!authObj,
        userId: authObj?.userId || null,
        sessionId: authObj?.sessionId || null,
      },
      user: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      } : null,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error en auth check:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
