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
import { AlertCircle, FileText } from 'lucide-react';
import { useYearContext } from '@/components/YearSelector';

interface CausasCountResponse {
  count: number;
}

export default function CausasLegadaCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { selectedYear } = useYearContext();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CausasLegadaCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CausasLegadaCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchCausasCount = async () => {
      try {
        console.log('📊 [CausasLegadaCard] Cargando datos de causas legadas...');
        console.log('📊 [CausasLegadaCard] Año seleccionado:', selectedYear);
        
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        url.searchParams.append('causaLegada', 'true');
        
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        console.log('📊 [CausasLegadaCard] URL:', url.toString());
        
        const response = await fetch(url.toString(), {
          credentials: 'include'
        });

        console.log('📊 [CausasLegadaCard] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CausasLegadaCard] Error response:', errorText);
          throw new Error(`HTTP ${response.status}`);
        }

        const data: CausasCountResponse = await response.json();
        console.log('📊 [CausasLegadaCard] Data received:', data);
        
        setCount(data.count || 0);
        setError(null);
        console.log('✅ [CausasLegadaCard] Datos cargados:', data.count);
        
      } catch (error) {
        console.error('❌ [CausasLegadaCard] Error:', error);
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20 mb-2" />
          <Skeleton className="h-3 w-48" />
        </CardContent>
      </Card>
    );
  }

  // Error o no autenticado
  if (!isSignedIn || error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <CardTitle className="text-sm font-medium">CAUSAS LEGADAS</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">CAUSAS LEGADAS</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{count.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">
          Causas Legadas en tramitación ECOH
        </p>
      </CardContent>
    </Card>
  );
}
