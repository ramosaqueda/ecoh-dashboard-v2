'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { createColumns, TipoActividad } from './columns';
import { TipoActividadFormDialog } from './form-dialog';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TipoActividadPage() {
    const [data, setData] = useState<TipoActividad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TipoActividad | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const fetchData = async () => {
        try {
            const url = showInactive
                ? '/api/admin/tipo-actividad?includeInactive=true'
                : '/api/admin/tipo-actividad';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar datos');
            const result = await response.json();
            setData(result);
        } catch (error) {
            toast.error('Error al cargar los tipos de actividad');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [showInactive]);

    const handleEdit = (item: TipoActividad) => {
        setSelectedItem(item);
        setFormOpen(true);
    };

    const handleDelete = (item: TipoActividad) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(`/api/admin/tipo-actividad?id=${selectedItem.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al desactivar');
            }

            toast.success('Tipo de actividad desactivado correctamente');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Error al desactivar');
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
                    <h2 className="text-2xl font-bold tracking-tight">Tipos de Actividad</h2>
                    <p className="text-muted-foreground">
                        Gestiona los tipos de actividades por área
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tipo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lista de Tipos de Actividad</CardTitle>
                            <CardDescription>
                                {data.length} tipo(s) de actividad registrado(s)
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="show-inactive"
                                checked={showInactive}
                                onCheckedChange={setShowInactive}
                            />
                            <Label htmlFor="show-inactive">Mostrar inactivos</Label>
                        </div>
                    </div>
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

            <TipoActividadFormDialog
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
                            Esta acción desactivará el tipo de actividad &quot;{selectedItem?.nombre}&quot;.
                            Podrás reactivarlo más tarde si es necesario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Desactivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
