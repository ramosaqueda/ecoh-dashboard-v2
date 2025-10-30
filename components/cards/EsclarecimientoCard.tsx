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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { useYearContext } from '@/components/YearSelector';

interface EsclarecimientoData {
  totalCausas: number;
  causasEsclarecidas: number;
  porcentaje: number;
  detalles: {
    causasFormalizadas: number;
    causasConCautelar: number;
    causasAmbasSituaciones: number;
  };
}

interface TipoDelito {
  id: number;
  nombre: string;
}

interface OrigenCausa {
  id: number;
  nombre: string;
  color: string | null;
}

export function EsclarecimientoCard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<EsclarecimientoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiposDelito, setTiposDelito] = useState<TipoDelito[]>([]);
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]); // ✨ NUEVO
  const [selectedTipoDelito, setSelectedTipoDelito] = useState('todos');
  const [selectedOrigen, setSelectedOrigen] = useState('todos'); // ✨ NUEVO
  const [soloHomicidiosConsumados, setSoloHomicidiosConsumados] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ [EsclarecimientoCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [EsclarecimientoCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchTiposDelito = async () => {
      try {
        console.log('📊 [EsclarecimientoCard] Cargando tipos de delito...');
        const response = await fetch('/api/delito', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar tipos de delito');
        const data = await response.json();
        setTiposDelito(data);
        console.log('✅ [EsclarecimientoCard] Tipos de delito cargados:', data.length);
      } catch (error) {
        console.error('❌ [EsclarecimientoCard] Error al cargar tipos de delito:', error);
        setTiposDelito([]);
      }
    };

    // ✨ NUEVO: Cargar orígenes de causa
    const fetchOrigenes = async () => {
      try {
        console.log('📊 [EsclarecimientoCard] Cargando orígenes de causa...');
        const response = await fetch('/api/origenes-causa', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al cargar orígenes');
        const data = await response.json();
        setOrigenes(data);
        console.log('✅ [EsclarecimientoCard] Orígenes cargados:', data.length);
      } catch (error) {
        console.error('❌ [EsclarecimientoCard] Error al cargar orígenes:', error);
        setOrigenes([]);
      }
    };

    fetchTiposDelito();
    fetchOrigenes();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ [EsclarecimientoCard] Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ [EsclarecimientoCard] Usuario no autenticado');
      setIsLoading(false);
      setError('No autenticado');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('📊 [EsclarecimientoCard] Cargando datos...', { 
          selectedYear, 
          selectedTipoDelito, 
          selectedOrigen, // ✨ NUEVO
          soloHomicidiosConsumados 
        });
        
        const params = new URLSearchParams({
          ...(selectedYear !== 'todos' && { year: selectedYear }),
          ...(selectedTipoDelito !== 'todos' && { tipoDelito: selectedTipoDelito }),
          ...(selectedOrigen !== 'todos' && { origenCausaId: selectedOrigen }), // ✨ NUEVO
          ...(soloHomicidiosConsumados && { homicidioConsumado: 'true' })
        });

        const url = `/api/analytics/tasa-esclarecimiento?${params.toString()}`;
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        console.log('📊 [EsclarecimientoCard] Response status:', response.status);
        
        if (!response.ok) throw new Error('Error al cargar datos de esclarecimiento');
        const data = await response.json();
        setData(data);
        setError(null);
        console.log('✅ [EsclarecimientoCard] Datos cargados:', data);
      } catch (error) {
        console.error('❌ [EsclarecimientoCard] Error:', error);
        setData(null);
        setError('Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn, selectedYear, selectedTipoDelito, selectedOrigen, soloHomicidiosConsumados]); // ✨ Agregado selectedOrigen

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isLoaded || isLoading) {
    return (
      <Card>
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn || error || !data) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">
            {!isSignedIn ? 'No autenticado' : error || 'Error al cargar datos'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Tasa de Esclarecimiento</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Causas con imputados formalizados y/o</p>
                  <p>con medidas cautelares vigentes</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedYear === 'todos' ? 'Todos los años' : `Año: ${selectedYear}`}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {/* ✨ NUEVO: Selector de origen */}
              <Select value={selectedOrigen} onValueChange={setSelectedOrigen}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Origen de causa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los orígenes</SelectItem>
                  {origenes.map((origen) => (
                    <SelectItem key={origen.id} value={origen.id.toString()}>
                      {origen.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selector de tipo de delito (existente) */}
              <Select value={selectedTipoDelito} onValueChange={setSelectedTipoDelito}>
                <SelectTrigger className="w-[200px]">
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
            
            {/* Switch de homicidios consumados (existente) */}
            <div className="flex items-center space-x-2">
              <Switch
                id="homicidio-consumado"
                checked={soloHomicidiosConsumados}
                onCheckedChange={setSoloHomicidiosConsumados}
              />
              <Label htmlFor="homicidio-consumado">Solo homicidios consumados</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {data.causasEsclarecidas} de {data.totalCausas} causas
              </span>
              <span className="font-bold">{data.porcentaje?.toFixed(1)}%</span>
            </div>
            <Progress
              value={data.porcentaje}
              className={getColorByPercentage(data.porcentaje)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-slate-100 p-2">
              <p className="text-muted-foreground">Formalizadas</p>
              <p className="text-xl font-bold">
                {data.detalles.causasFormalizadas}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <p className="text-muted-foreground">Con Cautelar</p>
              <p className="text-xl font-bold">
                {data.detalles.causasConCautelar}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2">
              <p className="text-muted-foreground">Ambas</p>
              <p className="text-xl font-bold">
                {data.detalles.causasAmbasSituaciones}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}