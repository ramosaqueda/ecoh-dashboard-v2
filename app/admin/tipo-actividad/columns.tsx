'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TipoActividad = {
    id: number;
    nombre: string;
    descripcion: string | null;
    areaId: number;
    activo: boolean;
    siglainf: string | null;
    reqinforme: boolean | null;
    area: {
        id: number;
        nombre: string;
    };
    createdAt: Date;
    updatedAt: Date;
};

interface ColumnActionsProps {
    row: TipoActividad;
    onEdit: (row: TipoActividad) => void;
    onDelete: (row: TipoActividad) => void;
}

function ColumnActions({ row, onEdit, onDelete }: ColumnActionsProps) {
    return (
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row)}
                disabled={!row.activo}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
}

export const createColumns = (
    onEdit: (row: TipoActividad) => void,
    onDelete: (row: TipoActividad) => void
): ColumnDef<TipoActividad>[] => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('id')}</div>
        },
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => <div className="font-medium">{row.getValue('nombre')}</div>
        },
        {
            accessorKey: 'area.nombre',
            header: 'Área',
            cell: ({ row }) => {
                const area = row.original.area;
                return <Badge variant="outline">{area.nombre}</Badge>;
            }
        },
        {
            accessorKey: 'siglainf',
            header: 'Sigla',
            cell: ({ row }) => {
                const sigla = row.getValue('siglainf') as string | null;
                return <div className="font-mono text-sm">{sigla || '-'}</div>;
            }
        },
        {
            accessorKey: 'reqinforme',
            header: 'Req. Informe',
            cell: ({ row }) => {
                const req = row.getValue('reqinforme') as boolean | null;
                return req ? (
                    <Badge variant="default">Sí</Badge>
                ) : (
                    <Badge variant="secondary">No</Badge>
                );
            }
        },
        {
            accessorKey: 'activo',
            header: 'Estado',
            cell: ({ row }) => {
                const activo = row.getValue('activo') as boolean;
                return activo ? (
                    <Badge variant="default">Activo</Badge>
                ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                );
            }
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <ColumnActions row={row.original} onEdit={onEdit} onDelete={onDelete} />
            )
        }
    ];
