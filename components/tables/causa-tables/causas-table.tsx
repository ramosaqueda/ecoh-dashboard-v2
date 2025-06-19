import React, { useState, useEffect, useMemo } from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { Download, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Professional {
  id: number;
  nombre: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (record: TData) => void;
  onDelete: (id: string) => void;
}

export function CausasDataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onDelete
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [abogados, setAbogados] = useState<Professional[]>([]);
  const [analistas, setAnalistas] = useState<Professional[]>([]);
  const [selectedAbogado, setSelectedAbogado] = useState<string>('all');
  const [selectedAnalista, setSelectedAnalista] = useState<string>('all');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    rit: false,
    observacion: false,
    foliobw: false
  });
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Fetch abogados and analistas
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const [abogadosRes, analistasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/abogado`),
          fetch(`${API_BASE_URL}/api/analista`)
        ]);

        if (abogadosRes.ok && analistasRes.ok) {
          const abogadosData = await abogadosRes.json();
          const analistasData = await analistasRes.json();
          setAbogados(abogadosData);
          setAnalistas(analistasData);
        }
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    };

    fetchProfessionals();
  }, []);

  // Filter the data based on selected professionals
  const filteredData = useMemo(() => {
    return (data as any[]).filter((item) => {
      const abogadoMatch =
        selectedAbogado === 'all' ||
        item.abogado?.id.toString() === selectedAbogado;
      const analistaMatch =
        selectedAnalista === 'all' ||
        item.analista?.id.toString() === selectedAnalista;
      return abogadoMatch && analistaMatch;
    });
  }, [data, selectedAbogado, selectedAnalista]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility
    },
    meta: {
      onEdit,
      onDelete
    }
  });

  const exportToExcel = () => {
    try {
      // Obtener los datos filtrados y formateados
      const exportData = table.getFilteredRowModel().rows.map((row) => {
        const rowData: any = {};
        columns.forEach((column: any) => {
          if (column.accessorKey && !column.id?.includes('actions')) {
            // Manejar nested properties (e.g., 'abogado.nombre')
            const keys = column.accessorKey.split('.');
            let value = row.original;
            for (const key of keys) {
              value = value?.[key];
            }

            // Formatear fechas si es necesario
            if (column.accessorKey === 'fechaHoraTomaConocimiento' && value) {
              try {
                value = format(new Date(value), 'dd/MM/yyyy HH:mm', {
                  locale: es
                });
              } catch (error) {
                console.error('Error formatting date:', error);
                value = value || '';
              }
            }

            // Formatear booleanos
            if (typeof value === 'boolean') {
              value = value ? 'Sí' : 'No';
            }

            // Usar el header como nombre de columna en el Excel
            const headerValue =
              typeof column.header === 'string'
                ? column.header
                : column.accessorKey.split('.').pop();

            rowData[headerValue] = value || '';
          }
        });
        return rowData;
      });

      // Crear el libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Ajustar el ancho de las columnas
      const columnsWidth = Object.keys(exportData[0] || {}).map(() => ({
        wch: 20
      }));
      ws['!cols'] = columnsWidth;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Causas');

      // Generar el archivo y descargarlo
      const fecha = format(new Date(), 'dd-MM-yyyy', { locale: es });
      XLSX.writeFile(wb, `Causas_${fecha}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar en todas las columnas..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
          <Select value={selectedAbogado} onValueChange={setSelectedAbogado}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por abogado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los abogados</SelectItem>
              {abogados.map((abogado) => (
                <SelectItem key={abogado.id} value={abogado.id.toString()}>
                  {abogado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAnalista} onValueChange={setSelectedAnalista}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por analista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los analistas</SelectItem>
              {analistas.map((analista) => (
                <SelectItem key={analista.id} value={analista.id.toString()}>
                  {analista.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Ver columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.id !== 'actions'
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === 'fechaHoraTomaConocimiento'
                        ? 'Fecha Toma Conocimiento'
                        : column.id.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} resultados encontrados
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
