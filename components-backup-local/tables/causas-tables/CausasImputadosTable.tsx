// src/components/tables/causas-tables/CausasImputadosTable.tsx
'use client';

import { useState, useMemo } from 'react';
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
  CardDescription,
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
import { ChevronDown, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

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

interface CausasImputadosTableProps {
  causas: Causa[];
  isLoading: boolean;
}

export default function CausasImputadosTable({ causas, isLoading }: CausasImputadosTableProps) {
  // Columnas disponibles
  const allColumns = [
    { id: 'ruc', name: 'RUC' },
    { id: 'denominacionCausa', name: 'Denominación' },
    { id: 'fechaDelHecho', name: 'Fecha del Hecho' },
    { id: 'delito', name: 'Delito' },
    { id: 'comuna', name: 'Comuna' },
    { id: 'nombreSujeto', name: 'Imputado' },
    { id: 'docId', name: 'Documento' },
    { id: 'alias', name: 'Alias' },
    { id: 'nacionalidad', name: 'Nacionalidad' },
    { id: 'formalizado', name: 'Formalizado' },
    { id: 'fechaFormalizacion', name: 'Fecha Formalización' },
    { id: 'medidaCautelar', name: 'Medida Cautelar' },
  ];

  // Estado para columnas visibles (por defecto todas activas)
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

  // Aplanar los datos para mostrar una fila por imputado
  const flattenedData = useMemo(() => {
    const flattened: any[] = [];
    
    causas.forEach(causa => {
      if (causa.imputados.length === 0) {
        // Si no hay imputados, mostrar solo la causa
        flattened.push({
          id: `causa-${causa.id}`,
          causaId: causa.id,
          ruc: causa.ruc,
          denominacionCausa: causa.denominacionCausa,
          fechaDelHecho: causa.fechaDelHecho,
          delito: causa.delito,
          comuna: causa.comuna,
          nombreSujeto: 'Sin imputados',
          docId: '',
          alias: '',
          nacionalidad: '',
          formalizado: false,
          fechaFormalizacion: null,
          medidaCautelar: '',
        });
      } else {
        // Si hay imputados, crear una fila por cada imputado
        causa.imputados.forEach((imputado, index) => {
          flattened.push({
            id: `causa-${causa.id}-imputado-${imputado.id}`,
            causaId: causa.id,
            ruc: causa.ruc,
            denominacionCausa: causa.denominacionCausa,
            fechaDelHecho: causa.fechaDelHecho,
            delito: causa.delito,
            comuna: causa.comuna,
            nombreSujeto: imputado.nombreSujeto,
            docId: imputado.docId,
            alias: imputado.alias,
            nacionalidad: imputado.nacionalidad,
            formalizado: imputado.formalizado,
            fechaFormalizacion: imputado.fechaFormalizacion,
            medidaCautelar: imputado.medidaCautelar,
          });
        });
      }
    });
    
    return flattened;
  }, [causas]);

  // Función para formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No registrada';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Preparar datos para exportación (solo columnas visibles)
    const dataToExport = flattenedData.map(row => {
      const exportRow: Record<string, any> = {};
      visibleColumns.forEach(colId => {
        const column = allColumns.find(col => col.id === colId);
        if (column) {
          if (colId === 'fechaDelHecho' || colId === 'fechaFormalizacion') {
            exportRow[column.name] = formatDate(row[colId]);
          } else if (colId === 'formalizado') {
            exportRow[column.name] = row[colId] ? 'Sí' : 'No';
          } else {
            exportRow[column.name] = row[colId];
          }
        }
      });
      return exportRow;
    });

    // Crear libro Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Causas e Imputados');
    
    // Guardar archivo
    const fileName = `causas_imputados_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Listado de Causas e Imputados</span>
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
              onClick={exportToExcel}
              disabled={isLoading || flattenedData.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Causas filtradas por fecha del hecho con sus imputados y medidas cautelares
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : flattenedData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No se encontraron registros para los criterios seleccionados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('ruc') && <TableHead>RUC</TableHead>}
                  {visibleColumns.includes('denominacionCausa') && <TableHead>Denominación</TableHead>}
                  {visibleColumns.includes('fechaDelHecho') && <TableHead>Fecha del Hecho</TableHead>}
                  {visibleColumns.includes('delito') && <TableHead>Delito</TableHead>}
                  {visibleColumns.includes('comuna') && <TableHead>Comuna</TableHead>}
                  {visibleColumns.includes('nombreSujeto') && <TableHead>Imputado</TableHead>}
                  {visibleColumns.includes('docId') && <TableHead>Documento</TableHead>}
                  {visibleColumns.includes('alias') && <TableHead>Alias</TableHead>}
                  {visibleColumns.includes('nacionalidad') && <TableHead>Nacionalidad</TableHead>}
                  {visibleColumns.includes('formalizado') && <TableHead>Formalizado</TableHead>}
                  {visibleColumns.includes('fechaFormalizacion') && <TableHead>Fecha Formalización</TableHead>}
                  {visibleColumns.includes('medidaCautelar') && <TableHead>Medida Cautelar</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedData.map((row) => (
                  <TableRow key={row.id}>
                    {visibleColumns.includes('ruc') && <TableCell>{row.ruc}</TableCell>}
                    {visibleColumns.includes('denominacionCausa') && <TableCell>{row.denominacionCausa}</TableCell>}
                    {visibleColumns.includes('fechaDelHecho') && <TableCell>{formatDate(row.fechaDelHecho)}</TableCell>}
                    {visibleColumns.includes('delito') && <TableCell>{row.delito}</TableCell>}
                    {visibleColumns.includes('comuna') && <TableCell>{row.comuna}</TableCell>}
                    {visibleColumns.includes('nombreSujeto') && <TableCell>{row.nombreSujeto}</TableCell>}
                    {visibleColumns.includes('docId') && <TableCell>{row.docId}</TableCell>}
                    {visibleColumns.includes('alias') && <TableCell>{row.alias}</TableCell>}
                    {visibleColumns.includes('nacionalidad') && <TableCell>{row.nacionalidad}</TableCell>}
                    {visibleColumns.includes('formalizado') && (
                      <TableCell>
                        {row.formalizado ? 
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Sí</span> : 
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No</span>
                        }
                      </TableCell>
                    )}
                    {visibleColumns.includes('fechaFormalizacion') && <TableCell>{formatDate(row.fechaFormalizacion)}</TableCell>}
                    {visibleColumns.includes('medidaCautelar') && <TableCell>{row.medidaCautelar}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Total: {flattenedData.length} registros
        </div>
      </CardFooter>
    </Card>
  );
}