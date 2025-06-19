// src/components/tables/FormalizacionesTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

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

interface CausaFormalizacion {
  causaId: number;
  ruc: string;
  denominacion: string;
  fechaHecho: string;
  delito: string;
  fiscal: string;
  comuna: string;
  imputados: Imputado[];
  estadisticas: EstadisticasCausa;
  alertaGeneral: 'vencido' | 'proximo' | 'normal';
}

interface FormalizacionesTableProps {
  causas: CausaFormalizacion[];
  isLoading: boolean;
  onExportExcel: () => void;
}

export default function FormalizacionesTable({ 
  causas, 
  isLoading,
  onExportExcel 
}: FormalizacionesTableProps) {
  // Estado para controlar las filas expandidas
  const [expandedCausas, setExpandedCausas] = useState<Record<number, boolean>>({});
  
  // Estado para filtrar causas por búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para filtrar por tipo de alerta
  const [alertFilter, setAlertFilter] = useState<'all' | 'vencido' | 'proximo' | 'normal'>('all');
  
  // Columnas disponibles
  const allColumns = [
    { id: 'ruc', name: 'RUC' },
    { id: 'denominacion', name: 'Denominación' },
    { id: 'delito', name: 'Delito' },
    { id: 'fiscal', name: 'Fiscal' },
    { id: 'fechaHecho', name: 'Fecha Hecho' },
    { id: 'imputados', name: 'Imputados' },
    { id: 'formalizados', name: 'Formalizados' },
    { id: 'alerta', name: 'Alerta' },
  ];

  // Estado para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map((col) => col.id)
  );

  // Cambiar visibilidad de columnas
  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      setVisibleColumns(visibleColumns.filter((id) => id !== columnId));
    } else {
      setVisibleColumns([...visibleColumns, columnId]);
    }
  };

  // Alternar expansión de causa
  const toggleCausa = (causaId: number) => {
    setExpandedCausas(prev => ({
      ...prev,
      [causaId]: !prev[causaId]
    }));
  };
  
  // Formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Obtener color según alerta
  const getAlertColor = (alerta: 'vencido' | 'proximo' | 'normal' | 'ninguna') => {
    switch (alerta) {
      case 'vencido':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'proximo':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'normal':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Filtrar causas según búsqueda y filtro de alerta
  const filteredCausas = causas.filter(causa => {
    // Aplicar filtro de búsqueda
    const searchMatch = 
      causa.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      causa.denominacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      causa.delito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      causa.fiscal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      causa.imputados.some(i => 
        i.nombreImputado.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Aplicar filtro de alerta
    const alertMatch = alertFilter === 'all' || causa.alertaGeneral === alertFilter;
    
    return searchMatch && alertMatch;
  });

  // Función para renderizar el estado de alerta
  const renderAlertBadge = (alerta: 'vencido' | 'proximo' | 'normal' | 'ninguna') => {
    switch (alerta) {
      case 'vencido':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Vencido
          </Badge>
        );
      case 'proximo':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Próximo a vencer
          </Badge>
        );
      case 'normal':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            En plazo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500">
            <Clock className="mr-1 h-3 w-3" />
            Sin formalizar
          </Badge>
        );
    }
  };
  
  // Función para renderizar el contador de días
  const renderDiasRestantes = (diasRestantes: number | null, alerta: 'vencido' | 'proximo' | 'normal' | 'ninguna') => {
    if (diasRestantes === null) return null;
    
    let textClass = '';
    let icon = null;
    
    if (diasRestantes <= 0) {
      textClass = 'text-red-600 font-bold';
      icon = <AlertCircle className="inline mr-1 h-3 w-3 text-red-600" />;
    } else if (diasRestantes <= 10) {
      textClass = 'text-yellow-600 font-bold';
      icon = <AlertTriangle className="inline mr-1 h-3 w-3 text-yellow-600" />;
    } else {
      textClass = 'text-green-600';
      icon = <Clock className="inline mr-1 h-3 w-3 text-green-600" />;
    }
    
    return (
      <span className={textClass}>
        {icon}
        {diasRestantes <= 0 
          ? `Vencido hace ${Math.abs(diasRestantes)} días` 
          : `${diasRestantes} días restantes`}
      </span>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Formalizaciones y Plazos</CardTitle>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {allColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline"
            onClick={onExportExcel}
            disabled={isLoading || causas.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por RUC, denominación, delito, fiscal o imputado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={alertFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAlertFilter('all')}
              className="whitespace-nowrap"
            >
              Todos
            </Button>
            <Button
              variant={alertFilter === 'vencido' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAlertFilter('vencido')}
              className="whitespace-nowrap bg-red-100 text-red-800 hover:text-red-800 hover:bg-red-200 border-red-200"
            >
              <AlertCircle className="mr-1 h-3 w-3" />
              Vencidos
            </Button>
            <Button
              variant={alertFilter === 'proximo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAlertFilter('proximo')}
              className="whitespace-nowrap bg-yellow-100 text-yellow-800 hover:text-yellow-800 hover:bg-yellow-200 border-yellow-200"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Próximos a vencer
            </Button>
            <Button
              variant={alertFilter === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAlertFilter('normal')}
              className="whitespace-nowrap bg-green-100 text-green-800 hover:text-green-800 hover:bg-green-200 border-green-200"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              En plazo
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredCausas.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No se encontraron causas que coincidan con los criterios de búsqueda
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCausas.map((causa) => (
              <Collapsible
                key={causa.causaId}
                open={expandedCausas[causa.causaId] || false}
                onOpenChange={() => toggleCausa(causa.causaId)}
                className={`border rounded-lg ${
                  causa.alertaGeneral === 'vencido' 
                    ? 'border-red-300' 
                    : causa.alertaGeneral === 'proximo' 
                      ? 'border-yellow-300' 
                      : 'border-gray-200'
                }`}
              >
                <div className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between ${
                  causa.alertaGeneral === 'vencido' 
                    ? 'bg-red-50' 
                    : causa.alertaGeneral === 'proximo' 
                      ? 'bg-yellow-50' 
                      : 'bg-gray-50'
                }`}>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      {visibleColumns.includes('ruc') && (
                        <div className="font-medium">
                          {causa.ruc}
                        </div>
                      )}
                      {visibleColumns.includes('denominacion') && (
                        <div className="text-sm text-gray-600 truncate max-w-md" title={causa.denominacion}>
                          {causa.denominacion}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-col md:flex-row gap-3">
                      {visibleColumns.includes('delito') && (
                        <div className="text-sm">
                          <span className="text-gray-500">Delito:</span> {causa.delito}
                        </div>
                      )}
                      {visibleColumns.includes('fiscal') && (
                        <div className="text-sm">
                          <span className="text-gray-500">Fiscal:</span> {causa.fiscal}
                        </div>
                      )}
                      {visibleColumns.includes('fechaHecho') && (
                        <div className="text-sm">
                          <span className="text-gray-500">Fecha:</span> {formatDate(causa.fechaHecho)}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {visibleColumns.includes('imputados') && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800">
                          {causa.estadisticas.totalImputados} imputado{causa.estadisticas.totalImputados !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {visibleColumns.includes('formalizados') && (
                        <Badge variant="outline" className="bg-gray-50">
                          {causa.estadisticas.formalizados} formalizado{causa.estadisticas.formalizados !== 1 ? 's' : ''}
                          {causa.estadisticas.totalImputados > 0 && (
                            <span className="ml-1">
                              ({causa.estadisticas.porcentajeFormalizados.toFixed(0)}%)
                            </span>
                          )}
                        </Badge>
                      )}
                      {visibleColumns.includes('alerta') && (
                        <div className="flex gap-1">
                          {causa.estadisticas.vencidos > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {causa.estadisticas.vencidos} vencido{causa.estadisticas.vencidos !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {causa.estadisticas.porVencer > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {causa.estadisticas.porVencer} próximo{causa.estadisticas.porVencer !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {causa.estadisticas.vencidos === 0 && causa.estadisticas.porVencer === 0 && causa.estadisticas.formalizados > 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              En plazo
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mt-2 md:mt-0"
                    >
                      {expandedCausas[causa.causaId] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="ml-2">
                        {expandedCausas[causa.causaId] ? 'Ocultar' : 'Ver imputados'}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Imputado</TableHead>
                            <TableHead>Formalizado</TableHead>
                            <TableHead>Fecha Formalización</TableHead>
                            <TableHead>Plazo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Medida Cautelar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {causa.imputados.map((imputado) => (
                            <TableRow key={imputado.imputadoId} className={
                              imputado.alerta === 'vencido' 
                                ? 'bg-red-50' 
                                : imputado.alerta === 'proximo' 
                                  ? 'bg-yellow-50' 
                                  : ''
                            }>
                              <TableCell>
                                <div className="font-medium">{imputado.nombreImputado}</div>
                                <div className="text-xs text-gray-500">{imputado.documento}</div>
                                {imputado.alias && (
                                  <div className="text-xs text-gray-500">Alias: {imputado.alias}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {imputado.formalizado ? (
                                  <Badge className="bg-green-100 text-green-800">Sí</Badge>
                                ) : (
                                  <Badge variant="outline">No</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {imputado.fechaFormalizacion ? formatDate(imputado.fechaFormalizacion) : 'No formalizado'}
                              </TableCell>
                              <TableCell>
                                {imputado.plazo ? (
                                  <>
                                    <div>{imputado.plazo} días</div>
                                    {imputado.diasRestantes !== null && (
                                      <div className="text-xs mt-1">
                                        {renderDiasRestantes(imputado.diasRestantes, imputado.alerta)}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  'No aplica'
                                )}
                              </TableCell>
                              <TableCell>
                                {renderAlertBadge(imputado.alerta)}
                              </TableCell>
                              <TableCell>
                                {imputado.medidaCautelar}
                              </TableCell>
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {filteredCausas.length} causas encontradas 
          {searchTerm || alertFilter !== 'all' ? ' (filtradas)' : ''}
        </div>
      </CardFooter>
    </Card>
  );
}