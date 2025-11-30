'use client';

import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    descripcion: z.string().max(500).optional(),
    areaId: z.number({ required_error: 'El área es requerida' }),
    siglainf: z.string().max(10).optional(),
    reqinforme: z.boolean().default(false),
    activo: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

interface Area {
    id: number;
    nombre: string;
}

interface TipoActividadFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: {
        id: number;
        nombre: string;
        descripcion: string | null;
        areaId: number;
        siglainf: string | null;
        reqinforme: boolean | null;
        activo: boolean;
    };
}

export function TipoActividadFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialData
}: TipoActividadFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);
    const isEditing = !!initialData;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: initialData?.nombre || '',
            descripcion: initialData?.descripcion || '',
            areaId: initialData?.areaId,
            siglainf: initialData?.siglainf || '',
            reqinforme: initialData?.reqinforme || false,
            activo: initialData?.activo ?? true
        }
    });

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await fetch('/api/admin/areas');
                if (response.ok) {
                    const data = await response.json();
                    setAreas(data);
                }
            } catch (error) {
                console.error('Error loading areas:', error);
            }
        };

        if (open) {
            fetchAreas();
        }
    }, [open]);

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const url = isEditing
                ? `/api/admin/tipo-actividad?id=${initialData.id}`
                : '/api/admin/tipo-actividad';

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
                    ? 'Tipo de actividad actualizado correctamente'
                    : 'Tipo de actividad creado correctamente'
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
                        {isEditing ? 'Editar' : 'Crear'} Tipo de Actividad
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del tipo de actividad'
                            : 'Completa los datos para crear un nuevo tipo de actividad'}
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
                                        <Input placeholder="Ej: Análisis de evidencia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="areaId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Área *</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un área" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem key={area.id} value={area.id.toString()}>
                                                    {area.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="siglainf"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sigla Informe</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: AE" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reqinforme"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Requiere Informe</FormLabel>
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
                        </div>

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del tipo de actividad"
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
                                                Desactiva este tipo si ya no se utiliza
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
