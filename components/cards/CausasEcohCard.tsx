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
import { Scale, AlertCircle } from 'lucide-react';
import { useYearContext } from '@/components/YearSelector';

interface CausasCountResponse {
  count: number;
}

export default function CausasEcohCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { selectedYear } = useYearContext();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CausasEcohCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CausasEcohCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchCausasCount = async () => {
      try {
        console.log('📊 [CausasEcohCard] Cargando datos de causas ECOH...');
        console.log('📊 [CausasEcohCard] Año seleccionado:', selectedYear);
        
        // ✅ Construir URL para la API
        const url = new URL('/api/causas', window.location.origin);
        url.searchParams.append('count', 'true');
        url.searchParams.append('causaEcoh', 'true');
        
        // Solo añadir year si no es "todos"
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        console.log('📊 [CausasEcohCard] URL:', url.toString());
        
        const response = await fetch(url.toString(), {
          credentials: 'include' // ✅ Agregar credentials
        });

        console.log('📊 [CausasEcohCard] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CausasEcohCard] Error response:', errorText);
          throw new Error(`HTTP ${response.status}`);
        }

        const data: CausasCountResponse = await response.json();
        console.log('📊 [CausasEcohCard] Data received:', data);
        
        setCount(data.count || 0);
        setError(null);
        console.log('✅ [CausasEcohCard] Datos cargados:', data.count);
        
      } catch (error) {
        console.error('❌ [CausasEcohCard] Error:', error);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCausasCount();
    
  }, [isLoaded, isSignedIn, selectedYear]); // ✅ Incluir selectedYear en dependencias

  // Loading mientras Clerk carga
  if (!isLoaded || isLoading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Scale className="h-4 w-4 text-blue-600" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-48" />
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
            <CardTitle className="text-sm font-medium">CAUSAS ECOH</CardTitle>
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
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Scale className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm font-medium">CAUSAS ECOH</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : selectedYear}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-blue-600">
            {count.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Equipo Contra el Crimen Organizado y Homicidios
          </p>
        </div>
      </CardContent>
    </Card>
  );
}