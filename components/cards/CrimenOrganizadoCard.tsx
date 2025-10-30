'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { useYearContext } from '@/components/YearSelector';

interface ResumenDelito {
  delito: string;
  cantidad: number;
}

interface CrimenOrganizadoData {
  totalCausas: number;
  causasCrimenOrganizado: number;
  porcentaje: number;
  resumenPorDelito: ResumenDelito[];
}

interface TipoDelito {
  id: number;
  nombre: string;
}

export function CrimenOrganizadoCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<CrimenOrganizadoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiposDelito, setTiposDelito] = useState<TipoDelito[]>([]);
  const [selectedTipoDelito, setSelectedTipoDelito] = useState('todos');

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CrimenOrganizadoCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CrimenOrganizadoCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchTiposDelito = async () => {
      try {
        console.log('📊 [CrimenOrganizadoCard] Cargando tipos de delito...');
        const response = await fetch('/api/delito', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar tipos de delito');
        const data = await response.json();
        setTiposDelito(data);
        console.log('✅ [CrimenOrganizadoCard] Tipos de delito cargados:', data.length);
      } catch (error) {
        console.error('❌ [CrimenOrganizadoCard] Error al cargar tipos de delito:', error);
        setTiposDelito([]);
      }
    };

    fetchTiposDelito();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    // ✅ Esperar a que Clerk esté listo
    if (!isLoaded) {
      console.log('⏳ [CrimenOrganizadoCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [CrimenOrganizadoCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('📊 [CrimenOrganizadoCard] Cargando datos...', { selectedYear, selectedTipoDelito });
        const params = new URLSearchParams({
          ...(selectedYear !== 'todos' && { year: selectedYear }),
          ...(selectedTipoDelito !== 'todos' && { tipoDelito: selectedTipoDelito })
        });

        const url = `/api/analytics/crimen-organizado?${params.toString()}`;
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        console.log('📊 [CrimenOrganizadoCard] Response status:', response.status);
        
        if (!response.ok) throw new Error('Error al cargar datos de crimen organizado');
        const data = await response.json();
        setData(data);
        setError(null);
        console.log('✅ [CrimenOrganizadoCard] Datos cargados:', data);
      } catch (error) {
        console.error('❌ [CrimenOrganizadoCard] Error:', error);
        setData(null);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, selectedYear, selectedTipoDelito]);

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 30) return 'bg-red-500';
    if (percentage >= 15) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // Loading mientras Clerk carga o datos cargan
  if (!isLoaded || isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error o no autenticado
  if (!isSignedIn || error || !data) {
    return (
      <Card className="h-full border-l-4 border-l-red-500">
        <CardContent className="flex flex-col items-center justify-center gap-2 h-full py-10">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">
            {!isSignedIn ? 'No autenticado' : error || 'Error al cargar datos'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar el resumen por cantidad (de mayor a menor)
  const sortedResumen = [...data.resumenPorDelito].sort((a, b) => b.cantidad - a.cantidad);
  
  // Mostrar solo los 3 principales tipos si hay más
  const topDelitos = sortedResumen.slice(0, 3);
  
  // Si hay más de 3 tipos, calcular el total de los demás
  const otrosDelitos = sortedResumen.length > 3 
    ? sortedResumen.slice(3).reduce((sum, item) => sum + item.cantidad, 0)
    : 0;

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-md p-1.5">
                <Shield className="h-4 w-4 text-blue-700" />
              </div>
              <CardTitle>Crimen Organizado</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Causas marcadas como crimen organizado</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
              {selectedYear === 'todos' ? 'Todos los años' : `Año: ${selectedYear}`}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Select value={selectedTipoDelito} onValueChange={setSelectedTipoDelito}>
                <SelectTrigger className="w-full text-xs h-8 focus:ring-blue-500">
                  <SelectValue placeholder="Tipo de delito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los delitos</SelectItem>
                  {tiposDelito.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">{data.causasCrimenOrganizado}</p>
                <span className="text-xs text-muted-foreground">
                  de {data.totalCausas} causas totales
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.porcentaje?.toFixed(1)}%
              </div>
            </div>
            <Progress
              value={data.porcentaje}
              className={`h-2 ${getColorByPercentage(data.porcentaje)}`}
            />
          </div>

          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">DISTRIBUCIÓN POR DELITO</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {topDelitos.map((item, index) => (
                <div key={index} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-muted-foreground truncate mb-1">{item.delito}</p>
                  <p className="text-xl font-bold">{item.cantidad}</p>
                </div>
              ))}
              
              {otrosDelitos > 0 && (
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-muted-foreground mb-1">Otros delitos</p>
                  <p className="text-xl font-bold">{otrosDelitos}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}