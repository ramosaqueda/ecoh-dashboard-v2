'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Download } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import MetricasGeneralesActividades from '@/components/charts/MetricasGeneralesActividades';
import ResumenActividadesPorCausa from '@/components/charts/ResumenActividadesPorCausa';

// Interfaces para los datos
interface ActividadDetalle {
  id: number;
  tipoActividad: string;
  area: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: string;
  observacion: string;
  vencida: boolean;
}

interface EstadisticasCausa {
  total: number;
  iniciadas: number;
  enProceso: number;
  terminadas: number;
  porcentajeCompletado: number;
}

interface ResumenCausa {
  causaId: number;
  ruc: string;
  denominacionCausa: string;
  delito: string;
  estadisticas: EstadisticasCausa;
  actividades: ActividadDetalle[];
  diasPromedio: number;
}

interface DistribucionUsuario {
  usuarioId: number;
  nombre: string;
  cargo: string;
  cantidadActividades: number;
}

interface TiempoPromedioTipo {
  tipoActividadId: number;
  nombre: string;
  area: string;
  diasPromedio: number;
}

interface MetricasGenerales {
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProceso: number;
  actividadesIniciadas: number;
  actividadesVencidas: number;
  porcentajeGlobalCompletado: number;
  distribucionPorUsuario: DistribucionUsuario[];
  tiempoPromedioPorTipo: TiempoPromedioTipo[];
}

interface TipoActividad {
  id: number;
  nombre: string;
  area: {
    nombre: string;
  };
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cargo: string | null;
}

