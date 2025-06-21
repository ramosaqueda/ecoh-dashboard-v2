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
import { CausasDrawer } from '@/components/drawer/causas-drawer';
import { useToast } from '@/components/ui/use-toast';
import { type Imputado } from '@/types/causaimputado'; // ← Corrección de importación
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (record: TData) => void;
  onDelete: (id: string) => void;
  onDataChange?: () => Promise<void>;
}

export function ImputadosDataTable<TData extends Imputado, TValue>({
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
  const [selectedImputado, setSelectedImputado] = useState<Imputado | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Función asíncrona para refrescar datos
  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['imputados'] }),
      onDataChange?.()
    ]);
  };
  // Función para actualizar el estado de una causa
  const handleUpdateCausa = async (causaId: number, data: any) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/causas-imputados/${causaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la causa');
      }

      await refreshData();

      toast({
        title: 'Éxito',
        description: 'Causa actualizada correctamente'
      });

      // Actualizar el imputado seleccionado
      if (selectedImputado) {
        const updatedImputado = await queryClient.fetchQuery({
          queryKey: ['imputado', selectedImputado.id],
          queryFn: async () => {
            const response = await fetch(
              `/api/imputado/${selectedImputado.id}`
            );
            if (!response.ok) throw new Error('Error al actualizar imputado');
            return response.json();
          }
        });

        setSelectedImputado(updatedImputado);
      }
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
      onViewCausas: (imputado: Imputado) => setSelectedImputado(imputado),
      onView: (imputado: Imputado) =>
        router.push(`/dashboard/imputado/${imputado.id}`)
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Buscar Imputados..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} sujeto(s) encontrado(s)
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

      {selectedImputado && (
        <CausasDrawer
          isOpen={!!selectedImputado}
          onClose={() => setSelectedImputado(null)}
          causas={selectedImputado.causas}
          nombreSujeto={selectedImputado.nombreSujeto}
          onUpdateCausa={handleUpdateCausa}
          onRefresh={refreshData} // <- Pasamos la función asíncrona
        />
      )}
    </div>
  );
}