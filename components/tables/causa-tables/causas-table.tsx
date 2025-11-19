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

interface Delito {
  id: number;
  nombre: string;
}

interface Fiscal {
  id: number;
  nombre: string;
}

interface Foco {
  id: number;
  nombre: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (record: TData) => void;
  onDelete: (id: string) => void;
}

// ✅ NUEVA función para formatear fechas sin problema de timezone
const formatDateOnly = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    // Si la fecha viene en formato ISO (YYYY-MM-DD), la parseamos directamente
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `${day}/${month}/${year}`;
    }
    // Fallback
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

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
  const [atvts, setAtvts] = useState<Professional[]>([]);
  const [delitos, setDelitos] = useState<Delito[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);
  const [focos, setFocos] = useState<Foco[]>([]); // ✅ NUEVO: Estado para focos
  const [selectedAbogado, setSelectedAbogado] = useState<string>('all');
  const [selectedAnalista, setSelectedAnalista] = useState<string>('all');
  const [selectedATVT, setSelectedATVT] = useState<string>('all');
  const [selectedDelito, setSelectedDelito] = useState<string>('all');
  const [selectedFiscal, setSelectedFiscal] = useState<string>('all');
  const [selectedFoco, setSelectedFoco] = useState<string>('all'); // ✅ NUEVO: Estado para foco
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    rit: false,
    observacion: false,
    foliobw: false
  });
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const [abogadosRes, analistasRes, atvtsRes, delitosRes, fiscalesRes, focosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/abogado`),
          fetch(`${API_BASE_URL}/api/analista`),
          fetch(`${API_BASE_URL}/api/atvt`),
          fetch(`${API_BASE_URL}/api/delito`),
          fetch(`${API_BASE_URL}/api/fiscal`),
          fetch(`${API_BASE_URL}/api/foco`) // ✅ NUEVO: Fetch de focos
        ]);

        if (abogadosRes.ok && analistasRes.ok && atvtsRes.ok && delitosRes.ok && fiscalesRes.ok && focosRes.ok) {
          const abogadosData = await abogadosRes.json();
          const analistasData = await analistasRes.json();
          const atvtsData = await atvtsRes.json();
          const delitosData = await delitosRes.json();
          const fiscalesData = await fiscalesRes.json();
          const focosData = await focosRes.json(); // ✅ NUEVO
          setAbogados(abogadosData);
          setAnalistas(analistasData);
          setAtvts(atvtsData);
          setDelitos(delitosData);
          setFiscales(Array.isArray(fiscalesData) ? fiscalesData : [fiscalesData]);
          setFocos(Array.isArray(focosData) ? focosData : [focosData]); // ✅ NUEVO
        }
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    };

    fetchProfessionals();
  }, []);

  // Generar lista de años únicos basada en fechaDelHecho
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (data as any[]).forEach((item) => {
      if (item.fechaDelHecho) {
        const year = new Date(item.fechaDelHecho).getFullYear();
        if (!isNaN(year)) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  // ✅ ACTUALIZADO: Filter the data based on selected filters (incluyendo fiscal y foco)
  const filteredData = useMemo(() => {
    return (data as any[]).filter((item) => {
      const abogadoMatch =
        selectedAbogado === 'all' ||
        item.abogado?.id.toString() === selectedAbogado;
      const analistaMatch =
        selectedAnalista === 'all' ||
        item.analista?.id.toString() === selectedAnalista;
      const atvtMatch =
        selectedATVT === 'all' ||
        item.atvt?.id.toString() === selectedATVT;
      
      const delitoMatch =
        selectedDelito === 'all' ||
        item.delito?.id.toString() === selectedDelito;
      
      const fiscalMatch =
        selectedFiscal === 'all' ||
        item.fiscal?.id.toString() === selectedFiscal;
      
      // ✅ NUEVO: Filtro por foco
      const focoMatch =
        selectedFoco === 'all' ||
        item.foco?.id.toString() === selectedFoco;
      
      const yearMatch = selectedYear === 'all' || (() => {
        if (!item.fechaDelHecho) return false;
        const itemYear = new Date(item.fechaDelHecho).getFullYear();
        return itemYear.toString() === selectedYear;
      })();
      
      return abogadoMatch && analistaMatch && atvtMatch && delitoMatch && fiscalMatch && focoMatch && yearMatch;
    });
  }, [data, selectedAbogado, selectedAnalista, selectedATVT, selectedDelito, selectedFiscal, selectedFoco, selectedYear]);

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
            // Manejar nested properties (e.g., 'abogado.nombre', 'atvt.nombre')
            const keys = column.accessorKey.split('.');
            let value = row.original;
            for (const key of keys) {
              value = value?.[key];
            }

            // ✅ ACTUALIZADO: Formatear fechaDelHecho con la nueva función
            if (column.accessorKey === 'fechaDelHecho' && value) {
              value = formatDateOnly(value);
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
        {/* Primera fila: Búsqueda y Filtros de Caso */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Buscar en todas las columnas..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Filtros de Caso:</span>
          </div>

          <Select value={selectedFiscal} onValueChange={setSelectedFiscal}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fiscal" />
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

          {/* ✅ NUEVO: Filtro por Foco */}
          <Select value={selectedFoco} onValueChange={setSelectedFoco}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Foco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los focos</SelectItem>
              {focos.map((foco) => (
                <SelectItem key={foco.id} value={foco.id.toString()}>
                  {foco.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDelito} onValueChange={setSelectedDelito}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Delito" />
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

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Segunda fila: Filtros de Asignación y Acciones */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Asignaciones:</span>
          </div>

          <Select value={selectedAbogado} onValueChange={setSelectedAbogado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Abogado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {abogados.map((abogado) => (
                <SelectItem key={abogado.id} value={abogado.id.toString()}>
                  {abogado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedAnalista} onValueChange={setSelectedAnalista}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Analista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {analistas.map((analista) => (
                <SelectItem key={analista.id} value={analista.id.toString()}>
                  {analista.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedATVT} onValueChange={setSelectedATVT}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ATVT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {atvts.map((atvt) => (
                <SelectItem key={atvt.id} value={atvt.id.toString()}>
                  {atvt.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columnas
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
                      {column.id === 'fechaDelHecho'
                        ? 'Fecha del Hecho'
                        : column.id === 'fechaHoraTomaConocimiento'
                        ? 'Fecha Toma Conocimiento'
                        : column.id.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
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