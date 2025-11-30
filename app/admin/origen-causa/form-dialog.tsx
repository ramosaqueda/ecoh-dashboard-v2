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
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const formSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    descripcion: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color hexadecimal válido').optional(),
    activo: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface OrigenCausaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: {
        id: number;
        nombre: string;
        descripcion: string | null;
        color: string | null;
        activo: boolean;
    };
}

export function OrigenCausaFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData
}: OrigenCausaFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: initialData?.nombre || '',
            descripcion: initialData?.descripcion || '',
            color: initialData?.color || '#3b82f6',
            activo: initialData?.activo ?? true
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const url = isEditing
                ? `/api/admin/origen-causa?id=${initialData.id}`
                : '/api/admin/origen-causa';

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
                    ? 'Origen de causa actualizado correctamente'
                    : 'Origen de causa creado correctamente'
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
                        {isEditing ? 'Editar' : 'Crear'} Origen de Causa
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del origen de causa'
                            : 'Completa los datos para crear un nuevo origen de causa'}
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
                                        <Input placeholder="Ej: Denuncia ciudadana" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input type="color" className="w-20 h-10" {...field} />
                                        </FormControl>
                                        <Input
                                            placeholder="#3b82f6"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="flex-1"
                                        />
                                    </div>
                                    <FormDescription>
                                        Color para identificar visualmente este origen
                                    </FormDescription>
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
                                            placeholder="Descripción del origen de causa"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isEditing && (
                            <FormField
                                control={form.control}
                                name="activo"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Activo</FormLabel>
                                            <FormDescription>
                                                Desactiva este origen si ya no se utiliza
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

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
