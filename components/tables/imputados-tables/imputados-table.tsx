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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CausasDrawer } from '@/components/drawer/causas-drawer';
import { useToast } from '@/components/ui/use-toast';
import { type Imputado } from '@/types/causaimputado';
import { Loader2, User, AlertCircle, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFichabSession } from '@/components/fichab/FichabSessionConfig';
import { Badge } from '@/components/ui/badge';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit: (record: TData) => void;
  onDelete: (id: string) => void;
  onDataChange?: () => Promise<void>;
}

// Interfaz para la respuesta de FICHAB
interface FichabResponse {
  success?: boolean;
  data?: FichabData | any;
  error?: string;
  message?: string;
}

// Interfaz para la estructura completa de respuesta FICHAB
interface FichabData {
  total: number;
  listado: FichabCaso[];
  cod_respuesta: number;
}

// Interfaz para un caso de FICHAB
interface FichabCaso {
  RUC: string;
  CALIDAD: string;
  FISCALIA: string;
  FISCAL_ASIGNADO: string;
  FECHA_RECEPCION: string;
  ESTADO_CASO: string;
  FECHA_TERMINO: string;
  PARTE: string | null;
  FECHA_PARTE: string | null;
  NOMBRE_CASO: string;
  COD_REGION: string;
  REGION_CASO: string;
  DELITO_CASO: string;
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
  const [selectedImputado, setSelectedImputado] = useState<Imputado | null>(null);
  const [photoModalImputado, setPhotoModalImputado] = useState<Imputado | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Hook global para sesión FICHAB
  const fichabSession = useFichabSession();

  // Estados para FICHAB
  const [fichabModalOpen, setFichabModalOpen] = useState(false);
  const [fichabLoading, setFichabLoading] = useState(false);
  const [fichabData, setFichabData] = useState<FichabData | null>(null);
  const [fichabError, setFichabError] = useState<string | null>(null);
  const [fichabImputado, setFichabImputado] = useState<Imputado | null>(null);

