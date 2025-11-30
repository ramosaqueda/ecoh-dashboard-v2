'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createColumns, TipoOrganizacion } from './columns';
import { TipoOrganizacionFormDialog } from './form-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TipoOrganizacionPage() {
    const [data, setData] = useState<TipoOrganizacion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TipoOrganizacion | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/admin/tipo-organizacion');
            if (!response.ok) throw new Error('Error al cargar datos');
            const result = await response.json();
            setData(result);
        } catch (error) {
            toast.error('Error al cargar los tipos de organización');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (item: TipoOrganizacion) => {
        setSelectedItem(item);
        setFormOpen(true);
    };

    const handleDelete = (item: TipoOrganizacion) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(`/api/admin/tipo-organizacion?id=${selectedItem.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al eliminar');
            }

            toast.success('Tipo de organización eliminado correctamente');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar');
        } finally {
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        }
    };

    const handleFormSuccess = () => {
        fetchData();
        setSelectedItem(null);
    };

    const columns = createColumns(handleEdit, handleDelete);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tipos de Organización</h2>
                    <p className="text-muted-foreground">
                        Gestiona los tipos de organizaciones delictuales
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tipo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tipos de Organización</CardTitle>
                    <CardDescription>
                        {data.length} tipo(s) de organización registrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Cargando...</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="nombre" />
                    )}
                </CardContent>
            </Card>

            <TipoOrganizacionFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setSelectedItem(null);
                }}
                onSuccess={handleFormSuccess}
                initialData={selectedItem || undefined}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el tipo de organización &quot;{selectedItem?.nombre}&quot;.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
