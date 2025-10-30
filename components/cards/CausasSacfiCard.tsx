'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertCircle } from 'lucide-react';
import { useYearContext } from '@/components/YearSelector';

interface CausasCountResponse {
  count: number;
}

export default function CausasSacfiCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { selectedYear } = useYearContext();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CausasSacfiCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CausasSacfiCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchCausasCount = async () => {
      try {
        console.log('📊 [CausasSacfiCard] Cargando datos de causas SACFI...');
        console.log('📊 [CausasSacfiCard] Año seleccionado:', selectedYear);
        
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        url.searchParams.append('causaSacfi', 'true');
        
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        console.log('📊 [CausasSacfiCard] URL:', url.toString());
        
        const response = await fetch(url.toString(), {
          credentials: 'include'
        });

        console.log('📊 [CausasSacfiCard] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CausasSacfiCard] Error response:', errorText);
          throw new Error(`HTTP ${response.status}`);
        }

        const data: CausasCountResponse = await response.json();
        console.log('📊 [CausasSacfiCard] Data received:', data);
        
        setCount(data.count || 0);
        setError(null);
        console.log('✅ [CausasSacfiCard] Datos cargados:', data.count);
        
      } catch (error) {
        console.error('❌ [CausasSacfiCard] Error:', error);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCausasCount();
    
  }, [isLoaded, isSignedIn, selectedYear]);

  // Loading mientras Clerk carga
  if (!isLoaded || isLoading) {
    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-orange-600" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-64" />
        </CardContent>
      </Card>
    );
  }

  // Error o no autenticado
  if (!isSignedIn || error) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <CardTitle className="text-sm font-medium">CAUSAS SACFI</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-500">
            {!isSignedIn ? 'No autenticado' : error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render normal con datos
  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-orange-600" />
          <CardTitle className="text-sm font-medium">CAUSAS SACFI</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-orange-600">
            {count.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Sistema de Análisis Criminal y Focalización de la Investigación
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