export default function SeguimientoActividadesPage() {
  // Estados para filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3), // Últimos 3 meses por defecto
    to: new Date(),
  });
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('all');
  const [tipoActividadSeleccionado, setTipoActividadSeleccionado] = useState<string>('all');
  const [rucBusqueda, setRucBusqueda] = useState<string>('');
  
  // Estados para datos
  const [datosCausas, setDatosCausas] = useState<ResumenCausa[]>([]);
  const [metricas, setMetricas] = useState<MetricasGenerales>({
    totalActividades: 0,
    actividadesCompletadas: 0,
    actividadesEnProceso: 0,
    actividadesIniciadas: 0,
    actividadesVencidas: 0,
    porcentajeGlobalCompletado: 0,
    distribucionPorUsuario: [],
    tiempoPromedioPorTipo: []
  });
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: string;
    tipoActividadId?: string;
    ruc?: string;
  } | null>(null);

  // Fetch de datos
  const fetchSeguimientoActividades = async (
    fechaInicio: string,
    fechaFin: string,
    usuarioId?: string,
    tipoActividadId?: string,
    ruc?: string
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', fechaInicio);
      params.append('fechaFin', fechaFin);
      
      if (usuarioId && usuarioId !== 'all') {
        params.append('usuarioId', usuarioId);
      }
      
      if (tipoActividadId && tipoActividadId !== 'all') {
        params.append('tipoActividadId', tipoActividadId);
      }
      
      if (ruc && ruc.trim() !== '') {
        params.append('ruc', ruc.trim());
      }

      const response = await fetch(`/api/seguimiento-actividades?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los datos de seguimiento de actividades');
      }
      
      const { data, metricas: metricasData, filtros, total } = await response.json();
      
      setDatosCausas(data);
      setMetricas(metricasData);
      setTiposActividad(filtros.tiposActividad);
      setUsuarios(filtros.usuarios);
      setLastSearchParams({ 
        fechaInicio, 
        fechaFin, 
        usuarioId: usuarioId !== 'all' ? usuarioId : undefined,
        tipoActividadId: tipoActividadId !== 'all' ? tipoActividadId : undefined,
        ruc: ruc ? (ruc.trim() !== '' ? ruc.trim() : undefined) : undefined
      });
      
      toast.success(`Se encontraron datos de ${total} causas`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de seguimiento de actividades');
      setDatosCausas([]);
      setMetricas({
        totalActividades: 0,
        actividadesCompletadas: 0,
        actividadesEnProceso: 0,
        actividadesIniciadas: 0,
        actividadesVencidas: 0,
        porcentajeGlobalCompletado: 0,
        distribucionPorUsuario: [],
        tiempoPromedioPorTipo: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Debe seleccionar un rango de fechas completo');
      return;
    }

    const fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
    const fechaFin = format(dateRange.to, 'yyyy-MM-dd');
    
    fetchSeguimientoActividades(
      fechaInicio, 
      fechaFin, 
      usuarioSeleccionado, 
      tipoActividadSeleccionado,
      rucBusqueda
    );
  };

  // Manejar actualización
  const handleRefresh = () => {
    if (lastSearchParams) {
      fetchSeguimientoActividades(
        lastSearchParams.fechaInicio, 
        lastSearchParams.fechaFin, 
        lastSearchParams.usuarioId, 
        lastSearchParams.tipoActividadId,
        lastSearchParams.ruc
      );
    } else {
      handleSearch();
    }
  };

  // Manejar limpieza de filtros
  const handleClearFilters = () => {
    setUsuarioSeleccionado('all');
    setTipoActividadSeleccionado('all');
    setRucBusqueda('');
    setDateRange({
      from: subMonths(new Date(), 3),
      to: new Date(),
    });
  };

  // Exportar a Excel
  const handleExportToExcel = () => {
    if (datosCausas.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    // Preparar datos para exportación - Hoja de resumen
    const resumenData = datosCausas.map(causa => ({
      'RUC': causa.ruc,
      'Denominación': causa.denominacionCausa,
      'Delito': causa.delito,
      'Total Actividades': causa.estadisticas.total,
      'Completadas': causa.estadisticas.terminadas,
      'En Proceso': causa.estadisticas.enProceso,
      'Iniciadas': causa.estadisticas.iniciadas,
      'Porcentaje Completado': `${causa.estadisticas.porcentajeCompletado.toFixed(1)}%`,
      'Tiempo Promedio (días)': causa.diasPromedio
    }));
    
    // Preparar datos para exportación - Hoja de actividades detalladas
    const actividadesData: any[] = [];
    datosCausas.forEach(causa => {
      causa.actividades.forEach(actividad => {
        actividadesData.push({
          'RUC': causa.ruc,
          'Denominación': causa.denominacionCausa,
          'Tipo Actividad': actividad.tipoActividad,
          'Área': actividad.area,
          'Responsable': actividad.usuario,
          'Fecha Inicio': format(new Date(actividad.fechaInicio), 'dd/MM/yyyy'),
          'Fecha Término': format(new Date(actividad.fechaTermino), 'dd/MM/yyyy'),
          'Estado': actividad.estado === 'inicio' ? 'Iniciada' : 
                  actividad.estado === 'en_proceso' ? 'En Proceso' : 'Terminada',
          'Vencida': actividad.vencida ? 'Sí' : 'No',
          'Observaciones': actividad.observacion
        });
      });
    });
    
    // Crear libro Excel con múltiples hojas
    const workbook = XLSX.utils.book_new();
    
    // Agregar hoja de resumen
    const worksheetResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen por Causa');
    
    // Agregar hoja de actividades detalladas
    const worksheetActividades = XLSX.utils.json_to_sheet(actividadesData);
    XLSX.utils.book_append_sheet(workbook, worksheetActividades, 'Actividades Detalladas');
    
    // Agregar hoja de métricas
    const metricasData = [
      {
        'Métrica': 'Total Actividades',
        'Valor': metricas.totalActividades
      },
      {
        'Métrica': 'Actividades Completadas',
        'Valor': metricas.actividadesCompletadas
      },
      {
        'Métrica': 'Actividades En Proceso',
        'Valor': metricas.actividadesEnProceso
      },
      {
        'Métrica': 'Actividades Iniciadas',
        'Valor': metricas.actividadesIniciadas
      },
      {
        'Métrica': 'Actividades Vencidas',
        'Valor': metricas.actividadesVencidas
      },
      {
        'Métrica': 'Porcentaje Global Completado',
        'Valor': `${metricas.porcentajeGlobalCompletado.toFixed(1)}%`
      }
    ];
    
    const worksheetMetricas = XLSX.utils.json_to_sheet(metricasData);
    XLSX.utils.book_append_sheet(workbook, worksheetMetricas, 'Métricas Generales');
    
    // Agregar hoja de distribución por usuario
    const distribucionUsuarioData = metricas.distribucionPorUsuario.map(usuario => ({
      'Usuario': usuario.nombre,
      'Cargo': usuario.cargo,
      'Cantidad Actividades': usuario.cantidadActividades
    }));
    
    const worksheetDistribucion = XLSX.utils.json_to_sheet(distribucionUsuarioData);
    XLSX.utils.book_append_sheet(workbook, worksheetDistribucion, 'Distribución por Usuario');
    
    // Guardar archivo
    const fileName = `seguimiento_actividades_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Datos exportados correctamente');
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
      const fechaFin = format(dateRange.to, 'yyyy-MM-dd');
      
      fetchSeguimientoActividades(fechaInicio, fechaFin);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Seguimiento de Actividades por Causa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Seleccione los criterios para analizar el cumplimiento de actividades por causa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-1 block">Período</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Responsable</label>
              <Select
                value={usuarioSeleccionado}
                onValueChange={setUsuarioSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Actividad</label>
              <Select
                value={tipoActividadSeleccionado}
                onValueChange={setTipoActividadSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposActividad.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">RUC Causa</label>
              <Input
                placeholder="Buscar por RUC..."
                value={rucBusqueda}
                onChange={(e) => setRucBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Limpiar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading || !lastSearchParams}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard de métricas generales */}
      <MetricasGeneralesActividades
        metricas={metricas}
        isLoading={isLoading}
      />
      
      {/* Resumen de actividades por causa */}
      <ResumenActividadesPorCausa
        datos={datosCausas}
        isLoading={isLoading}
        onExportExcel={handleExportToExcel}
      />
    </div>
  );
}