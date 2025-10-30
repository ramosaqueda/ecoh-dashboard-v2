'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

interface CausasStats {
  total: number;
  activas: number;
  cerradas: number;
}

export default function CausasCard() {
  const [data, setData] = useState<CausasStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Ya no verificamos autenticación aquí
    // El componente padre (dashboard/page.tsx) ya lo hizo
    fetchCausasData();
  }, []);

  const fetchCausasData = async () => {
    try {
      console.log('📊 [CausasCard] Cargando datos de causas...');
      
      const response = await fetch('/api/causas/stats');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log('✅ [CausasCard] Datos cargados correctamente');
      
    } catch (err) {
      console.error('❌ [CausasCard] Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Causas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Causas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <button 
              onClick={fetchCausasData}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar datos
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Causas
        </CardTitle>
        <CardDescription>Resumen de causas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{data?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Activas</span>
            <span className="text-xl font-semibold text-green-600">
              {data?.activas || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cerradas</span>
            <span className="text-xl font-semibold text-gray-600">
              {data?.cerradas || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