  // Función asíncrona para refrescar datos
  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['imputados'] }),
      onDataChange?.()
    ]);
  };

  // Función para consultar FICHAB
  const handleConsultaFichab = async (imputado: Imputado) => {
    if (!imputado.docId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El imputado no tiene Doc ID registrado'
      });
      return;
    }

    if (!fichabSession) {
      toast({
        variant: 'destructive',
        title: 'FICHAB no configurado',
        description: 'Configure su sesión FICHAB en el ícono del header'
      });
      return;
    }

    setFichabImputado(imputado);
    setFichabModalOpen(true);
    setFichabLoading(true);
    setFichabData(null);
    setFichabError(null);

    try {
      const response = await fetch('/api/fichab/casos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rut: imputado.docId,
          ciSession: fichabSession.ciSession,
          serverId: fichabSession.serverId
        })
      });

      const result: FichabResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setFichabError(result.message || 'Sesión FICHAB no válida o expirada');
          toast({
            variant: 'destructive',
            title: 'Sesión expirada',
            description: 'Actualice su sesión FICHAB en el header'
          });
        } else {
          setFichabError(result.message || 'Error al consultar FICHAB');
        }
        return;
      }

      if (result.data?.listado !== undefined) {
        setFichabData(result.data as FichabData);
      } else {
        setFichabData(result.data);
      }
      
    } catch (error) {
      console.error('Error consultando FICHAB:', error);
      setFichabError('Error de conexión al consultar FICHAB');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar con FICHAB'
      });
    } finally {
      setFichabLoading(false);
    }
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
        router.push(`/dashboard/imputado/${imputado.id}`),
      onViewPhoto: (imputado: Imputado) => setPhotoModalImputado(imputado),
      onConsultaFichab: handleConsultaFichab
    }
  });

  // Función para obtener el color del badge según el estado
  const getEstadoBadgeVariant = (estado: string): "default" | "secondary" | "destructive" | "outline" => {
    const estadoLower = estado?.toLowerCase() || '';
    if (estadoLower.includes('vigente') || estadoLower.includes('activo')) return 'default';
    if (estadoLower.includes('terminado')) return 'secondary';
    if (estadoLower.includes('suspendido')) return 'destructive';
    if (estadoLower.includes('archivo')) return 'outline';
    return 'outline';
  };

  // Función para obtener el color del badge según la calidad
  const getCalidadBadgeVariant = (calidad: string): "default" | "secondary" | "destructive" | "outline" => {
    const calidadLower = calidad?.toLowerCase() || '';
    if (calidadLower.includes('imputado')) return 'destructive';
    if (calidadLower.includes('victima') || calidadLower.includes('víctima')) return 'default';
    return 'outline';
  };

  // Función para renderizar la tabla de casos FICHAB
  const renderFichabTable = (casos: FichabCaso[]) => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">RUC</TableHead>
              <TableHead className="min-w-[250px]">Caso / Delito</TableHead>
              <TableHead className="w-[100px]">Calidad</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[150px]">Fiscalía</TableHead>
              <TableHead className="min-w-[180px]">Fiscal Asignado</TableHead>
              <TableHead className="w-[100px]">Recepción</TableHead>
              <TableHead className="w-[100px]">Término</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casos.map((caso, index) => (
              <TableRow key={`${caso.RUC}-${index}`}>
                <TableCell className="font-mono text-xs font-medium">
                  {caso.RUC}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-2" title={caso.NOMBRE_CASO}>
                      {caso.NOMBRE_CASO}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1" title={caso.DELITO_CASO}>
                      {caso.DELITO_CASO}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getCalidadBadgeVariant(caso.CALIDAD)} className="text-xs">
                    {caso.CALIDAD}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(caso.ESTADO_CASO)} className="text-xs">
                    {caso.ESTADO_CASO}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {caso.FISCALIA}
                </TableCell>
                <TableCell className="text-xs">
                  <span title={caso.FISCAL_ASIGNADO} className="line-clamp-2">
                    {caso.FISCAL_ASIGNADO}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-center">
                  {caso.FECHA_RECEPCION}
                </TableCell>
                <TableCell className="text-xs text-center">
                  {caso.FECHA_TERMINO !== '-' ? caso.FECHA_TERMINO : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Función para renderizar los datos de FICHAB
  const renderFichabData = () => {
    if (fichabLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Consultando FICHAB...</p>
        </div>
      );
    }

    if (fichabError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{fichabError}</p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://balanceador-qa.minpublico.cl/fichab', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ir a FICHAB
            </Button>
          </div>
        </div>
      );
    }

    if (!fichabData) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        </div>
      );
    }

    // Si tiene la estructura esperada con listado
    if (fichabData.listado !== undefined) {
      if (fichabData.listado.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No se encontraron casos para este RUT</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">
              {fichabData.total} caso(s) encontrado(s)
            </span>
            <span className="text-xs text-muted-foreground">
              Código respuesta: {fichabData.cod_respuesta}
            </span>
          </div>
          {renderFichabTable(fichabData.listado)}
        </div>
      );
    }

    // Si es HTML
    if ((fichabData as any).html && (fichabData as any).raw) {
      return (
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: (fichabData as any).html }}
        />
      );
    }

    // Fallback: mostrar JSON
    return (
      <div className="rounded-lg border p-3">
        <pre className="text-xs overflow-auto whitespace-pre-wrap">
          {JSON.stringify(fichabData, null, 2)}
        </pre>
      </div>
    );
  };

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

      {/* Modal para ver fotografía */}
      <Dialog 
        open={!!photoModalImputado} 
        onOpenChange={(open) => !open && setPhotoModalImputado(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {photoModalImputado?.nombreSujeto}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {photoModalImputado?.fotoPrincipal ? (
              <div className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoModalImputado.fotoPrincipal}
                  alt={`Fotografía de ${photoModalImputado.nombreSujeto}`}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-lg bg-gray-100">
                <User className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>
          {photoModalImputado?.docId && (
            <div className="text-center text-sm text-muted-foreground">
              Doc ID: {photoModalImputado.docId}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para FICHAB */}
      <Dialog 
        open={fichabModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setFichabModalOpen(false);
            setFichabData(null);
            setFichabError(null);
            setFichabImputado(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Consulta FICHAB - {fichabImputado?.nombreSujeto}
            </DialogTitle>
            {fichabImputado?.docId && (
              <p className="text-sm text-muted-foreground">
                RUT: {fichabImputado.docId}
              </p>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {renderFichabData()}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedImputado && (
        <CausasDrawer
          isOpen={!!selectedImputado}
          onClose={() => setSelectedImputado(null)}
          causas={selectedImputado.causas}
          nombreSujeto={selectedImputado.nombreSujeto}
          onUpdateCausa={handleUpdateCausa}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}
