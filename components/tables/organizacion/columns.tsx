import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Network } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Organization = {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaIdentificacion: Date;
  activa: boolean;
  tipoOrganizacion: {
    id: string;
    nombre: string;
  };
};

// Interfaz personalizada para meta con las funciones necesarias
interface OrganizationTableMeta {
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
}

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre'
  },
  {
    accessorKey: 'tipoOrganizacion.nombre',
    header: 'Tipo'
  },
  {
    accessorKey: 'fechaIdentificacion',
    header: 'Fecha de Identificación',
    cell: ({ row }) => {
      return format(
        new Date(row.getValue('fechaIdentificacion')),
        'dd/MM/yyyy'
      );
    }
  },
  {
    accessorKey: 'activa',
    header: 'Estado',
    cell: ({ row }) => {
      return row.getValue('activa') ? 'Activa' : 'Inactiva';
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const organization = row.original;
      const { onEdit, onDelete } = (table.options.meta as OrganizationTableMeta) || {};

      return (
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href={`/organizaciones/${organization.id}/network`}>
                    <Network className="h-4 w-4 text-blue-600" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver estructura organizacional</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(organization)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(organization)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];