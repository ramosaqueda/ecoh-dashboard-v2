// src/app/incidencia-geografica/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw, Map } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MapaCalorIncidencia from '@/components/charts/MapaCalorIncidencia';
import GraficoTendencia from '@/components/charts/GraficoTendencia';

interface DelitoDistribucion {
  delitoId: number;
  delitoNombre: string;
  cantidad: number;
}

interface DatoTendencia {
  año: number;
  mes: number;
  comunaId: number;
  cantidad: number;
}

interface DatoComuna {
  id: number;
  nombre: string;
  cantidadCausas: number;
  distribucionDelitos: DelitoDistribucion[];
  tendenciaMensual: DatoTendencia[];
}

interface Delito {
  id: number;
  nombre: string;
}

interface Foco {
  id: number;
  nombre: string;
}

// ✅ AGREGADO: Tipo para los datos de exportación
interface DatoExportacion extends Record<string, string | number> {
  'Comuna': string;
  'Total Causas': number;
}

interface DatoTendenciaExportacion {
  'Comuna': string;
  'Año': number;
  'Mes': number;
  'Cantidad': number;
}

export default function IncidenciaGeograficaPage() {
  // Estados para filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12), // Último año por defecto
    to: new Date(),
  });
  const [delitoSeleccionado, setDelitoSeleccionado] = useState<string>('all');
  const [focoSeleccionado, setFocoSeleccionado] = useState<string>('all');
  
  // Estados para datos
  const [datosIncidencia, setDatosIncidencia] = useState<DatoComuna[]>([]);
  const [delitos, setDelitos] = useState<Delito[]>([]);
  const [focos, setFocos] = useState<Foco[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    fechaInicio: string;
    fechaFin: string;
    delitoId?: string;
    focoId?: string;
  } | null>(null);

  // Fetch de datos
  const fetchIncidenciaGeografica = async (
    fechaInicio: string,
    fechaFin: string,
    delitoId?: string,
    focoId?: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', fechaInicio);
      params.append('fechaFin', fechaFin);
      
      if (delitoId && delitoId !== 'all') {
        params.append('delitoId', delitoId);
      }
      
      if (focoId && focoId !== 'all') {
        params.append('focoId', focoId);
      }

      const response = await fetch(`/api/incidencia-geografica?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los datos de incidencia geográfica');
      }
      
      const { data, filtros, total } = await response.json();
      
      setDatosIncidencia(data);
      setDelitos(filtros.delitos);
      setFocos(filtros.focos);
      setLastSearchParams({ 
        fechaInicio, 
        fechaFin, 
        delitoId: delitoId !== 'all' ? delitoId : undefined,
        focoId: focoId !== 'all' ? focoId : undefined
      });
      
      toast.success(`Se analizaron datos de ${total} comunas`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de incidencia geográfica');
      setDatosIncidencia([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (): void => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Debe seleccionar un rango de fechas completo');
      return;
    }

    const fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
    const fechaFin = format(dateRange.to, 'yyyy-MM-dd');
    
    fetchIncidenciaGeografica(
      fechaInicio, 
      fechaFin, 
      delitoSeleccionado, 
      focoSeleccionado
    );
  };

  // Manejar actualización
  const handleRefresh = (): void => {
    if (lastSearchParams) {
      fetchIncidenciaGeografica(
        lastSearchParams.fechaInicio, 
        lastSearchParams.fechaFin, 
        lastSearchParams.delitoId, 
        lastSearchParams.focoId
      );
    } else {
      handleSearch();
    }
  };

  // Manejar limpieza de filtros
  const handleClearFilters = (): void => {
    setDelitoSeleccionado('all');
    setFocoSeleccionado('all');
    setDateRange({
      from: subMonths(new Date(), 12),
      to: new Date(),
    });
  };

  // ✅ CORREGIDO: Exportar a Excel con tipos apropiados
  const handleExportToExcel = (): void => {
    if (datosIncidencia.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    // Preparar datos planos para exportación
    const datosPlanos: DatoExportacion[] = [];
    
    datosIncidencia.forEach((comuna: DatoComuna) => {
      // ✅ Datos básicos de la comuna con tipo flexible
      const filaPrincipal: DatoExportacion = {
        'Comuna': comuna.nombre,
        'Total Causas': comuna.cantidadCausas,
      };
      
      // ✅ Agregar distribución por delito (ahora TypeScript permite propiedades dinámicas)
      comuna.distribucionDelitos.forEach((delito: DelitoDistribucion) => {
        filaPrincipal[`Delito: ${delito.delitoNombre}`] = delito.cantidad;
      });
      
      datosPlanos.push(filaPrincipal);
    });
    
    // Crear libro Excel
    const worksheet = XLSX.utils.json_to_sheet(datosPlanos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidencia Geográfica');
    
    // ✅ Agregar hoja de tendencia temporal si hay datos (con tipos correctos)
    const datosTendencia: DatoTendenciaExportacion[] = [];
    datosIncidencia.forEach((comuna: DatoComuna) => {
      comuna.tendenciaMensual.forEach((tendencia: DatoTendencia) => {
        datosTendencia.push({
          'Comuna': comuna.nombre,
          'Año': tendencia.año,
          'Mes': tendencia.mes,
          'Cantidad': tendencia.cantidad
        });
      });
    });
    
    if (datosTendencia.length > 0) {
      const worksheetTendencia = XLSX.utils.json_to_sheet(datosTendencia);
      XLSX.utils.book_append_sheet(workbook, worksheetTendencia, 'Tendencia Temporal');
    }
    
    // Guardar archivo
    const fileName = `incidencia_geografica_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Datos exportados correctamente');
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
      const fechaFin = format(dateRange.to, 'yyyy-MM-dd');
      
      fetchIncidenciaGeografica(fechaInicio, fechaFin);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análisis de Incidencia Delictual Geográfica</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análisis</CardTitle>
          <CardDescription>
            Seleccione los criterios para analizar la incidencia delictual por comuna
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">Período</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Delito</label>
              <Select
                value={delitoSeleccionado}
                onValueChange={setDelitoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione delito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los delitos</SelectItem>
                  {delitos.map((delito: Delito) => (
                    <SelectItem key={delito.id} value={delito.id.toString()}>
                      {delito.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Foco</label>
              <Select
                value={focoSeleccionado}
                onValueChange={setFocoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione foco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los focos</SelectItem>
                  {focos.map((foco: Foco) => (
                    <SelectItem key={foco.id} value={foco.id.toString()}>
                      {foco.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="flex-1"
              >
                <Search className="mr-2 h-4 w-4" />
                Analizar
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading || !lastSearchParams}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>
          </div>
          
          {datosIncidencia.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleExportToExcel}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapa de calor de incidencia por comuna */}
      <MapaCalorIncidencia
        datos={datosIncidencia}
        isLoading={isLoading}
      />
      
      {/* Gráfico de evolución temporal */}
      <GraficoTendencia
        datos={datosIncidencia}
        isLoading={isLoading}
      />
      
      {/* Resumen estadístico */}
      {datosIncidencia.length > 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-xl font-semibold text-blue-700">
                  {datosIncidencia.length}
                </div>
                <div className="text-sm text-blue-600">
                  Comunas con registros
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-xl font-semibold text-green-700">
                  {datosIncidencia.reduce((sum, comuna) => sum + comuna.cantidadCausas, 0)}
                </div>
                <div className="text-sm text-green-600">
                  Total de causas
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-xl font-semibold text-purple-700">
                  {datosIncidencia.length > 0 
                    ? datosIncidencia[0].nombre
                    : 'N/A'}
                </div>
                <div className="text-sm text-purple-600">
                  Comuna con mayor incidencia
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}