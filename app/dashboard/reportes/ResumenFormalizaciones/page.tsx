'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import ResumenFormalizaciones from '@/components/dashboard/ResumenFormalizaciones';
import FormalizacionesTable from '@/components/tables/FormalizacionesTable/FormalizacionesTable';
import DistribucionDelitos from '@/components/charts/DistribucionDelitos';

// Interfaces para tipado
interface Imputado {
  imputadoId: number;
  nombreImputado: string;
  documento: string;
  alias: string;
  nacionalidad: string;
  formalizado: boolean;
  fechaFormalizacion: string | null;
  plazo: number | null;
  diasRestantes: number | null;
  medidaCautelar: string;
  cautelarId: number | null;
  estado: string;
  alerta: 'vencido' | 'proximo' | 'normal' | 'ninguna';
}

interface EstadisticasCausa {
  totalImputados: number;
  formalizados: number;
  noFormalizados: number;
  porcentajeFormalizados: number;
  porVencer: number;
  vencidos: number;
}

interface Formalizacion {
  causaId: number;
  ruc: string;
  denominacion: string;
  delito: string;
  fiscal: string;
  comuna: string;
  fechaHecho: string;
  estadisticas: EstadisticasCausa;
  alertaGeneral: 'vencido' | 'proximo' | 'normal';
  imputados: Imputado[];
}

// Alias para compatibilidad con el componente FormalizacionesTable
type CausaFormalizacion = Formalizacion;

interface Metricas {
  totalCausas: number;
  causasConFormalizados: number;
  causasSinFormalizados: number;
  totalImputados: number;
  totalFormalizados: number;
  noFormalizados: number;
  porcentajeFormalizados: number;
  alertas: {
    porVencer: number;
    vencidos: number;
  };
  promedioDiasFormalizacion: number;
}

interface DistribucionDelito {
  delitoId: number;
  nombre: string;
  causas: number;
  imputados: number;
  formalizados: number;
  porcentaje: number;
}

interface Delito {
  id: number;
  nombre: string;
}

interface Fiscal {
  id: number;
  nombre: string;
}

interface SearchParams {
  ruc?: string;
  delitoId?: string;
  fiscalId?: string;
  estadoId?: string;
}

