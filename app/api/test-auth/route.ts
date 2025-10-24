// TEST: app/api/test-auth/route.ts
// Este endpoint sirve para verificar que la autenticación de Clerk funciona correctamente

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, sessionId } = await auth();
    const user = await currentUser();

    return NextResponse.json({
      success: true,
      auth: {
        userId: userId || 'No userId',
        sessionId: sessionId || 'No sessionId',
        hasAuth: !!userId
      },
      user: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      } : 'No user data',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
