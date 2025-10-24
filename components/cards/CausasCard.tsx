'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function CausasCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const [totalCausas, setTotalCausas] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CausasCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CausasCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchCausas = async () => {
      try {
        console.log('📊 [CausasCard] Cargando datos de causas...');
        
        // ✅ CORRECCIÓN: Mantener la construcción original de URL
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        
        console.log('📊 [CausasCard] URL:', url.toString());
        
        const response = await fetch(url.toString(), {
          credentials: 'include' // ✅ Agregar credentials
        });

        console.log('📊 [CausasCard] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CausasCard] Error response:', errorText);
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 [CausasCard] Data received:', data);
        
        setTotalCausas(data.total || data.count || 0);
        setError(null);
        console.log('✅ [CausasCard] Datos cargados:', data.total || data.count);
        
      } catch (error) {
        console.error('❌ [CausasCard] Error:', error);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCausas();
    
  }, [isLoaded, isSignedIn]);

  // Loading mientras Clerk carga
  if (!isLoaded || isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Error o no autenticado
  if (!isSignedIn || error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Causas</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {!isSignedIn ? 'No autenticado' : error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render normal con datos
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Causas</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalCausas.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          Causas registradas en el sistema
        </p>
      </CardContent>
    </Card>
  );
}