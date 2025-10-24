// app/sign-in/page.tsx - VERSIÓN SIMPLIFICADA
'use client';
import { useEffect } from 'react';
import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Redirigir a dashboard o a la URL de retorno
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect_url') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [isLoaded, isSignedIn, router]);

  // Mostrar loading mientras se verifica
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">
            {!isLoaded ? 'Verificando...' : 'Redirigiendo...'}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar SignIn solo si no está autenticado
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}