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
    codigo: z.string().min(1, 'El código es requerido').max(20),
    descripcion: z.string().max(500).optional(),
    orden: z.number().int().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color hexadecimal válido').optional(),
    activo: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface EstadoCausaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: {
        id: number;
        nombre: string;
        codigo: string;
        descripcion: string | null;
        orden: number | null;
        color: string | null;
        activo: boolean;
    };
}

export function EstadoCausaFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData
}: EstadoCausaFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: initialData?.nombre || '',
            codigo: initialData?.codigo || '',
            descripcion: initialData?.descripcion || '',
            orden: initialData?.orden || undefined,
            color: initialData?.color || '#3b82f6',
            activo: initialData?.activo ?? true
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const url = isEditing
                ? `/api/admin/estado-causa?id=${initialData.id}`
                : '/api/admin/estado-causa';

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
                    ? 'Estado de causa actualizado correctamente'
                    : 'Estado de causa creado correctamente'
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar' : 'Crear'} Estado de Causa
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del estado de causa'
                            : 'Completa los datos para crear un nuevo estado de causa'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: En investigación" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="codigo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: INV"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="orden"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Orden</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Orden de visualización
                                        </FormDescription>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del estado de causa"
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
                                                Desactiva este estado si ya no se utiliza
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
