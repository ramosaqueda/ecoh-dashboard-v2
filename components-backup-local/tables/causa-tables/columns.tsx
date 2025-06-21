'use client';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2, Users, Eye, ExternalLink, Link2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import ImputadosDrawer from '@/components/drawer/imputados-drawer';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Causa = {
  id: string;
  denominacionCausa: string;
  ruc: string;
  rit: string;
  rut: string;
  observacion: string;
  foliobw: string;
  fechaHoraTomaConocimiento: string;
  causaEcoh: boolean;
  fiscalId: string;
  delitoId: string;
  delito: {
    id: number;
    nombre: string;
  };
  _count?: {
    imputados: number;
    causasRelacionadasMadre?: number;
    causasRelacionadasArista?: number;
  };
};

// Interface para CausaTableMeta
interface CausaTableMeta {
  onEdit?: (causa: Causa) => void;
  onDelete?: (id: string) => void;
}

// Interface para props de DeleteButton
interface DeleteButtonProps {
  causa: Causa;
  onDelete?: (id: string) => void;
}

// Interface para props de ActionsCell
interface ActionsCellProps {
  row: {
    original: Causa;
  };
  table: {
    options: {
      meta?: CausaTableMeta;
    };
  };
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const ImputadosCell = ({ causa }: { causa: Causa }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imputados, setImputados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/causas-imputados?causaId=${causa.id}`);
      if (!response.ok) throw new Error('Error al cargar los imputados');
      const data = await response.json();
      setImputados(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error loading imputados:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'No se pudieron cargar los imputados. Por favor, intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleClick}
        disabled={isLoading}
      >
        <Users className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{causa._count?.imputados || 0}</span>
      </Button>

      <ImputadosDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imputados={imputados}
        causaRuc={causa.ruc}
      />
    </>
  );
};

// Componente para el botón de eliminar con confirmación
const DeleteButton = ({ causa, onDelete }: DeleteButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { canDelete } = useUserPermissions();
  
  // Solo mostrar el botón si el usuario tiene permisos
  if (!canDelete) return null;
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar la causa <strong>{causa.denominacionCausa}</strong> (RUC: {causa.ruc})?
              <div className="mt-2 text-red-500 font-medium">
                Esta acción no se puede deshacer y eliminará todos los datos asociados.
              </div>
              
              {((causa._count?.imputados || 0) > 0 || 
                ((causa._count?.causasRelacionadasMadre || 0) > 0) || 
                ((causa._count?.causasRelacionadasArista || 0) > 0)) && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-700 font-medium">¡Atención!</p>
                  <ul className="list-disc ml-5 text-amber-700 text-sm">
                    {(causa._count?.imputados || 0) > 0 && (
                      <li>Esta causa tiene {causa._count?.imputados || 0} imputado(s) que también serán eliminados.</li>
                    )}
                    {((causa._count?.causasRelacionadasMadre || 0) + 
                      (causa._count?.causasRelacionadasArista || 0)) > 0 && (
                      <li>Esta causa tiene {(causa._count?.causasRelacionadasMadre || 0) + 
                        (causa._count?.causasRelacionadasArista || 0)} causa(s) relacionada(s).</li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete?.(causa.id);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Componente de acciones extraído a un componente separado para poder usar hooks
const ActionsCell = ({ row, table }: ActionsCellProps) => {
  const causa = row.original;
  const { onEdit, onDelete } = table.options.meta || {};
  const { canEdit } = useUserPermissions(); // Ahora es válido usar hooks aquí

  const totalRelaciones = (causa._count?.causasRelacionadasMadre || 0) + 
                      (causa._count?.causasRelacionadasArista || 0);

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/causas/view/${causa.id}`} passHref>
        <Button variant="ghost" size="icon" title="Ver detalles">
          <Eye className="h-4 w-4 text-primary" />
        </Button>
      </Link>

      <Link href={`/dashboard/causas/${causa.id}/relacionadas`} passHref>
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 h-8 px-2" 
          title="Causas relacionadas"
        >
          <div className="flex items-center">
            <Link2 className="h-4 w-4 text-green-600" />
            <span className="ml-1 text-xs font-medium">
              {totalRelaciones}
            </span>
          </div>
        </Button>
      </Link>

      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(causa)}
          title="Editar"
        >
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
      )}
      
      {/* Reemplazamos el botón de eliminar con nuestro componente con confirmación */}
      <DeleteButton causa={causa} onDelete={onDelete} />
    </div>
  );
};

export const columns: ColumnDef<Causa>[] = [
  {
    accessorKey: 'denominacionCausa',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Denominación Causa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  {
    accessorKey: 'ruc',
    header: 'RUC',
    cell: ({ row }) => {
      const ruc = row.getValue('ruc') as string;
      return (
        <div className="flex items-center gap-2">
          <span>{ruc}</span>
          <a 
            href={`${process.env.NEXT_PUBLIC_FICHACASORUC}?ruc=${ruc}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </Button>
          </a>
        </div>
      );
    }
  },
  {
    accessorKey: 'delito.nombre',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Delito
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  {
    accessorKey: 'rit',
    header: 'RIT'
  },
  {
    accessorKey: 'fiscal.nombre',
    header: 'Fiscal'
  },
  {
    accessorKey: 'foliobw',
    header: 'Folio BW'
  },
  {
    accessorKey: 'causaEcoh',
    header: 'Causa ECOH',
    cell: ({ row }) => (row.getValue('causaEcoh') ? 'Sí' : 'No')
  },
  {
    accessorKey: 'fechaHoraTomaConocimiento',
    header: 'Fecha Toma Conocimiento',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaHoraTomaConocimiento') as string;
      return fecha
        ? format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es })
        : '-';
    }
  },
  {
    accessorKey: 'observacion',
    header: 'Observación'
  },
  {
    accessorKey: 'abogado.nombre',
    header: 'Abogado'
  },
  {
    accessorKey: 'analista.nombre',
    header: 'Analista'
  },
  {
    id: 'imputados',
    header: 'Imputados',
    cell: ({ row }) => <ImputadosCell causa={row.original} />
  },
  {
    id: 'actions',
    cell: (props) => <ActionsCell {...props} />
  }
];