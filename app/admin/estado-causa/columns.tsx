'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type EstadoCausa = {
    id: number;
    nombre: string;
    descripcion: string | null;
    codigo: string;
    activo: boolean;
    orden: number | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
};

interface ColumnActionsProps {
    row: EstadoCausa;
    onEdit: (row: EstadoCausa) => void;
    onDelete: (row: EstadoCausa) => void;
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
    onEdit: (row: EstadoCausa) => void,
    onDelete: (row: EstadoCausa) => void
): ColumnDef<EstadoCausa>[] => [
        {
            accessorKey: 'orden',
            header: 'Orden',
            cell: ({ row }) => {
                const orden = row.getValue('orden') as number | null;
                return <div className="font-mono text-sm w-12">{orden ?? '-'}</div>;
            }
        },
        {
            accessorKey: 'codigo',
            header: 'Código',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono">
                    {row.getValue('codigo')}
                </Badge>
            )
        },
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => {
                const color = row.original.color;
                return (
                    <div className="flex items-center gap-2">
                        {color && (
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                            />
                        )}
                        <span className="font-medium">{row.getValue('nombre')}</span>
                    </div>
                );
            }
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
