'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// ✅ Schema de validación con Zod
const hitoFormSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  fecha: z.string().min(1, 'La fecha y hora son requeridas'),
  descripcion: z.string().optional(),
  icono: z.string().optional(),
  imagenUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type HitoFormData = z.infer<typeof hitoFormSchema>;

interface HitoFormProps {
  onSubmit: (data: HitoFormData) => void;
  isSubmitting: boolean;
  initialData?: HitoFormData | null;
}

export default function HitoForm({ onSubmit, isSubmitting, initialData }: HitoFormProps) {
  const form = useForm<HitoFormData>({
    resolver: zodResolver(hitoFormSchema),
    defaultValues: {
      titulo: initialData?.titulo || '',
      fecha: initialData?.fecha || '',
      descripcion: initialData?.descripcion || '',
      icono: initialData?.icono || '',
      imagenUrl: initialData?.imagenUrl || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Hito *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: Inicio de Investigación"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ FECHA Y HORA - CAMPO MÁS IMPORTANTE */}
        <FormField
          control={form.control}
          name="fecha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y Hora *</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"   
                  {...field}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe los detalles del hito..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ícono (opcional) */}
        <FormField
          control={form.control}
          name="icono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícono (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: 🔍 📝 ⚖️"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL de Imagen (opcional) */}
        <FormField
          control={form.control}
          name="imagenUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen (opcional)</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              initialData ? 'Actualizar' : 'Crear Hito'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
 