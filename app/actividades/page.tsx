'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ActividadesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirigir a la página del dashboard manteniendo los parámetros de query
    const params = searchParams.toString();
    const redirectUrl = params 
      ? `/dashboard/actividades?${params}`
      : '/dashboard/actividades';
    
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Redirigiendo...</span>
    </div>
  );
}
