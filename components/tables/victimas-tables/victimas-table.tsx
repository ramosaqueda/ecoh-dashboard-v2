// components/tables/victimas-tables/victimas-table.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CausasVictimasDrawer } from '@/components/drawer/causas-victimas-drawer';
import { useToast } from '@/components/ui/use-toast';
import { type Victima } from '@/types/victima';
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (record: TData) => void;
  onDelete: (id: number) => void;
  onDataChange?: () => Promise<void>;
}

export function VictimasDataTable<TData extends Victima, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  onDataChange
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedVictima, setSelectedVictima] = useState<Victima | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Función asíncrona para refrescar datos
  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['victimas'] }),
      onDataChange?.()
    ]);
  };

  // Función para actualizar el estado de una causa (ya no se usa pero mantenemos compatibilidad)
  const handleUpdateCausa = async (causaId: number, data: any) => {
    try {
      setIsUpdating(true);
      
      if (!selectedVictima) {
        throw new Error('No hay víctima seleccionada');
      }
      
      // Usar el endpoint correcto: /api/causas-victimas/[victimaId] con causaId en body
      const response = await fetch(`/api/causas-victimas/${selectedVictima.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ causaId: causaId, ...data })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la causa');
      }

      await refreshData();

      toast({
        title: 'Éxito',
        description: 'Causa actualizada correctamente'
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'No se pudo actualizar la causa. Por favor, intente nuevamente.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter
    },
    meta: {
      onEdit,
      onDelete,
      onViewCausas: (victima: Victima) => {
        console.log('🔍 Abriendo drawer para víctima:', victima.id, victima.nombreVictima);
        setSelectedVictima(victima);
      },
      onView: (victima: Victima) =>
        router.push(`/dashboard/victima/${victima.id}`)
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Buscar víctimas..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} víctima(s) encontrada(s)
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isUpdating}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isUpdating}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Drawer actualizado para usar victimaId en lugar de causas */}
      {selectedVictima && (
        <CausasVictimasDrawer
          isOpen={!!selectedVictima}
          onClose={() => {
            console.log('🔒 Cerrando drawer');
            setSelectedVictima(null);
          }}
          victimaId={selectedVictima.id} // ← Cambio principal: pasar ID en lugar de causas
          nombreVictima={selectedVictima.nombreVictima}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}