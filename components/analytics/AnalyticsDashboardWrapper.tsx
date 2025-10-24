'use client';

import { useAuth } from '@clerk/nextjs';
import  AnalyticsDashboard  from '@/components/analytics/AnalyticsDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsDashboardWrapper() {
  const { isLoaded, isSignedIn } = useAuth();

  // ⏳ Clerk aún está cargando
  if (!isLoaded) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ❌ No autenticado
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Debes iniciar sesión para ver el dashboard</p>
      </div>
    );
  }

  // ✅ Todo listo - renderizar el dashboard
  return <AnalyticsDashboard />;
}