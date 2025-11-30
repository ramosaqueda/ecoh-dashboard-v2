'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TipoOrganizacion = {
    id: number;
    nombre: string;
    descripcion: string | null;
    createdAt: Date;
    updatedAt: Date;
};

interface ColumnActionsProps {
    row: TipoOrganizacion;
    onEdit: (row: TipoOrganizacion) => void;
    onDelete: (row: TipoOrganizacion) => void;
}

function ColumnActions({ row, onEdit, onDelete }: ColumnActionsProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row)}
            >
                <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
}

export const createColumns = (
    onEdit: (row: TipoOrganizacion) => void,
    onDelete: (row: TipoOrganizacion) => void
): ColumnDef<TipoOrganizacion>[] => [
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
            accessorKey: 'descripcion',
            header: 'Descripción',
            cell: ({ row }) => {
                const descripcion = row.getValue('descripcion') as string | null;
                return (
                    <div className="max-w-md truncate text-muted-foreground">
                        {descripcion || '-'}
                    </div>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Fecha Creación',
            cell: ({ row }) => {
                const date = new Date(row.getValue('createdAt'));
                return <div className="text-sm">{date.toLocaleDateString('es-CL')}</div>;
            }
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <ColumnActions
                    row={row.original}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )
        }
    ];