export default function FormalizacionesPanelPage() {
  // Estados para filtros
  const [rucBusqueda, setRucBusqueda] = useState<string>('');
  const [delitoSeleccionado, setDelitoSeleccionado] = useState<string>('all');
  const [fiscalSeleccionado, setFiscalSeleccionado] = useState<string>('all');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('all');
  
  // Estados para datos - AQUÍ ESTÁ EL CAMBIO PRINCIPAL
  const [formalizaciones, setFormalizaciones] = useState<CausaFormalizacion[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    totalCausas: 0,
    causasConFormalizados: 0,
    causasSinFormalizados: 0,
    totalImputados: 0,
    totalFormalizados: 0,
    noFormalizados: 0,
    porcentajeFormalizados: 0,
    alertas: {
      porVencer: 0,
      vencidos: 0
    },
    promedioDiasFormalizacion: 0
  });
  const [distribucionDelitos, setDistribucionDelitos] = useState<DistribucionDelito[]>([]);
  const [delitos, setDelitos] = useState<Delito[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  // Fetch de datos
  const fetchFormalizaciones = async (
    ruc?: string,
    delitoId?: string,
    fiscalId?: string,
    estadoId?: string
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (ruc && ruc.trim() !== '') {
        params.append('ruc', ruc.trim());
      }
      
      if (delitoId && delitoId !== 'all') {
        params.append('delitoId', delitoId);
      }
      
      if (fiscalId && fiscalId !== 'all') {
        params.append('fiscalId', fiscalId);
      }
      
      if (estadoId && estadoId !== 'all') {
        params.append('estadoId', estadoId);
      }

      const response = await fetch(`/api/formalizaciones-panel?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los datos de formalizaciones');
      }
      
      const { data, metricas: metricasData, distribucionPorDelito, filtros } = await response.json();
      
      // Transformar los datos para manejar fechaHecho null y completar datos de imputados
      const formalizacionesTransformadas = data.map((causa: any) => ({
        ...causa,
        fechaHecho: causa.fechaHecho || 'No registrada',
        estadisticas: {
          ...causa.estadisticas,
          porcentajeFormalizados: causa.estadisticas.totalImputados > 0 
            ? (causa.estadisticas.formalizados / causa.estadisticas.totalImputados) * 100 
            : 0
        },
        imputados: causa.imputados.map((imputado: any) => ({
          ...imputado,
          imputadoId: imputado.imputadoId || imputado.id, // Usar id si no existe imputadoId
          cautelarId: imputado.cautelarId || null, // Permitir null
          alerta: imputado.alerta || (
            !imputado.formalizado ? 'ninguna' :
            imputado.diasRestantes !== null && imputado.diasRestantes <= 0 ? 'vencido' :
            imputado.diasRestantes !== null && imputado.diasRestantes <= 7 ? 'proximo' : 'normal'
          )
        }))
      }));
      
      setFormalizaciones(formalizacionesTransformadas);
      setMetricas(metricasData);
      setDistribucionDelitos(distribucionPorDelito);
      setDelitos(filtros.delitos);
      setFiscales(filtros.fiscales);
      setLastSearchParams({ 
        ruc: ruc?.trim() !== '' ? ruc?.trim() : undefined,
        delitoId: delitoId !== 'all' ? delitoId : undefined,
        fiscalId: fiscalId !== 'all' ? fiscalId : undefined,
        estadoId: estadoId !== 'all' ? estadoId : undefined
      });
      
      toast.success(`Se encontraron ${data.length} causas con imputados`);
      
      // Mostrar alertas si hay plazos vencidos o por vencer
      if (metricasData.alertas.vencidos > 0) {
        toast.error(`¡Atención! Hay ${metricasData.alertas.vencidos} imputado${metricasData.alertas.vencidos !== 1 ? 's' : ''} con plazos vencidos`, {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />
        });
      } else if (metricasData.alertas.porVencer > 0) {
        toast.warning(`Hay ${metricasData.alertas.porVencer} imputado${metricasData.alertas.porVencer !== 1 ? 's' : ''} con plazos próximos a vencer`, {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de formalizaciones');
      setFormalizaciones([]);
      setMetricas({
        totalCausas: 0,
        causasConFormalizados: 0,
        causasSinFormalizados: 0,
        totalImputados: 0,
        totalFormalizados: 0,
        noFormalizados: 0,
        porcentajeFormalizados: 0,
        alertas: {
          porVencer: 0,
          vencidos: 0
        },
        promedioDiasFormalizacion: 0
      });
      setDistribucionDelitos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    try {
      // Preparar hoja con resumen general
      const resumenData = [
        { 'Métrica': 'Total de Causas', 'Valor': metricas.totalCausas },
        { 'Métrica': 'Causas con Imputados Formalizados', 'Valor': metricas.causasConFormalizados },
        { 'Métrica': 'Causas sin Imputados Formalizados', 'Valor': metricas.causasSinFormalizados },
        { 'Métrica': 'Total de Imputados', 'Valor': metricas.totalImputados },
        { 'Métrica': 'Imputados Formalizados', 'Valor': metricas.totalFormalizados },
        { 'Métrica': 'Imputados No Formalizados', 'Valor': metricas.noFormalizados },
        { 'Métrica': 'Porcentaje de Formalización', 'Valor': `${metricas.porcentajeFormalizados.toFixed(1)}%` },
        { 'Métrica': 'Plazos Vencidos', 'Valor': metricas.alertas.vencidos },
        { 'Métrica': 'Plazos Próximos a Vencer', 'Valor': metricas.alertas.porVencer },
        { 'Métrica': 'Días Promedio entre Hecho y Formalización', 'Valor': metricas.promedioDiasFormalizacion }
      ];
      
      // Preparar hoja con datos por causa - AHORA CON TIPADO CORRECTO
      const causasData = formalizaciones.map((causa: CausaFormalizacion) => ({
        'ID Causa': causa.causaId,
        'RUC': causa.ruc,
        'Denominación': causa.denominacion,
        'Delito': causa.delito,
        'Fiscal': causa.fiscal,
        'Comuna': causa.comuna,
        'Fecha Hecho': causa.fechaHecho === 'No registrada' ? 'No registrada' : format(new Date(causa.fechaHecho), 'dd/MM/yyyy', { locale: es }),
        'Total Imputados': causa.estadisticas.totalImputados,
        'Formalizados': causa.estadisticas.formalizados,
        'No Formalizados': causa.estadisticas.noFormalizados,
        'Vencidos': causa.estadisticas.vencidos,
        'Por Vencer': causa.estadisticas.porVencer,
        'Estado': causa.alertaGeneral === 'vencido' ? 'Vencido' : causa.alertaGeneral === 'proximo' ? 'Próximo a vencer' : 'En plazo'
      }));
      
      // Preparar hoja con datos de imputados
      const imputadosData: any[] = [];
      formalizaciones.forEach((causa: CausaFormalizacion) => {
        causa.imputados.forEach((imputado: Imputado) => {
          imputadosData.push({
            'ID Causa': causa.causaId,
            'ID Imputado': imputado.imputadoId,
            'RUC': causa.ruc,
            'Denominación': causa.denominacion,
            'Imputado': imputado.nombreImputado,
            'Documento': imputado.documento,
            'Alias': imputado.alias,
            'Nacionalidad': imputado.nacionalidad,
            'Formalizado': imputado.formalizado ? 'Sí' : 'No',
            'Fecha Formalización': imputado.fechaFormalizacion 
              ? format(new Date(imputado.fechaFormalizacion), 'dd/MM/yyyy', { locale: es }) 
              : 'No formalizado',
            'Plazo (días)': imputado.plazo || 'No aplica',
            'Días Restantes': imputado.diasRestantes !== null 
              ? imputado.diasRestantes <= 0 
                ? `Vencido (${Math.abs(imputado.diasRestantes)} días)` 
                : imputado.diasRestantes 
              : 'No aplica',
            'Estado': imputado.estado,
            'Medida Cautelar': imputado.medidaCautelar,
            'ID Cautelar': imputado.cautelarId || 'No asignado',
            'Alerta': imputado.alerta === 'vencido' ? 'Vencido' : 
                     imputado.alerta === 'proximo' ? 'Próximo a vencer' : 
                     imputado.alerta === 'normal' ? 'Normal' : 'Sin formalizar'
          });
        });
      });
      
      // Preparar hoja con distribución por delito
      const delitosData = distribucionDelitos.map((delito: DistribucionDelito) => ({
        'ID Delito': delito.delitoId,
        'Delito': delito.nombre,
        'Causas': delito.causas,
        'Imputados': delito.imputados,
        'Formalizados': delito.formalizados,
        'Porcentaje Formalización': `${delito.porcentaje.toFixed(1)}%`
      }));
      
      // Crear libro Excel con múltiples hojas
      const workbook = XLSX.utils.book_new();
      
      // Agregar hoja de resumen
      const worksheetResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen');
      
      // Agregar hoja de causas
      const worksheetCausas = XLSX.utils.json_to_sheet(causasData);
      XLSX.utils.book_append_sheet(workbook, worksheetCausas, 'Causas');
      
      // Agregar hoja de imputados
      const worksheetImputados = XLSX.utils.json_to_sheet(imputadosData);
      XLSX.utils.book_append_sheet(workbook, worksheetImputados, 'Imputados');
      
      // Agregar hoja de distribución por delito
      const worksheetDelitos = XLSX.utils.json_to_sheet(delitosData);
      XLSX.utils.book_append_sheet(workbook, worksheetDelitos, 'Distribución por Delito');
      
      // Guardar archivo
      const fileName = `formalizaciones_${format(new Date(), 'dd-MM-yyyy', { locale: es })}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Informe exportado correctamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al exportar el informe');
    }
  };

  // Manejar búsqueda
  const handleSearch = () => {
    fetchFormalizaciones(
      rucBusqueda,
      delitoSeleccionado,
      fiscalSeleccionado,
      estadoSeleccionado
    );
  };

  // Manejar actualización
  const handleRefresh = () => {
    if (lastSearchParams) {
      fetchFormalizaciones(
        lastSearchParams.ruc,
        lastSearchParams.delitoId,
        lastSearchParams.fiscalId,
        lastSearchParams.estadoId
      );
    } else {
      handleSearch();
    }
  };

  // Manejar limpieza de filtros
  const handleClearFilters = () => {
    setRucBusqueda('');
    setDelitoSeleccionado('all');
    setFiscalSeleccionado('all');
    setEstadoSeleccionado('all');
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchFormalizaciones();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Control de Formalizaciones</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Seleccione los criterios para visualizar el estado de formalizaciones y sus plazos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">RUC</label>
              <Input
                placeholder="Buscar por RUC..."
                value={rucBusqueda}
                onChange={(e) => setRucBusqueda(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Delito</label>
              <Select
                value={delitoSeleccionado}
                onValueChange={setDelitoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione delito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los delitos</SelectItem>
                  {delitos.map((delito) => (
                    <SelectItem key={delito.id} value={delito.id.toString()}>
                      {delito.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Fiscal</label>
              <Select
                value={fiscalSeleccionado}
                onValueChange={setFiscalSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los fiscales</SelectItem>
                  {fiscales.map((fiscal) => (
                    <SelectItem key={fiscal.id} value={fiscal.id.toString()}>
                      {fiscal.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select
                value={estadoSeleccionado}
                onValueChange={setEstadoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="formalizados">Formalizados</SelectItem>
                  <SelectItem value="no_formalizados">No formalizados</SelectItem>
                </SelectContent>
              </Select>
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
              variant="outline"
              onClick={handleExportExcel}
              disabled={isLoading || formalizaciones.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
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

      {/* Resumen y alertas */}
      <ResumenFormalizaciones
        metricas={metricas}
        isLoading={isLoading}
      />
      
      {/* Distribución por tipo de delito */}
      <DistribucionDelitos
        datos={distribucionDelitos}
        isLoading={isLoading}
      />
      
      {/* Tabla de formalizaciones */}
      <FormalizacionesTable
        causas={formalizaciones}
        isLoading={isLoading}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}