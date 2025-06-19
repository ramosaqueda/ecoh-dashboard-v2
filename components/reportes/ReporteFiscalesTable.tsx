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
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  Search,
  FileDown
} from 'lucide-react';
import { CausaReporteDetalle } from '@/types/reporte';

interface ReporteFiscalesTableProps {
  data: CausaReporteDetalle[];
  onExport: (formato: 'xlsx' | 'csv') => void;
}

export function ReporteFiscalesTable({ data, onExport }: ReporteFiscalesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Definir columnas
  const columns: ColumnDef<CausaReporteDetalle>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 font-semibold"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'ruc',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 font-semibold"
        >
          RUC
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue('ruc') || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'denominacionCausa',
      header: 'Denominación',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue('denominacionCausa')}>
          {row.getValue('denominacionCausa')}
        </div>
      ),
    },
    {
      accessorKey: 'fiscal.nombre',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 font-semibold"
        >
          Fiscal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fiscal = row.original.fiscal;
        return fiscal ? (
          <div className="font-medium">{fiscal.nombre}</div>
        ) : (
          <Badge variant="secondary">Sin Asignar</Badge>
        );
      },
    },
    {
      accessorKey: 'fechaDelHecho',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 p-0 font-semibold"
        >
          Fecha del Hecho
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fecha = row.getValue('fechaDelHecho') as string | null;
        return fecha ? (
          <div className="text-sm">{new Date(fecha).toLocaleDateString()}</div>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: 'delito.nombre',
      header: 'Delito',
      cell: ({ row }) => {
        const delito = row.original.delito;
        return delito ? (
          <Badge variant="outline">{delito.nombre}</Badge>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      id: 'indicadores',
      header: 'Indicadores',
      cell: ({ row }) => {
        const causa = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {causa.causaEcoh && (
              <Badge variant="default" className="text-xs">ECOH</Badge>
            )}
            {causa.causaLegada && (
              <Badge variant="secondary" className="text-xs">Legada</Badge>
            )}
            {causa.constituyeSs && (
              <Badge variant="destructive" className="text-xs">SS</Badge>
            )}
            {causa.homicidioConsumado && (
              <Badge variant="destructive" className="text-xs">Homicidio</Badge>
            )}
            {causa.esCrimenOrganizado === 0 && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-700 bg-amber-50">Crimen Org.</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'contadores',
      header: 'Imputados/Víctimas',
      cell: ({ row }) => {
        const { _count } = row.original;
        return (
          <div className="text-sm">
            <div>Imputados: {_count.imputados}</div>
            <div>Víctimas: {_count.victimas}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'rit',
      header: 'RIT',
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue('rit') || 'N/A'}</div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const totalRegistros = data.length;
  const registrosMostrados = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda y exportación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en todas las columnas..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Badge variant="outline">
            {registrosMostrados} de {totalRegistros} registros
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('xlsx')}
            className="flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            className="flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-8 w-[70px] rounded border border-input bg-background px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}