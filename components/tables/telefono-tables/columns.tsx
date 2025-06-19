// components/tables/telefono-tables/columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TelefonoCausasDrawer } from '@/components/drawer/telefono-causas-drawer';

export type Telefono = {
  id: string;
  numeroTelefonico: string;
  proveedorServicio: {
    id: number;
    nombre: string;
  };
  imei: string;
  abonado: string;
  solicitaTrafico: boolean;
  solicitaImei: boolean;
  observacion?: string;
  telefonosCausa?: {
    id: number;
    causa: {
      id: number;
      ruc: string;
      denominacionCausa: string;
    };
  }[];
};

// Interfaz personalizada para meta con las funciones necesarias
interface TelefonoTableMeta {
  onEdit?: (telefono: Telefono) => void;
  onDelete?: (id: string) => void;
}

const CausasCell = ({ telefono }: { telefono: Telefono }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <FileText className="h-4 w-4" />
        <Badge variant="secondary">
          {telefono.telefonosCausa?.length || 0}
        </Badge>
      </Button>

      <TelefonoCausasDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        telefono={telefono}
      />
    </>
  );
};

export const columns: ColumnDef<Telefono>[] = [
  {
    accessorKey: 'numeroTelefonico',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Número Telefónico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  {
    accessorKey: 'proveedorServicio.nombre',
    header: 'Proveedor',
    cell: ({ row }) => row.original.proveedorServicio?.nombre || '-'
  },
  {
    accessorKey: 'imei',
    header: 'IMEI'
  },
  {
    accessorKey: 'abonado',
    header: 'Abonado'
  },
  {
    accessorKey: 'solicitaTrafico',
    header: 'Solicita Tráfico',
    cell: ({ row }) => (row.getValue('solicitaTrafico') ? 'Sí' : 'No')
  },
  {
    accessorKey: 'solicitaImei',
    header: 'Solicita IMEI',
    cell: ({ row }) => (row.getValue('solicitaImei') ? 'Sí' : 'No')
  },
  {
    id: 'causas',
    header: 'Causas',
    cell: ({ row }) => <CausasCell telefono={row.original} />
  },
  {
    accessorKey: 'observacion',
    header: 'Observación',
    cell: ({ row }) => row.original.observacion || '-'
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const telefono = row.original;
      const { onEdit, onDelete } = (table.options.meta as TelefonoTableMeta) || {};

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(telefono)}
            title="Editar"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(telefono.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }
  }
];