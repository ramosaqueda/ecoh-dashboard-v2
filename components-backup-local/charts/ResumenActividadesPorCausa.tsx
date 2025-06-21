// src/components/dashboards/ResumenActividadesPorCausa.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileSpreadsheet, Eye, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface ResumenActividadesPorCausaProps {
  datos: ResumenCausa[];
  isLoading: boolean;
  onExportExcel: () => void;
}

export default function ResumenActividadesPorCausa({ 
  datos, 
  isLoading,
  onExportExcel
}: ResumenActividadesPorCausaProps) {
  const [openCausas, setOpenCausas] = useState<Record<number, boolean>>({});

  const toggleCausa = (causaId: number) => {
    setOpenCausas(prev => ({
      ...prev,
      [causaId]: !prev[causaId]
    }));
  };

  // Función para obtener clase de color según porcentaje
  const getColorClass = (porcentaje: number): string => {
    if (porcentaje >= 80) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Función para formatear estado
  const formatEstado = (estado: 'inicio' | 'en_proceso' | 'terminado') => {
    switch (estado) {
      case 'inicio':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <Clock className="mr-1 h-3 w-3" />
            Iniciada
          </Badge>
        );
      case 'en_proceso':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
            <Clock className="mr-1 h-3 w-3" />
            En proceso
          </Badge>
        );
      case 'terminado':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Terminada
          </Badge>
        );
      default:
        return estado;
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumen de Actividades por Causa</CardTitle>
        <Button variant="outline" onClick={onExportExcel} disabled={isLoading || datos.length === 0}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lista">
          <TabsList className="mb-4">
            <TabsTrigger value="lista">Lista de Causas</TabsTrigger>
            <TabsTrigger value="grafico">Gráfico de Cumplimiento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : datos.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="space-y-4">
                {datos.map(causa => (
                  <Collapsible
                    key={causa.causaId}
                    open={openCausas[causa.causaId] || false}
                    onOpenChange={() => toggleCausa(causa.causaId)}
                    className="border rounded-lg"
                  >
                    <div className="p-4 flex items-center justify-between bg-gray-50">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                          <div className="font-medium">RUC: {causa.ruc}</div>
                          <div className="text-sm text-gray-500">{causa.denominacionCausa}</div>
                        </div>
                        <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">Progreso:</span>
                            <Progress 
                              value={causa.estadisticas.porcentajeCompletado} 
                              className="w-32 h-2"
                            />
                            <span className="text-sm ml-2">
                              {causa.estadisticas.porcentajeCompletado.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <Badge variant="outline" className="bg-gray-100">
                              {causa.estadisticas.terminadas}/{causa.estadisticas.total} completadas
                            </Badge>
                            {causa.actividades.some(act => act.vencida) && (
                              <Badge variant="outline" className="bg-red-100 text-red-700">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Con vencimientos
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {openCausas[causa.causaId] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="p-4">
                        <div className="mb-2 flex justify-between items-center">
                          <h4 className="text-sm font-medium">Detalle de Actividades</h4>
                          <div className="text-sm text-gray-500">
                            Tiempo promedio: {causa.diasPromedio} días
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead>Fecha Inicio</TableHead>
                                <TableHead>Fecha Término</TableHead>
                                <TableHead>Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {causa.actividades.map(actividad => (
                                <TableRow key={actividad.id} className={actividad.vencida ? 'bg-red-50' : ''}>
                                  <TableCell className="font-medium">{actividad.tipoActividad}</TableCell>
                                  <TableCell>{actividad.area}</TableCell>
                                  <TableCell>{actividad.usuario}</TableCell>
                                  <TableCell>{formatDate(actividad.fechaInicio)}</TableCell>
                                  <TableCell>
                                    {formatDate(actividad.fechaTermino)}
                                    {actividad.vencida && (
                                      <Badge variant="outline" className="ml-2 bg-red-100 text-red-700">
                                        Vencida
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{formatEstado(actividad.estado)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="grafico">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : datos.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {datos.map(causa => (
                  <Card key={causa.causaId} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{causa.ruc}</CardTitle>
                      <p className="text-sm text-gray-500 truncate" title={causa.denominacionCausa}>
                        {causa.denominacionCausa}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progreso</span>
                          <span className="text-sm font-medium">
                            {causa.estadisticas.porcentajeCompletado.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={causa.estadisticas.porcentajeCompletado}
                          className={`h-3 ${getColorClass(causa.estadisticas.porcentajeCompletado)}`}
                        />
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="font-medium text-blue-700">{causa.estadisticas.iniciadas}</div>
                            <div className="text-blue-600 text-xs">Iniciadas</div>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded">
                            <div className="font-medium text-yellow-700">{causa.estadisticas.enProceso}</div>
                            <div className="text-yellow-600 text-xs">En proceso</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="font-medium text-green-700">{causa.estadisticas.terminadas}</div>
                            <div className="text-green-600 text-xs">Terminadas</div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-sm">
                          <div>Total: {causa.estadisticas.total}</div>
                          <div>Días prom: {causa.diasPromedio}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}