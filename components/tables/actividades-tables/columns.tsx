'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit2, Trash2, CheckSquare } from 'lucide-react';
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
    id: number;
    nombre: string;
    email: string;
  };
  usuarioAsignado?: {
    id: number;
    nombre: string;
    email: string;
    rol: {
      id: number;
      nombre: string;
    };
  };
};

// Interfaz personalizada para meta con las funciones necesarias
interface ActividadTableMeta {
  onEdit?: (actividad: Actividad) => void;
  onDelete?: (id: number) => void;
  onViewTodos?: (id: number) => void;
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
    id: 'asignado_por',
    header: 'Asignado por',
    cell: ({ row }) => {
      const actividad = row.original;
      return actividad.usuario?.nombre || 'No asignado';
    }
  },
  {
    id: 'asignado',
    header: 'Asignado',
    cell: ({ row }) => {
      const actividad = row.original;
      return actividad.usuarioAsignado?.nombre || 'No asignado';
    }
  },
  {
    accessorKey: 'observacion',
    header: 'Observaciones',
    cell: ({ row }) => {
      const observacion = row.getValue('observacion') as string;
      return observacion ? (
        <div className="max-w-[200px] truncate" title={observacion}>
          {observacion}
        </div>
      ) : (
        <span className="text-muted-foreground">Sin observaciones</span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row, table }) => {
      const actividad = row.original;
      const { onEdit, onDelete, onViewTodos } = (table.options.meta as ActividadTableMeta) || {};

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewTodos?.(actividad.id)}
            title="Ver tareas"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(actividad)}
            title="Editar actividad"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(actividad.id)}
            title="Eliminar actividad"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];