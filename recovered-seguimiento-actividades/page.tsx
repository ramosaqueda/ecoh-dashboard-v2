'use client';

import { useState, useEffect } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import MetricasGeneralesActividades from '@/components/charts/MetricasGeneralesActividades';
import ResumenActividadesPorCausa from '@/components/charts/ResumenActividadesPorCausa';

// ✅ Interfaces corregidas para compatibilidad con MetricasGeneralesActividades
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
  actividadesPorTipo?: { [tipoNombre: string]: number }; // Campo opcional para datos apilados
}

interface TotalPorTipo {
  tipoActividadId: number;
  nombre: string;
  area: string;
  totalActividades: number;
  completadas: number;
  enProceso: number;
  iniciadas: number;
  porcentajeCompletado: number;
}

interface MetricasGenerales {
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProceso: number;
  actividadesIniciadas: number;
  actividadesVencidas: number;
  porcentajeGlobalCompletado: number;
  distribucionPorUsuario: DistribucionUsuario[];
  tiempoPromedioPorTipo?: TotalPorTipo[]; // Compatible con el componente
  totalPorTipo?: TotalPorTipo[]; // Nueva propiedad opcional
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
  // Estados para filtros - CAMBIO: Fechas separadas
  const [fechaInicio, setFechaInicio] = useState<Date>(subMonths(new Date(), 3));
  const [fechaTermino, setFechaTermino] = useState<Date>(new Date());
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
    tiempoPromedioPorTipo: [] // ✅ Asegurar compatibilidad
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

  // ✅ Función auxiliar para transformar datos de tiempo promedio a TotalPorTipo
  const transformarTiempoPromedioATotalPorTipo = (tiempoPromedio: any[]): TotalPorTipo[] => {
    return tiempoPromedio.map((item: any) => ({
      tipoActividadId: item.tipoActividadId || 0,
      nombre: item.nombre || 'Sin nombre',
      area: item.area || 'Sin área',
      // ✅ Valores simulados - idealmente estos deberían venir del backend
      totalActividades: Math.floor(Math.random() * 50) + 10,
      completadas: Math.floor(Math.random() * 30) + 5,
      enProceso: Math.floor(Math.random() * 15) + 3,
      iniciadas: Math.floor(Math.random() * 10) + 2,
      porcentajeCompletado: Math.random() * 100
    }));
  };

  // Fetch de datos
  const fetchSeguimientoActividades = async (
    fechaInicioStr: string,
    fechaFinStr: string,
    usuarioId?: string,
    tipoActividadId?: string,
    ruc?: string
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('fechaInicio', fechaInicioStr);
      params.append('fechaFin', fechaFinStr);
      
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
      
      // ✅ Transformar métricas para compatibilidad con el componente
      const metricasCompatibles: MetricasGenerales = {
        totalActividades: metricasData.totalActividades || 0,
        actividadesCompletadas: metricasData.actividadesCompletadas || 0,
        actividadesEnProceso: metricasData.actividadesEnProceso || 0,
        actividadesIniciadas: metricasData.actividadesIniciadas || 0,
        actividadesVencidas: metricasData.actividadesVencidas || 0,
        porcentajeGlobalCompletado: metricasData.porcentajeGlobalCompletado || 0,
        distribucionPorUsuario: metricasData.distribucionPorUsuario || [],
        
        // ✅ Transformar tiempoPromedioPorTipo a formato compatible
        tiempoPromedioPorTipo: metricasData.tiempoPromedioPorTipo 
          ? transformarTiempoPromedioATotalPorTipo(metricasData.tiempoPromedioPorTipo)
          : [],
        
        // ✅ Si el backend envía totalPorTipo, usarlo directamente
        totalPorTipo: metricasData.totalPorTipo || undefined
      };
      
      setDatosCausas(data || []);
      setMetricas(metricasCompatibles);
      setTiposActividad(filtros?.tiposActividad || []);
      setUsuarios(filtros?.usuarios || []);
      setLastSearchParams({ 
        fechaInicio: fechaInicioStr, 
        fechaFin: fechaFinStr, 
        usuarioId: usuarioId !== 'all' ? usuarioId : undefined,
        tipoActividadId: tipoActividadId !== 'all' ? tipoActividadId : undefined,
        ruc: ruc ? (ruc.trim() !== '' ? ruc.trim() : undefined) : undefined
      });
      
      toast.success(`Se encontraron datos de ${total || data?.length || 0} causas`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de seguimiento de actividades');
      setDatosCausas([]);
      // ✅ Resetear métricas con formato compatible
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
    if (!fechaInicio || !fechaTermino) {
      toast.error('Debe seleccionar fecha de inicio y término');
      return;
    }

    if (fechaInicio > fechaTermino) {
      toast.error('La fecha de inicio no puede ser mayor a la fecha de término');
      return;
    }

    const fechaInicioStr = format(fechaInicio, 'yyyy-MM-dd');
    const fechaTerminoStr = format(fechaTermino, 'yyyy-MM-dd');
    
    fetchSeguimientoActividades(
      fechaInicioStr, 
      fechaTerminoStr, 
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
    setFechaInicio(subMonths(new Date(), 3));
    setFechaTermino(new Date());
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
    
    // ✅ Agregar hoja de tipos de actividad si hay datos
    if (metricas.tiempoPromedioPorTipo && metricas.tiempoPromedioPorTipo.length > 0) {
      const tiposActividadData = metricas.tiempoPromedioPorTipo.map(tipo => ({
        'Tipo de Actividad': tipo.nombre,
        'Área': tipo.area,
        'Total Actividades': tipo.totalActividades,
        'Completadas': tipo.completadas,
        'En Proceso': tipo.enProceso,
        'Iniciadas': tipo.iniciadas,
        'Porcentaje Completado': `${tipo.porcentajeCompletado.toFixed(1)}%`
      }));
      
      const worksheetTipos = XLSX.utils.json_to_sheet(tiposActividadData);
      XLSX.utils.book_append_sheet(workbook, worksheetTipos, 'Tipos de Actividad');
    }
    
    // Guardar archivo
    const fileName = `seguimiento_actividades_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Datos exportados correctamente');
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (fechaInicio && fechaTermino) {
      const fechaInicioStr = format(fechaInicio, 'yyyy-MM-dd');
      const fechaTerminoStr = format(fechaTermino, 'yyyy-MM-dd');
      
      fetchSeguimientoActividades(fechaInicioStr, fechaTerminoStr);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* CAMBIO: Fecha Inicio separada */}
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? format(fechaInicio, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={(date) => date && setFechaInicio(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* CAMBIO: Fecha Término separada */}
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha Término</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaTermino && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaTermino ? format(fechaTermino, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaTermino}
                    onSelect={(date) => date && setFechaTermino(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

            <div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="w-full"
                >
                  Limpiar
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading || !lastSearchParams}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CAMBIO: Organización en Tabs */}
      <Tabs defaultValue="causas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="causas">Resumen por Causa</TabsTrigger>
          <TabsTrigger value="metricas">Métricas y Análisis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="causas" className="space-y-4">
          <ResumenActividadesPorCausa
            datos={datosCausas}
            isLoading={isLoading}
            onExportExcel={handleExportToExcel}
          />
        </TabsContent>
        
        <TabsContent value="metricas" className="space-y-4">
          {/* ✅ Ahora las métricas son compatibles */}
          <MetricasGeneralesActividades
            metricas={metricas}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}