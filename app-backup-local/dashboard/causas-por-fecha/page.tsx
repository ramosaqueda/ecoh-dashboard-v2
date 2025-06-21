// src/app/causas-por-fecha/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/date-range-picker';
import CausasImputadosTable from '@/components/tables/causas-tables/CausasImputadosTable';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Imputado {
  id: number;
  nombreSujeto: string;
  docId: string;
  alias: string;
  nacionalidad: string;
  formalizado: boolean;
  fechaFormalizacion: string | null;
  medidaCautelar: string;
}

interface Causa {
  id: number;
  denominacionCausa: string;
  ruc: string;
  fechaDelHecho: string;
  delito: string;
  comuna: string;
  imputados: Imputado[];
}

export default function CausasPorFechaPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Por defecto último mes
    to: new Date(),
  });
  const [causas, setCausas] = useState<Causa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{ fechaInicio: string; fechaFin: string } | null>(null);

  const fetchCausasPorFecha = async (fechaInicio: string, fechaFin: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', fechaInicio);
      params.append('fechaFin', fechaFin);

      const response = await fetch(`/api/causas-por-fecha?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener las causas');
      }
      
      const data = await response.json();
      setCausas(data.data);
      setLastSearchParams({ fechaInicio, fechaFin });
      
      toast.success(`Se encontraron ${data.data.length} causas en el rango de fechas seleccionado`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las causas');
      setCausas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Debe seleccionar un rango de fechas completo');
      return;
    }

    const fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
    const fechaFin = format(dateRange.to, 'yyyy-MM-dd');
    
    fetchCausasPorFecha(fechaInicio, fechaFin);
  };

  const handleRefresh = () => {
    if (lastSearchParams) {
      fetchCausasPorFecha(lastSearchParams.fechaInicio, lastSearchParams.fechaFin);
    } else {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consulta de Causas por Fecha del Hecho</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtro por Fecha</CardTitle>
          <CardDescription>
            Seleccione un rango de fechas para filtrar las causas según la fecha del hecho delictual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-96">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading || !lastSearchParams}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CausasImputadosTable
        causas={causas}
        isLoading={isLoading}
      />
    </div>
  );
}