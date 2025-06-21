'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export type Actividad = {
  id: number;
  causa: {
    id: number;
    ruc: string;
  };
  tipoActividad: {
    id: number;
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  observacion: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: {
    email: string;
  };
};

// Interfaz personalizada para meta con las funciones necesarias
interface ActividadTableMeta {
  onEdit?: (actividad: Actividad) => void;
  onDelete?: (id: number) => void;
}

const estadoBadgeColors = {
  inicio: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  terminado: 'bg-green-100 text-green-800'
};

const estadoTexto = {
  inicio: 'Inicio',
  en_proceso: 'En Proceso',
  terminado: 'Terminado'
};

export const columns: ColumnDef<Actividad>[] = [
  {
    accessorKey: 'causa.ruc',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        RUC
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  {
    accessorKey: 'tipoActividad.nombre',
    header: 'Tipo de Actividad'
  },
  {
    accessorKey: 'fechaInicio',
    header: 'Fecha Inicio',
    cell: ({ row }) => {
      return format(new Date(row.getValue('fechaInicio')), 'dd/MM/yyyy', { locale: es });
    }
  },
  {
    accessorKey: 'fechaTermino',
    header: 'Fecha Término',
    cell: ({ row }) => {
      return format(new Date(row.getValue('fechaTermino')), 'dd/MM/yyyy', { locale: es });
    }
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as keyof typeof estadoBadgeColors;
      return (
        <Badge className={estadoBadgeColors[estado]}>
          {estadoTexto[estado]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'usuario.email',
    header: 'Asignado'
  },
  {
    accessorKey: 'observacion',
    header: 'Observaciones'
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const actividad = row.original;
      const { onEdit, onDelete } = (table.options.meta as ActividadTableMeta) || {};

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(actividad)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(actividad.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];