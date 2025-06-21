// components/tables/victimas-tables/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2, FileText, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type Victima } from '@/types/victima';

// Interfaz personalizada para meta con las funciones necesarias
interface VictimaTableMeta {
  onViewCausas?: (victima: Victima) => void;
  onEdit?: (victima: Victima) => void;
  onDelete?: (id: number) => void;
  onView?: (victima: Victima) => void;
}

export const columns: ColumnDef<Victima>[] = [
  // nombreVictima
  {
    accessorKey: 'nombreVictima',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  // DocID
  {
    accessorKey: 'docId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Doc ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  // Nacionalidad
  {
    accessorKey: 'nacionalidad.nombre',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nacionalidad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const nacionalidad = row.original.nacionalidad;
      return nacionalidad?.nombre || '-';
    }
  },
  // Causas - Solución temporal: siempre mostrar botón para ver causas
  {
    id: 'causas',
    header: 'Causas',
    cell: ({ row, table }) => {
      const victima = row.original;
      const { onViewCausas } = (table.options.meta as VictimaTableMeta) || {};
      
      // Intentar obtener el conteo de diferentes fuentes
      let causasCount = 0;
      let hasCountData = false;
      
      // Opción 1: Si viene en victima.causas (formato anterior)
      if (victima.causas && Array.isArray(victima.causas)) {
        causasCount = victima.causas.length;
        hasCountData = true;
      }
      // Opción 2: Si viene en victima._count.causas (formato con conteo)
      else if (victima._count?.causas !== undefined) {
        causasCount = victima._count.causas;
        hasCountData = true;
      }
      // Opción 3: Si viene en victima.causasCount (formato personalizado)
      else if (typeof victima.causasCount === 'number') {
        causasCount = victima.causasCount;
        hasCountData = true;
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewCausas?.(victima)}
          className="flex items-center gap-2"
          title="Ver y gestionar causas asociadas"
        >
          <FileText className="h-4 w-4" />
          <span>
            {hasCountData 
              ? (causasCount > 0 
                  ? `${causasCount} causa${causasCount > 1 ? 's' : ''}`
                  : 'Sin causas'
                )
              : 'Gestionar causas'
            }
          </span>
        </Button>
      );
    }
  },
  // Acciones
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const victima = row.original;
      const { onEdit, onDelete, onView } = (table.options.meta as VictimaTableMeta) || {};

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView?.(victima)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(victima)}
            title="Editar"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(victima.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }
  }
];