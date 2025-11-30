'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    descripcion: z.string().max(500).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface TipoOrganizacionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: {
        id: number;
        nombre: string;
        descripcion: string | null;
    };
}

export function TipoOrganizacionFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData
}: TipoOrganizacionFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: initialData?.nombre || '',
            descripcion: initialData?.descripcion || ''
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const url = isEditing
                ? `/api/admin/tipo-organizacion?id=${initialData.id}`
                : '/api/admin/tipo-organizacion';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al guardar');
            }

            toast.success(
                isEditing
                    ? 'Tipo de organización actualizado correctamente'
                    : 'Tipo de organización creado correctamente'
            );

            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar' : 'Crear'} Tipo de Organización
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del tipo de organización'
                            : 'Completa los datos para crear un nuevo tipo de organización'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Banda organizada" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del tipo de organización"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
